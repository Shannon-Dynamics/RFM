"use client";
import { ResponsiveLine, type LineCustomSvgLayerProps } from "@nivo/line";
import { useMemo, useState } from "react";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

// Schematic token-pass model, not a measurement. One action chunk costs:
//   reactive VLA            C + Ka*A                (context once, then Ka light action-expert steps)
//   WAM, video at test time m * K * (C + H*T + A)   (every denoising step touches every imagined frame)
//   WAM, video in training  m * (C + Ka*A)          (same inference path as a VLA, on a bigger backbone)
const C = 600, A = 50, KA = 10;

const SERIES = [
  { id: "Reactive VLA", family: "reactive", dash: false },
  { id: "WAM, video at test time", family: "wam", dash: false },
  { id: "WAM, video only in training", family: "wam", dash: true },
] as const;

export function CostVsHorizon() {
  const t = useTokens();
  const [steps, setSteps] = useState(10);
  const [tokens, setTokens] = useState(256);
  const [size, setSize] = useState(2);
  const data = useMemo(() => {
    const vla = C + KA * A;
    const hs = Array.from({ length: 32 }, (_, i) => i + 1);
    return [
      { id: SERIES[0].id, data: hs.map((h) => ({ x: h, y: 1 })) },
      { id: SERIES[1].id, data: hs.map((h) => ({ x: h, y: (size * steps * (C + h * tokens + A)) / vla })) },
      { id: SERIES[2].id, data: hs.map((h) => ({ x: h, y: (size * vla) / vla })) },
    ];
  }, [steps, tokens, size]);
  const color = (id: string) => t[`fam-${SERIES.find((s) => s.id === id)!.family}` as const];

  const Lines = ({ series, lineGenerator }: LineCustomSvgLayerProps<(typeof data)[number]>) => (
    <g>
      {series.map((s) => {
        const meta = SERIES.find((x) => x.id === s.id)!;
        const pts = s.data.map((d) => d.position);
        const end = pts[pts.length - 1];
        return (
          <g key={s.id}>
            <path d={lineGenerator(pts) ?? ""} fill="none" stroke={color(s.id as string)} strokeWidth={2}
              strokeDasharray={meta.dash ? "6 5" : undefined} />
            <text x={end.x - 4} y={end.y - 8} textAnchor="end" fontSize={12.5} fill={t["ink-2"]} fontFamily="var(--font-ui)">{s.id}</text>
          </g>
        );
      })}
    </g>
  );

  return (
    <div className={styles.stack}>
      <div style={{ height: 300 }} role="img"
        aria-label={`Schematic. Relative compute per action chunk against imagined frames. Reactive VLA stays at 1. WAM with video at test time rises to ${data[1].data[31].y.toFixed(0)} times at 32 frames. WAM with video only in training stays at ${size} times.`}>
        <ResponsiveLine
          data={data}
          margin={{ top: 16, right: 16, bottom: 46, left: 56 }}
          xScale={{ type: "linear", min: 1, max: 32 }}
          yScale={{ type: "log", base: 10, min: 0.5, max: 5000 }}
          axisBottom={{ legend: "Imagined frames per action chunk", legendOffset: 36, legendPosition: "middle", tickValues: [1, 8, 16, 24, 32] }}
          axisLeft={{ legend: "Compute vs. VLA", legendOffset: -46, legendPosition: "middle", tickValues: [1, 10, 100, 1000], format: (v) => `${v}x` }}
          gridYValues={[1, 10, 100, 1000]}
          enableGridX={false}
          colors={(s) => color(s.id as string)}
          enablePoints={false}
          enableSlices="x"
          sliceTooltip={({ slice }) => (
            <div style={{ padding: "6px 10px" }}>
              <div style={{ fontWeight: 600 }}>{slice.points[0].data.xFormatted} imagined frames</div>
              {slice.points.map((p) => (
                <div key={p.id}>{p.seriesId}: {Number(p.data.y).toFixed(1)}x</div>
              ))}
            </div>
          )}
          layers={["grid", "axes", Lines, "slices", "crosshair"]}
          theme={nivoTheme(t)}
          animate={false}
        />
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: t["fam-reactive"] }}><span className={styles.swatchLine} />Reactive VLA</span>
        <span className={styles.legendItem} style={{ color: t["fam-wam"] }}><span className={styles.swatchLine} />WAM, video at test time</span>
        <span className={styles.legendItem} style={{ color: t["fam-wam"] }}><span className={styles.swatchDash} />WAM, video only in training</span>
      </div>
      <div className={styles.sliders}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Denoising steps</span><span className={styles.sliderValue}>{steps}</span></span>
          <input type="range" min={1} max={50} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
          <span className={styles.sliderNote}>Few-step samplers cut this.</span>
        </label>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Tokens per imagined frame</span><span className={styles.sliderValue}>{tokens}</span></span>
          <input type="range" min={64} max={1024} step={64} value={tokens} onChange={(e) => setTokens(Number(e.target.value))} />
          <span className={styles.sliderNote}>Set by the video VAE&rsquo;s compression.</span>
        </label>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>WAM backbone size vs. VLA</span><span className={styles.sliderValue}>{size}x</span></span>
          <input type="range" min={1} max={5} step={0.5} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <span className={styles.sliderNote}>A 14B video model against a 3B VLA is about 4.7x.</span>
        </label>
      </div>
    </div>
  );
}
