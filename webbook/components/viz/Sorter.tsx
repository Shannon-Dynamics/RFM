"use client";
import { useState } from "react";
import styles from "./viz.module.css";

export interface SortItem {
  name: string;
  hint: string;
  answer: string;
  why: string;
}

/** A small classification exercise: the reader sorts each item, then checks against the book. */
export function Sorter({ items, options, prompt }: { items: SortItem[]; options: string[]; prompt: string }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const score = items.filter((i) => picks[i.name] === i.answer).length;
  return (
    <div className={styles.stack}>
      <p className={styles.note}>{prompt}</p>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem" }}>
        {items.map((it) => {
          const pick = picks[it.name];
          const right = pick === it.answer;
          return (
            <li key={it.name} style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "0.6rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", alignItems: "baseline", justifyContent: "space-between" }}>
                <span><strong>{it.name}</strong> <span style={{ color: "var(--ink-2)" }}>{it.hint}</span></span>
                <span className={styles.segmented} role="group" aria-label={`Answer for ${it.name}`}>
                  {options.map((o) => (
                    <button key={o} aria-pressed={pick === o} onClick={() => { setPicks((p) => ({ ...p, [it.name]: o })); setChecked(false); }}>{o}</button>
                  ))}
                </span>
              </div>
              {checked && pick && (
                <p className={styles.note} style={{ marginTop: "0.35rem" }} aria-live="polite">
                  <strong>{right ? "Matches the book." : `The book says: ${it.answer}.`}</strong> {it.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={() => setChecked(true)} disabled={Object.keys(picks).length === 0}>
          Check answers
        </button>
        <button className={styles.button} onClick={() => { setPicks({}); setChecked(false); }}>Clear</button>
        {checked && <span className={styles.note}>{score} of {items.length} match the book&rsquo;s reading{Object.keys(picks).length < items.length ? `, ${items.length - Object.keys(picks).length} unanswered` : ""}.</span>}
      </div>
    </div>
  );
}
