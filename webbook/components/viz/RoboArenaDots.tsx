"use client";
import { ROBOARENA } from "@/content/ch06/data";
import styles from "./viz.module.css";

const MIN = 1400, MAX = 1800, W = 700, LEFT = 110, RIGHT = 20, ROW = 44;
const xs = (v: number) => LEFT + ((v - MIN) / (MAX - MIN)) * (W - LEFT - RIGHT);

/** Dot plot: Elo has no meaningful zero, so bars from zero would mislead. */
export function RoboArenaDots() {
  const h = ROBOARENA.length * ROW + 52;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${h}`} role="img"
        aria-label={ROBOARENA.map((r) => `${r.policy}: ${r.april} in April 2026, ${r.september} on 26 September 2026`).join("; ")}>
        {[1400, 1500, 1600, 1700, 1800].map((v) => (
          <g key={v}>
            <line x1={xs(v)} x2={xs(v)} y1={8} y2={h - 30} stroke="var(--rule)" />
            <text x={xs(v)} y={h - 12} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        {ROBOARENA.map((r, i) => {
          const y = 30 + i * ROW;
          const c = `var(--fam-${r.family})`;
          return (
            <g key={r.policy} tabIndex={0} aria-label={`${r.policy}: ${r.april} April, ${r.september} September`}>
              <title>{`${r.policy}: ${r.april} (April 2026 snapshot), ${r.september} (official board, 26 Sept 2026, ${r.evals} A/B evaluations)`}</title>
              <text x={LEFT - 12} y={y + 5} textAnchor="end" fontSize="14" fontWeight="600" fill="var(--ink)">{r.policy}</text>
              <line x1={xs(r.september)} x2={xs(r.april)} y1={y} y2={y} stroke="var(--rule-strong)" strokeWidth="2" />
              <circle cx={xs(r.september)} cy={y} r="7" fill="var(--surface)" stroke={c} strokeWidth="2.5" />
              <circle cx={xs(r.april)} cy={y} r="7" fill={c} stroke="var(--surface)" strokeWidth="2" />
              <text x={xs(r.april) + 13} y={y + 5} fontSize="12.5" fill="var(--ink-2)">{r.april}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.swatchDot} style={{ color: "var(--ink-2)" }} />April 2026 snapshot, as reported by NVIDIA</span>
        <span className={styles.legendItem}><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2.5px solid var(--ink-2)" }} />Official board, 26 September 2026</span>
        <span className={styles.legendItem} style={{ color: "var(--fam-wam)" }}><span className={styles.swatchDot} /><span style={{ color: "var(--ink-2)" }}>World-action model</span></span>
        <span className={styles.legendItem} style={{ color: "var(--fam-reactive)" }}><span className={styles.swatchDot} /><span style={{ color: "var(--ink-2)" }}>Reactive VLA</span></span>
      </div>
    </div>
  );
}
