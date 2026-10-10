"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { collect, EDGE, fitWorldModel, modelDistance, modelReward, optimize, TARGET, trueDistance, trueReward } from "@/lib/sim/simulators";
import styles from "./viz.module.css";

const START = 0.3, STEP = 0.025, ITERS = 60;
const W = 860, L = 56, R = 836, T = 16, B = 236;
const sx = (th: number) => L + th * (R - L);
const sy = (r: number) => T + ((1.1 - r) / 2.2) * (B - T);
const tx = (d: number) => 40 + (d / 1.05) * 620; // table coordinates

/** Figure 8.3: a policy trained inside a learned world model, and what happens when it leaves the data. */
export function ImaginationRL() {
  const [hi, setHi] = useState(0.4);
  const [trust, setTrust] = useState(false);
  const [k, setK] = useState(ITERS);
  const raf = useRef(0);

  const samples = useMemo(() => collect(0.1, hi, Math.max(4, Math.round((hi - 0.1) / 0.1) + 1)), [hi]);
  const model = useMemo(() => fitWorldModel(samples), [samples]);
  const path = useMemo(() => optimize(model, START, STEP, ITERS, trust ? hi + 0.1 : null), [model, trust, hi]);
  const th = path[Math.min(k, ITERS)];
  const imagined = modelReward(model, th), real = trueReward(th);

  const run = () => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setK(ITERS); return; }
    const t0 = performance.now();
    const tick = (now: number) => {
      const kk = Math.min(ITERS, Math.floor((now - t0) / 70));
      setK(kk);
      if (kk < ITERS) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => { setK(ITERS); }, [hi, trust]);

  const curve = (f: (t: number) => number) =>
    Array.from({ length: 201 }, (_, i) => i / 200).map((t, i) => `${i ? "L" : "M"}${sx(t).toFixed(1)},${sy(f(t)).toFixed(1)}`).join(" ");
  const dReal = trueDistance(th), dModel = Math.min(1.05, modelDistance(model, th));
  const falls = dReal > EDGE;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={run}>Train in imagination</button>
        <label className={styles.legendItem} style={{ fontSize: "0.95rem" }}>
          <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} /> Stay near the data
        </label>
      </div>

      <svg className={styles.svg} viewBox={`0 0 ${W} 96`} role="img"
        aria-label={`Push strength ${th.toFixed(2)}: the model predicts the block stops at ${dModel.toFixed(2)}; really it ${falls ? "falls off the table" : `stops at ${dReal.toFixed(2)}`}.`}>
        <rect x={tx(0) - 20} y={56} width={tx(EDGE) - tx(0) + 20} height={10} fill="var(--ink-2)" />
        <line x1={tx(TARGET)} x2={tx(TARGET)} y1={20} y2={56} stroke="var(--ink)" strokeDasharray="3 3" />
        <text x={tx(TARGET)} y={14} textAnchor="middle" fontSize="12" fill="var(--ink)">target</text>
        <text x={tx(EDGE) - 4} y={84} textAnchor="end" fontSize="12" fill="var(--ink-2)">edge</text>
        <rect x={tx(Math.min(dModel, 1.05)) - 12} y={34} width={24} height={22} rx="2" fill="none" stroke="var(--fam-simulator)" strokeWidth="2.5" strokeDasharray="4 3" />
        <g transform={falls ? `translate(${tx(EDGE) + 30},${70}) rotate(35)` : `translate(${tx(dReal)},45)`}>
          <rect x={-12} y={-11} width={24} height={22} rx="2" fill="var(--ink)" />
        </g>
        <text x={W - 4} y={30} textAnchor="end" fontSize="12" fill="var(--fam-simulator)" fontWeight="600">dashed: where the model says it stops</text>
        <text x={W - 4} y={48} textAnchor="end" fontSize="12" fill="var(--ink)" fontWeight="600">solid: where it really {falls ? "goes: off the edge" : "stops"}</text>
      </svg>

      <svg className={styles.svg} viewBox={`0 0 ${W} 280`} role="img"
        aria-label={`Reward against push strength. Real reward in ink, the world model's reward dashed. Training in imagination ends at ${th.toFixed(2)}, imagined reward ${imagined.toFixed(2)}, real ${real.toFixed(2)}.`}>
        <rect x={sx(0.1)} y={T} width={sx(hi) - sx(0.1)} height={B - T} fill="var(--surface-2)" />
        <text x={sx(0.1) + 6} y={T + 14} fontSize="12" fill="var(--ink-2)">logged data</text>
        {trust && <line x1={sx(hi + 0.1)} x2={sx(hi + 0.1)} y1={T} y2={B} stroke="var(--ink-2)" strokeDasharray="2 3" />}
        {[-1, 0, 1].map((r) => (
          <g key={r}>
            <line x1={L} x2={R} y1={sy(r)} y2={sy(r)} stroke="var(--rule)" />
            <text x={L - 8} y={sy(r) + 4} textAnchor="end" fontSize="12" fill="var(--ink-3)">{r}</text>
          </g>
        ))}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
          <text key={t} x={sx(t)} y={B + 18} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{t}</text>
        ))}
        <text x={(L + R) / 2} y={B + 38} textAnchor="middle" fontSize="12" fill="var(--ink-2)">push strength</text>
        <text x={12} y={(T + B) / 2} fontSize="12" fill="var(--ink-2)" transform={`rotate(-90 12 ${(T + B) / 2})`} textAnchor="middle">reward</text>
        <path d={curve(trueReward)} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
        <path d={curve((t) => modelReward(model, t))} fill="none" stroke="var(--fam-simulator)" strokeWidth="2.5" strokeDasharray="7 4" />
        {samples.map(([t, d]) => (
          <circle key={t} cx={sx(t)} cy={B - 6} r="4" fill={d > EDGE ? "var(--surface)" : "var(--ink-2)"} stroke="var(--ink-2)" strokeWidth="1.5" />
        ))}
        {path.slice(0, k + 1).map((p, i) => <circle key={i} cx={sx(p)} cy={sy(modelReward(model, p))} r="2.5" fill="var(--fam-simulator)" opacity={0.5} />)}
        <line x1={sx(th)} x2={sx(th)} y1={T} y2={B} stroke="var(--ink-2)" />
        <circle cx={sx(th)} cy={sy(imagined)} r="6" fill="var(--fam-simulator)" stroke="var(--surface)" strokeWidth="1.5" />
        <circle cx={sx(th)} cy={sy(real)} r="6" fill="var(--ink)" stroke="var(--surface)" strokeWidth="1.5" />
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink)" }}><span className={styles.swatchLine} />real reward</span>
        <span className={styles.legendItem} style={{ color: "var(--fam-simulator)" }}><span className={styles.swatchDash} />reward inside the world model</span>
        <span className={styles.legendItem}><span className={styles.swatchDot} style={{ color: "var(--ink-2)" }} />logged push (hollow: the block fell)</span>
      </div>

      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Strongest logged push</span><span className={styles.sliderValue}>{hi.toFixed(1)}</span></span>
            <input type="range" min={0.4} max={1} step={0.1} value={hi} onChange={(e) => setHi(Number(e.target.value))} />
            <span className={styles.sliderNote}>The world model is a straight line fitted to the logged pushes; it knows about the edge only if a logged push fell off.</span>
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Reward the policy believes</dt><dd>{imagined.toFixed(2)}</dd></div>
          <div><dt>Reward it really gets</dt><dd>{real.toFixed(2)}<small>{falls ? "the block falls off the table" : `push strength ${th.toFixed(2)}`}</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
