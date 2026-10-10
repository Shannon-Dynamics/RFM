"use client";
import { useState } from "react";
import styles from "./viz.module.css";

const BOXES = {
  modular: [
    { x: 20, label: "perception", sub: "detects objects", inside: false },
    { x: 190, label: "planner", sub: "explicit rules and maps", inside: false },
    { x: 360, label: "motion controller", sub: "verified trajectories", inside: true },
    { x: 530, label: "safety monitor", sub: "speed, separation, force limits", inside: true },
  ],
  learned: [
    { x: 20, label: "cameras", sub: "raw pixels", inside: false },
    { x: 190, label: "learned policy", sub: "one network, end to end", inside: false },
    { x: 360, label: "low-level controller", sub: "tracks the commanded actions", inside: false },
    { x: 530, label: "safety monitor", sub: "speed, separation, force limits", inside: true },
  ],
};

/** Figure 15.5: where a certifiable boundary can be drawn, with a modular pipeline and with a learned policy. */
export function SafetyBoundary() {
  const [mode, setMode] = useState<"modular" | "learned">("learned");
  const boxes = BOXES[mode];
  const first = boxes.findIndex((b) => b.inside);
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Architecture">
        <button aria-pressed={mode === "modular"} onClick={() => setMode("modular")}>Modular pipeline</button>
        <button aria-pressed={mode === "learned"} onClick={() => setMode("learned")}>Learned policy</button>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 180" role="img"
        aria-label={mode === "modular" ? "In a modular pipeline the certifiable boundary can enclose the motion controller and the safety monitor." : "With a learned policy the certifiable boundary encloses only an independent safety monitor; the policy sits outside it."}>
        <defs>
          <marker id="sb-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <rect x={boxes[first].x - 12} y={22} width={700 - boxes[first].x + 12 - 2} height={110} rx="12" fill="none" stroke="var(--fam-reactive)" strokeWidth="2.5" strokeDasharray="7 4" />
        <text x={boxes[first].x - 4} y={16} fontSize="12" fontWeight="600" fill="var(--ink)">certifiable boundary</text>
        {boxes.map((b, i) => (
          <g key={b.label}>
            <rect x={b.x} y={44} width={150} height={66} rx="8" fill={b.inside ? "var(--surface)" : "var(--surface-2)"} stroke="var(--ink-2)" />
            <text x={b.x + 75} y={72} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="var(--ink)">{b.label}</text>
            <text x={b.x + 75} y={92} textAnchor="middle" fontSize="11" fill="var(--ink-2)">{b.sub}</text>
            {i < 3 && <path d={`M ${b.x + 152} 77 L ${b.x + 168} 77`} stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sb-head)" />}
          </g>
        ))}
        <path d="M 682 77 L 720 77" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sb-head)" />
        <rect x={724} y={52} width={120} height={50} rx="6" fill="var(--ink)" />
        <text x={784} y={82} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--surface)">robot</text>
        <text x="20" y="160" fontSize="12" fill="var(--ink-2)">
          {mode === "modular" ? "Each module has a specification that can be tested and argued about separately; much of the chain can sit inside the safety case." :
            "The policy has no specification beyond its training data, so the safety case rests on an independent monitor that can stop it."}
        </text>
      </svg>
    </div>
  );
}
