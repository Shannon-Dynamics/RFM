"use client";
import { useMemo, useState } from "react";
import { jerk, NUDGE_AT, runEnsemble, runLatest, runOpenLoop, trackingError, world, type Policy } from "@/lib/sim/behavior";
import styles from "./viz.module.css";

const P: Policy = { horizon: 20, offset: 0.05, drift: 0.004, seed: 9 };
const N = 300;
type Mode = "open" | "latest" | "ensemble";

const W = 860, L = 40, R = 846, T = 14, B = 196;
const sx = (t: number) => L + (t / (N - 1)) * (R - L);
const sy = (v: number) => T + ((1.35 - v) / 2.5) * (B - T);

/** Figure 11.3: ACT's temporal ensembling against the two simpler ways to execute chunks. */
export function TemporalEnsemble() {
  const [mode, setMode] = useState<Mode>("ensemble");
  const [m, setM] = useState(0.1);
  const [at, setAt] = useState(160);

  const ens = useMemo(() => runEnsemble(P, N, m), [m]);
  const acts = useMemo(() => (mode === "open" ? runOpenLoop(P, N) : mode === "latest" ? runLatest(P, N) : ens.out), [mode, ens]);
  const err = trackingError(acts), jk = jerk(acts), after = trackingError(acts, NUDGE_AT, NUDGE_AT + 20);
  const line = (f: (t: number) => number) => Array.from({ length: N }, (_, t) => `${t ? "L" : "M"}${sx(t).toFixed(1)},${sy(f(t)).toFixed(1)}`).join(" ");
  const buf = ens.buffers[at];
  const ws = buf.map((_, i) => Math.exp(-m * i)), wsum = ws.reduce((a, b) => a + b, 0);
  const lo = Math.min(world(at), ...buf) - 0.04, hi = Math.max(world(at), ...buf) + 0.04;
  const ix = (i: number) => 470 + (i / 19) * 320, iy = (v: number) => 34 + ((hi - v) / (hi - lo)) * 120;

  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Execution">
        <button aria-pressed={mode === "open"} onClick={() => setMode("open")}>Whole chunks, open loop</button>
        <button aria-pressed={mode === "latest"} onClick={() => setMode("latest")}>Newest action only</button>
        <button aria-pressed={mode === "ensemble"} onClick={() => setMode("ensemble")}>Temporal ensemble</button>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${W} 222`} role="img"
        aria-label={`Executed motion over ${N} steps: mean error ${err.toFixed(3)}, jerk ${jk.toFixed(4)}, error in the 20 steps after the nudge ${after.toFixed(3)}.`}>
        <line x1={sx(NUDGE_AT)} x2={sx(NUDGE_AT)} y1={T} y2={B} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={sx(NUDGE_AT) + 6} y={T + 10} fontSize="12" fill="var(--ink-2)">object nudged</text>
        <path d={line(world)} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="6 4" />
        <path d={acts.map((v, t) => `${t ? "L" : "M"}${sx(t).toFixed(1)},${sy(v).toFixed(1)}`).join(" ")} fill="none" stroke="var(--fam-lbm)" strokeWidth="2" />
        {mode === "ensemble" && <line x1={sx(at)} x2={sx(at)} y1={T} y2={B} stroke="var(--ink)" />}
        {[0, 100, 200, 299].map((t) => <text key={t} x={sx(t)} y={B + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{t === 299 ? 300 : t}</text>)}
        <text x={(L + R) / 2} y={B + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)">step</text>
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchDash} />where the robot should be</span>
        <span className={styles.legendItem} style={{ color: "var(--fam-lbm)" }}><span className={styles.swatchLine} />what it executes</span>
      </div>
      {mode === "ensemble" && (
        <svg className={styles.svg} viewBox="0 0 860 176" role="img"
          aria-label={`At step ${at}, ${buf.length} overlapping predictions are averaged; the oldest gets the largest weight.`}>
          <text x="0" y="20" fontSize="13" fontWeight="600" fill="var(--ink)">Inside the ensemble at step {at}</text>
          <foreignObject x="0" y="30" width="440" height="140">
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.45, color: "var(--ink-2)" }}>
              Every chunk predicted in the last {buf.length} steps contains an action for step {at}. Each dot is one of those predictions,
              oldest on the left; its size is its weight exp(&minus;m&middot;i). The executed action is their weighted average.
              {at >= NUDGE_AT && at < NUDGE_AT + 20 && " Predictions made before the nudge still point at the old position."}
            </div>
          </foreignObject>
          <line x1={460} x2={798} y1={iy(world(at))} y2={iy(world(at))} stroke="var(--ink-3)" strokeDasharray="6 4" />
          <line x1={460} x2={798} y1={iy(ens.out[at])} y2={iy(ens.out[at])} stroke="var(--fam-lbm)" strokeWidth="2" />
          {buf.map((v, i) => (
            <circle key={i} cx={ix(i)} cy={iy(v)} r={3 + 9 * Math.sqrt(ws[i] / wsum * buf.length) / 2}
              fill="var(--ink-2)" opacity="0.75" />
          ))}
          <text x={470} y={20} fontSize="11" fill="var(--ink-3)">oldest prediction</text>
          <text x={830} y={20} textAnchor="end" fontSize="11" fill="var(--ink-3)">newest</text>
          <text x={804} y={iy(world(at)) + 4} fontSize="11" fill="var(--ink-2)">goal</text>
          <text x={804} y={iy(ens.out[at]) + 4} fontSize="11" fill="var(--fam-lbm)">executed</text>
        </svg>
      )}
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider} data-disabled={mode !== "ensemble"}>
            <span className={styles.sliderHead}><span>Weight decay m</span><span className={styles.sliderValue}>{m.toFixed(2)}</span></span>
            <input type="range" min={0} max={1} step={0.05} value={m} disabled={mode !== "ensemble"} onChange={(e) => setM(Number(e.target.value))} />
            <span className={styles.sliderNote}>0 averages all predictions equally; larger m trusts the oldest ones more.</span>
          </label>
          <label className={styles.slider} data-disabled={mode !== "ensemble"}>
            <span className={styles.sliderHead}><span>Inspect step</span><span className={styles.sliderValue}>{at}</span></span>
            <input type="range" min={20} max={N - 1} step={1} value={at} disabled={mode !== "ensemble"} onChange={(e) => setAt(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Mean tracking error</dt><dd>{err.toFixed(3)}</dd></div>
          <div><dt>Jerk</dt><dd>{(jk * 1000).toFixed(1)}<small>mean second difference, ×1000</small></dd></div>
          <div><dt>Error, 20 steps after the nudge</dt><dd>{after.toFixed(3)}<small>how fast it reacts</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
