"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

const STAGES = [
  { title: "Pretrained base", amount: "thousands to hundreds of thousands of hours", log: 5,
    what: "Broad data from many robots, human video and the web (chapter 13). Done once, by the model maker.",
    examples: "π0.5, GR00T N1.7, π*0.6's offline-RL pretraining" },
  { title: "Fine-tune", amount: "tens to hundreds of demonstrations per task", log: 2.3,
    what: "Supervised fine-tuning on demonstrations of the target task, often with low-rank adapters so only a sliver of the weights change.",
    examples: "200 to 500 demonstrations (industry survey); 50 to 100 for Gemini Robotics On-Device (vendor claim)" },
  { title: "Reinforcement learning", amount: "minutes to hours of practice", log: 0.7,
    what: "The robot tries the task and improves from reward, corrections and its own failures, beyond what the demonstrations showed.",
    examples: "SERL: 25 to 50 minutes per policy; RL Token: minutes to a few hours; π*0.6 with RECAP" },
  { title: "Deploy, and keep learning", amount: "a fleet's experience, continuously", log: 1.5,
    what: "Deployed robots stream their experience and human interventions back to a learner, which sends improved policies out.",
    examples: "SOP: a fleet streaming on-policy data to a cloud learner (January 2026)" },
];

/** Figure 14.1: from a pretrained base to a deployed specialist, with the data each stage uses. */
export function PostTrainingPipeline() {
  const [k, setK] = useState(1);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setK((s) => (s + 1) % STAGES.length), 2600);
    return () => window.clearInterval(id);
  }, [auto]);
  const s = STAGES[k];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 218" role="group" aria-label="Four post-training stages with the amount of data each uses">
        <defs>
          <marker id="pt-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        {STAGES.map((st, i) => {
          const x = i * 218, on = i === k;
          const h = 12 + st.log * 19;
          return (
            <g key={st.title} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }}
              onClick={() => { setAuto(false); setK(i); }} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setAuto(false), setK(i))}>
              <rect x={x + 4} y={10} width={190} height={56} rx="8" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
              <text x={x + 99} y={36} textAnchor="middle" fontSize="14" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{i + 1}. {st.title}</text>
              <text x={x + 99} y={54} textAnchor="middle" fontSize="11" fill={on ? "var(--surface)" : "var(--ink-3)"}>select</text>
              {i < 3 && <path d={`M ${x + 196} 38 L ${x + 220} 38`} stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#pt-head)" />}
              <rect x={x + 64} y={200 - h} width={70} height={h} fill={i === 3 ? "none" : "var(--fam-reactive)"} stroke="var(--fam-reactive)" strokeWidth="2"
                strokeDasharray={i === 3 ? "5 3" : undefined} opacity={on ? 1 : 0.55} />
              <text x={x + 99} y={194 - h} textAnchor="middle" fontSize="11" fill="var(--ink-2)">{["10⁵ h", "10² demos", "~1 h", "ongoing"][i]}</text>
            </g>
          );
        })}
        <text x="0" y="214" fontSize="11" fill="var(--ink-3)">data per stage, schematic log scale</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{k + 1}. {s.title}: {s.amount}</h4>
        <p>{s.what}</p>
        <p className={styles.cardMeta}>Examples: {s.examples}.</p>
      </div>
    </div>
  );
}
