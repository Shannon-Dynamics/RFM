"use client";
import { useState } from "react";
import { family } from "@/content/book";
import { PROBLEMS, type Maturity } from "@/content/ch17/problems";
import styles from "./viz.module.css";

const LABEL: Record<Maturity, string> = { early: "early", promising: "promising", established: "established" };
const chip = (m: Maturity, on: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "0.2rem 0.55rem", borderRadius: 999, cursor: "pointer",
  border: `2px ${m === "early" ? "dashed" : "solid"} var(--ink-2)`,
  background: m === "established" ? "var(--ink-2)" : "var(--surface)",
  color: m === "established" ? "var(--surface)" : "var(--ink)",
  outline: on ? "2px solid var(--ink)" : "none", outlineOffset: 2, textAlign: "left",
});

/** Figure 18.1: for each open problem, the solutions being tried and how far along they are. */
export function SolutionTable() {
  const [sel, setSel] = useState<[number, number]>([8, 0]);
  const p = PROBLEMS[sel[0]], s = p.solutions[sel[1]];
  return (
    <div className={styles.stack}>
      <div style={{ display: "grid", gap: "0.35rem", fontFamily: "var(--font-ui)" }}>
        {PROBLEMS.map((pr, i) => (
          <div key={pr.n} style={{ display: "grid", gridTemplateColumns: "minmax(9rem, 13rem) 1fr", gap: "0.6rem", alignItems: "start", borderBottom: "1px solid var(--rule)", padding: "0.3rem 0" }}>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--ink)" }}>{pr.n}. {pr.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {pr.solutions.map((so, j) => (
                <button key={so.name} style={chip(so.maturity, sel[0] === i && sel[1] === j)} aria-pressed={sel[0] === i && sel[1] === j}
                  aria-label={`${so.name}: ${LABEL[so.maturity]}`} onClick={() => setSel([i, j])}>{so.name}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span style={chip("early", false)}>early</span></span>
        <span className={styles.legendItem}><span style={chip("promising", false)}>promising</span></span>
        <span className={styles.legendItem}><span style={chip("established", false)}>established</span></span>
        <span>Maturity as assessed in October 2026.</span>
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{s.name}</h4>
        <p><strong>Problem:</strong> {p.title}. <strong>Maturity:</strong> {LABEL[s.maturity]}. <strong>Who:</strong> {s.who}.</p>
        <p className={styles.cardMeta}>Families it would change: {s.moves.map((m) => family(m).short).join(", ")}.</p>
      </div>
    </div>
  );
}
