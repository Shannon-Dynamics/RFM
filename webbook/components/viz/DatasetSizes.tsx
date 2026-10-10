"use client";
import { useState } from "react";
import { LAYERS, SIZES } from "@/content/ch13/data";
import { halo } from "@/lib/layout";
import styles from "./viz.module.css";

const W = 860, LEFT = 200, RIGHT = 20, ROW = 24, HEAD = 26;
const LO = 2, HI = 7.5; // log10 hours: 100 to about 30 million
const sx = (h: number) => LEFT + ((Math.log10(h) - LO) / (HI - LO)) * (W - LEFT - RIGHT);

/** Figure 13.2: reported dataset sizes in hours, on a log scale, by layer of the pyramid. */
export function DatasetSizes() {
  const [sel, setSel] = useState("EgoScale");
  let y = 30;
  const rows = LAYERS.flatMap((layer) => {
    const items = SIZES.filter((s) => s.layer === layer).sort((a, b) => a.hours - b.hours);
    const head = { kind: "head" as const, layer, y };
    y += HEAD;
    const its = items.map((s) => { const r = { kind: "item" as const, s, y }; y += ROW; return r; });
    y += 6;
    return [head, ...its];
  });
  const H = y + 30;
  const s = SIZES.find((x) => x.name === sel)!;

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Reported dataset sizes in hours, log scale">
        {[100, 1000, 1e4, 1e5, 1e6, 1e7].map((h) => (
          <g key={h}>
            <line x1={sx(h)} x2={sx(h)} y1={20} y2={H - 26} stroke="var(--rule)" />
            <text x={sx(h)} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--ink-3)">
              {h >= 1e6 ? `${h / 1e6}M` : h >= 1000 ? `${h / 1000}k` : h} h
            </text>
          </g>
        ))}
        <text x={sx(1e4)} y={14} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)">hours, log scale: each gridline is ten times the last</text>
        {rows.map((r) =>
          r.kind === "head" ? (
            <text key={r.layer} x={0} y={r.y + 16} fontSize="13" fontWeight="700" fill="var(--ink)">{r.layer}</text>
          ) : (
            <g key={r.s.name} tabIndex={0} role="button" aria-pressed={sel === r.s.name} style={{ cursor: "pointer" }}
              aria-label={`${r.s.name}: ${r.s.hours.toLocaleString("en-GB")} hours${r.s.plus ? " or more" : ""}${r.s.vendor ? ", vendor claim" : ""}`}
              onClick={() => setSel(r.s.name)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(r.s.name)}>
              <rect x={0} y={r.y} width={W} height={ROW} fill={sel === r.s.name ? "var(--surface-2)" : "transparent"} />
              <text x={12} y={r.y + 16} fontSize="12.5" fill="var(--ink)" fontWeight={sel === r.s.name ? 700 : 400}>{r.s.name}</text>
              <line x1={LEFT} x2={sx(r.s.hours)} y1={r.y + 12} y2={r.y + 12} stroke="var(--rule-strong)" />
              <circle cx={sx(r.s.hours)} cy={r.y + 12} r="6" fill={r.s.vendor ? "var(--surface)" : "var(--ink-2)"} stroke="var(--ink-2)" strokeWidth="2" />
              <text x={r.s.hours > 5e6 ? sx(r.s.hours) - 11 : sx(r.s.hours) + 11} y={r.y + 16} textAnchor={r.s.hours > 5e6 ? "end" : "start"} fontSize="11.5" fill="var(--ink-2)" {...halo}>
                {r.s.hours.toLocaleString("en-GB")}{r.s.plus ? "+" : ""}
              </text>
            </g>
          ),
        )}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span className={styles.swatchDot} style={{ color: "var(--ink-2)" }} />reported in a paper</span>
        <span className={styles.legendItem}><span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid var(--ink-2)" }} />reported by the company about its own data (vendor claim)</span>
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{s.name}: {s.hours.toLocaleString("en-GB")}{s.plus ? " or more" : ""} hours</h4>
        <p>{s.note}</p>
        <p className={styles.cardMeta}>Source: {s.source}.{s.vendor ? " Vendor claim." : ""}</p>
      </div>
      <p className={styles.note}>
        Reported only in trajectories, so not on this axis: Open X-Embodiment, more than one million trajectories from 22 robot types;
        BridgeData V2, 60,096 trajectories; Covariant&rsquo;s fleet data, &ldquo;tens of millions of trajectories&rdquo; (vendor claim).
      </p>
    </div>
  );
}
