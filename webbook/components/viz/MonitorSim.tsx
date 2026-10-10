"use client";
import { useState } from "react";
import { monitor } from "@/lib/sim/problems";
import styles from "./viz.module.css";

const N = 120, MAX = 0.25, STOP = 0.5;
const W = 860, L = 60, R = 840;
const sx = (i: number) => L + (i / (N - 1)) * (R - L);
const dist = Array.from({ length: N }, (_, i) => 1.6 - 1.3 * Math.exp(-(((i - 70) / 14) ** 2)));

/** Figure 17.4: a certified envelope around a learned policy. */
export function MonitorSim() {
  const [aggr, setAggr] = useState(1.4);
  const cmd = Array.from({ length: N }, (_, i) => aggr * 0.2 * (0.8 + 0.5 * Math.sin(i / 7)) * (i % 37 === 11 ? 1.8 : 1));
  const { out, changed } = monitor(cmd, dist, MAX, STOP);
  const vy = (v: number) => 150 - (v / 0.7) * 130, dy = (d: number) => 290 - (d / 1.8) * 110;
  const line = (vals: number[], f: (v: number) => number) => vals.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${f(v).toFixed(1)}`).join(" ");
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} 310`} role="img" aria-label={`The monitor changed ${changed} of ${N} commands: clamping speed and stopping while a person was within ${STOP} metres.`}>
        <text x="0" y="14" fontSize="12.5" fontWeight="600" fill="var(--ink)">Speed: commanded by the policy, and executed</text>
        <line x1={L} x2={R} y1={vy(MAX)} y2={vy(MAX)} stroke="var(--ink-2)" strokeDasharray="5 4" />
        <text x={R} y={vy(MAX) - 5} textAnchor="end" fontSize="11" fill="var(--ink-2)">speed limit</text>
        {dist.map((d, i) => d < STOP && <rect key={i} x={sx(i) - 3.5} y={20} width="7" height="270" fill="var(--surface-2)" />)}
        <path d={line(cmd, vy)} fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d={line(out, vy)} fill="none" stroke="var(--fam-reactive)" strokeWidth="2.5" />
        <line x1={L} x2={R} y1={vy(0)} y2={vy(0)} stroke="var(--rule-strong)" />
        <text x="0" y="186" fontSize="12.5" fontWeight="600" fill="var(--ink)">Distance to the nearest person</text>
        <line x1={L} x2={R} y1={dy(STOP)} y2={dy(STOP)} stroke="var(--ink-2)" strokeDasharray="5 4" />
        <text x={R} y={dy(STOP) - 5} textAnchor="end" fontSize="11" fill="var(--ink-2)">protective distance</text>
        <path d={line(dist, dy)} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <line x1={L} x2={R} y1={dy(0)} y2={dy(0)} stroke="var(--rule-strong)" />
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchDash} /><span style={{ color: "var(--ink-2)" }}>what the learned policy asks for</span></span>
        <span className={styles.legendItem} style={{ color: "var(--fam-reactive)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>what the monitor lets through</span></span>
        <span className={styles.legendItem}><span style={{ width: 12, height: 12, background: "var(--surface-2)", border: "1px solid var(--rule)" }} />person inside the protective distance</span>
      </div>
      <div className={styles.split}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>How hard the policy pushes</span><span className={styles.sliderValue}>{aggr.toFixed(1)}×</span></span>
          <input type="range" min={0.5} max={2.5} step={0.1} value={aggr} onChange={(e) => setAggr(Number(e.target.value))} />
          <span className={styles.sliderNote}>The monitor does not need to know what the policy is trying to do, only the envelope.</span>
        </label>
        <dl className={styles.readout}>
          <div><dt>Commands the monitor changed</dt><dd>{changed} of {N}</dd></div>
          <div><dt>Time stopped for a person</dt><dd>{dist.filter((d) => d < STOP).length} steps</dd></div>
        </dl>
      </div>
    </div>
  );
}
