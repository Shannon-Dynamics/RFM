"use client";
import { useState, type ReactElement } from "react";
import styles from "./viz.module.css";

// A side view of one scene: a mug on a table and a cloth draped over a box. Every rung draws
// the same scene in a different representation. Units are SVG pixels.
const TABLE = 220;
const MUG = { x: 170, y: 120, w: 80, h: 100 };
const BOX = { x: 520, y: 160, w: 120, h: 60 };
const CLOTH: [number, number][] = [[470, 214], [480, 196], [494, 176], [512, 160], [540, 154], [580, 152], [620, 154], [648, 160], [664, 176], [676, 196], [684, 214]];
const CAMERA: [number, number] = [60, 30];

const inMug = (x: number, y: number) =>
  (x >= MUG.x && x <= MUG.x + MUG.w && y >= MUG.y && y <= MUG.y + MUG.h) ||
  (((x - MUG.x - MUG.w) / 26) ** 2 + ((y - 170) / 30) ** 2 <= 1 && ((x - MUG.x - MUG.w) / 16) ** 2 + ((y - 170) / 20) ** 2 >= 1 && x > MUG.x + MUG.w);
const inBox = (x: number, y: number) => x >= BOX.x && x <= BOX.x + BOX.w && y >= BOX.y && y <= BOX.y + BOX.h;
const nearCloth = (x: number, y: number) => CLOTH.slice(1).some(([x1, y1], i) => {
  const [x0, y0] = CLOTH[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - x0 - t * dx, y - y0 - t * dy) < 5;
});
const solid = (x: number, y: number) => inMug(x, y) || inBox(x, y) || nearCloth(x, y);

// Surface samples: the mug's outline, the cloth, and the box top hidden under the cloth.
const MUG_OUTLINE: [number, number][] = [
  ...Array.from({ length: 10 }, (_, i) => [MUG.x, MUG.y + i * 10] as [number, number]),
  ...Array.from({ length: 8 }, (_, i) => [MUG.x + i * 10, MUG.y] as [number, number]),
  ...Array.from({ length: 10 }, (_, i) => [MUG.x + MUG.w, MUG.y + i * 10] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI * i) / 6; return [MUG.x + MUG.w + 26 * Math.cos(a), 170 + 30 * Math.sin(a)] as [number, number]; }),
];
const CLOTH_PTS: [number, number][] = CLOTH.flatMap(([x0, y0], i) => i === CLOTH.length - 1 ? [[x0, y0]] :
  [0, 0.5].map((t) => [x0 + t * (CLOTH[i + 1][0] - x0), y0 + t * (CLOTH[i + 1][1] - y0)] as [number, number]));
// Seen from the camera at top left: the mug's right wall and handle, and everything under the cloth, are hidden.
const visible = ([x, y]: [number, number]) => !(Math.abs(x - (MUG.x + MUG.w)) < 1 && y > MUG.y) && !(x > MUG.x + MUG.w + 1 && x < 300);

const RUNGS = [
  { id: "rgb", label: "RGB pixels", explicit: "colour at each pixel", lost: "depth, mass, contact and anything behind the cloth",
    examples: "every video model in chapters 6 and 8", cost: "pretrained on the web: cheapest to start from" },
  { id: "latent", label: "Feature latents", explicit: "a learned summary per image patch", lost: "the summary is not human-readable",
    examples: "V-JEPA 2, DINO-WM (chapter 7)", cost: "pretrained on video; cheaper than pixels to predict" },
  { id: "points", label: "Point cloud", explicit: "3D position of visible surfaces", lost: "hidden surfaces, unless several views are fused",
    examples: "PointWorld, ParticleFormer, GeoVLA", cost: "needs depth sensing or reconstruction" },
  { id: "gauss", label: "Gaussians", explicit: "position, extent, orientation and colour of small blobs", lost: "physical properties; the blobs are visual",
    examples: "GWM, ManiGaussian++, 4DGS-WAM", cost: "re-renders to images, so it can be trained with photos" },
  { id: "particles", label: "Particles", explicit: "material points and how they are connected", lost: "appearance; requires choosing a material model",
    examples: "ParticleFormer; physics-informed PIN-WM", cost: "small, fast, and close to a physics engine" },
  { id: "occupancy", label: "Occupancy", explicit: "which cells of space are filled", lost: "detail below the cell size",
    examples: "occupancy world models in driving (chapter 16)", cost: "coarse but cheap; easy to check collisions" },
  { id: "contact", label: "Contact and touch", explicit: "where things touch and how hard they press", lost: "everything not in contact",
    examples: "VT-WM (visuo-tactile)", cost: "needs tactile sensors; little pretraining data" },
] as const;

type Rung = (typeof RUNGS)[number]["id"];

function Scene({ rung }: { rung: Rung }) {
  const col = "var(--fam-geometry)";
  if (rung === "rgb" || rung === "occupancy" || rung === "latent") {
    const cell = rung === "rgb" ? 6 : rung === "occupancy" ? 20 : 30;
    const cells: ReactElement[] = [];
    for (let x = 140; x < 720; x += cell) for (let y = 90; y < TABLE; y += cell) {
      const cx = x + cell / 2, cy = y + cell / 2;
      if (rung === "latent") {
        const hits = [0.25, 0.75].flatMap((a) => [0.25, 0.75].map((b) => solid(x + a * cell, y + b * cell))).filter(Boolean).length;
        cells.push(<rect key={`${x},${y}`} x={x + 1} y={y + 1} width={cell - 2} height={cell - 2} fill={col} opacity={0.1 + hits * 0.2} />);
      } else if (solid(cx, cy)) {
        const shade = inMug(cx, cy) ? 0.85 : inBox(cx, cy) ? 0.45 : 0.65;
        cells.push(<rect key={`${x},${y}`} x={x} y={y} width={cell - (rung === "occupancy" ? 2 : 0)} height={cell - (rung === "occupancy" ? 2 : 0)}
          fill={rung === "rgb" ? "var(--ink)" : col} opacity={rung === "rgb" ? shade : 0.75} />);
      }
    }
    return <g>{cells}{rung === "latent" && <text x={140} y={84} fontSize="12" fill="var(--ink-2)">each patch becomes a vector of learned numbers</text>}</g>;
  }
  if (rung === "points") {
    const pts = [...MUG_OUTLINE, ...CLOTH_PTS];
    return <g>
      {pts.filter(visible).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={col} />)}
      {pts.filter((p) => !visible(p)).map(([x, y], i) => <circle key={`h${i}`} cx={x} cy={y} r="3" fill="none" stroke="var(--ink-3)" strokeDasharray="1.5 1.5" />)}
      <text x={300} y={100} fontSize="12" fill="var(--ink-3)">hollow: hidden from the camera</text>
    </g>;
  }
  if (rung === "gauss") {
    const pts = [...MUG_OUTLINE, ...CLOTH_PTS];
    return <g>{pts.map(([x, y], i) => {
      const [nx, ny] = pts[Math.min(i + 1, pts.length - 1)];
      const ang = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
      return <ellipse key={i} cx={x} cy={y} rx="9" ry="3.5" transform={`rotate(${ang} ${x} ${y})`} fill={col} opacity="0.45" />;
    })}</g>;
  }
  if (rung === "particles") {
    return <g>
      {CLOTH_PTS.slice(1).map(([x, y], i) => <line key={i} x1={CLOTH_PTS[i][0]} y1={CLOTH_PTS[i][1]} x2={x} y2={y} stroke="var(--ink-3)" strokeWidth="1.5" />)}
      {CLOTH_PTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill={col} />)}
      {Array.from({ length: 12 }, (_, i) => <circle key={`m${i}`} cx={MUG.x + 12 + (i % 4) * 19} cy={MUG.y + 14 + Math.floor(i / 4) * 34} r="6" fill={col} opacity="0.7" />)}
      <text x={470} y={110} fontSize="12" fill="var(--ink-3)">cloth: particles joined by springs</text>
      <text x={150} y={100} fontSize="12" fill="var(--ink-3)">mug: one rigid cluster</text>
    </g>;
  }
  // contact
  const contacts: [number, number, number][] = [[MUG.x + 6, TABLE, 0], [MUG.x + MUG.w - 6, TABLE, 0], [BOX.x + 8, BOX.y - 6, -30], [BOX.x + BOX.w - 8, BOX.y - 6, 30], [470, 214, 0], [684, 214, 0]];
  return <g>
    <rect x={MUG.x} y={MUG.y} width={MUG.w} height={MUG.h} fill="none" stroke="var(--rule-strong)" />
    <polyline points={CLOTH.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--rule-strong)" strokeWidth="2" />
    {contacts.map(([x, y, a], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${a})`}>
        <circle r="6" fill={col} />
        <line x1={0} y1={-6} x2={0} y2={-30} stroke={col} strokeWidth="3" />
        <path d="M -5 -26 L 0 -34 L 5 -26 z" fill={col} />
      </g>
    ))}
    <text x={300} y={100} fontSize="12" fill="var(--ink-3)">arrows: where things press, and how hard</text>
  </g>;
}

/** Figure 9.1: one scene, seven representations, and what each makes explicit. */
export function RepresentationLadder() {
  const [rung, setRung] = useState<Rung>("points");
  const r = RUNGS.find((x) => x.id === rung)!;
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Representation">
        {RUNGS.map((x) => <button key={x.id} aria-pressed={rung === x.id} onClick={() => setRung(x.id)}>{x.label}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 240" role="img" aria-label={`The scene as ${r.label.toLowerCase()}: explicit is ${r.explicit}; lost is ${r.lost}.`}>
        <line x1={120} x2={740} y1={TABLE} y2={TABLE} stroke="var(--ink-2)" strokeWidth="2" />
        <g transform={`translate(${CAMERA[0]},${CAMERA[1]})`}>
          <rect x={-16} y={-10} width={32} height={20} rx="3" fill="var(--ink-2)" />
          <circle cx={14} cy={8} r="6" fill="var(--ink-2)" />
          <text x={-16} y={30} fontSize="11" fill="var(--ink-3)">camera</text>
        </g>
        {rung !== "rgb" && rung !== "occupancy" && rung !== "latent" && rung !== "contact" && (
          <g opacity="0.25">
            <rect x={MUG.x} y={MUG.y} width={MUG.w} height={MUG.h} fill="none" stroke="var(--ink-3)" />
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="none" stroke="var(--ink-3)" />
          </g>
        )}
        <Scene rung={rung} />
        <text x={MUG.x + 40} y={TABLE + 16} textAnchor="middle" fontSize="12" fill="var(--ink-2)">mug</text>
        <text x={BOX.x + 60} y={TABLE + 16} textAnchor="middle" fontSize="12" fill="var(--ink-2)">cloth over a box</text>
      </svg>
      <dl className={styles.readout} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", display: "grid", columnGap: "1.5rem" }}>
        <div><dt>Explicit</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{r.explicit}</dd></div>
        <div><dt>Lost</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{r.lost}</dd></div>
        <div><dt>Used by</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{r.examples}</dd></div>
        <div><dt>Cost</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{r.cost}</dd></div>
      </dl>
    </div>
  );
}
