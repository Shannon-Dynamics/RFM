"use client";
import { useMemo, useState } from "react";
import { LINES, LINKS, NODES, PHASES } from "@/content/ch03/lineage";
import { halo, packRows, textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

const W = 860, LEFT = 150, RIGHT = 20, TOP = 16, SUB = 22, PAD = 12, START = 2018.6, END = 2026.9;
const x = (d: string) => { const [y, m] = d.split("-").map(Number); return LEFT + ((y + (m - 1) / 12 - START) / (END - START)) * (W - LEFT - RIGHT); };
const PACKS = LINES.map((l) => packRows(NODES.filter((n) => n.line === l), (n) => x(n.date), (n) => textWidth(n.name, 11.5), W - 4));
const LINE_TOP: number[] = [];
let ACC = TOP;
for (const p of PACKS) { LINE_TOP.push(ACC); ACC += p.rows * SUB + PAD; }
const BOTTOM = ACC;
const ny = (n: { line: string }) => { const li = LINES.indexOf(n.line); return LINE_TOP[li] + (PACKS[li].slot.get(n as never)?.row ?? 0) * SUB + SUB / 2; };
const onLeft = (n: { line: string }) => PACKS[LINES.indexOf(n.line)].slot.get(n as never)?.left ?? false;

/** Figure 3.3: who descends from whom. Select a model to light up everything it builds on. */
export function LineageTree() {
  const [sel, setSel] = useState("π0.7");
  const ancestors = useMemo(() => {
    const found = new Set<string>(), stack = [sel];
    while (stack.length) {
      const n = stack.pop()!;
      for (const l of LINKS) if (l.to === n && !found.has(l.from)) { found.add(l.from); stack.push(l.from); }
    }
    return found;
  }, [sel]);
  const node = NODES.find((n) => n.name === sel)!;
  const H = BOTTOM + 28;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Lineage of robot foundation models from 2018 to 2026. ${sel} builds on ${[...ancestors].join(", ") || "nothing earlier in this set"}.`}>
        <defs>
          <marker id="lt-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L10 5 L0 10z" fill="context-stroke" />
          </marker>
        </defs>
        {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
          <g key={yr}>
            <line x1={x(`${yr}-01`)} x2={x(`${yr}-01`)} y1={TOP} y2={BOTTOM} stroke="var(--rule)" />
            <text x={x(`${yr}-01`)} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{yr}</text>
          </g>
        ))}
        {LINES.map((l, li) => (
          <g key={l}>
            <text x={LEFT - 12} y={LINE_TOP[li] + SUB / 2 + 4} textAnchor="end" fontSize="12.5" fill="var(--ink-2)">{l}</text>
            <line x1={LEFT} x2={W - RIGHT} y1={LINE_TOP[li] + PACKS[li].rows * SUB + PAD / 2} y2={LINE_TOP[li] + PACKS[li].rows * SUB + PAD / 2} stroke="var(--rule)" strokeDasharray="2 4" />
          </g>
        ))}
        {LINKS.map((l) => {
          const a = NODES.find((n) => n.name === l.from)!, b = NODES.find((n) => n.name === l.to)!;
          const on = (ancestors.has(l.from) && (ancestors.has(l.to) || l.to === sel));
          const x1 = x(a.date), y1 = ny(a), x2 = x(b.date), y2 = ny(b);
          const mx = (x1 + x2) / 2;
          return <path key={`${l.from}>${l.to}`} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 8},${y2}`} fill="none"
            stroke={on ? "var(--ink)" : "var(--rule-strong)"} strokeWidth={on ? 2 : 1.2}
            strokeDasharray={l.kind === "builds-on" ? "5 4" : undefined} markerEnd="url(#lt-head)" />;
        })}
        {NODES.map((n) => {
          const on = n.name === sel, anc = ancestors.has(n.name);
          return (
            <g key={n.name} tabIndex={0} role="button" aria-pressed={on} onClick={() => setSel(n.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(n.name); }} style={{ cursor: "pointer" }}>
              <circle cx={x(n.date)} cy={ny(n)} r={on ? 7 : 5.5} fill={on || anc ? "var(--ink)" : "var(--surface)"} stroke="var(--ink-2)" strokeWidth="1.5" />
              <text x={onLeft(n) ? x(n.date) - 9 : x(n.date) + 9} textAnchor={onLeft(n) ? "end" : "start"} {...halo} y={ny(n) + 4} fontSize="11.5" fontWeight={on ? 700 : 400} fill={on || anc ? "var(--ink)" : "var(--ink-3)"}>{n.name}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span className={styles.swatchLine} />next version from the same team</span>
        <span className={styles.legendItem}><span className={styles.swatchDash} />builds on: backbone, recipe or central idea</span>
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{node.name} <span className={styles.cardMeta}>{node.date}, phase {node.phase}: {PHASES[node.phase - 1].name}</span></h4>
        <p>{ancestors.size ? `Builds on ${[...ancestors].join(", ")}.` : "Nothing earlier in this set; it starts a line."}</p>
      </div>
    </div>
  );
}
