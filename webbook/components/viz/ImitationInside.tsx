"use client";
import { useState } from "react";
import type { FamilyId } from "@/content/book";
import styles from "./viz.module.css";

type Prim = "denoise" | "chunk";

const MODELS: { name: string; date: string; family: FamilyId; ch: number; around: string; denoise: string | null; chunk: string | null }[] = [
  { name: "Diffusion Policy", date: "March 2023", family: "lbm", ch: 11, around: "a vision encoder, nothing else",
    denoise: "denoising diffusion over actions", chunk: "a sequence of actions, executed with receding horizon control" },
  { name: "ACT", date: "April 2023", family: "lbm", ch: 11, around: "a transformer trained as a variational autoencoder",
    denoise: null, chunk: "chunks of k actions, averaged across overlapping chunks (figure 11.3)" },
  { name: "Octo", date: "May 2024", family: "lbm", ch: 11, around: "a transformer trained on 800,000 Open X-Embodiment trajectories",
    denoise: "a diffusion action head", chunk: "a chunk of several consecutive actions" },
  { name: "TRI LBM", date: "July 2025", family: "lbm", ch: 11, around: "CLIP image and text encoders, no language model",
    denoise: "a diffusion transformer", chunk: "16 steps of 20-dimensional actions" },
  { name: "π0", date: "October 2024", family: "reactive", ch: 5, around: "a 3B vision-language model",
    denoise: "a 300M flow-matching action expert", chunk: "H = 50 future actions" },
  { name: "GR00T N1", date: "March 2025", family: "reactive", ch: 5, around: "a VLM as System 2",
    denoise: "a flow-matching diffusion transformer as System 1", chunk: "action chunks at 120 Hz" },
  { name: "DreamZero", date: "February 2026", family: "wam", ch: 6, around: "a 14B video generation model",
    denoise: "video and action tokens denoised together", chunk: "an action chunk alongside the predicted video" },
  { name: "ViPRA", date: "November 2025", family: "latent", ch: 7, around: "a video-language model predicting latent actions",
    denoise: "a flow-matching decoder", chunk: "chunked decoding to robot actions at up to 22 Hz" },
];

/** Figure 11.1: two imitation-learning primitives, and where they now live. */
export function ImitationInside() {
  const [prim, setPrim] = useState<Prim>("denoise");
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Primitive">
        <button aria-pressed={prim === "denoise"} onClick={() => setPrim("denoise")}>Denoising action head</button>
        <button aria-pressed={prim === "chunk"} onClick={() => setPrim("chunk")}>Action chunks</button>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 340" role="img"
        aria-label={`Eight models, four of them large behavior models and four from other families. ${prim === "denoise" ? "A denoising action head" : "Action chunking"} appears in ${MODELS.filter((m) => m[prim]).length} of them.`}>
        {MODELS.map((m, i) => {
          const x = (i % 4) * 215, y = Math.floor(i / 4) * 172;
          const has = m[prim];
          const col = `var(--fam-${m.family})`;
          return (
            <g key={m.name}>
              <rect x={x + 2} y={y + 2} width={205} height={160} rx="8" fill="var(--surface)" stroke="var(--rule-strong)" />
              <rect x={x + 2} y={y + 2} width={6} height={160} rx="3" fill={col} />
              <text x={x + 18} y={y + 24} fontSize="15" fontWeight="700" fill="var(--ink)">{m.name}</text>
              <text x={x + 18} y={y + 42} fontSize="11.5" fill="var(--ink-3)">{m.date}, chapter {m.ch}</text>
              <foreignObject x={x + 16} y={y + 50} width={184} height={46}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: 1.3, color: "var(--ink-2)" }}>{m.around}</div>
              </foreignObject>
              <rect x={x + 16} y={y + 100} width={182} height={52} rx="6"
                fill={has ? "var(--fam-lbm)" : "none"} stroke={has ? "var(--fam-lbm)" : "var(--rule-strong)"} strokeDasharray={has ? undefined : "4 3"} />
              <foreignObject x={x + 22} y={y + 104} width={172} height={46}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, lineHeight: 1.3, color: has ? "var(--surface)" : "var(--ink-3)", fontWeight: has ? 600 : 400 }}>
                  {has ?? "not used"}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        {(["lbm", "reactive", "wam", "latent"] as FamilyId[]).map((f) => (
          <span key={f} className={styles.legendItem}><span style={{ width: 6, height: 14, borderRadius: 3, background: `var(--fam-${f})` }} />
            {f === "lbm" ? "large behavior model" : f === "reactive" ? "reactive VLA" : f === "wam" ? "world-action model" : "latent-action model"}</span>
        ))}
      </div>
    </div>
  );
}
