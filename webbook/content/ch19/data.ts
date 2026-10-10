// Chapter 19 data. The evidence table mirrors rust/ch19-scenarios (evidence_table).
export const SCENARIOS = ["Consolidation around reactive VLAs", "Convergence on world-action models", "Resurgence of latent and geometric prediction"];
export const SHORT = ["VLA consolidation", "WAM convergence", "Latent and geometric"];

export type Effect = "S" | "U" | "-";
export const EVIDENCE: { result: string; effects: [Effect, Effect, Effect] }[] = [
  { result: "An independent real-robot study finds no robustness gap between VLAs and WAMs at matched data", effects: ["S", "U", "-"] },
  { result: "WAMs' robustness advantage replicates outside the labs that reported it", effects: ["U", "S", "U"] },
  { result: "A GR00T N2-class world-action model ships at control rates on robot hardware", effects: ["U", "S", "U"] },
  { result: "VLA inference stays cheap while video-generating WAMs do not get cheaper", effects: ["S", "U", "-"] },
  { result: "Steerability, memory and RL post-training close the long-horizon gap in VLAs", effects: ["S", "U", "-"] },
  { result: "Training with video and acting without it becomes the default in new releases", effects: ["-", "S", "-"] },
  { result: "A matched-compute comparison favours latent targets over pixel prediction", effects: ["-", "U", "S"] },
  { result: "A shared benchmark for geometry-first models appears", effects: ["-", "-", "S"] },
  { result: "Latent-action pretraining on human video beats teleoperation-only pretraining, independently", effects: ["U", "-", "S"] },
  { result: "Pixel world models end up used mainly as simulators, not as policies", effects: ["-", "U", "S"] },
];
