"use client";
import { ResponsiveLine } from "@nivo/line";
import { useState } from "react";
import { ceiling, expectedLatencyMs, success } from "@/lib/sim/bets";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

/** Figure 18.3: test-time scaling, capped by the verifier's precision. */
export function BestOfN() {
  const t = useTokens();
  const [p, setP] = useState(0.5);
  const [a, setA] = useState(0.9);
  const [b, setB] = useState(0.2);
  const [n, setN] = useState(4);
  const s = { p, a, b };
  const data = [{ id: "success", data: Array.from({ length: 32 }, (_, i) => ({ x: i + 1, y: success(s, i + 1) })) }];
  const cap = ceiling(s);
  return (
    <div className={styles.stack}>
      <div style={{ height: 250 }} role="img" aria-label={`Success rises from ${Math.round(p * 100)} percent with one candidate towards a ceiling of ${Math.round(cap * 100)} percent set by the verifier.`}>
        <ResponsiveLine
          data={data}
          margin={{ top: 14, right: 110, bottom: 44, left: 56 }}
          xScale={{ type: "linear", min: 1, max: 32 }}
          yScale={{ type: "linear", min: 0, max: 1 }}
          axisBottom={{ legend: "Candidate plans checked, at most", legendOffset: 36, legendPosition: "middle", tickValues: [1, 4, 8, 16, 24, 32] }}
          axisLeft={{ legend: "Success", legendOffset: -46, legendPosition: "middle", tickValues: [0, 0.25, 0.5, 0.75, 1], format: (v) => `${Math.round(Number(v) * 100)}%` }}
          colors={[t["fam-simulator"]]}
          lineWidth={2.5}
          enablePoints={false}
          enableGridX={false}
          markers={[
            { axis: "y", value: cap, lineStyle: { stroke: t.ink, strokeDasharray: "6 4", strokeWidth: 1.5 }, legend: `ceiling ${Math.round(cap * 100)}%`, legendPosition: "right", textStyle: { fill: t.ink, fontSize: 12 } },
            { axis: "x", value: n, lineStyle: { stroke: t["ink-2"], strokeWidth: 1 } },
          ]}
          useMesh
          tooltip={({ point }) => <div style={{ padding: "6px 10px" }}>{String(point.data.x)} candidates: {Math.round(Number(point.data.y) * 100)}%</div>}
          theme={nivoTheme(t)}
          animate={false}
        />
      </div>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Policy: chance a plan succeeds</span><span className={styles.sliderValue}>{Math.round(p * 100)}%</span></span>
            <input type="range" min={0.1} max={0.9} step={0.05} value={p} onChange={(e) => setP(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Verifier accepts a good plan</span><span className={styles.sliderValue}>{Math.round(a * 100)}%</span></span>
            <input type="range" min={0.5} max={1} step={0.05} value={a} onChange={(e) => setA(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Verifier accepts a bad plan</span><span className={styles.sliderValue}>{Math.round(b * 100)}%</span></span>
            <input type="range" min={0} max={0.5} step={0.05} value={b} onChange={(e) => setB(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Candidates allowed</span><span className={styles.sliderValue}>{n}</span></span>
            <input type="range" min={1} max={32} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Success with {n} candidates</dt><dd>{Math.round(success(s, n) * 100)}%</dd></div>
          <div><dt>Expected time to decide</dt><dd>{Math.round(expectedLatencyMs(s, n, 100, 50))} ms<small>at an illustrative 100 ms to generate and 50 ms to check each plan</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
