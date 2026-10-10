"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

export type Arrow = "policy" | "planning" | "forward" | "inverse";
type Phase = "train" | "infer";

export interface Style {
  id: string;
  label: string;
  examples: string;
  train: Arrow[];
  /** Inference runs these in order; arrows inside one inner array run together. */
  infer: Arrow[][];
  note: string;
}

// After the four-component decomposition in the WAM survey (arXiv 2609.16074, eqs. 10-15).
const STYLES: Style[] = [
  { id: "vla", label: "Reactive VLA", examples: "π0.5, GR00T N1.7", train: ["policy"], infer: [["policy"]],
    note: "Learns and runs the policy only. Nothing about the future is modelled." },
  { id: "joint", label: "Joint prediction", examples: "DreamZero, UWM, PAD", train: ["policy", "planning"], infer: [["policy", "planning"]],
    note: "Futures and actions come out of one generative pass, so each is shaped by the other." },
  { id: "idm", label: "Plan, then act", examples: "LingBot-VA, mimic-video, VPP", train: ["planning", "inverse"], infer: [["planning"], ["inverse"]],
    note: "First imagine the future, then infer the actions that produce it. The action head solves the easier inverse problem." },
  { id: "fast", label: "Video only in training", examples: "Fast-WAM, GigaWorld-Policy", train: ["policy", "planning"], infer: [["policy"]],
    note: "Trains with futures as extra supervision, then drops them at test time: the inference cost of a VLA." },
  { id: "search", label: "Propose, imagine, choose", examples: "Cosmos Policy planning, this chapter's simulation", train: ["policy", "forward"],
    infer: [["policy"], ["forward"]],
    note: "A policy proposes action chunks, the forward model imagines each, and the best predicted future wins." },
];

const PATHS: Record<Arrow, { d: string; label: string; formula: string; lx: number; ly: number }> = {
  policy: { d: "M 196 176 C 300 176, 360 236, 452 236", label: "Policy", formula: "p(a | o<t, ℓ)", lx: 300, ly: 238 },
  planning: { d: "M 196 104 C 300 104, 360 44, 452 44", label: "Visual planning", formula: "p(o | o<t, ℓ)", lx: 300, ly: 40 },
  forward: { d: "M 520 200 L 520 84", label: "Forward dynamics", formula: "p(o | o<t, a)", lx: 508, ly: 136 },
  inverse: { d: "M 552 84 L 552 200", label: "Inverse dynamics", formula: "p(a | o<t, o)", lx: 564, ly: 164 },
};

/** Figure 6.2: which of the four components each style trains, and which it runs at inference. */
export function FourComponents({ modes: list = STYLES, initial = "idm", futures = "Future observations", futuresSym = "o t:t+H" }:
  { modes?: Style[]; initial?: string; futures?: string; futuresSym?: string } = {}) {
  const [styleId, setStyleId] = useState(initial);
  const [phase, setPhase] = useState<Phase>("infer");
  const [stage, setStage] = useState(0);
  const st = list.find((s) => s.id === styleId)!;
  const stages = phase === "infer" ? st.infer : [st.train];

  // Step through inference stages in order: motion that answers the reader's choice.
  useEffect(() => {
    setStage(0);
    if (stages.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % (stages.length + 1)), 1100);
    return () => window.clearInterval(id);
  }, [styleId, phase, stages.length]);

  const active = new Set(stages.flat());
  const lit = new Set(stages.length < 2 ? stages.flat() : stages.slice(0, Math.max(1, stage)).flat());

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Model style">
          {list.map((s) => <button key={s.id} aria-pressed={styleId === s.id} onClick={() => setStyleId(s.id)}>{s.label}</button>)}
        </div>
        <div className={styles.segmented} role="group" aria-label="Phase">
          <button aria-pressed={phase === "train"} onClick={() => setPhase("train")}>Training</button>
          <button aria-pressed={phase === "infer"} onClick={() => setPhase("infer")}>Inference</button>
        </div>
      </div>
      <svg className={styles.svg} viewBox="0 0 720 280" role="img"
        aria-label={`${st.label} during ${phase === "train" ? "training" : "inference"}: ${[...active].map((a) => PATHS[a].label).join(", ")} active.`}>
        <defs>
          <marker id="fc-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>
        <rect x="16" y="92" width="180" height="96" rx="8" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="106" y="130" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">Past observations</text>
        <text x="106" y="152" textAnchor="middle" fontSize="15" fill="var(--ink-2)">and instruction</text>
        <text x="106" y="174" textAnchor="middle" fontSize="14" fill="var(--ink-3)">o&lt;t, ℓ</text>
        <rect x="452" y="16" width="170" height="68" rx="8" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="537" y="46" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">{futures}</text>
        <text x="537" y="68" textAnchor="middle" fontSize="14" fill="var(--ink-3)">{futuresSym}</text>
        <rect x="452" y="200" width="170" height="68" rx="8" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="537" y="230" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--ink)">Actions</text>
        <text x="537" y="252" textAnchor="middle" fontSize="14" fill="var(--ink-3)">a t:t+H</text>
        {(Object.keys(PATHS) as Arrow[]).map((k) => {
          const p = PATHS[k];
          const on = lit.has(k);
          const used = active.has(k);
          return (
            <g key={k}>
              <path d={p.d} fill="none" stroke={on ? "var(--ink)" : used ? "var(--ink-3)" : "var(--rule-strong)"}
                strokeWidth={on ? 3 : 1.5} strokeDasharray={used ? undefined : "5 5"} markerEnd="url(#fc-head)"
                style={{ transition: "stroke 250ms, stroke-width 250ms" }} />
              <text x={p.lx} y={p.ly} fontSize="14" fontWeight={used ? 600 : 400} fill={used ? "var(--ink)" : "var(--ink-3)"}
                textAnchor={k === "forward" ? "end" : k === "inverse" ? "start" : "middle"}>
                {p.label}
                <tspan x={p.lx} dy="17" fontWeight="400" fill="var(--ink-2)">{p.formula}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
      <p className={styles.note}>
        <strong>{st.label}</strong> ({st.examples}). {st.note}{" "}
        {phase === "infer" && st.infer.length > 1 && "At inference the steps run in the order shown."}
      </p>
    </div>
  );
}
