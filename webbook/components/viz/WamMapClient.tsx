"use client";
import { useState } from "react";
import type { WamModel } from "@/content/ch06/data";
import styles from "./viz.module.css";
import css from "./WamMap.module.css";

export type MapEntry = WamModel & { title: string; date: string; arxiv: string | null; url: string };

const COLS = [
  { id: "e2e", label: "End-to-end", sub: "one backbone for world and action" },
  { id: "dual", label: "Dual system", sub: "separate world and action modules" },
] as const;
const ROWS = [
  { id: "joint", label: "Joint prediction", sub: "futures and actions generated together" },
  { id: "idm", label: "Inverse dynamics", sub: "imagine the future, then infer the action" },
] as const;

export function WamMapClient({ entries }: { entries: MapEntry[] }) {
  const [sel, setSel] = useState<string>("dreamzero");
  const picked = entries.find((e) => e.key === sel)!;
  return (
    <div className={styles.stack}>
      <div className={css.grid} role="group" aria-label="World-action models by transition paradigm and architecture">
        <div />
        {COLS.map((c) => (
          <div key={c.id} className={css.colHead}><strong>{c.label}</strong><span>{c.sub}</span></div>
        ))}
        {ROWS.map((r) => (
          <div key={r.id} className={css.rowWrap}>
            <div className={css.rowHead}><strong>{r.label}</strong><span>{r.sub}</span></div>
            {COLS.map((c) => (
              <div key={c.id} className={css.cell} data-col={c.label}>
                {entries.filter((e) => e.transition === r.id && e.structure === c.id).map((e) => (
                  <button key={e.key} className={styles.chip} aria-pressed={sel === e.key} onClick={() => setSel(e.key)}>
                    {e.name}{e.argued && <span aria-label="placement argued" title="Placement argued"> *</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{picked.name}</h4>
        <p>{picked.summary}</p>
        {picked.argued && <p><strong>Placement argued.</strong> {picked.argued}</p>}
        <p className={styles.cardMeta}>
          {picked.title}. First arXiv version {picked.date}.{" "}
          {picked.arxiv && <a href={picked.url}>arXiv {picked.arxiv}</a>}
        </p>
      </div>
      <p className={styles.note}>* placement argued either way; select the model to see why.</p>
    </div>
  );
}
