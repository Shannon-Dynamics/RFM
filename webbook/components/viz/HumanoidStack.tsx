"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

const MODES = {
  gr00t: { label: "GR00T N1.7 with SONIC", layers: [
    { name: "reasoning backbone", detail: "Cosmos-Reason2-2B inside the VLA", rate: "with the VLA" },
    { name: "VLA", detail: "emits compact latent action tokens", rate: "chunk rate" },
    { name: "whole-body controller", detail: "SONIC turns tokens into joint commands", rate: "controller rate" }],
    lit: ["legs", "arms", "hands"], note: "One policy produces coordinated manipulation and locomotion: the VLA decides what the body should do, the learned controller how." },
  helix: { label: "Helix", layers: [
    { name: "System 2", detail: "7B vision-language model", rate: "7 to 9 Hz" },
    { name: "latent vector", detail: "the slow model's summary of what to do", rate: "updated at 7 to 9 Hz" },
    { name: "System 1", detail: "80M visuomotor policy", rate: "200 Hz" }],
    lit: ["arms", "hands"], note: "The fast-slow split of chapter 5, running entirely on embedded GPUs on the robot (maker's claim)." },
  er2: { label: "Reasoner over controllers", layers: [
    { name: "embodied reasoning model", detail: "Gemini Robotics ER 2, in the cloud", rate: "as the video streams" },
    { name: "tools", detail: "the robot's own VLA and motion APIs", rate: "called per subgoal" },
    { name: "robot controllers", detail: "the maker's locomotion and manipulation", rate: "controller rate" }],
    lit: ["legs", "arms", "hands"], note: "The reasoning model hands motor execution to whatever controllers the humanoid already has, and can coordinate several robots." },
};
type Mode = keyof typeof MODES;

const PARTS: Record<string, string[]> = {
  legs: ["M 690 200 L 676 262 L 672 300", "M 714 200 L 728 262 L 732 300"],
  arms: ["M 684 108 L 656 152 L 642 184", "M 720 108 L 748 152 L 762 184"],
  hands: ["M 642 184 l -8 10 M 642 184 l 2 12 M 642 184 l 8 9", "M 762 184 l 8 10 M 762 184 l -2 12 M 762 184 l -8 9"],
};

/** Figure 16.2: three ways the layers of a humanoid's control stack are arranged. */
export function HumanoidStack() {
  const [mode, setMode] = useState<Mode>("gr00t");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % 3), 700);
    return () => window.clearInterval(id);
  }, []);
  const m = MODES[mode];
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Control stack">
        {(Object.keys(MODES) as Mode[]).map((k) => <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{MODES[k].label}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 320" role="img" aria-label={`${m.label}: ${m.layers.map((l) => `${l.name}, ${l.detail}`).join("; ")}.`}>
        <defs>
          <marker id="hs-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        {m.layers.map((l, i) => {
          const y = 14 + i * 100, on = i === tick;
          return (
            <g key={l.name}>
              <rect x={20} y={y} width={420} height={70} rx="10" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" style={{ transition: "fill 200ms" }} />
              <text x={40} y={y + 30} fontSize="15" fontWeight="700" fill={on ? "var(--surface)" : "var(--ink)"}>{l.name}</text>
              <text x={40} y={y + 52} fontSize="12.5" fill={on ? "var(--surface)" : "var(--ink-2)"}>{l.detail}</text>
              <text x={426} y={y + 30} textAnchor="end" fontSize="12" fill={on ? "var(--surface)" : "var(--ink-3)"}>{l.rate}</text>
              {i < 2 && <path d={`M 230 ${y + 72} L 230 ${y + 98}`} stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#hs-head)" />}
            </g>
          );
        })}
        <path d="M 442 249 C 520 249, 560 160, 630 150" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#hs-head)" />
        <circle cx="702" cy="62" r="20" fill="none" stroke="var(--ink-2)" strokeWidth="3" />
        <path d="M 702 82 L 702 200 M 684 108 L 720 108 M 690 200 L 714 200" stroke="var(--ink-2)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {Object.entries(PARTS).map(([part, ds]) => ds.map((d, j) => (
          <path key={part + j} d={d} fill="none" strokeLinecap="round" strokeWidth={m.lit.includes(part) ? 5 : 3.5}
            stroke={m.lit.includes(part) ? "var(--fam-reactive)" : "var(--rule-strong)"} />
        )))}
        <text x="702" y="316" textAnchor="middle" fontSize="12" fill="var(--ink-2)">highlighted: what the stack drives</text>
      </svg>
      <p className={styles.note}>{m.note}</p>
    </div>
  );
}
