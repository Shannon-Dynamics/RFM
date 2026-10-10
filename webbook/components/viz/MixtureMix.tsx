"use client";
import { useState } from "react";
import { mixtureWeights } from "@/lib/sim/data";
import { textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

// The crate's example mixture (rust/ch13-data, example_mixture): sizes as each source reports them.
const SOURCES = [
  { name: "DROID", hours: 350, kind: "teleoperation" },
  { name: "TRI-Ramen", hours: 545, kind: "teleoperation" },
  { name: "EgoDex", hours: 829, kind: "human video" },
  { name: "Synthetic", hours: 6500, kind: "generated" },
  { name: "EgoScale", hours: 20854, kind: "human video" },
];
const TOTAL = SOURCES.reduce((s, x) => s + x.hours, 0);
const SHADES = ["var(--ink)", "var(--ink-2)", "var(--fam-lbm)", "var(--ink-3)", "var(--rule-strong)"];

/** Figure 13.5: temperature sampling, and how often it repeats the small datasets. */
export function MixtureMix() {
  const [alpha, setAlpha] = useState(0.5);
  const w = mixtureWeights(SOURCES.map((s) => s.hours), alpha);
  const epochs = w.map((x, i) => (TOTAL * x) / SOURCES[i].hours);
  const maxE = Math.max(...epochs);
  const ex = (e: number) => 200 + (Math.min(e, 20) / 20) * 620;
  let x0 = 0;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 236" role="img"
        aria-label={`With alpha ${alpha}, shares of training samples: ${SOURCES.map((s, i) => `${s.name} ${Math.round(w[i] * 100)} percent`).join(", ")}. The most repeated dataset is seen ${maxE.toFixed(1)} times.`}>
        <text x="0" y="16" fontSize="13" fontWeight="600" fill="var(--ink)">Share of training samples</text>
        {SOURCES.map((s, i) => {
          const wd = w[i] * 860, x = x0;
          x0 += wd;
          return (
            <g key={s.name}>
              <rect x={x} y={26} width={Math.max(0, wd - 1)} height={30} fill={SHADES[i]} />
              {wd > textWidth(`${s.name} ${Math.round(w[i] * 100)}%`, 11.5) * 1.07 && <text x={x + 6} y={46} fontSize="11.5" fontWeight="600" fill={i < 3 ? "var(--surface)" : "var(--ink)"}>{s.name} {Math.round(w[i] * 100)}%</text>}
            </g>
          );
        })}
        <text x="0" y="90" fontSize="13" fontWeight="600" fill="var(--ink)">Times each dataset is seen in one pass of {TOTAL.toLocaleString("en-GB")} hours</text>
        {SOURCES.map((s, i) => {
          const y = 102 + i * 24;
          return (
            <g key={s.name}>
              <text x="0" y={y + 14} fontSize="12" fill="var(--ink)">{s.name}</text>
              <text x="190" y={y + 14} textAnchor="end" fontSize="11" fill="var(--ink-3)">{s.hours.toLocaleString("en-GB")} h, {s.kind}</text>
              <rect x={200} y={y + 3} width={ex(epochs[i]) - 200} height={14} fill={SHADES[i]} />
              <text x={ex(epochs[i]) + 6} y={y + 14} fontSize="11.5" fill="var(--ink-2)">{epochs[i].toFixed(1)}×</text>
            </g>
          );
        })}
        <line x1={ex(5)} x2={ex(5)} y1={98} y2={226} stroke="var(--ink-2)" strokeDasharray="4 3" />
        <text x={ex(5) + 4} y={232} fontSize="11" fill="var(--ink-3)">5×: the limit in exercise 13.2</text>
      </svg>
      <div className={styles.split}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Sampling temperature &alpha;</span><span className={styles.sliderValue}>{alpha.toFixed(2)}</span></span>
          <input type="range" min={0} max={1} step={0.05} value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} />
          <span className={styles.sliderNote}>0: every dataset gets the same share. 1: shares in proportion to hours.</span>
        </label>
        <dl className={styles.readout}>
          <div><dt>Most repeated dataset</dt><dd>{maxE.toFixed(1)}×<small>{SOURCES[epochs.indexOf(maxE)].name}</small></dd></div>
          <div><dt>Robot-action data in the mix</dt><dd>{Math.round((w[0] + w[1] + w[3]) * 100)}%<small>teleoperation and generated trajectories</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
