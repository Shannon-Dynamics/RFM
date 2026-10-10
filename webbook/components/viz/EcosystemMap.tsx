"use client";
import { useState } from "react";
import { halo, packRows, textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

export type Access = "open" | "application" | "closed";

export interface EcoModel {
  name: string;
  /** Parameters in billions, as the source reports them; null when not disclosed. */
  params: number | null;
  sizeText: string;
  access: Access;
  date: string;
  released: string;
  footprint?: string;
  source: string;
}

const ROWS: { id: Access; label: string; sub: string }[] = [
  { id: "open", label: "Open weights", sub: "download and fine-tune" },
  { id: "application", label: "By application", sub: "SDK for approved testers" },
  { id: "closed", label: "Not released", sub: "papers or demos only" },
];

const W = 860, LEFT = 150, PLOT_R = 628, UND_L = 648, LO = Math.log10(0.05), HI = Math.log10(100);
const xs = (b: number) => LEFT + ((Math.log10(b) - LO) / (HI - LO)) * (PLOT_R - LEFT);
const SUB = 22, LABEL = 12.5;

/** Figure 5.3: who can use which model, by size. A map, not a ranking. */
export function EcosystemMap({ models }: { models: EcoModel[] }) {
  const [sel, setSel] = useState<string>("GR00T N1.7");
  const layout = ROWS.map((r) => {
    const sized = models.filter((m) => m.access === r.id && m.params !== null);
    const und = models.filter((m) => m.access === r.id && m.params === null);
    const packed = packRows(sized, (m) => xs(m.params!), (m) => textWidth(m.name, LABEL) + 6, PLOT_R + 4);
    return { r, sized, und, packed, height: Math.max(packed.rows, und.length, 1) * SUB + 26 };
  });
  let y = 30;
  const tops = layout.map((l) => { const t = y; y += l.height; return t; });
  const H = y + 34;
  const m = models.find((x) => x.name === sel)!;

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Models placed by parameter count and by how their weights can be used">
        <text x={(LEFT + PLOT_R) / 2} y={16} textAnchor="middle" fontSize="12" fill="var(--ink-3)">parameters, log scale</text>
        <text x={(UND_L + W) / 2} y={16} textAnchor="middle" fontSize="12" fill="var(--ink-3)">size not disclosed</text>
        {[0.1, 1, 10, 100].map((v) => (
          <g key={v}>
            <line x1={xs(v)} x2={xs(v)} y1={24} y2={H - 30} stroke="var(--rule)" />
            <text x={xs(v)} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{v < 1 ? `${v * 1000}M` : `${v}B`}</text>
          </g>
        ))}
        <rect x={UND_L} y={24} width={W - UND_L - 4} height={H - 54} rx="4" fill="var(--surface-2)" />
        {layout.map((l, i) => (
          <g key={l.r.id}>
            <line x1={8} x2={W - 4} y1={tops[i]} y2={tops[i]} stroke="var(--rule-strong)" />
            <text x={8} y={tops[i] + 22} fontSize="14" fontWeight="600" fill="var(--ink)">{l.r.label}</text>
            <text x={8} y={tops[i] + 40} fontSize="12" fill="var(--ink-3)">{l.r.sub}</text>
            {l.sized.map((mm) => {
              const s = l.packed.slot.get(mm)!;
              const cx = xs(mm.params!), cy = tops[i] + 20 + s.row * SUB;
              const on = mm.name === sel;
              return (
                <g key={mm.name} tabIndex={0} role="button" aria-pressed={on} aria-label={`${mm.name}: ${mm.sizeText}, ${l.r.label.toLowerCase()}`}
                  onClick={() => setSel(mm.name)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(mm.name)} style={{ cursor: "pointer" }}>
                  <circle cx={cx} cy={cy} r={on ? 7.5 : 6} fill="var(--fam-reactive)" stroke={on ? "var(--ink)" : "var(--surface)"} strokeWidth={on ? 2.5 : 1.5} />
                  <text x={s.left ? cx - 11 : cx + 11} y={cy + 4.5} textAnchor={s.left ? "end" : "start"} fontSize={LABEL}
                    fontWeight={on ? 700 : 500} fill="var(--ink)" {...halo}>{mm.name}</text>
                </g>
              );
            })}
            {l.und.map((mm, j) => {
              const on = mm.name === sel, cy = tops[i] + 20 + j * SUB;
              return (
                <g key={mm.name} tabIndex={0} role="button" aria-pressed={on} aria-label={`${mm.name}: size not disclosed, ${l.r.label.toLowerCase()}`}
                  onClick={() => setSel(mm.name)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(mm.name)} style={{ cursor: "pointer" }}>
                  <circle cx={UND_L + 16} cy={cy} r={on ? 7.5 : 6} fill="none" stroke="var(--fam-reactive)" strokeWidth={on ? 3 : 2} />
                  <text x={UND_L + 30} y={cy + 4.5} fontSize={LABEL} fontWeight={on ? 700 : 500} fill="var(--ink)">{mm.name}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{m.name}</h4>
        <p>{m.sizeText}. {ROWS.find((r) => r.id === m.access)!.label}: {m.released}.{m.footprint ? ` ${m.footprint}.` : ""}</p>
        <p className={styles.cardMeta}>{m.date}. Source: {m.source}.</p>
      </div>
    </div>
  );
}
