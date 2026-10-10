"use client";
import { useState } from "react";
import { halo } from "@/lib/layout";
import styles from "./viz.module.css";

const ITEMS = [
  { name: "ManiSkill3", x: 0.08, y: 0.22, year: "2024", what: "GPU-parallel simulation for manipulation, reported at up to 30,000+ frames per second.", misses: "real contact and appearance; short tasks" },
  { name: "LIBERO", x: 0.14, y: 0.38, year: "2023", what: "Four task suites, 130 tasks, for transfer in lifelong learning; the most reported VLA benchmark.", misses: "close to saturated; little visual or physical variation" },
  { name: "LIBERO-Plus", x: 0.22, y: 0.28, year: "2025", what: "LIBERO under perturbations of layout, camera, initial state, language, light, background and sensor noise.", misses: "still simulated and short" },
  { name: "RoboTwin 2.0", x: 0.3, y: 0.42, year: "2025", what: "50 dual-arm tasks with domain randomisation along five axes.", misses: "simulated contact; bimanual only" },
  { name: "CALVIN", x: 0.12, y: 0.7, year: "2021", what: "Long-horizon, language-conditioned tasks in simulation, tested on new instructions and environments.", misses: "one simulated tabletop" },
  { name: "BEHAVIOR-1K challenge", x: 0.28, y: 0.86, year: "studied in 2026", what: "Household chores in simulation; a 2026 study argues its final-state metrics hide safety violations.", misses: "what happens along the way; real physics" },
  { name: "TRI blind A/B trials", x: 0.66, y: 0.5, year: "2025", what: "1,800 blind, randomised real-world trials plus 47,000 simulated rollouts, with statistical confidence.", misses: "shared access: one lab's robots and tasks" },
  { name: "RoboArena", x: 0.86, y: 0.36, year: "2025", what: "Distributed real-world evaluation: evaluators choose their own tasks and compare two policies double-blind.", misses: "long horizons; tasks are whatever evaluators pick" },
];

const W = 860, L = 70, R = 840, T = 20, B = 300;
const px = (v: number) => L + v * (R - L), py = (v: number) => B - v * (B - T);

/** Figure 15.3: where the benchmarks sit, and the quadrant nobody occupies. */
export function BenchmarkMap() {
  const [sel, setSel] = useState("LIBERO-Plus");
  const s = ITEMS.find((i) => i.name === sel)!;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} 340`} role="group" aria-label="Benchmarks placed by simulated versus real, and short versus long horizon">
        <rect x={px(0.5)} y={py(1)} width={px(1) - px(0.5)} height={py(0.5) - py(1)} fill="var(--surface-2)" stroke="var(--rule-strong)" strokeDasharray="5 4" />
        <text x={px(0.75)} y={py(0.78)} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink-2)">real robots, long tasks:</text>
        <text x={px(0.75)} y={py(0.78) + 18} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink-2)">no shared benchmark</text>
        <line x1={L} x2={R} y1={B} y2={B} stroke="var(--rule-strong)" />
        <line x1={L} x2={L} y1={T} y2={B} stroke="var(--rule-strong)" />
        <text x={L} y={B + 20} fontSize="12" fill="var(--ink-2)">simulated</text>
        <text x={R} y={B + 20} textAnchor="end" fontSize="12" fill="var(--ink-2)">real robots</text>
        <text x={L - 10} y={B} textAnchor="end" fontSize="12" fill="var(--ink-2)">short</text>
        <text x={L - 10} y={T + 10} textAnchor="end" fontSize="12" fill="var(--ink-2)">long</text>
        <text x={(L + R) / 2} y={B + 36} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)">placement is the authors&rsquo; reading of each benchmark&rsquo;s paper</text>
        {ITEMS.map((i) => {
          const on = i.name === sel;
          return (
            <g key={i.name} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }} aria-label={`${i.name}: ${i.what}`}
              onClick={() => setSel(i.name)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(i.name)}>
              <circle cx={px(i.x)} cy={py(i.y)} r={on ? 9 : 7} fill={on ? "var(--ink)" : "var(--ink-2)"} stroke="var(--surface)" strokeWidth="2" />
              <text x={px(i.x) + 13} y={py(i.y) + 4} fontSize="12.5" fontWeight={on ? 700 : 500} fill="var(--ink)" {...halo}>{i.name}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{s.name} ({s.year})</h4>
        <p>{s.what}</p>
        <p className={styles.cardMeta}>What it does not measure: {s.misses}.</p>
      </div>
    </div>
  );
}
