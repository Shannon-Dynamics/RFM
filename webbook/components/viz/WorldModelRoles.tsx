"use client";
import { useState } from "react";
import styles from "./viz.module.css";

const ROLES = [
  { id: "planner", label: "Planner", x: 40, y: 24, into: "candidate actions", out: "imagined futures, scored",
    examples: "V-JEPA 2-AC plans towards image goals (June 2025); Cosmos Policy can run as a planner (January 2026, chapter 6); DreamPlan fine-tunes a vision-language planner inside a video world model (March 2026).",
    risk: "The planner picks whichever action the model scores highest, including actions the model gets wrong." },
  { id: "data", label: "Data engine", x: 600, y: 24, into: "a few real demonstrations", out: "many synthetic trajectories",
    examples: "DreamGen (May 2025) turns teleoperation of one pick-and-place task into 22 new humanoid behaviours; Cosmos-Transfer (March 2025) translates simulation to realistic video; GigaWorld-0 (November 2025) generates training data for GigaBrain-0.",
    risk: "Generated video can look right and still imply motions the robot cannot make (figure 8.4)." },
  { id: "rl", label: "RL environment", x: 40, y: 232, into: "the policy's actions", out: "next frames and rewards",
    examples: "World4RL refines a policy entirely inside a frozen diffusion world model (September 2025); WMPO runs on-policy GRPO in imagination (November 2025); World-VLA-Loop co-trains the world model and the VLA (February 2026); VLA-MBPO adds multi-view consistency and branched rollouts (March 2026).",
    risk: "The policy optimises the model, not the world, and finds the model's mistakes (figure 8.3)." },
  { id: "eval", label: "Policy evaluator", x: 600, y: 232, into: "a trained policy", out: "a predicted success rate",
    examples: "Interactive World Simulator runs for more than 10 minutes at 15 FPS on one RTX 4090 and reports strong correlation with real-world results (March 2026); WorldArena benchmarks 14 world models as data engines, evaluators and planners (February 2026).",
    risk: "An evaluation is only as good as the model in the states the policy actually visits." },
];

/** Figure 8.1: one world model, four jobs. The world model is never the policy. */
export function WorldModelRoles() {
  const [sel, setSel] = useState("rl");
  const r = ROLES.find((x) => x.id === sel)!;
  const CX = 430, CY = 166;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 330" role="group" aria-label="A world model at the centre, used as planner, data engine, RL environment or policy evaluator">
        <style>{`@keyframes wmflow { to { stroke-dashoffset: -24; } } .wmflow { animation: wmflow 0.9s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .wmflow { animation: none; } }`}</style>
        {ROLES.map((ro) => {
          const on = ro.id === sel;
          const bx = ro.x + 110, by = ro.y + 37;
          return (
            <g key={ro.id}>
              <line x1={bx} y1={by} x2={CX} y2={CY} stroke={on ? "var(--fam-simulator)" : "var(--rule-strong)"} strokeWidth={on ? 3 : 1.5}
                strokeDasharray="8 4" className={on ? "wmflow" : undefined} />
              <g tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }}
                onClick={() => setSel(ro.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(ro.id)}>
                <rect x={ro.x} y={ro.y} width={220} height={74} rx="8" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
                <text x={ro.x + 110} y={ro.y + 30} textAnchor="middle" fontSize="16" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{ro.label}</text>
                <text x={ro.x + 110} y={ro.y + 52} textAnchor="middle" fontSize="12" fill={on ? "var(--surface)" : "var(--ink-2)"}>gets {ro.out}</text>
              </g>
            </g>
          );
        })}
        <rect x={CX - 110} y={CY - 44} width={220} height={88} rx="12" fill="var(--surface)" stroke="var(--fam-simulator)" strokeWidth="3" />
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--ink)">world model</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="12" fill="var(--ink-2)">predicts what happens next</text>
        <text x={CX} y={CY + 30} textAnchor="middle" fontSize="12" fill="var(--ink-2)">given what is done</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{r.label}</h4>
        <p><strong>Sends in</strong> {r.into}; <strong>gets back</strong> {r.out}.</p>
        <p>{r.examples}</p>
        <p className={styles.cardMeta}>Where it goes wrong: {r.risk}</p>
      </div>
    </div>
  );
}
