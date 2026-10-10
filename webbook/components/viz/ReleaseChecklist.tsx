"use client";
import { useState } from "react";
import { GRID_CELLS, GRID_COLUMNS, GRID_ROWS, family } from "@/content/book";
import styles from "./viz.module.css";

const LAYERS = ["Robot trajectories", "Human video", "Internet video", "Synthetic"];
const QUESTIONS = [
  { k: "weights", q: "Are the weights and the licence stated?", flag: "no weights or licence" },
  { k: "size", q: "Is the size and the hardware it needs stated?", flag: "no size or hardware" },
  { k: "latency", q: "Is latency or control rate given on named hardware?", flag: "no latency on named hardware" },
  { k: "real", q: "Is it evaluated on real robots?", flag: "simulation only" },
  { k: "trials", q: "Are there at least 50 trials per condition?", flag: "too few trials" },
  { k: "intervals", q: "Are confidence intervals reported?", flag: "no intervals" },
  { k: "independent", q: "Has anyone other than the maker evaluated it?", flag: "no independent evaluation" },
  { k: "flagged", q: "Are numbers about the maker's own data and model presented as claims?", flag: "own numbers not flagged" },
  { k: "baselines", q: "Are baselines matched for data and compute?", flag: "baselines not matched" },
  { k: "failures", q: "Are failure cases reported?", flag: "no failures reported" },
];
const CW = 104, CH = 34, GX = 250;

/** Figure 19.3: reading the next model release in ten minutes. */
export function ReleaseChecklist() {
  const [cell, setCell] = useState<number | null>(null);
  const [layers, setLayers] = useState<boolean[]>([true, false, false, false]);
  const [ans, setAns] = useState<Record<string, boolean>>({ weights: true, size: true, real: true });
  const flags = QUESTIONS.filter((q) => !ans[q.k]).map((q) => q.flag);
  const c = cell === null ? null : GRID_CELLS[cell];
  return (
    <div className={styles.stack}>
      <p className={styles.note}><strong>1. Place it on the family grid.</strong> What does it predict, and in what space?</p>
      <svg className={styles.svg} viewBox="0 0 860 210" role="group" aria-label="Family grid: select the cell the release belongs in">
        {GRID_COLUMNS.map((col, i) => <text key={col} x={GX + i * CW + CW / 2} y={14} textAnchor="middle" fontSize="11" fill="var(--ink-2)">{col}</text>)}
        {GRID_ROWS.map((r, j) => <text key={r} x={GX - 8} y={24 + j * CH + CH / 2 + 4} textAnchor="end" fontSize="10.5" fill="var(--ink-2)">{r}</text>)}
        {GRID_ROWS.map((_, j) => GRID_COLUMNS.map((__, i) => <rect key={`${i}-${j}`} x={GX + i * CW} y={24 + j * CH} width={CW - 4} height={CH - 4} rx="4" fill="none" stroke="var(--rule)" />))}
        {GRID_CELLS.map((g, idx) => (
          <g key={idx} tabIndex={0} role="button" aria-pressed={cell === idx} aria-label={g.label} style={{ cursor: "pointer" }}
            onClick={() => setCell(idx)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setCell(idx)}>
            <rect x={GX + g.col * CW} y={24 + g.row * CH} width={CW - 4} height={CH - 4} rx="4"
              fill={cell === idx ? `var(--fam-${g.family})` : "var(--surface-2)"} stroke={`var(--fam-${g.family})`} strokeWidth={cell === idx ? 2.5 : 1.5} />
            <text x={GX + g.col * CW + 8} y={24 + g.row * CH + 19} fontSize="10.5" fill={cell === idx ? "var(--surface)" : "var(--ink)"}>{family(g.family).short}</text>
          </g>
        ))}
        <text x={GX + 4 * CW + 10} y={40} fontSize="12" fill="var(--ink)">{c ? `Chapter ${family(c.family).chapter}:` : "Select a cell."}</text>
        {c && <text x={GX + 4 * CW + 10} y={58} fontSize="12" fill="var(--ink-2)">{c.label}</text>}
      </svg>
      <p className={styles.note}><strong>2. Which layers of the data pyramid does it use?</strong></p>
      <div className={styles.row}>
        {LAYERS.map((l, i) => (
          <label key={l} className={styles.legendItem}><input type="checkbox" checked={layers[i]} onChange={() => setLayers(layers.map((v, j) => (j === i ? !v : v)))} /> {l}</label>
        ))}
      </div>
      <p className={styles.note}><strong>3. Ten questions about the evidence.</strong></p>
      <div style={{ display: "grid", gap: "0.3rem", fontFamily: "var(--font-ui)", fontSize: "0.95rem" }}>
        {QUESTIONS.map((q) => (
          <label key={q.k} style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
            <input type="checkbox" checked={!!ans[q.k]} onChange={() => setAns({ ...ans, [q.k]: !ans[q.k] })} /> {q.q}
          </label>
        ))}
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{flags.length === 0 ? "No red flags" : `${flags.length} red flag${flags.length > 1 ? "s" : ""}`}</h4>
        <p>{flags.length ? flags.join("; ") + "." : "Every question answered yes: unusual, and worth saying so."}</p>
        <p className={styles.cardMeta}>
          {c ? `A chapter ${family(c.family).chapter} model` : "A model"} trained on {layers.some((v) => v) ? LAYERS.filter((_, i) => layers[i]).join(", ").toLowerCase() : "unstated data"}.
          Several flags are a reason to wait for evidence, not a reason to dismiss the model.
        </p>
      </div>
    </div>
  );
}
