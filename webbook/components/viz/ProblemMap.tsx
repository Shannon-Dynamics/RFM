"use client";
import { useState } from "react";
import { FAMILIES, family } from "@/content/book";
import { PROBLEMS } from "@/content/ch17/problems";
import styles from "./viz.module.css";

const PX = 20, PW = 300, FX = 600, FW = 240, ROW = 34;
const py = (i: number) => 16 + i * ROW, fy = (i: number) => 40 + i * 46;

/** Figure 17.1: ten open problems and the families each one hits hardest. */
export function ProblemMap() {
  const [sel, setSel] = useState(8);
  const p = PROBLEMS[sel];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 360" role="group" aria-label="Ten open problems linked to the families they affect most">
        {PROBLEMS.map((pr, i) => pr.hits.map((h) => {
          const j = FAMILIES.findIndex((f) => f.id === h), on = i === sel;
          return (
            <path key={`${pr.n}-${h}`} d={`M ${PX + PW} ${py(i) + 13} C ${(PX + PW + FX) / 2} ${py(i) + 13}, ${(PX + PW + FX) / 2} ${fy(j) + 15}, ${FX} ${fy(j) + 15}`}
              fill="none" stroke={on ? `var(--fam-${h})` : "var(--rule)"} strokeWidth={on ? 3 : 1} opacity={on ? 1 : 0.8} />
          );
        }))}
        {PROBLEMS.map((pr, i) => {
          const on = i === sel;
          return (
            <g key={pr.n} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }} aria-label={`Problem ${pr.n}: ${pr.title}`}
              onClick={() => setSel(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(i)}>
              <rect x={PX} y={py(i)} width={PW} height={26} rx="6" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--rule-strong)" />
              <text x={PX + 10} y={py(i) + 17.5} fontSize="12.5" fontWeight={on ? 700 : 500} fill={on ? "var(--surface)" : "var(--ink)"}>{pr.n}. {pr.title}</text>
            </g>
          );
        })}
        {FAMILIES.map((f, j) => {
          const on = p.hits.includes(f.id);
          return (
            <g key={f.id}>
              <rect x={FX} y={fy(j)} width={FW} height={30} rx="6" fill={on ? `var(--fam-${f.id})` : "var(--surface)"} stroke={`var(--fam-${f.id})`} strokeWidth="2" />
              <text x={FX + 12} y={fy(j) + 20} fontSize="12.5" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{f.short} (ch. {f.chapter})</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{p.n}. {p.title}</h4>
        <p>{p.plain}</p>
        <p><strong>A failure you have already seen:</strong> {p.failure} See {p.see}.</p>
        <p className={styles.cardMeta}>Hits hardest: {p.hits.length === 7 ? "every family" : p.hits.map((h) => family(h).short).join(", ")}.</p>
      </div>
    </div>
  );
}
