"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

type Route = "sim" | "real" | "wm";
const ROUTES: Record<Route, { label: string; x: number; y: number; costs: string; risks: string; loop: string[]; examples: string }> = {
  sim: { label: "Simulation RL", x: 150, y: 222, costs: "building simulated scenes and tasks; compute",
    risks: "the sim-to-real gap: what works in simulation can fail on the real robot",
    loop: ["policy acts in simulation", "simulator returns state and reward", "update", "transfer to the real robot"],
    examples: "RL-Co fine-tunes OpenVLA and π0.5 with RL in simulation while anchoring to real data, reporting +24 and +20 points of real-world success (February 2026)." },
  real: { label: "Real-world RL", x: 710, y: 222, costs: "robot time, resets, human supervision and corrections",
    risks: "safety during learning, and results from only a few labs",
    loop: ["robot tries the task", "reward, or a human correction", "update", "try again"],
    examples: "SERL learns tasks in 25 to 50 minutes per policy (2024); π*0.6 with RECAP more than doubles throughput on its hardest tasks (vendor report, November 2025); RL Token speeds up the hardest part of a task up to 3× within hours (April 2026); VLA-Precision targets high-precision tasks with large VLAs (September 2026)." },
  wm: { label: "World-model RL", x: 430, y: 74, costs: "training a world model good enough to practise in",
    risks: "model bias: the policy learns to exploit the model's mistakes (chapter 8)",
    loop: ["policy acts in imagination", "world model predicts frames and reward", "update", "refresh the model with real rollouts"],
    examples: "World-VLA-Loop co-trains the world model and the VLA (February 2026); GigaBrain-0.5M* reports about 30% gains over RECAP on laundry folding, box packing and espresso (vendor report, February 2026); WMPO runs on-policy RL in a pixel world model (November 2025)." },
};

/** Figure 14.2: three routes to reinforcement learning for a robot policy, each with its own cost and risk. */
export function RlRoutes() {
  const [r, setR] = useState<Route>("real");
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % 4), 900);
    return () => window.clearInterval(id);
  }, [r]);
  const ro = ROUTES[r];
  const pts = (Object.keys(ROUTES) as Route[]).map((k) => `${ROUTES[k].x},${ROUTES[k].y}`).join(" ");
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 300" role="group" aria-label="Triangle of reinforcement-learning routes: simulation, real world and world model">
        <polygon points={pts} fill="var(--surface-2)" stroke="var(--rule-strong)" strokeDasharray="6 5" />
        <text x="430" y="166" textAnchor="middle" fontSize="12" fill="var(--ink-3)">every route trades</text>
        <text x="430" y="182" textAnchor="middle" fontSize="12" fill="var(--ink-3)">fidelity against cost</text>
        {(Object.keys(ROUTES) as Route[]).map((k) => {
          const c = ROUTES[k], on = k === r;
          return (
            <g key={k} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }}
              onClick={() => setR(k)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setR(k)}>
              <circle cx={c.x} cy={c.y} r={on ? 34 : 28} fill={on ? "var(--ink)" : "var(--surface)"} stroke="var(--ink)" strokeWidth="2" />
              {on && [0, 1, 2, 3].map((i) => {
                const a = -Math.PI / 2 + (i / 4) * 2 * Math.PI;
                return <circle key={i} cx={c.x + 34 * Math.cos(a)} cy={c.y + 34 * Math.sin(a)} r={i === step ? 6 : 3} fill="var(--fam-reactive)" />;
              })}
              <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill={on ? "var(--surface)" : "var(--ink)"}>{k === "wm" ? "WM" : k === "sim" ? "SIM" : "REAL"}</text>
              <text x={c.x} y={k === "wm" ? c.y - 44 : c.y + 52} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="var(--ink)">{c.label}</text>
            </g>
          );
        })}
        <text x={ro.x > 430 ? ro.x - 50 : ro.x + 50} y={ro.y + (r === "wm" ? 60 : -40)} textAnchor={ro.x > 430 ? "end" : ro.x < 430 ? "start" : "middle"}
          fontSize="12.5" fill="var(--ink)" fontWeight="600">{`${step + 1}. ${ro.loop[step]}`}</text>
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{ro.label}</h4>
        <p><strong>Costs:</strong> {ro.costs}. <strong>Risks:</strong> {ro.risks}.</p>
        <p className={styles.cardMeta}>{ro.examples}</p>
      </div>
    </div>
  );
}
