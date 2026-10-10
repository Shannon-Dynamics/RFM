"use client";
import { useState } from "react";
import { FAMILIES, type FamilyId } from "@/content/book";
import styles from "@/components/viz/viz.module.css";
import css from "./domains.module.css";

const DOMAINS = ["Tabletop and bimanual", "Humanoids", "Mobile manipulation and navigation", "Autonomous driving", "Industrial and logistics", "Mobile service robots"];
type Cell = { level: 1 | 2; note: string };
// 2: a main approach in this book's sources; 1: used or researched; absent: not in this book's sources.
const CELLS: Partial<Record<FamilyId, Partial<Record<number, Cell>>>> = {
  reactive: { 0: { level: 2, note: "The VLA home turf: π0 to π0.7, GR00T, OpenVLA; most deployments start here (chapter 5)." },
    1: { level: 2, note: "Helix's fast-slow split and GR00T N1.7 drive humanoid upper bodies and, through SONIC, whole bodies." },
    2: { level: 1, note: "DreamTrajectory predicts whole-body action chunks for mobile manipulation, guided by an end-effector trajectory." },
    4: { level: 2, note: "Warehouse picking with RFM-1 and at least eleven commercial VLA deployments by early 2026 (industry survey)." },
    5: { level: 1, note: "The 2026 systematic review covers VLAs for language-conditioned control on mobile service robots." } },
  wam: { 0: { level: 1, note: "DreamZero, LingBot-VA and Cosmos Policy on manipulation benchmarks (chapter 6)." },
    1: { level: 1, note: "GR00T N2 was previewed as a world-action model for humanoids, with end-of-2026 availability as NVIDIA's target." },
    2: { level: 1, note: "DreamTrajectory aligns its predicted trajectory with a world model to check intended against realised motion." } },
  latent: { 0: { level: 1, note: "LAPA, ViPRA and VLA-JEPA (chapter 7)." },
    1: { level: 1, note: "GR00T N1.7 emits latent action tokens that the SONIC controller turns into joint commands." },
    2: { level: 1, note: "X-Mobility learns navigation with a latent world model decoupled from the action policy." } },
  simulator: { 0: { level: 1, note: "DreamGen and Cosmos as data engines (chapter 8)." },
    1: { level: 1, note: "DreamGen taught a humanoid 22 new behaviours from one task's teleoperation." },
    2: { level: 1, note: "Navigation World Models imagine trajectories and rank them before moving." },
    3: { level: 2, note: "GAIA-1, GAIA-2 and DriveDreamer generate driving scenarios, common and rare, for training and testing." },
    4: { level: 1, note: "Synthetic motion data for industrial humanoid deployments (GR00T blueprint, vendor claim)." } },
  geometry: { 0: { level: 1, note: "PointWorld, ParticleFormer, GWM (chapter 9)." },
    3: { level: 2, note: "OccWorld forecasts 3D occupancy, the representation driving stacks already use." } },
  reasoning: { 0: { level: 1, note: "Gemini Robotics-ER over manipulation VLAs (chapter 10)." },
    1: { level: 1, note: "Gemini Robotics ER 2 coordinating Apptronik's Apollo 2 humanoid with a Franka mobile manipulator (vendor demonstration)." },
    2: { level: 1, note: "DualVLN (InternVLA-N1): a VLM plans mid-term waypoints, a fast policy drives." },
    4: { level: 1, note: "Instrument reading on Boston Dynamics' Spot for facility inspection (vendor claim)." },
    5: { level: 2, note: "LLMs and VLMs turning instructions into robot actions are the review's main thread." } },
  lbm: { 0: { level: 2, note: "Diffusion Policy and ACT remain the bimanual teleoperation workhorses (chapter 11)." },
    1: { level: 1, note: "SONIC: a motion-tracking controller scaled on 700 hours of motion capture." },
    4: { level: 1, note: "TRI's LBMs, evaluated with blind A/B trials on dexterous tasks." } },
};

/** Figure 16.1: which families are used in which domains, in this book's sources. */
export function DomainMatrix() {
  const [sel, setSel] = useState<[FamilyId, number]>(["simulator", 3]);
  const cell = CELLS[sel[0]]?.[sel[1]];
  return (
    <div className={styles.stack}>
      <div className={css.scroll}>
        <table className={css.table}>
          <thead><tr><th scope="col" />{DOMAINS.map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
          <tbody>
            {FAMILIES.map((f) => (
              <tr key={f.id} style={{ "--fam": `var(--fam-${f.id})` } as React.CSSProperties}>
                <th scope="row"><span className={css.dot} aria-hidden="true" />{f.short}</th>
                {DOMAINS.map((d, j) => {
                  const c = CELLS[f.id]?.[j];
                  return (
                    <td key={d}>
                      {c ? (
                        <button className={css.cell} data-level={c.level} aria-pressed={sel[0] === f.id && sel[1] === j}
                          aria-label={`${f.short} in ${d}: ${c.level === 2 ? "a main approach" : "used"}. ${c.note}`} onClick={() => setSel([f.id, j])} />
                      ) : <span className={css.none} aria-label="not in this book's sources" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span className={css.key} data-level="2" />a main approach</span>
        <span className={styles.legendItem}><span className={css.key} data-level="1" />used or researched</span>
        <span className={styles.legendItem}><span className={css.none} />not in this book&rsquo;s sources</span>
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{FAMILIES.find((f) => f.id === sel[0])!.short} in {DOMAINS[sel[1]].toLowerCase()}</h4>
        <p>{cell?.note}</p>
      </div>
    </div>
  );
}
