"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

// DreamGen's four stages (arXiv 2505.12705, section 1), with an evaluation step closing the loop.
const STEPS = [
  { title: "Fine-tune the video model", input: "teleoperated trajectories of the target robot", output: "a video model that knows this robot's body",
    note: "An off-the-shelf image-to-video model learns the robot's appearance, kinematics and dynamics." },
  { title: "Generate videos", input: "an initial frame plus a new instruction", output: "videos of familiar and novel tasks in new scenes",
    note: "The prompt can ask for behaviours and environments the teleoperation never covered." },
  { title: "Label pseudo-actions", input: "generated video only", output: "neural trajectories: video plus inferred actions",
    note: "A latent action model or an inverse dynamics model reads actions off the frames, because the video model generates none." },
  { title: "Train the policy", input: "real plus neural trajectories", output: "a visuomotor policy",
    note: "The policy never knows which trajectories were real." },
  { title: "Evaluate", input: "the trained policy", output: "which generated data helped",
    note: "DreamGen Bench scores video models on generation; the authors report it correlates strongly with downstream policy success." },
];

/** Figure 8.2: the synthetic data loop, stage by stage. */
export function SyntheticLoop() {
  const [k, setK] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setK((s) => (s + 1) % STEPS.length), 2200);
    return () => window.clearInterval(id);
  }, [auto]);
  const CX = 430, CY = 150, RX = 330, RY = 104;
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / STEPS.length;
    return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
  };
  const s = STEPS[k];
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 300" role="group" aria-label="Synthetic data loop in five steps">
        <defs>
          <marker id="sl-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--rule-strong)" strokeDasharray="6 5" />
        {STEPS.map((_, i) => {
          const a0 = -Math.PI / 2 + (2 * Math.PI * (i + 0.3)) / STEPS.length, a1 = -Math.PI / 2 + (2 * Math.PI * (i + 0.7)) / STEPS.length;
          return <path key={i} d={`M ${CX + RX * Math.cos(a0)} ${CY + RY * Math.sin(a0)} A ${RX} ${RY} 0 0 1 ${CX + RX * Math.cos(a1)} ${CY + RY * Math.sin(a1)}`}
            fill="none" stroke={i === k ? "var(--fam-simulator)" : "var(--ink-2)"} strokeWidth={i === k ? 3 : 1.5} markerEnd="url(#sl-head)" />;
        })}
        {STEPS.map((st, i) => {
          const [x, y] = pos(i), on = i === k;
          return (
            <g key={st.title} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }}
              onClick={() => { setAuto(false); setK(i); }} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setAuto(false), setK(i))}>
              <rect x={x - 92} y={y - 24} width={184} height={48} rx="8" fill={on ? "var(--ink)" : "var(--surface)"} stroke="var(--ink-2)" />
              <text x={x} y={y - 3} textAnchor="middle" fontSize="13" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{i + 1}. {st.title}</text>
              <text x={x} y={y + 14} textAnchor="middle" fontSize="11" fill={on ? "var(--surface)" : "var(--ink-3)"}>{i === 2 ? "inverse dynamics" : i === 1 ? "world model" : i === 4 ? "closes the loop" : i === 0 ? "real data in" : "imitation"}</text>
            </g>
          );
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="13" fill="var(--ink-2)">real data is the seed;</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="13" fill="var(--ink-2)">the world model multiplies it</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{k + 1}. {s.title}</h4>
        <p><strong>In:</strong> {s.input}. <strong>Out:</strong> {s.output}.</p>
        <p className={styles.cardMeta}>{s.note}</p>
      </div>
    </div>
  );
}
