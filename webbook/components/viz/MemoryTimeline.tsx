"use client";
import { useState } from "react";
import { textWidth } from "@/lib/layout";
import styles from "./viz.module.css";

// After MEM's grilled-cheese example (arXiv 2603.03596); the same events as rust/ch14-post-training.
const EVENTS = [
  { t: 20, fact: "pan on the stove" }, { t: 60, fact: "stove turned on" }, { t: 150, fact: "butter spread" },
  { t: 240, fact: "cheese on bread" }, { t: 300, fact: "sandwich in pan" }, { t: 480, fact: "sandwich flipped" },
  { t: 690, fact: "sandwich on plate" }, { t: 840, fact: "stove turned off" },
];
const END = 900, WINDOW = 30;
const W = 860, L = 20, R = 840;
/** Centre a label on its tick unless that would push it past the figure edge. */
const edgeAnchor = (x: number, s: string) => (x - textWidth(s, 10.5) / 2 < 0 ? "start" : x + textWidth(s, 10.5) / 2 > W ? "end" : "middle");
const sx = (t: number) => L + (t / END) * (R - L);

/** Figure 14.5: short-term memory in video, long-term memory in text, over a fifteen-minute task. */
export function MemoryTimeline() {
  const [now, setNow] = useState(560);
  const past = EVENTS.filter((e) => e.t <= now);
  const short = past.filter((e) => e.t > now - WINDOW);
  const stoveOn = now >= 60 && now < 840;
  const flipped = now >= 480;
  const questions = [
    { q: "Is the stove on?", truth: stoveOn ? "yes" : "no", shortKnows: short.some((e) => e.fact.startsWith("stove")) },
    { q: "Has the sandwich been flipped?", truth: flipped ? "yes" : "no", shortKnows: short.some((e) => e.fact === "sandwich flipped") },
    { q: "Where is the spatula the arm is now hiding?", truth: "where it was seen a few seconds ago", shortKnows: true },
  ];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} 150`} role="img"
        aria-label={`At ${Math.floor(now / 60)} minutes ${now % 60} seconds, short-term memory covers the last ${WINDOW} seconds and holds ${short.length} events; long-term memory holds ${past.length}.`}>
        <line x1={L} x2={R} y1={80} y2={80} stroke="var(--rule-strong)" strokeWidth="2" />
        {[0, 300, 600, 900].map((t) => <text key={t} x={sx(t)} y={104} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{t / 60} min</text>)}
        <rect x={sx(0)} y={18} width={sx(now) - sx(0)} height={16} rx="3" fill="var(--fam-reactive)" opacity="0.25" />
        <text x={sx(0) + 4} y={30} fontSize="11" fill="var(--ink)">long-term memory, in text: everything so far</text>
        <rect x={sx(Math.max(0, now - WINDOW))} y={40} width={sx(now) - sx(Math.max(0, now - WINDOW))} height={16} rx="3" fill="var(--fam-reactive)" />
        <text x={sx(now) + 6} y={52} fontSize="11" fill="var(--ink)">short-term memory, in video: the last {WINDOW} s</text>
        {EVENTS.map((e) => (
          <g key={e.t}>
            <circle cx={sx(e.t)} cy={80} r="5" fill={e.t <= now ? "var(--ink)" : "var(--surface)"} stroke="var(--ink-2)" strokeWidth="1.5" />
            <text x={sx(e.t)} y={124 + (EVENTS.indexOf(e) % 2) * 14} textAnchor={edgeAnchor(sx(e.t), e.fact)} fontSize="10.5" fill={e.t <= now ? "var(--ink-2)" : "var(--ink-3)"}>{e.fact}</text>
          </g>
        ))}
        <line x1={sx(now)} x2={sx(now)} y1={14} y2={90} stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <label className={styles.slider}>
        <span className={styles.sliderHead}><span>Time into the task</span><span className={styles.sliderValue}>{Math.floor(now / 60)} min {String(now % 60).padStart(2, "0")} s</span></span>
        <input type="range" min={0} max={END} step={10} value={now} onChange={(e) => setNow(Number(e.target.value))} />
      </label>
      <table style={{ fontFamily: "var(--font-ui)", fontSize: "0.95rem", borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ color: "var(--ink-2)", textAlign: "left" }}>
            <th style={{ padding: "0.3rem" }}>Question the policy must answer</th><th>Current frame only</th><th>Short-term video</th><th>Video plus text, as in MEM</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.q} style={{ borderTop: "1px solid var(--rule)" }}>
              <td style={{ padding: "0.35rem 0.3rem" }}>{q.q} <span style={{ color: "var(--ink-3)" }}>({q.truth})</span></td>
              <td><strong>cannot tell</strong></td>
              <td>{q.shortKnows ? "knows" : <strong>has forgotten</strong>}</td>
              <td>knows</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
