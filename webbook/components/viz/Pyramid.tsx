"use client";
import { useState } from "react";
import styles from "./viz.module.css";

export interface PyramidLayer {
  name: string;
  property: string;
  examples: { label: string; size: string; source: string }[];
  usedBy: string;
}

/** Core diagram 2: the data pyramid, smallest and most expensive layer on top. */
export function Pyramid({ layers }: { layers: PyramidLayer[] }) {
  const [sel, setSel] = useState(0);
  const W = 720, H = 262, top = 20, base = 230;
  const n = layers.length;
  const layer = layers[sel];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Data pyramid: ${layers.map((l) => l.name).join(", then ")}`}>
        {layers.map((l, i) => {
          const y0 = top + (i * (base - top)) / n, y1 = top + ((i + 1) * (base - top)) / n;
          const half = (y: number) => 40 + ((y - top) / (base - top)) * 300;
          const p = `${360 - half(y0)},${y0} ${360 + half(y0)},${y0} ${360 + half(y1)},${y1 - 3} ${360 - half(y1)},${y1 - 3}`;
          return (
            <g key={l.name} tabIndex={0} role="button" aria-pressed={sel === i} onClick={() => setSel(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(i); }} style={{ cursor: "pointer" }}>
              <polygon points={p} fill={sel === i ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
              <text x="360" y={(y0 + y1) / 2 + 1} textAnchor="middle" fontSize="15" fontWeight="600" fill={sel === i ? "var(--surface)" : "var(--ink)"}>{l.name}</text>
              <text x="360" y={(y0 + y1) / 2 + 19} textAnchor="middle" fontSize="12" fill={sel === i ? "var(--surface)" : "var(--ink-2)"}>{l.property}</text>
            </g>
          );
        })}
        <text x="20" y={top + 12} fontSize="12" fill="var(--ink-3)">smallest, most expensive</text>
        <text x="20" y={base + 22} fontSize="12" fill="var(--ink-3)">largest, cheapest</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{layer.name}</h4>
        <table>
          <thead><tr><th>Example</th><th>Reported size</th><th>Source</th></tr></thead>
          <tbody>{layer.examples.map((e) => <tr key={e.label}><td>{e.label}</td><td>{e.size}</td><td>{e.source}</td></tr>)}</tbody>
        </table>
        <p><strong>Who can use it:</strong> {layer.usedBy}</p>
      </div>
    </div>
  );
}
