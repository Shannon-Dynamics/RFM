"use client";
import { useMemo, useState } from "react";
import styles from "./viz.module.css";

interface Ep { i: number; above: boolean; fast: boolean; mistake: boolean; quality: number; pts: [number, number][] }

const START: [number, number] = [70, 135], GOAL: [number, number] = [790, 135], OB: [number, number] = [430, 135];

function episodes(): Ep[] {
  return Array.from({ length: 24 }, (_, i) => {
    const above = i % 2 === 0, fast = i % 3 !== 0, mistake = i % 5 === 0;
    const quality = mistake ? 2 : fast ? (i % 4 < 2 ? 5 : 4) : 3;
    const cy = (above ? -10 : 280) + ((i * 37) % 17) - 8;
    const pts: [number, number][] = [];
    for (let k = 0; k <= 60; k++) {
      const t = k / 60;
      let x = (1 - t) ** 2 * START[0] + 2 * (1 - t) * t * OB[0] + t * t * GOAL[0];
      let y = (1 - t) ** 2 * START[1] + 2 * (1 - t) * t * cy + t * t * GOAL[1];
      if (mistake && t > 0.28 && t < 0.42) {
        const u = ((t - 0.28) / 0.14) * 2 * Math.PI;
        x += 16 * Math.sin(u);
        y += (above ? 1 : -1) * 16 * (1 - Math.cos(u));
      }
      pts.push([x, y]);
    }
    return { i, above, fast, mistake, quality, pts };
  });
}

const PROMPTS = [
  { id: 0, label: "Task only", text: "Task: go to the goal." },
  { id: 1, label: "+ metadata", text: "Task: go to the goal. Speed: fast. Quality: 5. Mistake: false." },
  { id: 2, label: "+ subgoal image", text: "Task: go to the goal. Speed: fast. Quality: 5. Mistake: false. <subgoal: passing above>" },
];

/** Figure 14.4: one model, three prompts, three behaviours. */
export function SteerPaths() {
  const eps = useMemo(episodes, []);
  const [p, setP] = useState(1);
  const [draw, setDraw] = useState(0);
  const match = eps.filter((e) => (p < 1 || (e.fast && e.quality === 5 && !e.mistake)) && (p < 2 || e.above));
  const sample = match[(draw * 7) % match.length];
  const pct = (f: (e: Ep) => boolean) => `${Math.round((100 * match.filter(f).length) / match.length)}%`;
  const path = (pts: [number, number][]) => pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = sample.pts.filter((_, k) => k % (sample.fast ? 6 : 3) === 0);

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Prompt">
          {PROMPTS.map((q) => <button key={q.id} aria-pressed={p === q.id} onClick={() => setP(q.id)}>{q.label}</button>)}
        </div>
        <button className={styles.button} onClick={() => setDraw((d) => d + 1)}>Sample again</button>
      </div>
      <p className={styles.note} style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{PROMPTS[p].text}</p>
      <svg className={styles.svg} viewBox="0 0 860 280" role="img"
        aria-label={`${match.length} of 24 demonstrations match the prompt. The sampled behaviour goes ${sample.above ? "above" : "below"} the obstacle, ${sample.fast ? "fast" : "slowly"}${sample.mistake ? ", with a fumble" : ""}.`}>
        <circle cx={OB[0]} cy={OB[1]} r="46" fill="var(--surface-2)" stroke="var(--ink-3)" />
        <text x={OB[0]} y={OB[1] + 4} textAnchor="middle" fontSize="12" fill="var(--ink-2)">obstacle</text>
        {eps.map((e) => <path key={e.i} d={path(e.pts)} fill="none" stroke={match.includes(e) ? "var(--ink-2)" : "var(--rule)"} strokeWidth={match.includes(e) ? 1.6 : 1} opacity={match.includes(e) ? 0.8 : 0.7} />)}
        <path d={path(sample.pts)} fill="none" stroke="var(--fam-reactive)" strokeWidth="3.5" />
        {dots.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="3.5" fill="var(--fam-reactive)" stroke="var(--surface)" strokeWidth="1" />)}
        <circle cx={START[0]} cy={START[1]} r="7" fill="var(--ink)" />
        <text x={START[0]} y={START[1] + 24} textAnchor="middle" fontSize="12" fill="var(--ink-2)">start</text>
        <rect x={GOAL[0] - 8} y={GOAL[1] - 8} width="16" height="16" fill="var(--ink)" />
        <text x={GOAL[0]} y={GOAL[1] + 26} textAnchor="middle" fontSize="12" fill="var(--ink-2)">goal</text>
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-2)" }}><span className={styles.swatchLine} />demonstrations matching the prompt</span>
        <span className={styles.legendItem} style={{ color: "var(--rule-strong)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>other demonstrations</span></span>
        <span className={styles.legendItem} style={{ color: "var(--fam-reactive)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>what the model does; dots are equal time steps</span></span>
      </div>
      <dl className={styles.readout} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", columnGap: "1.5rem" }}>
        <div><dt>Demonstrations matching</dt><dd>{match.length} of 24</dd></div>
        <div><dt>With a fumble</dt><dd>{pct((e) => e.mistake)}</dd></div>
        <div><dt>Slow</dt><dd>{pct((e) => !e.fast)}</dd></div>
        <div><dt>Passing above</dt><dd>{pct((e) => e.above)}</dd></div>
      </dl>
    </div>
  );
}
