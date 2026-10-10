"use client";
import { useState } from "react";
import { arc, choose, collides, CURVATURES, dist, GOAL, OBSTACLES, ROBOT_R, type P } from "@/lib/sim/nav";
import styles from "./viz.module.css";

const W = 860, H = 400, S = 50, OX = 290, OY = 295;
const sx = (x: number) => OX + x * S, sy = (y: number) => OY - y * S;
const path = (p: P[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");

/** Figure 16.3: choose a path by imagining it, with a world model that may be wrong about turning. */
export function LookAhead() {
  const [bias, setBias] = useState(1);
  const i = choose(bias);
  const k = i === null ? null : CURVATURES[i];
  const imagined = k === null ? null : arc(k * bias), real = k === null ? null : arc(k);
  const crash = real ? collides(real) : false;
  const end = real ? real[real.length - 1] : null;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={k === null ? "Every imagined path collides; the robot stops." : `The model believes turns are ${bias} times as sharp as they are. It chooses curvature ${k}; the real path ${crash ? "hits a pillar" : `ends ${dist(end!, GOAL).toFixed(2)} metres from the goal`}.`}>
        <clipPath id="la-room"><rect x={sx(-1.5)} y={sy(5.6)} width={9 * S} height={7.8 * S} /></clipPath>
        <rect x={sx(-1.5)} y={sy(5.6)} width={9 * S} height={7.8 * S} fill="var(--surface-2)" />
        <g clipPath="url(#la-room)">
        {CURVATURES.map((c) => <path key={c} d={path(arc(c * bias))} fill="none" stroke="var(--rule-strong)" strokeWidth="1" opacity="0.7" />)}
        {OBSTACLES.map((o, j) => (
          <g key={j}>
            <circle cx={sx(o.c[0])} cy={sy(o.c[1])} r={(o.r + ROBOT_R) * S} fill="none" stroke="var(--rule-strong)" strokeDasharray="3 3" />
            <circle cx={sx(o.c[0])} cy={sy(o.c[1])} r={o.r * S} fill="var(--ink-3)" />
            <text x={sx(o.c[0])} y={sy(o.c[1]) + 4} textAnchor="middle" fontSize="11" fill="var(--surface)">pillar</text>
          </g>
        ))}
        {imagined && <path d={path(imagined)} fill="none" stroke="var(--fam-simulator)" strokeWidth="3" strokeDasharray="8 5" />}
        {real && <path d={path(real)} fill="none" stroke="var(--ink)" strokeWidth="3" />}
        {real && crash && (() => {
          const hit = real.find((p) => OBSTACLES.some((o) => dist(p, o.c) < o.r + ROBOT_R))!;
          return <g><circle cx={sx(hit[0])} cy={sy(hit[1])} r="9" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={sx(hit[0]) + 14} y={sy(hit[1]) - 10} fontSize="12" fontWeight="700" fill="var(--ink)">collision</text></g>;
        })()}
        </g>
        <circle cx={sx(0)} cy={sy(0)} r="9" fill="var(--ink)" />
        <text x={sx(0) - 14} y={sy(0) + 4} textAnchor="end" fontSize="12" fill="var(--ink-2)">robot</text>
        <rect x={sx(GOAL[0]) - 8} y={sy(GOAL[1]) - 8} width="16" height="16" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={sx(GOAL[0]) + 14} y={sy(GOAL[1]) + 4} fontSize="12" fill="var(--ink-2)">goal</text>
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--rule-strong)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>candidate paths, as the model imagines them</span></span>
        <span className={styles.legendItem} style={{ color: "var(--fam-simulator)" }}><span className={styles.swatchDash} /><span style={{ color: "var(--ink-2)" }}>the chosen path, imagined</span></span>
        <span className={styles.legendItem} style={{ color: "var(--ink)" }}><span className={styles.swatchLine} />the chosen path, driven</span>
      </div>
      <div className={styles.split}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>World model&rsquo;s turning error</span><span className={styles.sliderValue}>{bias.toFixed(2)}×</span></span>
          <input type="range" min={0.5} max={2} step={0.05} value={bias} onChange={(e) => setBias(Number(e.target.value))} />
          <span className={styles.sliderNote}>1.00 is an accurate model. Above 1 it believes the robot turns more sharply than it does; below 1, less.</span>
        </label>
        <dl className={styles.readout}>
          <div><dt>Chosen curvature</dt><dd>{k === null ? "none: every path looks blocked" : k.toFixed(2)}</dd></div>
          <div><dt>What really happens</dt><dd>{k === null ? "the robot stays put" : crash ? "hits a pillar" : `${dist(end!, GOAL).toFixed(2)} m from the goal`}</dd></div>
        </dl>
      </div>
    </div>
  );
}
