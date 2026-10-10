"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./viz.module.css";

const K = 20; // denoising steps shown
const G = 4; // patches per frame side

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A small latent frame: G x G patches, each drawn as ink at an opacity between noise and clean. */
function Frame({ x, y, size, clean, seed, alpha, given, label }: {
  x: number; y: number; size: number; clean: number[]; seed: number; alpha: number; given?: boolean; label: string;
}) {
  const cell = size / G;
  return (
    <g>
      {clean.map((c, i) => {
        const v = given ? c : (1 - alpha) * hash(seed * 100 + i) + alpha * c;
        return <rect key={i} x={x + (i % G) * cell + 1} y={y + Math.floor(i / G) * cell + 1} width={cell - 2} height={cell - 2}
          rx="2" fill="var(--ink)" fillOpacity={0.08 + 0.85 * v} />;
      })}
      <rect x={x} y={y} width={size} height={size} rx="4" fill="none" stroke={given ? "var(--ink)" : "var(--rule-strong)"}
        strokeWidth={given ? 2 : 1} strokeDasharray={given ? undefined : "4 3"} />
      <text x={x + size / 2} y={y + size + 16} textAnchor="middle" fontSize="12.5" fill="var(--ink-2)">{label}</text>
    </g>
  );
}

function puckFrame(col: number): number[] {
  return Array.from({ length: G * G }, (_, i) => {
    const cx = i % G, cy = Math.floor(i / G);
    return (cx === col || cx === col + 1) && (cy === 1 || cy === 2) ? 1 : 0.08;
  });
}

/** Figure 6.5: how actions enter a video diffusion model, in two designs. */
export function JointDenoising() {
  const [k, setK] = useState(K);
  const [playing, setPlaying] = useState(false);
  const alpha = k / K;

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setK(K); setPlaying(false); return; }
    setK(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setK(n);
      if (n >= K) { window.clearInterval(id); setPlaying(false); }
    }, 120);
    return () => window.clearInterval(id);
  }, [playing]);

  const video = useMemo(() => [0, 1, 1, 2].map(puckFrame), []);
  const arrows = [0, 0, 10, 20, 35, 60, 80, 90]; // clean action directions, degrees
  const actionFrame = Array.from({ length: G * G }, (_, i) => [0.9, 0.55, 0.3, 0.7][i % G]);
  const valueFrame = Array.from({ length: G * G }, () => 0.75);

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 720 300" role="img"
        aria-label={`Denoising step ${k} of ${K}. Left: video and action tokens denoised together. Right: action, future state and value encoded as latent frames next to the given current frame.`}>
        <text x="8" y="22" fontSize="15" fontWeight="600" fill="var(--ink)">Video and action tokens in one transformer</text>
        <text x="8" y="40" fontSize="13" fill="var(--ink-2)">DreamZero: one DiT denoises both</text>
        {video.map((c, f) => (
          <Frame key={f} x={8 + f * 82} y={58} size={70} clean={c} seed={f + 1} alpha={alpha} label={`frame t+${f + 1}`} />
        ))}
        {arrows.map((deg, i) => {
          const noisy = hash(900 + i) * 360;
          const a = ((1 - alpha) * noisy + alpha * deg) * (Math.PI / 180);
          const cx = 26 + i * 38, cy = 196;
          return (
            <g key={i} opacity={0.35 + 0.65 * alpha}>
              <circle cx={cx} cy={cy} r="15" fill="none" stroke="var(--ink-2)" />
              <line x1={cx - 9 * Math.cos(a)} y1={cy + 9 * Math.sin(a)} x2={cx + 9 * Math.cos(a)} y2={cy - 9 * Math.sin(a)}
                stroke="var(--ink)" strokeWidth="2.2" markerEnd="url(#jd-head)" />
            </g>
          );
        })}
        <text x="8" y="236" fontSize="12.5" fill="var(--ink-2)">action tokens a t+1 to a t+8 (arrows show direction)</text>

        <line x1="352" y1="10" x2="352" y2="252" stroke="var(--rule)" />

        <text x="372" y="22" fontSize="15" fontWeight="600" fill="var(--ink)">Actions as extra latent frames</text>
        <text x="372" y="40" fontSize="13" fill="var(--ink-2)">Cosmos Policy: no new architecture</text>
        <Frame x={372} y={58} size={70} clean={puckFrame(0)} seed={11} alpha={1} given label="current frame" />
        <Frame x={458} y={58} size={70} clean={actionFrame} seed={12} alpha={alpha} label="action frame" />
        <Frame x={544} y={58} size={70} clean={puckFrame(2)} seed={13} alpha={alpha} label="future state" />
        <Frame x={630} y={58} size={70} clean={valueFrame} seed={14} alpha={alpha} label="value" />
        <text x="372" y="190" fontSize="13" fill="var(--ink-2)">
          <tspan x="372">The action vector is written into a frame, then read</tspan>
          <tspan x="372" dy="18">back by averaging it. The predicted future and value</tspan>
          <tspan x="372" dy="18">let the same model plan: propose, imagine, score.</tspan>
        </text>
        <defs>
          <marker id="jd-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
          </marker>
        </defs>
        <text x="8" y="286" fontSize="13" fill="var(--ink-2)">
          Denoising step {k} of {K}. Solid outline: given, never noised. Dashed: generated.
        </text>
      </svg>
      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={() => setPlaying(true)} disabled={playing}>Denoise from noise</button>
        <label className={styles.slider} style={{ minWidth: "16rem", flex: 1 }}>
          <span className={styles.sliderHead}><span>Denoising step</span><span className={styles.sliderValue}>{k} of {K}</span></span>
          <input type="range" min={0} max={K} value={k} onChange={(e) => { setPlaying(false); setK(Number(e.target.value)); }} />
        </label>
      </div>
    </div>
  );
}
