// Reported dataset sizes in hours, as each source states them. "vendor" marks numbers a company
// reports about its own data in a post or report, tagged as claims in the text.

export type Layer = "Robot trajectories" | "Human activity" | "Internet video" | "Synthetic and capture";

export interface Sized { name: string; hours: number; layer: Layer; vendor: boolean; note: string; source: string; plus?: boolean }

export const SIZES: Sized[] = [
  { name: "DROID", hours: 350, layer: "Robot trajectories", vendor: false, note: "76,000 teleoperated trajectories across 564 scenes; three cameras, depth and language.", source: "Khazatsky et al. 2024, arXiv 2403.12945" },
  { name: "TRI-Ramen (TRI's own)", hours: 545, layer: "Robot trajectories", vendor: false, note: "TRI's internally collected share of its LBM pretraining mixture.", source: "TRI LBM Team 2025, arXiv 2507.05331" },
  { name: "MolmoAct2 bimanual", hours: 720, layer: "Robot trajectories", vendor: false, note: "Teleoperated bimanual trajectories, released with the model.", source: "Fang et al. 2026, arXiv 2605.02881" },
  { name: "TRI LBM mixture", hours: 1695, layer: "Robot trajectories", vendor: false, note: "TRI-Ramen plus about 1,150 hours of curated Open X-Embodiment data.", source: "TRI LBM Team 2025, arXiv 2507.05331" },
  { name: "LingBot-VLA 2.0 robot", hours: 50000, layer: "Robot trajectories", vendor: false, note: "Robot trajectories across 20 configurations in a 60,000-hour pretraining set.", source: "Wu et al. 2026, arXiv 2607.06403" },
  { name: "EgoDex", hours: 829, layer: "Human activity", vendor: false, note: "Egocentric video at 30 FPS with tracked 3D hands: 90 million frames, 338,000 demonstrations.", source: "Hoque et al. 2025, arXiv 2505.11709" },
  { name: "Ego4D", hours: 3670, layer: "Human activity", vendor: false, note: "Daily-life egocentric video from 931 camera wearers; not collected for robots.", source: "Grauman et al. 2021, arXiv 2110.07058" },
  { name: "LingBot-VLA 2.0 human", hours: 10000, layer: "Human activity", vendor: false, note: "Egocentric human video in the same 60,000-hour pretraining set.", source: "Wu et al. 2026, arXiv 2607.06403" },
  { name: "EgoScale", hours: 20854, layer: "Human activity", vendor: true, note: "Action-labelled egocentric video with wrist and hand actions.", source: "Zheng et al. 2026, arXiv 2602.16710" },
  { name: "DreamDojo", hours: 44000, layer: "Human activity", vendor: false, note: "Egocentric human video for world-model pretraining.", source: "Gao et al. 2026, arXiv 2602.06949" },
  { name: "GEN-0", hours: 270000, layer: "Human activity", vendor: true, note: "Real-world manipulation data from low-cost wearable devices on humans, growing by 10,000 hours a week.", source: "Generalist AI, November 2025 and April 2026", plus: true },
  { name: "GEN-1", hours: 500000, layer: "Human activity", vendor: true, note: "Half a million hours of real-world data, the base model trained without robot data.", source: "Generalist AI, 2 April 2026" },
  { name: "Dyna-2", hours: 1000000, layer: "Human activity", vendor: true, note: "Egocentric human video for a world-action model.", source: "Dyna Robotics, August 2026", plus: true },
  { name: "V-JEPA 2", hours: 1000000, layer: "Internet video", vendor: false, note: "Internet video and images for an action-free JEPA.", source: "Assran et al. 2025, arXiv 2506.09985", plus: true },
  { name: "Cosmos raw video", hours: 20000000, layer: "Internet video", vendor: false, note: "About 20 million hours of raw video, curated to about 100 million clips.", source: "NVIDIA 2025, arXiv 2501.03575" },
  { name: "PointWorld", hours: 500, layer: "Synthetic and capture", vendor: false, note: "About 2 million real and simulated 3D trajectories.", source: "Huang et al. 2026, arXiv 2601.03782" },
  { name: "SONIC motion capture", hours: 700, layer: "Synthetic and capture", vendor: false, note: "More than 100 million frames of human motion capture for a whole-body controller.", source: "Luo et al. 2025, arXiv 2511.07820" },
  { name: "GR00T synthetic", hours: 6500, layer: "Synthetic and capture", vendor: true, note: "780,000 generated trajectories, which NVIDIA equates to 6,500 hours of demonstrations, made in 11 hours.", source: "NVIDIA press release, 18 March 2025" },
];

export const LAYERS: Layer[] = ["Robot trajectories", "Human activity", "Internet video", "Synthetic and capture"];
