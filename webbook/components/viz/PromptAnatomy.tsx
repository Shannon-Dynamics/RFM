"use client";
import { useMemo, useState } from "react";
import type { Recipe } from "@/lib/sim/reactive";
import styles from "./viz.module.css";

// The example prompt printed in the π0.7 paper (arXiv 2604.15483, section E), slot by slot.
const SLOTS = [
  { text: "<Multi-view observation>", kind: "what the cameras see now", detail: "Images from every camera on the robot. Always present." },
  { text: "<Multi-view subgoals>", kind: "how: a picture of the next step", detail: "Generated images of what the scene should look like after the current subtask. At inference they can come from a world model; training randomly drops them, so the model also runs without." },
  { text: "Task: peel vegetables.", kind: "what", detail: "The overall instruction, as in every VLA." },
  { text: "Subtask: pick up the peeler.", kind: "what, in detail", detail: "The current step, so a higher-level policy or a person can coach the model step by step." },
  { text: "Speed: 8000.", kind: "how: episode metadata", detail: "The episode's length in timesteps, binned to the nearest 500. Prompting for a short episode asks for fast execution." },
  { text: "Quality: 5.", kind: "how: episode metadata", detail: "A human annotator's score from 1 to 5, with 5 the best. Prompting for 5 asks for the best behaviour the data contains." },
  { text: "Mistake: false.", kind: "how: segment metadata", detail: "Whether a segment contains a mistake, such as a failed grasp or the wrong subtask. Annotated coarsely by humans." },
  { text: "Control Mode: joint.", kind: "how: control modality", detail: "Joint-level or end-effector actions, chosen per task at run time." },
  { text: "<Proprioception>", kind: "the robot's own state", detail: "Joint angles, as in every VLA." },
];

const RECIPES: { id: Recipe; label: string; prompt: string }[] = [
  { id: "language", label: "Task only", prompt: "train on everything, prompt with the task" },
  { id: "filter", label: "Filter failures", prompt: "drop episodes labelled as mistakes" },
  { id: "metadata", label: "Metadata prompt", prompt: "train on everything, prompt with Mistake: false" },
];

// Two fixed permutations of 100 episodes, so the grid is the same on every load.
const perm = (seed: number) => {
  const p = Array.from({ length: 100 }, (_, i) => i);
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  return p;
};
const P1 = perm(37), P2 = perm(59);

/** Figure 5.4: π0.7's prompt, and a toy of why describing "how" lets a model keep its failures. */
export function PromptAnatomy() {
  const [slot, setSlot] = useState(6);
  const [recipe, setRecipe] = useState<Recipe>("metadata");
  const [fail, setFail] = useState(30);
  const [acc, setAcc] = useState(90);

  const eps = useMemo(() => {
    const nMist = Math.round(fail);
    const mistake = new Set(P1.slice(0, nMist));
    const mist = P2.filter((i) => mistake.has(i)), clean = P2.filter((i) => !mistake.has(i));
    const wrong = new Set([...mist.slice(0, Math.round(mist.length * (1 - acc / 100))), ...clean.slice(0, Math.round(clean.length * (1 - acc / 100)))]);
    return Array.from({ length: 100 }, (_, i) => {
      const m = mistake.has(i), labelledMistake = m !== wrong.has(i);
      const trained = recipe !== "filter" || !labelledMistake;
      const imitated = recipe === "language" ? true : !labelledMistake;
      return { m, trained, imitated };
    });
  }, [fail, acc, recipe]);
  const used = eps.filter((e) => e.trained).length;
  const imitated = eps.filter((e) => e.imitated);
  const mistakeRate = imitated.length ? imitated.filter((e) => e.m).length / imitated.length : 0;
  const s = SLOTS[slot];

  return (
    <div className={styles.stack}>
      <div className={styles.row} role="group" aria-label="Prompt slots in the π0.7 paper's example">
        {SLOTS.map((sl, i) => (
          <button key={sl.text} className={styles.chip} aria-pressed={slot === i} onClick={() => setSlot(i)}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{sl.text}</button>
        ))}
      </div>
      <div className={styles.card} aria-live="polite">
        <p><strong>{s.kind}.</strong> {s.detail}</p>
      </div>

      <p className={styles.note}><strong>Toy model:</strong> 100 collected episodes, some with mistakes. A generative policy imitates the episodes that match its prompt.</p>
      <div className={styles.segmented} role="group" aria-label="Training recipe">
        {RECIPES.map((r) => <button key={r.id} aria-pressed={recipe === r.id} onClick={() => setRecipe(r.id)}>{r.label}</button>)}
      </div>
      <div className={styles.split}>
        <svg className={styles.svg} viewBox="0 0 420 236" role="img"
          aria-label={`${RECIPES.find((r) => r.id === recipe)!.label}: trains on ${used} of 100 episodes; ${(mistakeRate * 100).toFixed(1)} percent of the behaviour it imitates contains a mistake.`}>
          {eps.map((e, i) => {
            const x = 6 + (i % 20) * 20.4, y = 6 + Math.floor(i / 20) * 40;
            return (
              <g key={i}>
                <rect x={x} y={y} width="16" height="32" rx="2"
                  fill={!e.trained ? "none" : e.imitated ? "var(--fam-reactive)" : "var(--surface-2)"}
                  stroke={!e.trained ? "var(--ink-3)" : e.imitated ? "var(--fam-reactive)" : "var(--rule-strong)"}
                  strokeDasharray={e.trained ? undefined : "3 2"} />
                {e.m && <path d={`M ${x + 3} ${y + 11} l 10 10 m 0 -10 l -10 10`} stroke={e.trained && e.imitated ? "var(--surface)" : "var(--ink)"} strokeWidth="2.2" />}
              </g>
            );
          })}
          <text x="6" y="222" fontSize="12" fill="var(--ink-2)">
            {RECIPES.find((r) => r.id === recipe)!.prompt}
          </text>
        </svg>
        <dl className={styles.readout}>
          <div><dt>Episodes trained on</dt><dd>{used} of 100</dd></div>
          <div><dt>Imitated behaviour that is a mistake</dt><dd>{(mistakeRate * 100).toFixed(1)}%<small>among episodes matching the prompt</small></dd></div>
        </dl>
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span style={{ width: 10, height: 18, background: "var(--fam-reactive)", borderRadius: 2 }} />trained on and imitated</span>
        <span className={styles.legendItem}><span style={{ width: 10, height: 18, background: "var(--surface-2)", border: "1px solid var(--rule-strong)", borderRadius: 2 }} />trained on, not imitated</span>
        <span className={styles.legendItem}><span style={{ width: 10, height: 18, border: "1px dashed var(--ink-3)", borderRadius: 2 }} />discarded</span>
        <span className={styles.legendItem}><strong aria-hidden="true">×</strong> contains a mistake</span>
      </div>
      <div className={styles.sliders}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Episodes with a mistake</span><span className={styles.sliderValue}>{fail}%</span></span>
          <input type="range" min={0} max={60} step={5} value={fail} onChange={(e) => setFail(Number(e.target.value))} />
        </label>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Annotator accuracy</span><span className={styles.sliderValue}>{acc}%</span></span>
          <input type="range" min={70} max={100} step={5} value={acc} onChange={(e) => setAcc(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
