"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cup, DURATION_S, reactionTime, simulate, SWITCH_S, trackingError, type Loop } from "@/lib/sim/reactive";
import styles from "./viz.module.css";

const PRESETS = [
  { label: "Helix: 8 Hz over 200 Hz", slow: 8, fast: 200 },
  { label: "GR00T N1: 10 Hz over 120 Hz", slow: 10, fast: 120 },
  { label: "DuoCore-FS: 2 Hz over 30 Hz", slow: 2, fast: 30 },
];
const TOL = 0.1;

const W = 860, X0 = 54, X1 = 844, Y0 = 20, Y1 = 170;
const sx = (t: number) => X0 + (t / DURATION_S) * (X1 - X0);
const sy = (p: number) => Y1 - ((p + 0.45) / 1.9) * (Y1 - Y0);
const px = (p: number) => 70 + ((p + 0.4) / 1.8) * 720;

/** Figure 5.2: a slow model alone, or a slow reasoner over a fast controller, following a moving cup. */
export function DualRate() {
  const [dual, setDual] = useState(true);
  const [slow, setSlow] = useState(8);
  const [fast, setFast] = useState(200);
  const [now, setNow] = useState(DURATION_S);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  const loop: Loop = dual ? { kind: "dual", slowHz: slow, fastHz: fast } : { kind: "single", hz: slow };
  const tr = useMemo(() => simulate(loop), [dual, slow, fast]); // eslint-disable-line react-hooks/exhaustive-deps
  const err = trackingError(tr, 0.3, SWITCH_S);
  const react = reactionTime(tr, TOL);

  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setNow(DURATION_S); return; }
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    setPlaying(true);
    const step = (ts: number) => {
      const t = ((ts - start) / 1000) * 0.5; // half speed
      if (t >= DURATION_S) { setNow(DURATION_S); setPlaying(false); return; }
      setNow(t);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const idx = Math.min(tr.t.length - 1, Math.round(now * 1000));
  const thin = (vals: number[]) => vals.filter((_, i) => i % 5 === 0).map((v, j) => `${j ? "L" : "M"}${sx(j * 0.005).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const cupPath = (w: number) => Array.from({ length: 301 }, (_, j) => `${j ? "L" : "M"}${sx(j * 0.01).toFixed(1)},${sy(cup(w, j * 0.01)).toFixed(1)}`).join(" ");
  const named = now >= SWITCH_S ? 1 : 0;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Architecture">
          <button aria-pressed={!dual} onClick={() => setDual(false)}>One model</button>
          <button aria-pressed={dual} onClick={() => setDual(true)}>Fast-slow split</button>
        </div>
        <button className={styles.button} data-primary="true" onClick={play} disabled={playing}>{playing ? "Playing" : "Play at half speed"}</button>
      </div>
      <div className={styles.row} role="group" aria-label="Published rates">
        {PRESETS.map((p) => (
          <button key={p.label} className={styles.chip} aria-pressed={dual && slow === p.slow && fast === p.fast}
            onClick={() => { setDual(true); setSlow(p.slow); setFast(p.fast); }}>{p.label}</button>
        ))}
      </div>

      <svg className={styles.svg} viewBox={`0 0 ${W} 74`} role="img"
        aria-label={`Table at ${now.toFixed(2)} seconds: the instruction names cup ${named ? "B" : "A"}; the hand is at ${tr.hand[idx].toFixed(2)}.`}>
        <line x1={50} x2={810} y1={46} y2={46} stroke="var(--rule-strong)" />
        {[0, 1].map((w) => (
          <g key={w} transform={`translate(${px(cup(w, now))},46)`}>
            <rect x={-13} y={-24} width={26} height={24} rx="4" fill={named === w ? "var(--ink-2)" : "var(--surface-2)"} stroke="var(--ink-2)" />
            <text y={-30} textAnchor="middle" fontSize="12" fill="var(--ink-2)">cup {w ? "B" : "A"}</text>
          </g>
        ))}
        <g transform={`translate(${px(tr.hand[idx])},58)`}>
          <path d="M -12 -2 L -12 10 L 12 10 L 12 -2" fill="none" stroke="var(--fam-reactive)" strokeWidth="3" />
          <line x1={0} x2={0} y1={10} y2={16} stroke="var(--fam-reactive)" strokeWidth="3" />
        </g>
        <text x={W - 8} y={16} textAnchor="end" fontSize="13" fill="var(--ink)">
          t = {now.toFixed(2)} s: &ldquo;pick up cup {named ? "B" : "A"}&rdquo;
        </text>
      </svg>

      <svg className={styles.svg} viewBox={`0 0 ${W} 232`} role="img"
        aria-label={`Hand and named cup over three seconds. Tracking error before the switch ${err.toFixed(3)}; reaction to the new instruction ${react === null ? "never settles" : `${react.toFixed(2)} seconds`}.`}>
        <rect x={sx(SWITCH_S)} y={Y0} width={sx(DURATION_S) - sx(SWITCH_S)} height={Y1 - Y0} fill="var(--surface-2)" />
        <text x={sx(SWITCH_S) + 6} y={Y0 - 5} fontSize="12" fill="var(--ink-2)">instruction changes to cup B</text>
        <path d={cupPath(0)} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={cupPath(1)} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="2 4" />
        <text x={X0 + 4} y={sy(cup(0, 0)) + 20} fontSize="12" fill="var(--ink-3)">cup A</text>
        <text x={X0 + 4} y={sy(cup(1, 0)) + 20} fontSize="12" fill="var(--ink-3)">cup B</text>
        <path d={thin(tr.hand)} fill="none" stroke="var(--fam-reactive)" strokeWidth="2.2" />
        {[0, 1, 2, 3].map((s) => (
          <g key={s}>
            <line x1={sx(s)} x2={sx(s)} y1={Y1} y2={Y1 + 4} stroke="var(--rule-strong)" />
            <text x={sx(s)} y={Y1 + 16} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{s} s</text>
          </g>
        ))}
        <text x={8} y={200} fontSize="11" fill="var(--ink-2)">{dual ? "slow" : "model"}</text>
        {tr.slowTicks.map((t) => <rect key={t} x={sx(t) - 1} y={192} width="2.5" height="10" fill="var(--ink)" />)}
        {dual && <text x={8} y={220} fontSize="11" fill="var(--ink-2)">fast</text>}
        {tr.fastTicks.map((t) => <line key={t} x1={sx(t)} x2={sx(t)} y1={212} y2={222} stroke="var(--fam-reactive)" strokeWidth="1" />)}
        <line x1={sx(now)} x2={sx(now)} y1={Y0} y2={224} stroke="var(--ink-2)" strokeWidth="1" opacity={now < DURATION_S ? 1 : 0} />
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--fam-reactive)" }}><span className={styles.swatchLine} />hand</span>
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchDash} />cups</span>
        <span>Ticks along the bottom: each model update.</span>
      </div>

      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>{dual ? "Slow reasoner" : "Model rate"}</span><span className={styles.sliderValue}>{slow} Hz</span></span>
            <input type="range" min={1} max={12} value={slow} onChange={(e) => setSlow(Number(e.target.value))} />
          </label>
          <label className={styles.slider} data-disabled={!dual}>
            <span className={styles.sliderHead}><span>Fast controller</span><span className={styles.sliderValue}>{dual ? `${fast} Hz` : "none"}</span></span>
            <input type="range" min={10} max={200} step={10} value={fast} disabled={!dual} onChange={(e) => setFast(Number(e.target.value))} />
            <span className={styles.sliderNote}>Each model&rsquo;s output arrives one period after it looks.</span>
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Tracking error, before the switch</dt><dd>{err.toFixed(3)}<small>mean distance to the named cup; set by the fast loop</small></dd></div>
          <div><dt>Reaction to the new instruction</dt><dd>{react === null ? "never settles" : `${react.toFixed(2)} s`}<small>until the hand stays within {TOL} of cup B; set by the slow loop</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
