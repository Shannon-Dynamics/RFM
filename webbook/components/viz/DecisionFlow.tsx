"use client";
import Link from "next/link";
import { useState } from "react";
import { CHAPTERS } from "@/content/book";
import styles from "./viz.module.css";

type Q = "q1" | "q2" | "q3" | "q4";
type A = "a1" | "a2" | "a3" | "a4" | "a5";
type Answers = Partial<Record<Q, boolean>>;

const QUESTIONS: Record<Q, { text: string; y: number }> = {
  q1: { text: "Short-horizon task with in-distribution objects?", y: 10 },
  q2: { text: "Contact-rich, occluded, or delayed effects?", y: 100 },
  q3: { text: "Any action-labelled robot data for this body?", y: 214 },
  q4: { text: "Edge compute only, no cloud?", y: 304 },
};
const ANSWERS: Record<A, { text: string; chapters: number[]; y: number }> = {
  a1: { text: "Reactive VLA or flow-matching action expert", chapters: [5], y: 10 },
  a2: { text: "World-action model or latent-prediction model", chapters: [6, 7], y: 100 },
  a3: { text: "Latent-action pretraining from video, then adapt", chapters: [7, 8], y: 214 },
  a4: { text: "Quantised VLA on device; reasoning model optional", chapters: [5, 10], y: 304 },
  a5: { text: "Reasoning model over a controller", chapters: [10, 5, 11], y: 384 },
};
const PRESETS: { label: string; a: Answers }[] = [
  { label: "Warehouse pick-and-place cell", a: { q1: true } },
  { label: "Humanoid tidying a home", a: { q1: false, q2: true } },
  { label: "Mobile inspection robot", a: { q1: false, q2: false, q3: true, q4: false } },
  { label: "New robot, no data yet", a: { q1: false, q2: false, q3: false } },
];

function walk(a: Answers): { path: (Q | A)[]; next: Q | null; end: A | null } {
  const path: (Q | A)[] = ["q1"];
  if (a.q1 === undefined) return { path, next: "q1", end: null };
  if (a.q1) return { path: [...path, "a1"], next: null, end: "a1" };
  path.push("q2");
  if (a.q2 === undefined) return { path, next: "q2", end: null };
  if (a.q2) return { path: [...path, "a2"], next: null, end: "a2" };
  path.push("q3");
  if (a.q3 === undefined) return { path, next: "q3", end: null };
  if (!a.q3) return { path: [...path, "a3"], next: null, end: "a3" };
  path.push("q4");
  if (a.q4 === undefined) return { path, next: "q4", end: null };
  const end: A = a.q4 ? "a4" : "a5";
  return { path: [...path, end], next: null, end };
}

const QX = 10, QW = 360, AX = 506, AW = 344, H = 56;

/** Figure 12.2: the decision walk-through, one question at a time. */
export function DecisionFlow() {
  const [ans, setAns] = useState<Answers>({});
  const { path, next, end } = walk(ans);
  const on = (n: Q | A) => path.includes(n);
  const edge = (from: Q | A, to: Q | A) => on(from) && on(to);
  const stroke = (lit: boolean) => (lit ? "var(--ink)" : "var(--rule-strong)");
  const qy = (q: Q) => QUESTIONS[q].y + H / 2;
  const ay = (a: A) => ANSWERS[a].y + H / 2;

  const arrows: { d: string; lit: boolean; label: string; lx: number; ly: number }[] = [
    { d: `M ${QX + QW} ${qy("q1")} L ${AX - 4} ${ay("a1")}`, lit: edge("q1", "a1"), label: "yes", lx: 420, ly: qy("q1") - 6 },
    { d: `M ${QX + QW / 2} ${QUESTIONS.q1.y + H} L ${QX + QW / 2} ${QUESTIONS.q2.y - 4}`, lit: edge("q1", "q2"), label: "no", lx: QX + QW / 2 + 8, ly: 86 },
    { d: `M ${QX + QW} ${qy("q2")} L ${AX - 4} ${ay("a2")}`, lit: edge("q2", "a2"), label: "yes", lx: 420, ly: qy("q2") - 6 },
    { d: `M ${QX + QW / 2} ${QUESTIONS.q2.y + H} L ${QX + QW / 2} ${QUESTIONS.q3.y - 4}`, lit: edge("q2", "q3"), label: "no", lx: QX + QW / 2 + 8, ly: 190 },
    { d: `M ${QX + QW} ${qy("q3")} L ${AX - 4} ${ay("a3")}`, lit: edge("q3", "a3"), label: "no", lx: 420, ly: qy("q3") - 6 },
    { d: `M ${QX + QW / 2} ${QUESTIONS.q3.y + H} L ${QX + QW / 2} ${QUESTIONS.q4.y - 4}`, lit: edge("q3", "q4"), label: "yes", lx: QX + QW / 2 + 8, ly: 290 },
    { d: `M ${QX + QW} ${qy("q4")} L ${AX - 4} ${ay("a4")}`, lit: edge("q4", "a4"), label: "yes", lx: 420, ly: qy("q4") - 6 },
    { d: `M ${QX + QW} ${qy("q4") + 10} C 440 ${qy("q4") + 10}, 440 ${ay("a5")}, ${AX - 4} ${ay("a5")}`, lit: edge("q4", "a5"), label: "no", lx: 420, ly: ay("a5") - 8 },
  ];
  const slug = (n: number) => CHAPTERS.find((c) => c.n === n)!;

  return (
    <div className={styles.stack}>
      <div className={styles.row} role="group" aria-label="Worked scenarios">
        {PRESETS.map((p) => (
          <button key={p.label} className={styles.chip} aria-pressed={JSON.stringify(p.a) === JSON.stringify(ans)} onClick={() => setAns(p.a)}>{p.label}</button>
        ))}
        <button className={styles.button} onClick={() => setAns({})}>Start over</button>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 450" role="img"
        aria-label={end ? `Answers lead to: ${ANSWERS[end].text}, chapters ${ANSWERS[end].chapters.join(", ")}.` : `Current question: ${QUESTIONS[next!].text}`}>
        <defs>
          {["on", "off"].map((k) => (
            <marker key={k} id={`df-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={k === "on" ? "var(--ink)" : "var(--rule-strong)"} />
            </marker>
          ))}
        </defs>
        {arrows.map((a, i) => (
          <g key={i}>
            <path d={a.d} fill="none" stroke={stroke(a.lit)} strokeWidth={a.lit ? 2.5 : 1.5} markerEnd={`url(#df-${a.lit ? "on" : "off"})`} />
            <text x={a.lx} y={a.ly} fontSize="12" fontWeight={a.lit ? 700 : 400} fill={a.lit ? "var(--ink)" : "var(--ink-3)"}>{a.label}</text>
          </g>
        ))}
        {(Object.keys(QUESTIONS) as Q[]).map((q) => {
          const cur = q === next, was = on(q) && !cur;
          return (
            <g key={q}>
              <rect x={QX} y={QUESTIONS[q].y} width={QW} height={H} rx="8" fill={cur ? "var(--ink)" : "var(--surface-2)"}
                stroke={was || cur ? "var(--ink)" : "var(--rule-strong)"} strokeWidth={was ? 2 : 1} />
              <text x={QX + QW / 2} y={QUESTIONS[q].y + H / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill={cur ? "var(--surface)" : "var(--ink)"}>{QUESTIONS[q].text}</text>
            </g>
          );
        })}
        {(Object.keys(ANSWERS) as A[]).map((a) => {
          const hit = a === end;
          return (
            <g key={a}>
              <rect x={AX} y={ANSWERS[a].y} width={AW} height={H} rx="8" fill={hit ? "var(--surface)" : "var(--surface-2)"}
                stroke={hit ? "var(--ink)" : "var(--rule-strong)"} strokeWidth={hit ? 2.5 : 1} />
              <text x={AX + 14} y={ANSWERS[a].y + 23} fontSize="12.5" fontWeight={hit ? 700 : 500} fill="var(--ink)">{ANSWERS[a].text}</text>
              {ANSWERS[a].chapters.map((n, k) => (
                <g key={n}>
                  <circle cx={AX + 20 + k * 92} cy={ANSWERS[a].y + 40} r="5" fill={`var(--fam-${slug(n).family ?? "reactive"})`} />
                  <text x={AX + 30 + k * 92} y={ANSWERS[a].y + 44} fontSize="12" fill="var(--ink-2)">chapter {n}</text>
                </g>
              ))}
            </g>
          );
        })}
        <rect x={AX} y={164} width={AW} height={38} rx="6" fill="none" stroke={on("a2") ? "var(--ink-2)" : "var(--rule)"} strokeDasharray="4 3" />
        <text x={AX + 12} y={180} fontSize="11.5" fill="var(--ink-2)">If precise contact state matters more than appearance,</text>
        <text x={AX + 12} y={195} fontSize="11.5" fill="var(--ink-2)">also consider geometry-first models (chapter 9).</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        {next ? (
          <div className={styles.row}>
            <strong>{QUESTIONS[next].text}</strong>
            <button className={styles.button} data-primary="true" onClick={() => setAns({ ...ans, [next]: true })}>Yes</button>
            <button className={styles.button} onClick={() => setAns({ ...ans, [next]: false })}>No</button>
          </div>
        ) : (
          <p>
            <strong>Start with:</strong> {ANSWERS[end!].text}. Read{" "}
            {ANSWERS[end!].chapters.map((n, i) => (
              <span key={n}>{i ? (i === ANSWERS[end!].chapters.length - 1 ? " and " : ", ") : ""}<Link href={`/chapters/${slug(n).slug}/`}>chapter {n}</Link></span>
            ))}.
          </p>
        )}
      </div>
    </div>
  );
}
