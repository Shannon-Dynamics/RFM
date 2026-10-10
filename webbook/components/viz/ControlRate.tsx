"use client";
import { useState } from "react";
import styles from "./viz.module.css";

/** Figure 2.3: how chunking and asynchronous execution turn slow inference into fast control.
 *  Mirrors rust/ch02-why-now (sync_rate_hz, async_keeps_up). */
export function ControlRate() {
  const [latency, setLatency] = useState(200);
  const [chunk, setChunk] = useState(10);
  const [hz, setHz] = useState(50);
  const [mode, setMode] = useState<"sync" | "async">("sync");
  const execMs = (chunk * 1000) / hz;
  const syncRate = (chunk * 1000) / (latency + execMs);
  const asyncOk = latency <= execMs;
  const delivered = mode === "sync" ? syncRate : asyncOk ? hz : syncRate;
  const W = 720, LEFT = 90, span = 2000; // ms shown
  const sx = (ms: number) => LEFT + (ms / span) * (W - LEFT - 10);
  // Build the two rows: inference (thinking) and execution (moving).
  const think: [number, number][] = [], move: [number, number][] = [];
  if (mode === "sync") {
    for (let t = 0; t < span; t += latency + execMs) { think.push([t, t + latency]); move.push([t + latency, t + latency + execMs]); }
  } else {
    const period = Math.max(execMs, latency);
    for (let t = 0; t < span + period; t += period) { think.push([t, t + latency]); move.push([t + latency, t + latency + period]); }
  }
  const clip = (a: number, b: number): [number, number] => [Math.min(a, span), Math.min(b, span)];
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Execution mode">
        <button aria-pressed={mode === "sync"} onClick={() => setMode("sync")}>Stop and think</button>
        <button aria-pressed={mode === "async"} onClick={() => setMode("async")}>Think while moving</button>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${W} 150`} role="img"
        aria-label={`Over two seconds, ${mode === "sync" ? "the robot alternates between thinking and moving" : "the robot thinks about the next chunk while executing the current one"}. Delivered rate ${delivered.toFixed(1)} commands per second.`}>
        {[0, 500, 1000, 1500, 2000].map((ms) => (
          <g key={ms}>
            <line x1={sx(ms)} x2={sx(ms)} y1={18} y2={112} stroke="var(--rule)" />
            <text x={sx(ms)} y={130} textAnchor={ms === 2000 ? "end" : "middle"} fontSize="12" fill="var(--ink-3)">{ms} ms</text>
          </g>
        ))}
        <text x={LEFT - 10} y={46} textAnchor="end" fontSize="13" fill="var(--ink)">model thinks</text>
        <text x={LEFT - 10} y={92} textAnchor="end" fontSize="13" fill="var(--ink)">robot moves</text>
        {think.map(([a, b], i) => { const [x0, x1] = clip(a, b); return x1 > x0 && <rect key={`t${i}`} x={sx(x0)} y={30} width={sx(x1) - sx(x0)} height={24} rx="3" fill="var(--ink-3)" />; })}
        {move.map(([a, b], i) => { const [x0, x1] = clip(a, b); return x1 > x0 && <rect key={`m${i}`} x={sx(x0)} y={76} width={sx(x1) - sx(x0) - 2} height={24} rx="3" fill="var(--fam-reactive)" />; })}
      </svg>
      <dl className={styles.readout} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", display: "grid" }}>
        <div><dt>Commands per second delivered</dt><dd>{delivered.toFixed(1)}<small>controller runs at {hz} Hz</small></dd></div>
        <div><dt>One chunk lasts</dt><dd>{execMs.toFixed(0)} ms<small>{chunk} actions at {hz} Hz</small></dd></div>
        <div><dt>Inference takes</dt><dd>{latency} ms<small>{mode === "async" ? (asyncOk ? "finishes before the chunk runs out" : "too slow: the robot still waits") : "the robot waits every time"}</small></dd></div>
      </dl>
      <div className={styles.sliders}>
        <label className={styles.slider}><span className={styles.sliderHead}><span>Inference latency</span><span className={styles.sliderValue}>{latency} ms</span></span>
          <input type="range" min={20} max={1000} step={10} value={latency} onChange={(e) => setLatency(Number(e.target.value))} /></label>
        <label className={styles.slider}><span className={styles.sliderHead}><span>Actions per chunk</span><span className={styles.sliderValue}>{chunk}</span></span>
          <input type="range" min={1} max={50} value={chunk} onChange={(e) => setChunk(Number(e.target.value))} /></label>
        <label className={styles.slider}><span className={styles.sliderHead}><span>Controller rate</span><span className={styles.sliderValue}>{hz} Hz</span></span>
          <input type="range" min={10} max={200} step={10} value={hz} onChange={(e) => setHz(Number(e.target.value))} /></label>
      </div>
    </div>
  );
}
