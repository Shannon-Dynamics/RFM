"use client";
import { useState } from "react";
import { IMPLICATIONS, TOP_FIVE } from "@/lib/sim/deploy";
import styles from "./viz.module.css";

const CX = 430, CY = 200, RAD = 150, MAXV = 0.5;
const pt = (i: number, v: number) => {
  const a = -Math.PI / 2 + (i / 11) * 2 * Math.PI;
  return [CX + (v / MAXV) * RAD * Math.cos(a), CY + (v / MAXV) * RAD * Math.sin(a)];
};

/** Figure 15.4: the industrial readiness profile of the survey's five highest-rated models. */
export function ReadinessRadar() {
  const [m, setM] = useState(0);
  const p = TOP_FIVE[m];
  return (
    <div className={styles.stack}>
      <div className={styles.row} role="group" aria-label="Model">
        {TOP_FIVE.map((x, i) => <button key={x.model} className={styles.chip} aria-pressed={m === i} onClick={() => setM(i)}>{x.model}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 400" role="img"
        aria-label={`${p.model}: ${IMPLICATIONS.map((n, i) => `${n} ${Math.round(p.profile[i] * 100)} percent`).join("; ")}.`}>
        {[0.1, 0.2, 0.3, 0.4, 0.5].map((v) => (
          <polygon key={v} points={IMPLICATIONS.map((_, i) => pt(i, v).join(",")).join(" ")} fill="none" stroke="var(--rule)" />
        ))}
        {[0.1, 0.3, 0.5].map((v) => <text key={v} x={CX + 4} y={CY - (v / MAXV) * RAD + 12} fontSize="10.5" fill="var(--ink-3)">{v * 100}%</text>)}
        {IMPLICATIONS.map((n, i) => {
          const [x, y] = pt(i, MAXV * 1.12);
          const [lx, ly] = pt(i, MAXV);
          return (
            <g key={n}>
              <line x1={CX} y1={CY} x2={lx} y2={ly} stroke="var(--rule)" />
              <text x={x} y={y + 4} textAnchor={x < CX - 10 ? "end" : x > CX + 10 ? "start" : "middle"} fontSize="11.5" fill="var(--ink-2)">{n}</text>
            </g>
          );
        })}
        <polygon points={p.profile.map((v, i) => pt(i, v).join(",")).join(" ")} fill="var(--fam-reactive)" fillOpacity="0.25" stroke="var(--fam-reactive)" strokeWidth="2.5" />
        {p.profile.map((v, i) => { const [x, y] = pt(i, v); return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--fam-reactive)" />; })}
      </svg>
      <dl className={styles.readout} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", columnGap: "1.5rem" }}>
        <div><dt>Share of all 149 criteria fulfilled</dt><dd>{Math.round(p.total * 100)}%</dd></div>
        <div><dt>Strongest implication</dt><dd style={{ fontSize: "1rem" }}>{IMPLICATIONS[p.profile.indexOf(Math.max(...p.profile))]}</dd></div>
        <div><dt>Implications with nothing fulfilled</dt><dd>{p.profile.filter((v) => v === 0).length} of 11</dd></div>
      </dl>
    </div>
  );
}
