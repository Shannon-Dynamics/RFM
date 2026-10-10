"use client";
import { useState } from "react";
import { rolloutFeasible, rolloutPlausibleOnly, velocities } from "@/lib/sim/simulators";
import styles from "./viz.module.css";

const DT = 0.1, VMAX = 1.2, AMAX = 10;

/** Figure 8.4: two generated rollouts that look alike frame by frame; only one can be executed. */
export function PlausibleFeasible() {
  const [which, setWhich] = useState<"a" | "b">("b");
  const pos = which === "a" ? rolloutFeasible() : rolloutPlausibleOnly();
  const v = velocities(pos, DT);
  const acc = v.slice(1).map((x, i) => (x - v[i]) / DT);
  const FW = 78;
  const bad = v.map((x) => Math.abs(x) > VMAX);
  const badA = acc.map((a) => Math.abs(a) > AMAX);
  const nViol = bad.filter(Boolean).length + badA.filter(Boolean).length;
  const VY = 196, VH = 56, vs = (x: number) => (Math.min(4, Math.abs(x)) / 4) * VH;

  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Rollout">
        <button aria-pressed={which === "a"} onClick={() => setWhich("a")}>Rollout A</button>
        <button aria-pressed={which === "b"} onClick={() => setWhich("b")}>Rollout B</button>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 300" role="img"
        aria-label={`Rollout ${which.toUpperCase()}: ten generated frames. Decoded into actions, it has ${nViol} speed or acceleration violations.`}>
        <text x="0" y="14" fontSize="12" fontWeight="600" fill="var(--ink)">Generated frames</text>
        {pos.map((p, i) => (
          <g key={i}>
            <rect x={i * (FW + 8)} y={22} width={FW} height={64} rx="3" fill="var(--surface-2)" stroke="var(--rule-strong)" />
            <line x1={i * (FW + 8)} x2={i * (FW + 8) + FW} y1={70} y2={70} stroke="var(--rule)" />
            <g transform={`translate(${i * (FW + 8) + 6 + p * (FW - 12) / 0.8},56)`}>
              <path d="M -7 -8 L -7 4 L 7 4 L 7 -8" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
              <line x1={0} x2={0} y1={4} y2={14} stroke="var(--ink)" strokeWidth="2.5" />
            </g>
            <text x={i * (FW + 8) + FW / 2} y={100} textAnchor="middle" fontSize="11" fill="var(--ink-3)">t = {(i * DT).toFixed(1)} s</text>
          </g>
        ))}
        <text x="0" y="118" fontSize="12" fontWeight="600" fill="var(--ink)">What an inverse dynamics model reads off them: gripper speed between frames</text>
        <line x1={0} x2={860} y1={VY} y2={VY} stroke="var(--rule-strong)" />
        <line x1={0} x2={860} y1={VY - vs(VMAX)} y2={VY - vs(VMAX)} stroke="var(--ink-2)" strokeDasharray="5 4" />
        <text x={858} y={VY - vs(VMAX) - 6} textAnchor="end" fontSize="11" fill="var(--ink-2)">speed limit {VMAX} m/s</text>
        {v.map((x, i) => {
          const h = vs(x), xx = i * (FW + 8) + FW + 4 - 12;
          return (
            <g key={i}>
              <rect x={xx} y={VY - h} width={24} height={h} fill={bad[i] ? "var(--fam-simulator)" : "var(--ink-2)"} />
              {bad[i] && <text x={xx + 12} y={VY - h - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{x.toFixed(1)} m/s</text>}
            </g>
          );
        })}
        <text x="0" y="226" fontSize="12" fill="var(--ink-2)">
          {which === "a" ? "Every frame plausible, and every step within the robot's speed and acceleration: executable." :
            "Every frame plausible, but between t = 0.4 and 0.5 s the gripper would have to move at 3.5 m/s."}
        </text>
        <text x="0" y="246" fontSize="12" fill="var(--ink-2)">
          {which === "a" ? "" : "Decoded into commands, the motor either refuses or lurches. An image metric scores both rollouts alike."}
        </text>
        <text x="0" y="280" fontSize="14" fontWeight="600" fill="var(--ink)">Violations of the robot&rsquo;s limits: {nViol}</text>
        <text x="300" y="280" fontSize="12" fill="var(--ink-3)">speed above {VMAX} m/s, or acceleration above {AMAX} m/s², counted per step</text>
      </svg>
    </div>
  );
}
