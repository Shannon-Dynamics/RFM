"use client";
import { useState } from "react";
import { EGOSCALE, fitLogLinear, fitPowerLaw } from "@/lib/sim/data";
import styles from "./viz.module.css";

const lin = fitLogLinear(EGOSCALE), pow = fitPowerLaw(EGOSCALE);
const W = 860, L = 60, R = 840, T = 16, B = 266;
const LO = 3, HI = 6; // 1k to 1M hours
const sx = (h: number) => L + ((Math.log10(h) - LO) / (HI - LO)) * (R - L);
const sy = (v: number) => B - (v / 1.6) * (B - T);
const OTHERS = [{ h: 270000, label: "GEN-0 data" }, { h: 1000000, label: "Dyna-2 data" }];

/** Figure 13.3: five reported points, two curves that fit them, and what each says beyond them. */
export function ScalingCurves() {
  const [lg, setLg] = useState(5); // log10 hours
  const h = 10 ** lg;
  const curve = (f: (x: number) => number) =>
    Array.from({ length: 121 }, (_, i) => 10 ** (LO + (i / 120) * (HI - LO))).map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`).join(" ");
  const fmt = (x: number) => (x >= 1e6 ? `${(x / 1e6).toFixed(1)}M` : `${Math.round(x / 1000)}k`);
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} 312`} role="img"
        aria-label={`EgoScale's five points from 1,000 to 20,000 hours, with a log-linear and a power-law fit. At ${fmt(h)} hours the log-linear curve predicts ${pct(lin(h))} and the power law ${pct(pow(h))}.`}>
        <rect x={sx(1000)} y={T} width={sx(20000) - sx(1000)} height={B - T} fill="var(--surface-2)" />
        <text x={sx(1000) + 6} y={T + 14} fontSize="12" fill="var(--ink-2)">measured range, 1k to 20k hours</text>
        {[0, 0.5, 1, 1.5].map((v) => (
          <g key={v}>
            <line x1={L} x2={R} y1={sy(v)} y2={sy(v)} stroke={v === 1 ? "var(--ink-2)" : "var(--rule)"} strokeDasharray={v === 1 ? "6 4" : undefined} />
            <text x={L - 8} y={sy(v) + 4} textAnchor="end" fontSize="12" fill="var(--ink-3)">{v * 100}%</text>
          </g>
        ))}
        <text x={sx(1000) + 6} y={sy(1) - 6} fontSize="12" fill="var(--ink-2)">100%: every task completed, the ceiling</text>
        {[1e3, 1e4, 1e5, 1e6].map((x) => <text key={x} x={sx(x)} y={B + 18} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{fmt(x)} h</text>)}
        <text x={(L + R) / 2} y={B + 34} textAnchor="middle" fontSize="12" fill="var(--ink-2)">hours of human pretraining data (log scale)</text>
        {OTHERS.map((o) => (
          <g key={o.label}>
            <line x1={sx(o.h)} x2={sx(o.h)} y1={T + 22} y2={B} stroke="var(--rule-strong)" strokeDasharray="2 3" />
            <text x={sx(o.h) - 4} y={T + 34} textAnchor="end" fontSize="11" fill="var(--ink-3)">{o.label}</text>
          </g>
        ))}
        <clipPath id="sc-plot"><rect x={L} y={T} width={R - L} height={B - T} /></clipPath>
        <g clipPath="url(#sc-plot)">
          <path d={curve(lin)} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
          <path d={curve(pow)} fill="none" stroke="var(--ink-2)" strokeWidth="2.2" strokeDasharray="7 4" />
        </g>
        {EGOSCALE.map(([x, y]) => <circle key={x} cx={sx(x)} cy={sy(y)} r="5.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />)}
        <line x1={sx(h)} x2={sx(h)} y1={T} y2={B} stroke="var(--ink)" />
        <circle cx={sx(h)} cy={sy(lin(h))} r="4" fill="var(--ink)" />
        <circle cx={sx(h)} cy={sy(Math.min(1.6, pow(h)))} r="4" fill="var(--ink-2)" />
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid var(--ink)" }} />EgoScale, average task completion (vendor claim)</span>
        <span className={styles.legendItem} style={{ color: "var(--ink)" }}><span className={styles.swatchLine} />log-linear fit</span>
        <span className={styles.legendItem} style={{ color: "var(--ink-2)" }}><span className={styles.swatchDash} />power-law fit</span>
      </div>
      <div className={styles.split}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Extrapolate to</span><span className={styles.sliderValue}>{fmt(h)} hours</span></span>
          <input type="range" min={3} max={6} step={0.05} value={lg} onChange={(e) => setLg(Number(e.target.value))} />
          <span className={styles.sliderNote}>Both curves miss the five points by about 3 points of completion on average.</span>
        </label>
        <dl className={styles.readout}>
          <div><dt>Log-linear predicts</dt><dd>{pct(lin(h))}{lin(h) > 1 && <small>impossible: above the ceiling</small>}</dd></div>
          <div><dt>Power law predicts</dt><dd>{pct(pow(h))}{pow(h) > 1 && <small>impossible: above the ceiling</small>}</dd></div>
        </dl>
      </div>
    </div>
  );
}
