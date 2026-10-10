import { FourComponents, type Style } from "@/components/viz/FourComponents";
import css from "./matrix.module.css";

type Use = "in" | "out" | "both" | "train";
const COLS = ["RGB video", "Depth, points, normals", "Gaussians", "Particles or physics", "Touch", "Audio"] as const;

// What each model consumes and predicts, from its abstract (arXiv IDs in the source line).
const ROWS: { model: string; date: string; kind: string; cells: Partial<Record<(typeof COLS)[number], Use>> }[] = [
  { model: "SpatialVLA", date: "Jan 2025", kind: "3D-aware VLA", cells: { "RGB video": "in", "Depth, points, normals": "in" } },
  { model: "GeoVLA", date: "Aug 2025", kind: "3D-aware VLA", cells: { "RGB video": "in", "Depth, points, normals": "in" } },
  { model: "PIN-WM", date: "Apr 2025", kind: "physics-informed world model", cells: { "RGB video": "in", Gaussians: "train", "Particles or physics": "both" } },
  { model: "ManiGaussian++", date: "Jun 2025", kind: "Gaussian world model", cells: { "RGB video": "in", Gaussians: "out" } },
  { model: "ParticleFormer", date: "Jun 2025", kind: "point-cloud world model", cells: { "Depth, points, normals": "both" } },
  { model: "GWM", date: "Aug 2025", kind: "Gaussian world model", cells: { "RGB video": "in", Gaussians: "out" } },
  { model: "PhysWorld", date: "Nov 2025", kind: "video to physics", cells: { "RGB video": "both", "Particles or physics": "out" } },
  { model: "Audio-WM", date: "Dec 2025", kind: "audio world model", cells: { Audio: "both" } },
  { model: "PointWorld", date: "Jan 2026", kind: "3D world model", cells: { "RGB video": "in", "Depth, points, normals": "both" } },
  { model: "VT-WM", date: "Feb 2026", kind: "visuo-tactile world model", cells: { "RGB video": "both", Touch: "both" } },
  { model: "Cloth-WM", date: "Feb 2026", kind: "world model for cloth", cells: { "Depth, points, normals": "in" } },
  { model: "4D-WAM", date: "Aug 2026", kind: "world-action model", cells: { "RGB video": "both", "Depth, points, normals": "train" } },
  { model: "4DGS-WAM", date: "Aug 2026", kind: "object-centric WAM", cells: { "RGB video": "in", Gaussians: "both" } },
];

const LABEL: Record<Use, string> = { in: "consumes", out: "predicts", both: "consumes and predicts", train: "training signal only" };

/** Figure 9.3: which representation each model reads, predicts, or only learns from. */
export function GeometryMatrix() {
  return (
    <div className={css.wrap}>
      <table className={css.table}>
        <thead>
          <tr><th scope="col">Model</th>{COLS.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.model}>
              <th scope="row"><span className={css.model}>{r.model}</span><span className={css.meta}>{r.date}, {r.kind}</span></th>
              {COLS.map((c) => {
                const u = r.cells[c];
                return <td key={c} title={u ? `${r.model} ${LABEL[u]} ${c.toLowerCase()}` : undefined}>
                  {u ? <span className={css.mark} data-use={u} aria-label={LABEL[u]} /> : <span className={css.none} aria-label="not used" />}
                </td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={css.key}>
        {(Object.keys(LABEL) as Use[]).map((u) => <li key={u}><span className={css.mark} data-use={u} aria-hidden="true" />{LABEL[u]}</li>)}
      </ul>
    </div>
  );
}

const GEOMETRY: Style[] = [
  { id: "vla3d", label: "3D-aware VLA", examples: "SpatialVLA, GeoVLA", train: ["policy"], infer: [["policy"]],
    note: "Geometry enters only as input: depth or points help the policy, and nothing about the future is predicted. A reactive VLA with better eyes." },
  { id: "plan", label: "Geometric world model, then plan", examples: "ParticleFormer, PointWorld, PIN-WM", train: ["forward"], infer: [["forward"]],
    note: "Learns how points, particles or rigid bodies move under an action, then searches for actions with model predictive control or trains a policy in it." },
  { id: "aux", label: "Geometry as a training signal", examples: "4D-WAM, GWM as an auxiliary", train: ["policy", "planning"], infer: [["policy", "planning"]],
    note: "A video world-action model is trained to agree with 3D trajectory fields or Gaussian futures, and runs on video as before." },
  { id: "objwam", label: "Object-centric WAM", examples: "4DGS-WAM", train: ["policy", "forward"], infer: [["policy"], ["forward"]],
    note: "A policy proposes actions; a world model moves only the dynamic objects' Gaussian splats, reusing the static background it has already seen." },
];

/** Figure 9.5. */
export function GeometryFourComponents() {
  return <FourComponents modes={GEOMETRY} initial="plan" futures="Future geometry" futuresSym="points, splats, particles" />;
}
