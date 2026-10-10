"use client";
import { useState } from "react";
import { inTheCloud, latencyMs, onDevice, worstReactionMs } from "@/lib/sim/deploy";
import styles from "./viz.module.css";

const SHADES = ["var(--ink-3)", "var(--rule-strong)", "var(--fam-reactive)", "var(--ink-2)", "var(--ink)", "var(--ink-3)"];
const W = 860, L = 150, R = 840, MAX = 2600;
const sx = (ms: number) => L + (Math.min(ms, MAX) / MAX) * (R - L);

/** Figure 15.1: where the milliseconds go, and how long the robot is blind to a change. */
export function LatencyBudget() {
  const [cloud, setCloud] = useState(false);
  const [rtt, setRtt] = useState(60);
  const [chunk, setChunk] = useState(1000);
  const [asyn, setAsyn] = useState(false);
  const stages = cloud ? inTheCloud(rtt) : onDevice();
  const lat = latencyMs(stages);
  const react = worstReactionMs(stages, chunk, asyn);
  const walk = 1.5; // m/s, an illustrative brisk walking pace
  let x = 0;
  const ZW = R - L, zx = (ms: number) => L + (ms / 300) * ZW;
  let zx0 = 0;
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Where the model runs">
          <button aria-pressed={!cloud} onClick={() => setCloud(false)}>On the robot</button>
          <button aria-pressed={cloud} onClick={() => setCloud(true)}>In the cloud</button>
        </div>
        <div className={styles.segmented} role="group" aria-label="Execution">
          <button aria-pressed={!asyn} onClick={() => setAsyn(false)}>Stop to think</button>
          <button aria-pressed={asyn} onClick={() => setAsyn(true)}>Think while moving</button>
        </div>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${W} 210`} role="img"
        aria-label={`Pipeline latency ${lat} milliseconds; worst-case reaction to a change ${react} milliseconds.`}>
        <text x="0" y="18" fontSize="13" fontWeight="600" fill="var(--ink)">One pass, camera to motor</text>
        {stages.map((s, i) => {
          const x0 = zx0, w = (s.ms / 300) * ZW;
          zx0 += w;
          return (
            <g key={s.name}>
              <rect x={L + x0} y={28} width={Math.max(0, w - 1)} height={30} fill={SHADES[i % SHADES.length]} />
              {w > 46 && <text x={L + x0 + 4} y={70 + (i % 2) * 13} fontSize="10.5" fill="var(--ink-2)">{s.name}</text>}
            </g>
          );
        })}
        <text x={L - 8} y={48} textAnchor="end" fontSize="12" fill="var(--ink)">{lat} ms</text>
        {[100, 200, 300].map((ms) => <text key={ms} x={zx(ms)} y={22} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">{ms} ms</text>)}
        <text x="0" y="118" fontSize="13" fontWeight="600" fill="var(--ink)">Worst case, from a change to a reaction</text>
        {(asyn ? [["waiting for the next look", lat], ["thinking about it", lat]] : [["finishing the current chunk", chunk], ["thinking about it", lat]]).map(([label, ms], i) => {
          const x0 = x, w = sx(x + (ms as number)) - sx(x);
          x += ms as number;
          return (
            <g key={label as string}>
              <rect x={sx(x0)} y={128} width={Math.max(0, w - 1)} height={30} fill={i === 0 ? "var(--rule-strong)" : "var(--fam-reactive)"} />
              {w > 120 && <text x={sx(x0) + 6} y={147} fontSize="11.5" fill={i === 0 ? "var(--ink)" : "var(--surface)"}>{label as string}</text>}
            </g>
          );
        })}
        <text x={L - 8} y={148} textAnchor="end" fontSize="12" fill="var(--ink)">{react} ms</text>
        {[0, 500, 1000, 1500, 2000, 2500].map((ms) => (
          <g key={ms}>
            <line x1={sx(ms)} x2={sx(ms)} y1={162} y2={168} stroke="var(--rule-strong)" />
            <text x={sx(ms)} y={182} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">{ms / 1000} s</text>
          </g>
        ))}
        <text x={L} y={202} fontSize="11.5" fill="var(--ink-2)">
          In that time a person walking briskly (an illustrative 1.5 m/s) moves {(react / 1000 * walk).toFixed(2)} m towards the robot.
        </text>
      </svg>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Action chunk length</span><span className={styles.sliderValue}>{chunk} ms</span></span>
            <input type="range" min={100} max={2500} step={100} value={chunk} onChange={(e) => setChunk(Number(e.target.value))} />
          </label>
          <label className={styles.slider} data-disabled={!cloud}>
            <span className={styles.sliderHead}><span>Network round trip</span><span className={styles.sliderValue}>{cloud ? `${rtt} ms` : "none"}</span></span>
            <input type="range" min={10} max={200} step={10} value={rtt} disabled={!cloud} onChange={(e) => setRtt(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Pipeline latency</dt><dd>{lat} ms</dd></div>
          <div><dt>Worst-case reaction</dt><dd>{(react / 1000).toFixed(2)} s</dd></div>
        </dl>
      </div>
    </div>
  );
}
