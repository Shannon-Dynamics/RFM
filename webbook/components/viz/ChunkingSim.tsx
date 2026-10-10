"use client";
import { ResponsiveLine } from "@nivo/line";
import { useMemo, useState } from "react";
import { target, track } from "@/lib/sim/toolkit";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

const STEPS = 240;

/** Figure 4.2: action chunking as a film strip, with the error it buys and costs. */
export function ChunkingSim() {
  const t = useTokens();
  const [chunk, setChunk] = useState(8);
  const [latency, setLatency] = useState(5);
  const [asyn, setAsyn] = useState(false);
  const run = useMemo(() => track(chunk, latency, STEPS, asyn), [chunk, latency, asyn]);
  const curve = useMemo(() => [false, true].map((a) => ({
    id: a ? "think while moving" : "stop to think",
    data: Array.from({ length: 40 }, (_, i) => ({ x: i + 1, y: track(i + 1, latency, 800, a).error })),
  })), [latency]);
  const W = 720, H = 170, sx = (k: number) => 10 + (k / STEPS) * (W - 20), sy = (v: number) => H / 2 - v * 62;
  const path = (vals: number[]) => vals.map((v, k) => `${k ? "L" : "M"}${sx(k).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Execution">
        <button aria-pressed={!asyn} onClick={() => setAsyn(false)}>Stop to think</button>
        <button aria-pressed={asyn} onClick={() => setAsyn(true)}>Think while moving</button>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Target and robot over ${STEPS} steps with chunks of ${chunk} and ${latency} steps of inference latency. Mean error ${run.error.toFixed(3)}.`}>
        {run.thinking.map((th, k) => th && <rect key={k} x={sx(k)} y={8} width={(W - 20) / STEPS + 0.3} height={H - 16} fill="var(--surface-2)" />)}
        <path d={path(Array.from({ length: STEPS }, (_, k) => target(k)))} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 4" />
        <path d={path(run.executed)} fill="none" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchDash} />target</span>
        <span className={styles.legendItem} style={{ color: "var(--ink)" }}><span className={styles.swatchLine} />robot</span>
        <span className={styles.legendItem}><span style={{ width: 14, height: 12, background: "var(--surface-2)", border: "1px solid var(--rule)" }} />model thinking</span>
        <span>Mean error: <strong>{run.error.toFixed(3)}</strong></span>
      </div>
      <div className={styles.sliders}>
        <label className={styles.slider}><span className={styles.sliderHead}><span>Actions per chunk H</span><span className={styles.sliderValue}>{chunk}</span></span>
          <input type="range" min={1} max={40} value={chunk} onChange={(e) => setChunk(Number(e.target.value))} /></label>
        <label className={styles.slider}><span className={styles.sliderHead}><span>Inference latency</span><span className={styles.sliderValue}>{latency} steps</span></span>
          <input type="range" min={0} max={12} value={latency} onChange={(e) => setLatency(Number(e.target.value))} /></label>
      </div>
      <p className={styles.note}>Mean error against chunk length at this latency. The vertical line marks your current setting.</p>
      <div style={{ height: 220 }} role="img" aria-label="Error against chunk length for both execution modes">
        <ResponsiveLine
          data={curve}
          margin={{ top: 10, right: 16, bottom: 42, left: 52 }}
          xScale={{ type: "linear", min: 1, max: 40 }}
          yScale={{ type: "linear", min: 0, max: "auto" }}
          axisBottom={{ legend: "Actions per chunk", legendOffset: 34, legendPosition: "middle", tickValues: [1, 10, 20, 30, 40] }}
          axisLeft={{ legend: "Mean error", legendOffset: -44, legendPosition: "middle", tickValues: 4 }}
          colors={[t["ink-2"], t.ink]}
          lineWidth={2}
          enableGridX={false}
          enablePoints={false}
          enableSlices="x"
          markers={[{ axis: "x", value: chunk, lineStyle: { stroke: t["rule-strong"], strokeWidth: 1 } }]}
          sliceTooltip={({ slice }) => (
            <div style={{ padding: "6px 10px" }}>
              <div style={{ fontWeight: 600 }}>H = {slice.points[0].data.xFormatted}</div>
              {slice.points.map((p) => <div key={p.id}>{p.seriesId}: {Number(p.data.y).toFixed(3)}</div>)}
            </div>
          )}
          legends={[{ anchor: "top-right", direction: "column", translateX: 0, itemWidth: 140, itemHeight: 18, symbolSize: 10 }]}
          theme={nivoTheme(t)}
          animate={false}
        />
      </div>
    </div>
  );
}
