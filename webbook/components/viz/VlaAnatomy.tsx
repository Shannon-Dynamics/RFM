"use client";
import { useEffect, useState } from "react";
import { sequentialPasses } from "@/lib/sim/reactive";
import styles from "./viz.module.css";

type Mode = "tokens" | "denoising" | "dual";

const HORIZON = 50, DOF = 14, K = 10;

const MODES: Record<Mode, { label: string; head: string; passes: string; crosses: string; models: string; note: string }> = {
  tokens: {
    label: "Token head",
    head: "the backbone's own decoder writes action tokens, one pass per token",
    passes: `${sequentialPasses({ kind: "tokens" }, HORIZON, DOF)} decoder passes`,
    crosses: "nothing new: actions are words in the backbone's vocabulary",
    models: "RT-2 (July 2023), OpenVLA (June 2024), π0-FAST (January 2025), OpenVLA-OFT (February 2025, decodes in parallel)",
    note: "Simple and reuses the language model unchanged, but the cost grows with every step and dimension. FAST compresses the tokens; OpenVLA-OFT decodes them all at once.",
  },
  denoising: {
    label: "Action expert",
    head: "a separate, smaller network turns noise into the whole chunk in K steps",
    passes: `${sequentialPasses({ kind: "denoising", steps: K }, HORIZON, DOF)} expert passes`,
    crosses: "the backbone's features, read by the expert through attention",
    models: "π0 (October 2024), GR00T N1 (March 2025), SmolVLA (June 2025), Xiaomi-Robotics-0 (February 2026), π0.7 and GR00T N1.7 (April 2026)",
    note: "The cost depends on the number of denoising steps, not on the chunk length. Continuous actions, many modes, smooth motion.",
  },
  dual: {
    label: "Fast-slow split",
    head: "two models on two clocks: a slow reasoner and a fast controller",
    passes: "System 1 every 5 ms; System 2 every 110 to 140 ms",
    crosses: "a latent vector: the slow model's summary of what to do",
    models: "Helix (February 2025: 7 to 9 Hz over 200 Hz), GR00T N1 (March 2025: 10 Hz over 120 Hz), Gemini Robotics (cloud backbone, on-robot decoder), DuoCore-FS (December 2025)",
    note: "The controller reacts to fresh images while the reasoner is still thinking. Figure 5.2 simulates what this buys.",
  },
};

// A reach: the chunk every head should end up producing.
const target = (s: number) => 0.8 * (3 * s * s - 2 * s * s * s) - 0.4 + 0.12 * Math.sin(2 * Math.PI * s);
const noise = (i: number) => Math.sin(i * 12.9898) * 43758.5453 % 1;

/** Figure 5.1: one backbone, three ways to get an action chunk out of it. */
export function VlaAnatomy() {
  const [mode, setMode] = useState<Mode>("denoising");
  const [tick, setTick] = useState(0);
  const m = MODES[mode];

  useEffect(() => {
    setTick(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTick(1000); return; }
    const id = window.setInterval(() => setTick((t) => t + 1), mode === "dual" ? 40 : 160);
    return () => window.clearInterval(id);
  }, [mode]);

  // Tokens: 14 visible tokens (one step of 14 dimensions), then a pause. Denoising: K steps, then a pause.
  const tokensShown = mode === "tokens" ? Math.min(14, tick % 20) : 14;
  const k = mode === "denoising" ? Math.min(K, tick % (K + 6)) : K;
  const done = mode === "tokens" ? tokensShown === 14 : mode === "denoising" ? k === K : true;
  const sweep = mode === "dual" ? (tick % 100) / 100 : 0; // one simulated second, slowed down four times

  const chunkPath = (x0: number, y0: number, w: number, h: number, tau: number, n = 24) =>
    Array.from({ length: n }, (_, i) => {
      const s = i / (n - 1);
      const v = Math.max(-0.85, Math.min(0.85, tau * target(s) + (1 - tau) * (noise(i + 3) - 0.5) * 1.6));
      return `${i ? "L" : "M"}${(x0 + s * w).toFixed(1)},${(y0 + h / 2 - v * h * 0.55).toFixed(1)}`;
    }).join(" ");

  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Action head">
        {(Object.keys(MODES) as Mode[]).map((id) => (
          <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{MODES[id].label}</button>
        ))}
      </div>
      <svg className={styles.svg} viewBox={`0 0 860 ${mode === "dual" ? 290 : 244}`} role="img"
        aria-label={`Vision-language-action model with a ${m.label.toLowerCase()}: ${m.head}. A ${HORIZON}-step chunk of ${DOF} dimensions needs ${m.passes}.`}>
        <defs>
          <marker id="va-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
          </marker>
        </defs>

        {/* Inputs */}
        <text x="16" y="22" fontSize="13" fill="var(--ink-2)">camera images</text>
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={16 + i * 84} y={30} width={76} height={54} rx="3" fill="var(--surface-2)" stroke="var(--ink-2)" />
            <line x1={16 + i * 84} x2={92 + i * 84} y1={68} y2={68} stroke="var(--rule-strong)" />
            <rect x={40 + i * 84 - i * 10} y={52} width="16" height="16" rx="3" fill="var(--ink-3)" />
          </g>
        ))}
        <text x="16" y="108" fontSize="13" fill="var(--ink-2)">instruction</text>
        <rect x="16" y="116" width="160" height="46" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="96" y="136" textAnchor="middle" fontSize="13" fill="var(--ink)">&ldquo;put the mug</text>
        <text x="96" y="153" textAnchor="middle" fontSize="13" fill="var(--ink)">in the sink&rdquo;</text>
        <text x="16" y="186" fontSize="13" fill="var(--ink-2)">robot state</text>
        <rect x="16" y="194" width="160" height="30" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="96" y="214" textAnchor="middle" fontSize="13" fill="var(--ink)">joint angles</text>
        {[[180, 60], [180, 139], [180, 209]].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} L 222 ${100 + i * 30}`} stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#va-head)" />
        ))}

        {/* Backbone */}
        <rect x="226" y="34" width="200" height="190" rx="10" fill="var(--ink)" />
        <text x="326" y="64" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--surface)">
          {mode === "dual" ? "System 2: VLM" : "VLM backbone"}
        </text>
        <text x="326" y="84" textAnchor="middle" fontSize="12" fill="var(--surface)" opacity="0.8">
          {mode === "dual" ? "slow: reads, reasons" : "pretrained on web"}
        </text>
        <text x="326" y="100" textAnchor="middle" fontSize="12" fill="var(--surface)" opacity="0.8">
          {mode === "dual" ? "7 to 9 Hz in Helix" : "images and text"}
        </text>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={250 + (i % 8) * 20} y={122 + Math.floor(i / 8) * 22} width="14" height="14" rx="2"
            fill="var(--surface)" opacity={i < 8 ? 0.85 : i < 16 ? 0.55 : 0.35} />
        ))}
        <text x="326" y="208" textAnchor="middle" fontSize="12" fill="var(--surface)" opacity="0.8">image, text and state tokens</text>

        {/* Head */}
        {mode === "tokens" && (
          <g>
            <path d="M 428 130 L 470 130" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#va-head)" />
            <text x="474" y="96" fontSize="13" fill="var(--ink-2)">action tokens, one pass each</text>
            {Array.from({ length: 14 }, (_, i) => (
              <g key={i}>
                <rect x={474 + i * 16} y={116} width="13" height="28" rx="2"
                  fill={i < tokensShown ? "var(--fam-reactive)" : "none"} stroke="var(--ink-3)" strokeDasharray={i < tokensShown ? undefined : "3 2"} />
              </g>
            ))}
            <text x="474" y="166" fontSize="12" fill="var(--ink-3)">14 values per step for two arms, each binned to 256 levels</text>
            <text x="474" y="196" fontSize="14" fill="var(--ink)" fontWeight="600">pass {Math.max(1, tokensShown)} of 14 for one step</text>
            <text x="474" y="216" fontSize="12" fill="var(--ink-2)">× 50 steps = 700 passes for a one-second chunk</text>
          </g>
        )}
        {mode === "denoising" && (
          <g>
            <path d="M 428 90 L 470 90" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#va-head)" />
            <text x="436" y="80" fontSize="11" fill="var(--ink-3)">features</text>
            <rect x="474" y="54" width="128" height="72" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="538" y="86" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">action expert</text>
            <text x="538" y="104" textAnchor="middle" fontSize="12" fill="var(--ink-2)">step {k} of {K}</text>
            {Array.from({ length: 5 }, (_, i) => {
              const step = Math.round((i / 4) * K);
              const lit = step <= k;
              return (
                <g key={i} opacity={lit ? 1 : 0.35}>
                  <rect x={474 + i * 44} y={150} width="40" height="44" rx="3" fill="var(--surface)" stroke="var(--rule-strong)" />
                  <path d={chunkPath(477 + i * 44, 152, 34, 40, step / K, 14)} fill="none" stroke="var(--fam-reactive)" strokeWidth="1.5" />
                  <text x={494 + i * 44} y={210} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{step === 0 ? "noise" : `k=${step}`}</text>
                </g>
              );
            })}
            <text x="474" y="232" fontSize="12" fill="var(--ink-2)">same cost for 5 steps or 50</text>
          </g>
        )}
        {mode === "dual" && (
          <g>
            <path d="M 428 110 L 470 110" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 3" fill="none" markerEnd="url(#va-head)" />
            <text x="432" y="100" fontSize="11" fill="var(--ink-3)">latent</text>
            <rect x="474" y="64" width="150" height="96" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="549" y="96" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">System 1</text>
            <text x="549" y="116" textAnchor="middle" fontSize="12" fill="var(--ink-2)">fast: 80M parameters</text>
            <text x="549" y="134" textAnchor="middle" fontSize="12" fill="var(--ink-2)">200 Hz in Helix</text>
            <path d="M 549 40 L 549 62" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#va-head)" />
            <text x="556" y="40" fontSize="11" fill="var(--ink-3)">fresh images</text>
          </g>
        )}

        {/* Output */}
        <path d={mode === "tokens" ? "M 700 130 L 716 130" : mode === "dual" ? "M 626 112 L 716 128" : "M 604 90 L 716 122"} stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#va-head)" />
        <text x="720" y="88" fontSize="13" fill="var(--ink-2)">action chunk</text>
        <rect x="720" y="96" width="124" height="70" rx="4" fill="var(--surface)" stroke="var(--rule-strong)" />
        <path d={chunkPath(726, 100, 112, 62, done ? 1 : 0.15)} fill="none" stroke="var(--fam-reactive)" strokeWidth="2" opacity={done ? 1 : 0.3} />
        <text x="720" y="184" fontSize="12" fill="var(--ink-3)">{HORIZON} × {DOF} numbers</text>

        {/* Clocks, for the fast-slow split */}
        {mode === "dual" && (
          <g>
            <text x="16" y="252" fontSize="12" fill="var(--ink-2)">System 2 updates</text>
            <text x="16" y="276" fontSize="12" fill="var(--ink-2)">System 1 updates</text>
            {Array.from({ length: 8 }, (_, i) => {
              const x = 140 + (i / 8) * 700;
              return <rect key={i} x={x} y={240} width="4" height="16" fill="var(--ink)" opacity={i / 8 <= sweep ? 1 : 0.25} />;
            })}
            {Array.from({ length: 200 }, (_, i) => {
              const x = 140 + (i / 200) * 700;
              return <line key={i} x1={x} x2={x} y1={266} y2={280} stroke="var(--fam-reactive)" opacity={i / 200 <= sweep ? 1 : 0.25} />;
            })}
            <line x1={140 + sweep * 700} x2={140 + sweep * 700} y1={234} y2={286} stroke="var(--ink-2)" />
            <text x="844" y="234" textAnchor="end" fontSize="11" fill="var(--ink-3)">one second, slowed four times</text>
          </g>
        )}
      </svg>
      <div className={styles.split}>
        <div className={styles.card}>
          <p><strong>How the head works.</strong> {m.head}. {m.note}</p>
          <p className={styles.cardMeta}>Examples: {m.models}.</p>
        </div>
        <dl className={styles.readout}>
          <div><dt>Sequential passes for one chunk</dt><dd>{m.passes}<small>{HORIZON} steps × {DOF} dimensions, after the backbone reads the inputs once{mode === "denoising" ? `; π0 uses ${K} steps` : ""}</small></dd></div>
          <div><dt>What crosses into the head</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{m.crosses}</dd></div>
        </dl>
      </div>
    </div>
  );
}
