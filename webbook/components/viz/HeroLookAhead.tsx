"use client";
import { useEffect, useRef, useState } from "react";
import { arc, choose, collides, CURVATURES, dist, GOAL, OBSTACLES, ROBOT_R, type P } from "@/lib/sim/nav";
import styles from "./HeroLookAhead.module.css";

const CYCLE = [1, 1.25, 1, 0.6];
const W = 520, H = 330, S = 44, OX = 120, OY = 250;
const sx = (x: number) => OX + x * S, sy = (y: number) => OY - y * S;
const path = (p: P[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");

/** The overview's live figure: chapter 16's look-ahead planner, cycling through accurate and
 *  wrong world models while a robot drives the chosen path. */
export function HeroLookAhead() {
  const [k, setK] = useState(0);
  const [t, setT] = useState(1);
  const [paused, setPaused] = useState(false);
  const raf = useRef(0);
  const bias = CYCLE[k % CYCLE.length];
  const i = choose(bias);
  const real = i === null ? [] : arc(CURVATURES[i]);
  const imagined = i === null ? [] : arc(CURVATURES[i] * bias);
  const hitAt = real.findIndex((p) => OBSTACLES.some((o) => dist(p, o.c) < o.r + ROBOT_R));
  const crash = collides(real);
  const upto = Math.floor(t * (real.length - 1));
  const shown = real.slice(0, crash ? Math.min(upto, hitAt) + 1 : upto + 1);
  const robot = shown[shown.length - 1] ?? [0, 0];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(1); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const e = (now - start) / 2600;
      setT(Math.min(1, e));
      if (e < 1.55) raf.current = requestAnimationFrame(tick);
      else setK((x) => x + 1);
    };
    setT(0);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [k, paused]);

  return (
    <figure className={styles.card}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
        aria-label={`World model turning error ${bias.toFixed(2)} times: the robot ${crash ? "drives into a pillar" : "reaches the goal"}.`}>
        <defs>
          <pattern id="hla-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="var(--rule)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="url(#hla-grid)" />
        {CURVATURES.map((c) => <path key={c} d={path(arc(c * bias))} fill="none" stroke="var(--rule-strong)" strokeWidth="1" />)}
        {OBSTACLES.map((o, j) => (
          <g key={j}>
            <circle cx={sx(o.c[0])} cy={sy(o.c[1])} r={(o.r + ROBOT_R) * S} fill="none" stroke="var(--rule-strong)" strokeDasharray="3 3" />
            <circle cx={sx(o.c[0])} cy={sy(o.c[1])} r={o.r * S} fill="var(--ink-3)" />
          </g>
        ))}
        <path d={path(imagined)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="7 5" opacity="0.85" />
        <path d={path(shown)} fill="none" stroke="var(--ink)" strokeWidth="2.6" />
        <rect x={sx(GOAL[0]) - 7} y={sy(GOAL[1]) - 7} width="14" height="14" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.2" />
        <circle cx={sx(robot[0])} cy={sy(robot[1])} r="8" fill={crash && t >= 1 ? "var(--surface)" : "var(--ink)"} stroke={crash && t >= 1 ? "var(--ink)" : "var(--surface)"} strokeWidth={crash && t >= 1 ? 3 : 2} />
        <circle cx={sx(0)} cy={sy(0)} r="3" fill="var(--ink-3)" />
      </svg>
      <div className={styles.bar}>
        <span><span className={styles.eyebrow}>turning error</span> {bias.toFixed(2)}×</span>
        <span>{t < 1 ? "driving" : crash ? "collision" : "goal reached"}</span>
        <button onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</button>
      </div>
    </figure>
  );
}
