"use client";
import { useEffect, useMemo, useState } from "react";
import { BLOCK, encode, predictPixels, render, signalShare, WIDTH } from "@/lib/sim/latent";
import styles from "./viz.module.css";

const POS = 14, ACTION = 4;
const CELL = 15, X0 = 150;

/** Figure 7.1: the same prediction scored in pixels and in features. */
export function PixelVsLatent() {
  const [flicker, setFlicker] = useState(0.3);
  const [err, setErr] = useState(1);
  const [seed, setSeed] = useState(1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSeed((s) => s + 1), 450);
    return () => window.clearInterval(id);
  }, [playing]);

  const actual = render(POS + ACTION, flicker, seed);
  const pred = predictPixels(POS, ACTION + err);
  const perPixel = actual.map((a, i) => (pred[i] - a) ** 2);
  const inBlock = (i: number) => (i + 1 > POS + ACTION && i < POS + ACTION + BLOCK) || (i + 1 > POS + ACTION + err && i < POS + ACTION + err + BLOCK);
  const total = perPixel.reduce((s, v) => s + v, 0);
  const share = useMemo(() => Array.from({ length: 200 }, (_, s) => signalShare(POS, ACTION, err, flicker, s)).reduce((a, b) => a + b, 0) / 200,
    [flicker, err]);
  const zTrue = encode(actual), zPred = encode(pred);
  const shade = (v: number) => Math.max(0.04, Math.min(1, (v + 0.5) / 1.5));
  const maxBar = Math.max(1, ...perPixel);

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 880 330" role="img"
        aria-label={`Pixel branch: ${(100 * share).toFixed(0)} percent of the pixel loss comes from the action error, on average. Feature branch: target position ${zTrue}, predicted ${zPred}; all of the feature loss comes from the action error.`}>
        <text x="0" y="16" fontSize="13" fontWeight="600" fill="var(--ink)">Pixel branch</text>
        {[["next frame", actual, 30], ["prediction", pred, 70]].map(([label, row, y]) => (
          <g key={label as string}>
            <text x={X0 - 10} y={(y as number) + 19} textAnchor="end" fontSize="12" fill="var(--ink-2)">{label as string}</text>
            {(row as number[]).map((v, i) => (
              <rect key={i} x={X0 + i * CELL} y={y as number} width={CELL - 1} height="28" fill="var(--ink)" opacity={shade(v)} />
            ))}
          </g>
        ))}
        <text x={X0 - 10} y={150} textAnchor="end" fontSize="12" fill="var(--ink-2)">what the loss sees</text>
        <text x={X0 - 10} y={166} textAnchor="end" fontSize="11" fill="var(--ink-3)">squared error per pixel</text>
        <line x1={X0} x2={X0 + WIDTH * CELL} y1={176} y2={176} stroke="var(--rule-strong)" />
        {perPixel.map((v, i) => {
          const h = (v / maxBar) * 64;
          return <rect key={i} x={X0 + i * CELL} y={176 - h} width={CELL - 1} height={h} fill={inBlock(i) ? "var(--fam-latent)" : "var(--ink-3)"} />;
        })}

        <text x="0" y="222" fontSize="13" fontWeight="600" fill="var(--ink)">Feature branch</text>
        <text x={X0 - 10} y={262} textAnchor="end" fontSize="12" fill="var(--ink-2)">block position</text>
        <line x1={X0} x2={X0 + WIDTH * CELL} y1={258} y2={258} stroke="var(--rule-strong)" />
        {[0, 12, 24, 36, 48].map((v) => (
          <g key={v}>
            <line x1={X0 + v * CELL} x2={X0 + v * CELL} y1={254} y2={262} stroke="var(--rule-strong)" />
            <text x={X0 + v * CELL} y={280} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        <circle cx={X0 + (zTrue + BLOCK / 2) * CELL} cy={258} r="8" fill="var(--ink)" />
        <text x={X0 + (zTrue + BLOCK / 2) * CELL} y={240} textAnchor="middle" fontSize="12" fill="var(--ink)">target {zTrue}</text>
        <circle cx={X0 + (zPred + BLOCK / 2) * CELL} cy={258} r="8" fill="none" stroke="var(--fam-latent)" strokeWidth="3" />
        <text x={X0 + (zPred + BLOCK / 2) * CELL} y={302} textAnchor="middle" fontSize="12" fill="var(--ink)">prediction {zPred}</text>
        <text x={X0} y={324} fontSize="12" fill="var(--ink-2)">The background never reaches this branch: the encoder keeps only where the block is.</text>
      </svg>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--fam-latent)" }}><span className={styles.swatchDot} /><span style={{ color: "var(--ink-2)" }}>error about the block, which the action moves</span></span>
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchDot} /><span style={{ color: "var(--ink-2)" }}>error about the flickering background</span></span>
      </div>

      <div className={styles.split}>
        <div className={styles.stack}>
          <div className={styles.row}>
            <button className={styles.button} data-primary="true" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play frames"}</button>
            <button className={styles.button} onClick={() => setSeed((s) => s + 1)}>Next frame</button>
          </div>
          <div className={styles.sliders}>
            <label className={styles.slider}>
              <span className={styles.sliderHead}><span>Background flicker</span><span className={styles.sliderValue}>{flicker.toFixed(2)}</span></span>
              <input type="range" min={0} max={0.5} step={0.05} value={flicker} onChange={(e) => setFlicker(Number(e.target.value))} />
            </label>
            <label className={styles.slider}>
              <span className={styles.sliderHead}><span>Action error</span><span className={styles.sliderValue}>{err} px</span></span>
              <input type="range" min={0} max={3} step={1} value={err} onChange={(e) => setErr(Number(e.target.value))} />
            </label>
          </div>
        </div>
        <dl className={styles.readout}>
          <div><dt>Pixel loss caused by the action error</dt><dd>{err === 0 ? "0%" : `${(100 * share).toFixed(0)}%`}<small>average over 200 frames; this frame&rsquo;s loss {(total / WIDTH).toFixed(3)}</small></dd></div>
          <div><dt>Feature loss caused by the action error</dt><dd>{err === 0 ? "0%" : "100%"}<small>squared position error {((zPred - zTrue) ** 2).toFixed(2)}</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
