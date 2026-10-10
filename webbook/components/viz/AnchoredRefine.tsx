"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE, BEST, refine, reward } from "@/lib/sim/posttrain";
import styles from "./viz.module.css";

const ROUNDS = 30, K = 16;
const W = 860, L = 50, R = 840, T = 20, B = 170;
const sx = (a: number) => L + ((a + 0.6) / 1.8) * (R - L);
const sy = (v: number) => B - v * (B - T);

/** Figure 14.3: improving from reward, with and without an anchor to the pretrained policy. */
export function AnchoredRefine() {
  const [anchor, setAnchor] = useState(0.1);
  const [sigma, setSigma] = useState(0.15);
  const [k, setK] = useState(ROUNDS);
  const raf = useRef(0);
  const run = useMemo(() => refine(ROUNDS, K, sigma, 0.3, anchor), [anchor, sigma]);
  const mu = run.aims[k];

  const play = () => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setK(ROUNDS); return; }
    const t0 = performance.now();
    const tick = (now: number) => {
      const kk = Math.min(ROUNDS, Math.floor((now - t0) / 220));
      setK(kk);
      if (kk < ROUNDS) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => setK(ROUNDS), [anchor, sigma]);

  const curve = Array.from({ length: 181 }, (_, i) => -0.6 + i * 0.01).map((a, i) => `${i ? "L" : "M"}${sx(a).toFixed(1)},${sy(reward(a)).toFixed(1)}`).join(" ");
  const tries = k > 0 ? run.tries[k - 1] : [];
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={play}>Practise {ROUNDS} rounds</button>
        <span className={styles.note}>Round {k} of {ROUNDS}</span>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${W} 220`} role="img"
        aria-label={`After ${k} rounds the policy aims at ${mu.toFixed(2)}, earning reward ${reward(mu).toFixed(2)}; the best setting is ${BEST}.`}>
        <path d={curve} fill="none" stroke="var(--ink-3)" strokeWidth="2" />
        <text x={sx(BEST)} y={T - 6} textAnchor="middle" fontSize="12" fill="var(--ink-2)">best setting</text>
        <line x1={sx(BASE)} x2={sx(BASE)} y1={T} y2={B} stroke="var(--ink-2)" strokeDasharray="4 3" />
        <text x={sx(BASE) - 6} y={T + 12} textAnchor="end" fontSize="12" fill="var(--ink-2)">pretrained aim</text>
        {tries.map((a, i) => <circle key={i} cx={sx(a)} cy={sy(reward(a))} r="3.5" fill="var(--ink-2)" opacity="0.6" />)}
        {run.aims.slice(0, k + 1).map((a, i) => <circle key={`p${i}`} cx={sx(a)} cy={B + 20} r="2.5" fill="var(--fam-reactive)" opacity={0.25 + (0.75 * i) / ROUNDS} />)}
        <line x1={sx(mu)} x2={sx(mu)} y1={T} y2={B + 24} stroke="var(--fam-reactive)" strokeWidth="2" />
        <circle cx={sx(mu)} cy={sy(reward(mu))} r="6" fill="var(--fam-reactive)" />
        <line x1={L} x2={R} y1={B} y2={B} stroke="var(--rule-strong)" />
        <text x={L} y={B + 42} fontSize="11.5" fill="var(--ink-3)">aim after each round</text>
        <text x={R} y={B + 42} textAnchor="end" fontSize="11.5" fill="var(--ink-3)">setting, for example how far to push a connector</text>
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>reward for each setting</span></span>
        <span className={styles.legendItem}><span className={styles.swatchDot} style={{ color: "var(--ink-2)" }} />this round&rsquo;s attempts</span>
        <span className={styles.legendItem} style={{ color: "var(--fam-reactive)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>where the policy aims</span></span>
      </div>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Anchor to the pretrained policy</span><span className={styles.sliderValue}>{anchor.toFixed(2)}</span></span>
            <input type="range" min={0} max={0.5} step={0.05} value={anchor} onChange={(e) => setAnchor(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Exploration spread</span><span className={styles.sliderValue}>{sigma.toFixed(2)}</span></span>
            <input type="range" min={0.02} max={0.3} step={0.01} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Reward at the current aim</dt><dd>{reward(mu).toFixed(2)}<small>pretrained policy: {reward(BASE).toFixed(2)}</small></dd></div>
          <div><dt>Distance moved from the pretrained aim</dt><dd>{Math.abs(mu - BASE).toFixed(2)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
