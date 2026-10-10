"use client";
import { useMemo, useState } from "react";
import { halo, packRows, textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

export interface TimelineItem {
  id: string;
  lane: string;
  date: string; // YYYY-MM or YYYY-MM-DD
  label: string;
  detail: string;
  family?: string;
  href?: string;
}
export interface Band {
  label: string;
  from: string;
  to: string;
}

const toX = (d: string, start: number, end: number, x0: number, x1: number) => {
  const [y, m = "1"] = d.split("-");
  const t = Number(y) + (Number(m) - 1) / 12;
  return x0 + ((t - start) / (end - start)) * (x1 - x0);
};

/** Lanes of dated milestones on one time axis, with optional background bands (phases). */
export function Timeline({ lanes, items, start, end, bands = [], height }: {
  lanes: string[]; items: TimelineItem[]; start: number; end: number; bands?: Band[]; height?: number;
}) {
  const [sel, setSel] = useState<string>(items[items.length - 1]?.id);
  const LEFT = Math.max(150, Math.ceil(Math.max(...lanes.map((l) => textWidth(l, 13)))) + 2);
  const W = 720, RIGHT = 12, TOP = bands.length ? 34 : 14, SUB = 22, PAD = 12;
  const px = (d: string) => toX(d, start, end, LEFT, W - RIGHT);
  const packs = lanes.map((l) => packRows(items.filter((i) => i.lane === l), (i) => px(i.date), (i) => textWidth(i.label, 11.5), W - 4));
  const laneTop: number[] = [];
  let acc = TOP;
  for (const p of packs) { laneTop.push(acc); acc += p.rows * SUB + PAD; }
  const H = height ?? acc + 30;
  const bottom = acc;
  const picked = items.find((i) => i.id === sel);
  const years = useMemo(() => Array.from({ length: Math.floor(end) - Math.ceil(start) + 1 }, (_, i) => Math.ceil(start) + i), [start, end]);
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Timeline from ${start} to ${Math.floor(end)}: ${items.map((i) => `${i.label} (${i.date})`).join(", ")}`}>
        {bands.map((b, i) => {
          const x0 = toX(b.from, start, end, LEFT, W - RIGHT), x1 = toX(b.to, start, end, LEFT, W - RIGHT);
          return (
            <g key={b.label}>
              <rect x={x0} y={TOP - 4} width={Math.max(0, x1 - x0)} height={bottom - TOP + 4} fill={i % 2 ? "var(--surface-2)" : "transparent"} />
              <text x={(x0 + x1) / 2} y={TOP - 12} textAnchor="middle" fontSize="11.5" fill="var(--ink-2)">{b.label}</text>
            </g>
          );
        })}
        {years.map((y) => {
          const x = toX(`${y}-01`, start, end, LEFT, W - RIGHT);
          return (
            <g key={y}>
              <line x1={x} x2={x} y1={TOP - 4} y2={bottom} stroke="var(--rule)" />
              <text x={x} y={bottom + 18} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{y}</text>
            </g>
          );
        })}
        {lanes.map((l, li) => (
          <g key={l}>
            <text x={LEFT - 10} y={laneTop[li] + SUB / 2 + 4} textAnchor="end" fontSize="13" fill="var(--ink)">{l}</text>
            <line x1={LEFT} x2={W - RIGHT} y1={laneTop[li] + packs[li].rows * SUB + PAD / 2} y2={laneTop[li] + packs[li].rows * SUB + PAD / 2} stroke="var(--rule)" />
          </g>
        ))}
        {items.map((it) => {
          const li = lanes.indexOf(it.lane);
          const x = px(it.date);
          const place = packs[li].slot.get(it) ?? { row: 0, left: false };
          const y = laneTop[li] + place.row * SUB + SUB / 2;
          const on = it.id === sel;
          return (
            <g key={it.id} tabIndex={0} role="button" aria-pressed={on} aria-label={`${it.label}, ${it.date}`}
              onClick={() => setSel(it.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(it.id); }}
              style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={on ? 7 : 5.5} fill={it.family ? `var(--fam-${it.family})` : "var(--ink-2)"}
                stroke={on ? "var(--ink)" : "var(--surface)"} strokeWidth={on ? 2.5 : 1.5} />
              <text x={place.left ? x - 9 : x + 9} y={y + 4} textAnchor={place.left ? "end" : "start"} fontSize="11.5" fontWeight={on ? 700 : 400} fill={on ? "var(--ink)" : "var(--ink-2)"} {...halo}>{it.label}</text>
            </g>
          );
        })}
      </svg>
      {picked && (
        <div className={styles.card} aria-live="polite">
          <h4>{picked.label} <span className={styles.cardMeta}>{picked.date}</span></h4>
          <p>{picked.detail}{picked.href && <> <a href={picked.href}>Source</a>.</>}</p>
        </div>
      )}
    </div>
  );
}
