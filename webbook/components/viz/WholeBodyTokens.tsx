"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

const PARTS = [
  { id: "legs", label: "legs", d: ["M 742 168 L 728 218 L 724 262", "M 758 168 L 772 218 L 778 262"] },
  { id: "arms", label: "arms", d: ["M 734 96 L 706 136 L 690 164", "M 766 96 L 794 136 L 812 162"] },
  { id: "hands", label: "hands", d: ["M 690 164 L 682 174 M 690 164 L 692 176 M 690 164 L 698 172", "M 812 162 L 820 172 M 812 162 L 810 174 M 812 162 L 804 170"] },
];

/** Figure 7.4: a VLA speaks in compact latent tokens; a learned whole-body controller turns them into joints. */
export function WholeBodyTokens() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 220);
    return () => window.clearInterval(id);
  }, []);
  const filled = tick % 12;
  const lit = PARTS[Math.floor(tick / 4) % PARTS.length].id;

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 292" role="img"
        aria-label="A vision-language-action model emits a short sequence of latent action tokens; a learned whole-body controller decodes them into joint commands for legs, arms and hands.">
        <defs>
          <marker id="wb-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
          </marker>
        </defs>
        <text x="0" y="52" fontSize="13" fill="var(--ink-2)">images, instruction</text>
        <path d="M 6 62 L 66 100" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#wb-head)" />
        <rect x="70" y="70" width="170" height="96" rx="10" fill="var(--ink)" />
        <text x="155" y="110" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--surface)">VLA</text>
        <text x="155" y="130" textAnchor="middle" fontSize="12" fill="var(--surface)" opacity="0.8">GR00T N1.7</text>
        <path d="M 242 118 L 272 118" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#wb-head)" />
        <text x="276" y="92" fontSize="12" fill="var(--ink-2)">compact latent action tokens</text>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={276 + i * 22} y={104} width="17" height="28" rx="3"
            fill={i < Math.min(8, filled) ? "var(--fam-latent)" : "none"} stroke="var(--fam-latent)" />
        ))}
        <path d="M 454 118 L 486 118" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#wb-head)" />
        <rect x="490" y="62" width="160" height="112" rx="10" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="570" y="96" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">whole-body</text>
        <text x="570" y="114" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">controller</text>
        <text x="570" y="136" textAnchor="middle" fontSize="12" fill="var(--ink-2)">SONIC: learned</text>
        <text x="570" y="152" textAnchor="middle" fontSize="12" fill="var(--ink-2)">motion tracking</text>
        <path d="M 652 118 L 680 118" stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#wb-head)" />

        <circle cx="750" cy="70" r="16" fill="none" stroke="var(--ink-2)" strokeWidth="3" />
        <path d="M 750 86 L 750 168 M 734 96 L 766 96 M 742 168 L 758 168" stroke="var(--ink-2)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {PARTS.map((p) => p.d.map((d, j) => (
          <path key={p.id + j} d={d} fill="none" strokeLinecap="round" strokeWidth={p.id === lit ? 5 : 4}
            stroke={p.id === lit ? "var(--fam-latent)" : "var(--ink-2)"} style={{ transition: "stroke 200ms" }} />
        )))}
        <text x="750" y="284" textAnchor="middle" fontSize="12" fill="var(--ink-2)">joint commands: {lit}</text>
        <text x="70" y="206" fontSize="12" fill="var(--ink-2)">The VLA does not need to know how to balance or place a foot. It says what the body should do in</text>
        <text x="70" y="224" fontSize="12" fill="var(--ink-2)">a few tokens; the controller, trained on motion capture, knows how a body does it.</text>
      </svg>
    </div>
  );
}
