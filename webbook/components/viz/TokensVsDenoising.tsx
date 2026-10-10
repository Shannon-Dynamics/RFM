"use client";
import { ResponsiveBar } from "@nivo/bar";
import { useMemo, useState } from "react";
import { normalQuantiles, sample } from "@/lib/sim/toolkit";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

const NOISE = normalQuantiles(600);

/** Figure 4.3: two ways to emit an action. Left, uniform bins. Right, a flow from noise to a two-mode action. */
export function TokensVsDenoising() {
  const t = useTokens();
  const [bins, setBins] = useState(8);
  const [steps, setSteps] = useState(1);
  const W = 340, H = 180, N = 120;
  const curve = (k: number) => 0.8 * Math.sin(k * 0.06) + 0.15 * Math.sin(k * 0.21);
  const q = (v: number) => { const u = Math.min(bins - 1, Math.max(0, Math.floor(((v + 1) / 2) * bins))); return -1 + ((u + 0.5) * 2) / bins; };
  const sx = (k: number) => 8 + (k / N) * (W - 16), sy = (v: number) => H / 2 - v * 78;
  const line = (f: (k: number) => number) => Array.from({ length: N }, (_, k) => `${k ? "L" : "M"}${sx(k).toFixed(1)},${sy(f(k)).toFixed(1)}`).join(" ");
  const hist = useMemo(() => {
    const edges = 30, lo = -2, hi = 2, counts = new Array(edges).fill(0);
    for (const z of NOISE) {
      const x = sample(1, 0.12, z, steps);
      const i = Math.floor(((x - lo) / (hi - lo)) * edges);
      if (i >= 0 && i < edges) counts[i]++;
    }
    return counts.map((c, i) => ({ x: (lo + ((i + 0.5) * (hi - lo)) / edges).toFixed(2), count: c }));
  }, [steps]);
  const nearModes = useMemo(() => NOISE.filter((z) => Math.abs(Math.abs(sample(1, 0.12, z, steps)) - 1) < 0.3).length / NOISE.length, [steps]);
  return (
    <div className={styles.stack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))", gap: "1.25rem" }}>
        <div className={styles.stack}>
          <strong>Tokens: round to the nearest bin</strong>
          <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A smooth action trajectory and its ${bins}-bin quantisation`}>
            <path d={line(curve)} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 4" />
            <path d={line((k) => q(curve(k)))} fill="none" stroke="var(--ink)" strokeWidth="2" />
          </svg>
          <label className={styles.slider}><span className={styles.sliderHead}><span>Bins per dimension</span><span className={styles.sliderValue}>{bins}</span></span>
            <input type="range" min={2} max={8} value={Math.log2(bins)} onChange={(e) => setBins(2 ** Number(e.target.value))} />
            <span className={styles.sliderNote}>Worst-case rounding error: {(1 / bins).toFixed(3)} (half a bin of a range of 2). RT-2 and OpenVLA use 256.</span></label>
        </div>
        <div className={styles.stack}>
          <strong>Denoising: flow from noise in K steps</strong>
          <div style={{ height: H }} role="img" aria-label={`Histogram of 600 sampled actions after ${steps} steps; ${(nearModes * 100).toFixed(0)} percent within 0.3 of a mode.`}>
            <ResponsiveBar
              data={hist}
              keys={["count"]}
              indexBy="x"
              margin={{ top: 4, right: 4, bottom: 24, left: 4 }}
              padding={0.15}
              colors={[t["ink-2"]]}
              enableLabel={false}
              enableGridY={false}
              axisLeft={null}
              axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: [hist[7].x, hist[22].x], format: (v) => `${Math.round(Number(v))}` }}
              theme={nivoTheme(t)}
              tooltip={({ indexValue, value }) => <div style={{ padding: "4px 8px" }}>action ≈ {indexValue}: {value} samples</div>}
              animate={false}
            />
          </div>
          <label className={styles.slider}><span className={styles.sliderHead}><span>Denoising steps K</span><span className={styles.sliderValue}>{steps}</span></span>
            <input type="range" min={1} max={32} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
            <span className={styles.sliderNote}>{(nearModes * 100).toFixed(0)} percent of samples land near a mode (left or right of the obstacle).</span></label>
        </div>
      </div>
    </div>
  );
}
