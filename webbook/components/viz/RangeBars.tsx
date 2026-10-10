import { textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

/** Ranges on one linear axis, for reported intervals ("300 to 1,200 demonstrations"). */
export function RangeBars({ rows, max, unit, ticks }: {
  rows: { label: string; lo: number; hi: number; note: string; family?: string; text?: string }[]; max: number; unit: string; ticks: number[];
}) {
  // The label column fits the longest bold label (Inter bold runs about 7% wider than regular).
  const LEFT = Math.ceil(Math.max(180, ...rows.map((r) => Math.max(textWidth(r.label, 13.5) * 1.07, textWidth(r.note, 11.5))))) + 4;
  const W = 720, RIGHT = 24, ROW = 46, H = rows.length * ROW + 40;
  const x = (v: number) => LEFT + (v / max) * (W - LEFT - RIGHT);
  return (
    <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={rows.map((r) => `${r.label}: ${r.lo} to ${r.hi} ${unit}`).join("; ")}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={8} y2={H - 30} stroke="var(--rule)" />
          <text x={x(t)} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{t.toLocaleString("en-GB")}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = 22 + i * ROW;
        const c = r.family ? `var(--fam-${r.family})` : "var(--ink-2)";
        return (
          <g key={r.label}>
            <text x={LEFT - 12} y={y + 5} textAnchor="end" fontSize="13.5" fontWeight="600" fill="var(--ink)">{r.label}</text>
            <text x={LEFT - 12} y={y + 21} textAnchor="end" fontSize="11.5" fill="var(--ink-3)">{r.note}</text>
            <rect x={x(r.lo)} y={y - 7} width={Math.max(4, x(r.hi) - x(r.lo))} height={14} rx="7" fill={c} />
            {(() => {
              const label = r.text ?? `${r.lo.toLocaleString("en-GB")}${r.hi > r.lo ? ` to ${r.hi.toLocaleString("en-GB")}` : ""} ${unit}`;
              // Right of the bar, else left of it, else under it when neither side has room.
              const tw = textWidth(label, 12.5);
              const at = x(r.hi) + tw < W ? "right" : x(r.lo) - tw > LEFT ? "left" : "under";
              return <text x={at === "right" ? x(r.hi) + 8 : at === "left" ? x(r.lo) - 8 : x(r.lo)} y={at === "under" ? y + 22 : y + 5}
                textAnchor={at === "left" ? "end" : "start"} fontSize="12.5" fill="var(--ink-2)">{label}</text>;
            })()}
          </g>
        );
      })}
    </svg>
  );
}
