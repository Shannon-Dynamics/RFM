"use client";
import { ResponsiveLine } from "@nivo/line";
import { useMemo, useState } from "react";
import { power, wilson } from "@/lib/sim/behavior";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

const NS = Array.from({ length: 60 }, (_, i) => 5 + i * 5);

/** Figure 11.4: how many real-robot trials it takes to tell a better policy from a worse one. */
export function TrialsNeeded() {
  const t = useTokens();
  const [pa, setPa] = useState(0.6);
  const [pb, setPb] = useState(0.7);
  const [n, setN] = useState(20);
  const curve = useMemo(() => NS.map((k) => ({ x: k, y: power(pa, pb, k) })), [pa, pb]);
  const need = curve.find((c) => c.y >= 0.8)?.x;
  const pw = power(pa, pb, n);
  const ka = Math.round(n * pa), kb = Math.round(n * pb);
  const [al, ah] = wilson(ka, n), [bl, bh] = wilson(kb, n);
  const sx = (v: number) => 120 + v * 700;

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 120" role="img"
        aria-label={`With ${n} trials each, typical results are ${ka} of ${n} for A and ${kb} of ${n} for B, with 95 percent intervals ${Math.round(al * 100)} to ${Math.round(ah * 100)} percent and ${Math.round(bl * 100)} to ${Math.round(bh * 100)} percent.`}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={8} y2={92} stroke="var(--rule)" />
            <text x={sx(v)} y={110} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{v * 100}%</text>
          </g>
        ))}
        {[["policy A", ka, al, ah, pa, 30], ["policy B", kb, bl, bh, pb, 68]].map(([lab, k, lo, hi, p, y]) => (
          <g key={lab as string}>
            <text x={110} y={(y as number) + 5} textAnchor="end" fontSize="13" fill="var(--ink)">{lab as string}: {k as number}/{n}</text>
            <line x1={sx(lo as number)} x2={sx(hi as number)} y1={y as number} y2={y as number} stroke="var(--fam-lbm)" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
            <circle cx={sx((k as number) / n)} cy={y as number} r="6" fill="var(--fam-lbm)" />
            <line x1={sx(p as number)} x2={sx(p as number)} y1={(y as number) - 12} y2={(y as number) + 12} stroke="var(--ink)" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--fam-lbm)" }}><span className={styles.swatchDot} /><span style={{ color: "var(--ink-2)" }}>a typical observed rate, with its 95% Wilson interval</span></span>
        <span className={styles.legendItem}><span style={{ width: 2, height: 14, background: "var(--ink)" }} />true rate</span>
      </div>
      <p className={styles.note}>Chance that a one-sided test at the 5% level finds B better, against the number of trials per policy:</p>
      <div style={{ height: 230 }} role="img" aria-label={`Power rises with trials; 80 percent power needs ${need ?? "more than 300"} trials per policy.`}>
        <ResponsiveLine
          data={[{ id: "power", data: curve }]}
          margin={{ top: 10, right: 44, bottom: 44, left: 56 }}
          xScale={{ type: "linear", min: 0, max: 300 }}
          yScale={{ type: "linear", min: 0, max: 1 }}
          axisBottom={{ legend: "Trials per policy", legendOffset: 36, legendPosition: "middle", tickValues: [0, 50, 100, 150, 200, 250, 300] }}
          axisLeft={{ legend: "Power", legendOffset: -46, legendPosition: "middle", tickValues: [0, 0.2, 0.4, 0.6, 0.8, 1], format: (v) => `${Math.round(Number(v) * 100)}%` }}
          colors={[t["fam-lbm"]]}
          lineWidth={2.5}
          enablePoints={false}
          enableGridX={false}
          markers={[
            { axis: "y", value: 0.8, lineStyle: { stroke: t["ink-3"], strokeDasharray: "4 4", strokeWidth: 1 }, legend: "80%", legendPosition: "right", textStyle: { fill: t["ink-2"], fontSize: 11 } },
            { axis: "x", value: n, lineStyle: { stroke: t.ink, strokeWidth: 1 } },
          ]}
          useMesh
          tooltip={({ point }) => <div style={{ padding: "6px 10px" }}>{String(point.data.x)} trials each: {Math.round(Number(point.data.y) * 100)}% power</div>}
          theme={nivoTheme(t)}
          animate={false}
        />
      </div>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Policy A true success</span><span className={styles.sliderValue}>{Math.round(pa * 100)}%</span></span>
            <input type="range" min={0.1} max={0.9} step={0.05} value={pa} onChange={(e) => setPa(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Policy B true success</span><span className={styles.sliderValue}>{Math.round(pb * 100)}%</span></span>
            <input type="range" min={0.1} max={0.95} step={0.05} value={pb} onChange={(e) => setPb(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Trials per policy</span><span className={styles.sliderValue}>{n}</span></span>
            <input type="range" min={5} max={300} step={5} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Chance of detecting the difference</dt><dd>{Math.round(pw * 100)}%<small>with {n} trials each</small></dd></div>
          <div><dt>Trials each for 80% power</dt><dd>{pb <= pa ? "no difference to find" : need ? `about ${need}` : "more than 300"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
