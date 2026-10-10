"use client";
import { useState } from "react";
import { PROBLEMS } from "@/content/ch17/problems";
import { halo } from "@/lib/layout";
import styles from "./viz.module.css";

const W = 860, L = 80, R = 830, T = 20, B = 300;
const PLACE: Record<number, "left" | "right" | "below"> = { 1: "below", 2: "left", 3: "left", 4: "below" };
const sx = (a: number) => L + ((a - 0.5) / 2.7) * (R - L), sy = (s: number) => B - ((s - 1.5) / 1.7) * (B - T);

/** Figure 17.2: how severe each problem is against how much research attention it gets. */
export function SeverityAttention() {
  const [sel, setSel] = useState(9);
  const p = PROBLEMS.find((x) => x.n === sel)!;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} 340`} role="group" aria-label="Problems placed by severity and research attention">
        <rect x={L} y={T} width={sx(1.6) - L} height={sy(2.6) - T} fill="var(--surface-2)" stroke="var(--ink-2)" strokeDasharray="6 4" />
        <text x={L + 8} y={T + 18} fontSize="12.5" fontWeight="700" fill="var(--ink)">severe, under-researched</text>
        <line x1={L} x2={R} y1={B} y2={B} stroke="var(--rule-strong)" />
        <line x1={L} x2={L} y1={T} y2={B} stroke="var(--rule-strong)" />
        <text x={L} y={B + 20} fontSize="12" fill="var(--ink-2)">little research attention</text>
        <text x={R} y={B + 20} textAnchor="end" fontSize="12" fill="var(--ink-2)">much research attention</text>
        <text x={L - 8} y={T + 10} textAnchor="end" fontSize="12" fill="var(--ink-2)">severe</text>
        <text x={L - 8} y={B} textAnchor="end" fontSize="12" fill="var(--ink-2)">milder</text>
        <text x={(L + R) / 2} y={B + 36} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)">the authors&rsquo; judgement, October 2026</text>
        {PROBLEMS.map((pr) => {
          const on = pr.n === sel, x = sx(pr.attention), y = sy(pr.severity);
          return (
            <g key={pr.n} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }} aria-label={`Problem ${pr.n}, ${pr.title}`}
              onClick={() => setSel(pr.n)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(pr.n)}>
              <circle cx={x} cy={y} r={on ? 15 : 13} fill={on ? "var(--ink)" : "var(--surface)"} stroke="var(--ink)" strokeWidth="2" />
              <text x={x} y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={on ? "var(--surface)" : "var(--ink)"}>{pr.n}</text>
              <text x={PLACE[pr.n] === "left" ? x - 19 : PLACE[pr.n] === "below" ? x : x + 19} y={PLACE[pr.n] === "below" ? y + 32 : y + 4.5}
                textAnchor={PLACE[pr.n] === "left" ? "end" : PLACE[pr.n] === "below" ? "middle" : "start"} fontSize="12" fill="var(--ink-2)" {...halo}>{pr.short}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{p.n}. {p.title}</h4>
        <p>{p.plain}</p>
      </div>
    </div>
  );
}
