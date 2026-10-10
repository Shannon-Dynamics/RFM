"use client";
import { useState } from "react";
import styles from "./viz.module.css";

// Implication numbers and names follow the industrial readiness survey (arXiv 2603.06749).
const MARKS = [
  { n: 9, x: 330, y: 40, name: "Sensor fusion and perception", where: "the camera over the tote", check: "Transparent, reflective and deformable items; lighting changes across shifts." },
  { n: 4, x: 180, y: 190, name: "Robustness and reliability", where: "the cluttered source tote", check: "Success rate over thousands of picks with confidence intervals, and what happens after a failed grasp." },
  { n: 5, x: 560, y: 190, name: "Precision and accuracy", where: "the place location in the box", check: "Placement error against the packing tolerance." },
  { n: 6, x: 700, y: 250, name: "Real-time performance", where: "the conveyor", check: "Worst-case reaction time against conveyor speed (chapter 15, figure 15.1)." },
  { n: 2, x: 820, y: 120, name: "Safety and compliance", where: "the fence and the shared zone", check: "An independent, certified safety layer between the policy and the motors (figure 15.5)." },
  { n: 3, x: 820, y: 40, name: "Human-robot interaction and collaboration", where: "where a worker clears jams", check: "Behaviour when a person enters, and how the robot hands back control." },
  { n: 7, x: 82, y: 36, name: "Cost-effectiveness and integration", where: "the PLC and warehouse system", check: "Interfaces to the existing control system, and total cost per pick." },
];

/** Figure 16.5: a picking cell, with each readiness implication marked where it bites. */
export function PickingCell() {
  const [sel, setSel] = useState(4);
  const m = MARKS[sel];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 300" role="group" aria-label="A robot picking cell with seven readiness implications marked">
        <rect x="610" y="20" width="230" height="180" fill="none" stroke="var(--ink-3)" strokeDasharray="8 6" />
        <text x="725" y="216" textAnchor="middle" fontSize="11.5" fill="var(--ink-3)">shared zone behind a light curtain</text>
        <rect x="110" y="200" width="160" height="70" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="190" y="288" textAnchor="middle" fontSize="11.5" fill="var(--ink-2)">source tote</text>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={125 + i * 26} y={214 + (i % 2) * 14} width="22" height="16" rx="2" fill="var(--ink-3)" transform={`rotate(${i * 9 - 18} ${136 + i * 26} ${222})`} />)}
        <rect x="490" y="200" width="140" height="70" rx="4" fill="var(--surface)" stroke="var(--ink-2)" />
        <text x="560" y="288" textAnchor="middle" fontSize="11.5" fill="var(--ink-2)">outgoing box</text>
        <rect x="450" y="250" width="410" height="24" fill="var(--surface-2)" stroke="var(--rule-strong)" />
        <rect x="330" y="230" width="60" height="40" fill="var(--ink-2)" />
        <path d="M 360 230 L 360 120 L 300 90 L 220 140" fill="none" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 212 148 L 204 168 M 228 148 L 236 168" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
        <rect x="300" y="12" width="60" height="22" rx="3" fill="var(--ink-2)" />
        <path d="M 330 34 L 200 196 M 330 34 L 260 196" stroke="var(--rule-strong)" strokeDasharray="3 3" />
        <rect x="20" y="16" width="80" height="40" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="42" y="40" textAnchor="middle" fontSize="11" fill="var(--ink-2)">PLC</text>
        {MARKS.map((mk, i) => {
          const on = i === sel;
          return (
            <g key={mk.n} tabIndex={0} role="button" aria-pressed={on} aria-label={`Implication ${mk.n}, ${mk.name}, at ${mk.where}`} style={{ cursor: "pointer" }}
              onClick={() => setSel(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(i)}>
              <circle cx={mk.x} cy={mk.y} r={on ? 15 : 13} fill={on ? "var(--ink)" : "var(--surface)"} stroke="var(--ink)" strokeWidth="2" />
              <text x={mk.x} y={mk.y + 5} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={on ? "var(--surface)" : "var(--ink)"}>I{mk.n}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>I{m.n}. {m.name}</h4>
        <p><strong>Where it bites:</strong> {m.where}. <strong>What to check:</strong> {m.check}</p>
      </div>
    </div>
  );
}
