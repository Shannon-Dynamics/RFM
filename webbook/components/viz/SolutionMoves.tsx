"use client";
import { useState } from "react";
import { GRID_CELLS, GRID_COLUMNS, GRID_ROWS } from "@/content/book";
import { PROBLEMS } from "@/content/ch17/problems";
import styles from "./viz.module.css";

const GX = 430, GY = 40, CW = 104, CH = 46;

/** Figure 18.2: which cells of the family grid each candidate solution would move. */
export function SolutionMoves() {
  const [pi, setPi] = useState(1);
  const p = PROBLEMS[pi];
  const sy = (j: number) => 40 + j * 64;
  const cellOf = (f: string) => GRID_CELLS.filter((c) => c.family === f);
  return (
    <div className={styles.stack}>
      <div className={styles.row} role="group" aria-label="Problem">
        {PROBLEMS.map((pr, i) => <button key={pr.n} className={styles.chip} aria-pressed={pi === i} onClick={() => setPi(i)}>{pr.n}. {pr.short}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 380" role="img"
        aria-label={`Solutions to ${p.title}: ${p.solutions.map((s) => `${s.name} moves ${s.moves.join(", ")}`).join("; ")}.`}>
        <defs>
          <marker id="sm-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        {GRID_COLUMNS.map((c, i) => <text key={c} x={GX + i * CW + CW / 2} y={GY - 10} textAnchor="middle" fontSize="11" fill="var(--ink-2)">{c}</text>)}
        {GRID_ROWS.map((r, j) => (
          <g key={r}>
            {GRID_COLUMNS.map((_, i) => <rect key={i} x={GX + i * CW} y={GY + j * CH} width={CW - 4} height={CH - 4} rx="4" fill="none" stroke="var(--rule)" />)}
          </g>
        ))}
        {GRID_CELLS.map((c) => {
          const moved = p.solutions.some((s) => s.moves.includes(c.family));
          return (
            <rect key={`${c.row}-${c.col}`} x={GX + c.col * CW} y={GY + c.row * CH} width={CW - 4} height={CH - 4} rx="4"
              fill={moved ? `var(--fam-${c.family})` : "var(--surface-2)"} stroke={`var(--fam-${c.family})`} strokeWidth="1.5" opacity={moved ? 1 : 0.6} />
          );
        })}
        {p.solutions.map((s, j) => (
          <g key={s.name}>
            <rect x={10} y={sy(j)} width={300} height={48} rx="8" fill="var(--surface)" stroke="var(--ink-2)" strokeDasharray={s.maturity === "early" ? "5 3" : undefined} />
            <foreignObject x={18} y={sy(j) + 4} width={286} height={42}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: 1.25, color: "var(--ink)" }}><strong>{s.name}</strong> <span style={{ color: "var(--ink-3)" }}>({s.maturity})</span></div>
            </foreignObject>
            {s.moves.flatMap((f) => cellOf(f).slice(0, 1)).map((c) => (
              <path key={`${s.name}-${c.family}`} d={`M 312 ${sy(j) + 24} C 370 ${sy(j) + 24}, 370 ${GY + c.row * CH + CH / 2 - 2}, ${GX + c.col * CW - 4} ${GY + c.row * CH + CH / 2 - 2}`}
                fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sm-head)" />
            ))}
          </g>
        ))}
        <text x={GX} y={GY + GRID_ROWS.length * CH + 18} fontSize="11.5" fill="var(--ink-3)">The family grid of chapter 1.</text>
        <text x={GX} y={GY + GRID_ROWS.length * CH + 33} fontSize="11.5" fill="var(--ink-3)">Filled cells: families these solutions would change.</text>
      </svg>
    </div>
  );
}
