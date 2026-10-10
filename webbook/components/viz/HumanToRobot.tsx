"use client";
import { ResponsiveLine } from "@nivo/line";
import { useMemo, useState } from "react";
import { apply, decoderError, exampleRobot, fitDecoder, noise, type V2 } from "@/lib/sim/latent";
import { nivoTheme, useTokens } from "./useTokens";
import styles from "./viz.module.css";

const STAGES = [
  { id: "lam", title: "Learn latent actions", consumes: "internet and human video, no actions",
    text: "A small model looks at pairs of frames and compresses what changed into a latent action, trained so that a forward model can predict the next frame from the current one plus that code.",
    examples: "Genie (February 2024) learned latent actions from unlabelled Internet video; LAPA (October 2024) uses a VQ-VAE codebook; AdaWorld (March 2025) builds an adaptable world model on them; DreamDojo (February 2026) uses continuous latent actions over 44,000 hours of egocentric human video.",
    cites: "genie,lapa,adaworld,dreamdojo" },
  { id: "pre", title: "Pretrain on latent actions", consumes: "the same video, now labelled with latent actions",
    text: "Every clip now has an action-like label, so a vision-language model can be pretrained to predict latent actions from an image and an instruction, exactly as a VLA predicts real ones.",
    examples: "LAPA pretrains a latent VLA this way; ViPRA trains a video-language model to predict both future frames and motion-centric latent actions.",
    cites: "lapa,vipra" },
  { id: "dec", title: "Decode for one robot", consumes: "a few hundred action-labelled robot demonstrations",
    text: "A latent action means 'move right' in the camera's view, not 'turn joint 3 by 0.1 rad'. A small decoder, trained per robot, learns that mapping.",
    examples: "LAPA fine-tunes on small-scale robot data; ViPRA's chunked flow-matching decoder needs 100 to 200 teleoperated demonstrations and controls at up to 22 Hz.",
    cites: "lapa,vipra" },
];

const NOISES = [0.02, 0.05, 0.1];
const COUNTS = [2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];

function meanError(n: number, sigma: number) {
  const m = exampleRobot();
  let sum = 0, ok = 0;
  for (let trial = 0; trial < 40; trial++) {
    const pairs: [V2, V2][] = Array.from({ length: n }, (_, i) => {
      const a = Math.PI * (noise(100 + trial, i) + 1);
      const z: V2 = [Math.cos(a), Math.sin(a)];
      const t = apply(m, z);
      return [z, [t[0] + sigma * noise(trial, 2 * i), t[1] + sigma * noise(trial, 2 * i + 1)]];
    });
    const fit = fitDecoder(pairs);
    if (fit) { sum += decoderError(fit, m); ok++; }
  }
  return sum / Math.max(1, ok);
}

/** Figure 7.3: three stages from action-free video to one robot's commands, and the cost of the last. */
export function HumanToRobot() {
  const t = useTokens();
  const [stage, setStage] = useState("dec");
  const st = STAGES.find((s) => s.id === stage)!;
  const data = useMemo(() => NOISES.map((s) => ({
    id: `label noise ${s}`,
    data: COUNTS.map((n) => ({ x: n, y: meanError(n, s) })),
  })), []);

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 132" role="group" aria-label="Three stages from video to robot control">
        <defs>
          <marker id="hr-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const x = i * 290, on = s.id === stage;
          return (
            <g key={s.id} tabIndex={0} role="button" aria-pressed={on} style={{ cursor: "pointer" }}
              onClick={() => setStage(s.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStage(s.id)}>
              <rect x={x + 2} y={8} width={250} height={64} rx="8" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
              <text x={x + 127} y={36} textAnchor="middle" fontSize="15" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{i + 1}. {s.title}</text>
              <text x={x + 127} y={56} textAnchor="middle" fontSize="12" fill={on ? "var(--surface)" : "var(--ink-2)"}>select for details</text>
              <rect x={x + 2} y={86} width={250} height={38} rx="4" fill="none" stroke="var(--rule-strong)" strokeDasharray="4 3" />
              <text x={x + 127} y={102} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)">consumes</text>
              <text x={x + 127} y={117} textAnchor="middle" fontSize="12" fill="var(--ink)">{s.consumes}</text>
              {i < 2 && <path d={`M ${x + 256} 40 L ${x + 288} 40`} stroke="var(--ink)" strokeWidth="1.5" markerEnd="url(#hr-head)" />}
            </g>
          );
        })}
      </svg>
      <div className={styles.card} aria-live="polite">
        <h4>{st.title}</h4>
        <p>{st.text}</p>
        <p className={styles.cardMeta}>{st.examples}</p>
      </div>
      <p className={styles.note}><strong>Toy model of stage 3:</strong> fitting a two-by-two linear decoder from labelled pairs. Error of the fitted decoder, averaged over 40 random draws, against the number of labelled pairs.</p>
      <div style={{ height: 240 }} role="img" aria-label="Decoder error falls as labelled pairs increase, and noisier labels need more pairs for the same error.">
        <ResponsiveLine
          data={data}
          margin={{ top: 10, right: 150, bottom: 44, left: 56 }}
          xScale={{ type: "log", base: 2, min: 2, max: 64 }}
          yScale={{ type: "linear", min: 0, max: "auto" }}
          axisBottom={{ legend: "Labelled robot pairs", legendOffset: 36, legendPosition: "middle", tickValues: [2, 4, 8, 16, 32, 64] }}
          axisLeft={{ legend: "Decoder error", legendOffset: -46, legendPosition: "middle", tickValues: 4 }}
          colors={[t["ink-3"], t["ink-2"], t.ink]}
          lineWidth={2}
          pointSize={6}
          enableGridX={false}
          useMesh
          legends={[{ anchor: "right", direction: "column", translateX: 140, itemWidth: 130, itemHeight: 20, symbolSize: 10 }]}
          theme={nivoTheme(t)}
          animate={false}
        />
      </div>
    </div>
  );
}
