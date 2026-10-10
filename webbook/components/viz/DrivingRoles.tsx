"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

const ROLES = {
  generate: { label: "Generate scenarios", models: "GAIA-1 (September 2023), GAIA-2 (March 2025)",
    text: "Generate realistic multi-camera driving video under control: ego motion, other agents, weather and road layout. GAIA-2 conditions on all of these and covers the UK, US and Germany; its makers frame it as a way to simulate both common and rare scenarios." },
  occupancy: { label: "Forecast occupancy", models: "OccWorld (November 2023)",
    text: "Predict how the 3D occupancy of the scene evolves, together with the ego car's path. Occupancy is cheaper to obtain than full labels and works with cameras or LiDAR." },
  real: { label: "World model from real driving", models: "DriveDreamer (September 2023)",
    text: "A diffusion world model built entirely from real-world driving, which learns traffic structure first and then predicts future states, producing both driving video and driving actions." },
};
type Role = keyof typeof ROLES;

const GHOSTS = [[[300, 150], [380, 150], [470, 150]], [[430, 60], [430, 110], [430, 160]], [[560, 210], [480, 210], [400, 210]]];

/** Figure 16.4: three roles of world models in driving, around one intersection. */
export function DrivingRoles() {
  const [role, setRole] = useState<Role>("generate");
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setT((x) => (x + 1) % 3), 800);
    return () => window.clearInterval(id);
  }, []);
  const r = ROLES[role];
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Role">
        {(Object.keys(ROLES) as Role[]).map((k) => <button key={k} aria-pressed={role === k} onClick={() => setRole(k)}>{ROLES[k].label}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 280" role="img" aria-label={`${r.label}: ${r.text}`}>
        <rect x="0" y="120" width="860" height="120" fill="var(--surface-2)" />
        <rect x="370" y="0" width="120" height="280" fill="var(--surface-2)" />
        <line x1="0" x2="370" y1="180" y2="180" stroke="var(--rule-strong)" strokeDasharray="12 10" />
        <line x1="490" x2="860" y1="180" y2="180" stroke="var(--rule-strong)" strokeDasharray="12 10" />
        <line x1="430" x2="430" y1="0" y2="120" stroke="var(--rule-strong)" strokeDasharray="12 10" />
        <line x1="430" x2="430" y1="240" y2="280" stroke="var(--rule-strong)" strokeDasharray="12 10" />
        <g transform="translate(200,198)">
          <rect x="-24" y="-12" width="48" height="24" rx="5" fill="var(--ink)" />
          <text x="0" y="40" textAnchor="middle" fontSize="12" fill="var(--ink-2)">ego car</text>
        </g>
        {role === "generate" && GHOSTS.map((g, i) => {
          const [x, y] = g[t];
          return <rect key={i} x={x - 22} y={y - 11} width="44" height="22" rx="5" fill="none" stroke="var(--fam-simulator)" strokeWidth="2.5" strokeDasharray="5 3" />;
        })}
        {role === "generate" && <text x="620" y="40" fontSize="12.5" fill="var(--ink-2)">dashed: agents the model generates,</text>}
        {role === "generate" && <text x="620" y="58" fontSize="12.5" fill="var(--ink-2)">differently each time</text>}
        {role === "occupancy" && Array.from({ length: 8 }, (_, i) => Array.from({ length: 5 }, (_, j) => {
          const x = 300 + i * 30, y = 130 + j * 22;
          const busy = (j === 2 && i >= 2 + t && i <= 4 + t) || (i === 4 && j <= 1 + t);
          return <rect key={`${i}-${j}`} x={x} y={y} width="28" height="20" fill={busy ? "var(--fam-geometry)" : "none"} stroke="var(--rule-strong)" opacity={busy ? 0.8 : 0.6} />;
        }))}
        {role === "occupancy" && <text x="620" y="40" fontSize="12.5" fill="var(--ink-2)">shaded: cells predicted to be occupied,</text>}
        {role === "occupancy" && <text x="620" y="58" fontSize="12.5" fill="var(--ink-2)">step {t + 1} of 3 into the future</text>}
        {role === "real" && (
          <g>
            <path d={`M 224 198 C 320 198, 360 ${198 - t * 10}, ${420 + t * 60} ${198 - t * 10}`} fill="none" stroke="var(--fam-simulator)" strokeWidth="3" />
            {[0, 1, 2].map((k) => <rect key={k} x={560 + k * 92} y={60} width="84" height="56" rx="4" fill={k <= t ? "var(--surface)" : "none"} stroke="var(--ink-2)" />)}
            <text x="560" y="40" fontSize="12.5" fill="var(--ink-2)">predicted camera frames, and the path that goes with them</text>
          </g>
        )}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{r.label}</h4>
        <p>{r.text}</p>
        <p className={styles.cardMeta}>{r.models}.</p>
      </div>
    </div>
  );
}
