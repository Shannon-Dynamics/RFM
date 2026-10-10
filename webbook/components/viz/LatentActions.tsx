"use client";
import { useEffect, useState } from "react";
import { quantize, ring, type V2 } from "@/lib/sim/latent";
import styles from "./viz.module.css";

// Tracked positions (camera units, 0 to 3) of a hand and of a gripper doing the same task: slide a
// cup right, lift it, pause, bring it back left.
const CLIPS: Record<"human" | "robot", { label: string; path: V2[] }> = {
  human: { label: "Human video", path: [[0.4, 0.5], [1.3, 0.55], [2.25, 0.5], [2.3, 1.45], [2.35, 2.4], [2.3, 2.45], [1.4, 2.5], [0.45, 2.45]] },
  robot: { label: "Robot video", path: [[0.5, 0.4], [1.45, 0.45], [2.45, 0.4], [2.45, 1.35], [2.5, 2.35], [2.45, 2.4], [1.5, 2.45], [0.55, 2.4]] },
};
const CODES = ring(8, 1);
const STEPS = 7;

const tokens = (p: V2[]) => p.slice(1).map((q, i) => quantize(CODES, [q[0] - p[i][0], q[1] - p[i][1]]));

function CodeGlyph({ c, x, y, r, on }: { c: number; x: number; y: number; r: number; on?: boolean }) {
  const col = on ? "var(--fam-latent)" : "var(--ink-3)";
  if (c === 0) return <circle cx={x} cy={y} r={r * 0.28} fill={col} />;
  const [dx, dy] = CODES[c];
  return <line x1={x - dx * r * 0.55} y1={y + dy * r * 0.55} x2={x + dx * r * 0.55} y2={y - dy * r * 0.55}
    stroke={col} strokeWidth={on ? 3 : 2} markerEnd={on ? "url(#la-on)" : "url(#la-off)"} />;
}

function Frame({ x, y, title, p, ghost, kind }: { x: number; y: number; title: string; p: V2; ghost?: V2; kind: "human" | "robot" }) {
  const S = 120, at = (q: V2) => [x + 10 + (q[0] / 3) * (S - 20), y + S - 10 - (q[1] / 3) * (S - 20)];
  const [gx, gy] = at(p);
  return (
    <g>
      <text x={x} y={y - 8} fontSize="12" fill="var(--ink-2)">{title}</text>
      <rect x={x} y={y} width={S} height={S} rx="4" fill="var(--surface-2)" stroke="var(--rule-strong)" />
      <line x1={x} x2={x + S} y1={y + S - 18} y2={y + S - 18} stroke="var(--rule)" />
      {ghost && (() => { const [hx, hy] = at(ghost); return <circle cx={hx} cy={hy} r="11" fill="none" stroke="var(--fam-latent)" strokeWidth="2" strokeDasharray="4 3" />; })()}
      {kind === "human" ? (
        <g transform={`translate(${gx},${gy})`}>
          <rect x={-9} y={-6} width={18} height={14} rx="5" fill="var(--ink-2)" />
          {[-7, -2.5, 2, 6.5].map((fx) => <rect key={fx} x={fx - 1.5} y={-14} width={3} height={9} rx="1.5" fill="var(--ink-2)" />)}
        </g>
      ) : (
        <g transform={`translate(${gx},${gy})`}>
          <path d="M -10 -10 L -10 6 L 10 6 L 10 -10" fill="none" stroke="var(--ink-2)" strokeWidth="3.5" />
          <line x1={0} x2={0} y1={6} y2={14} stroke="var(--ink-2)" strokeWidth="3.5" />
        </g>
      )}
    </g>
  );
}

/** Figure 7.2: a latent action is read off two frames, and then drives a forward model. */
export function LatentActions() {
  const [clip, setClip] = useState<"human" | "robot">("human");
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPlaying(false); return; }
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setK((s) => (s + 1) % STEPS), 1100);
    return () => window.clearInterval(id);
  }, [playing]);

  const path = CLIPS[clip].path;
  const code = tokens(path)[k];
  const predicted: V2 = [path[k][0] + CODES[code][0], path[k][1] + CODES[code][1]];
  const cx = 600, cy = 96, R = 56;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Video">
          {(Object.keys(CLIPS) as ("human" | "robot")[]).map((c) => (
            <button key={c} aria-pressed={clip === c} onClick={() => setClip(c)}>{CLIPS[c].label}</button>
          ))}
        </div>
        <button className={styles.button} onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
        <button className={styles.button} onClick={() => { setPlaying(false); setK((s) => (s + 1) % STEPS); }}>Step</button>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 300" role="img"
        aria-label={`${CLIPS[clip].label}, frames ${k} and ${k + 1}: the latent action is code ${code}. Both videos give the same sequence of latent actions.`}>
        <defs>
          {[["la-on", "var(--fam-latent)"], ["la-off", "var(--ink-3)"], ["la-ink", "var(--ink)"]].map(([id, c]) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>
        <Frame x={0} y={26} title={`frame ${k}`} p={path[k]} kind={clip} />
        <Frame x={132} y={26} title={`frame ${k + 1}`} p={path[k + 1]} kind={clip} />
        <path d="M 256 86 L 290 86" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#la-ink)" />
        <rect x="294" y="54" width="186" height="64" rx="8" fill="var(--ink)" />
        <text x="387" y="82" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--surface)">latent action model</text>
        <text x="387" y="102" textAnchor="middle" fontSize="12" fill="var(--surface)" opacity="0.8">what changed between frames?</text>
        <path d="M 482 86 L 534 90" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#la-ink)" />

        <circle cx={cx} cy={cy} r={R + 12} fill="none" stroke="var(--rule)" />
        {CODES.map((c, i) => {
          const px = i === 0 ? cx : cx + c[0] * R, py = i === 0 ? cy : cy - c[1] * R;
          return <CodeGlyph key={i} c={i} x={px} y={py} r={30} on={i === code} />;
        })}
        <text x={cx} y={cy + R + 30} textAnchor="middle" fontSize="12" fill="var(--ink-2)">codebook: 9 latent actions</text>

        <path d="M 676 86 L 710 86" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#la-ink)" />
        <Frame x={716} y={26} title="forward model" p={path[k + 1]} ghost={predicted} kind={clip} />

        <text x="0" y="214" fontSize="12" fontWeight="600" fill="var(--ink)">Latent actions read from each video</text>
        {(Object.keys(CLIPS) as ("human" | "robot")[]).map((c, row) => (
          <g key={c}>
            <text x="0" y={246 + row * 36} fontSize="12" fill="var(--ink-2)">{CLIPS[c].label.toLowerCase()}</text>
            {tokens(CLIPS[c].path).map((t, i) => (
              <g key={i}>
                <rect x={120 + i * 46} y={226 + row * 36} width="38" height="30" rx="4"
                  fill={i === k ? "var(--surface-2)" : "none"} stroke={i === k ? "var(--fam-latent)" : "var(--rule-strong)"} strokeWidth={i === k ? 2 : 1} />
                <CodeGlyph c={t} x={139 + i * 46} y={241 + row * 36} r={26} on={i === k} />
              </g>
            ))}
          </g>
        ))}
        <text x="460" y="250" fontSize="12" fill="var(--ink-2)">Same task, different bodies:</text>
        <text x="460" y="268" fontSize="12" fill="var(--ink-2)">the same sequence of latent actions.</text>
        <text x="716" y="168" fontSize="11" fill="var(--ink-3)">dashed: predicted from</text>
        <text x="716" y="182" fontSize="11" fill="var(--ink-3)">frame {k} and the</text>
        <text x="716" y="196" fontSize="11" fill="var(--ink-3)">latent action</text>
      </svg>
    </div>
  );
}
