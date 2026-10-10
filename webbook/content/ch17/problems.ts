// The ten open problems of Book.md chapter 17, shared with chapter 18. Severity and attention are
// the authors' judgement as of October 2026, on a scale of 1 (low) to 3 (high).
import type { FamilyId } from "@/content/book";

export type Maturity = "early" | "promising" | "established";

export interface Problem {
  n: number;
  short: string;
  title: string;
  plain: string;
  failure: string;
  see: string;
  hits: FamilyId[];
  severity: number;
  attention: number;
  solutions: { name: string; maturity: Maturity; who: string; moves: FamilyId[] }[];
}

export const PROBLEMS: Problem[] = [
  { n: 1, short: "Action alignment", title: "Action alignment",
    plain: "Turning a video or latent prior into commands a specific robot can execute, without destroying what the prior learned.",
    failure: "A generated plan that looks right but implies a motion the robot cannot make.", see: "figure 8.4, and the per-robot decoder of figure 7.3",
    hits: ["wam", "latent", "simulator"], severity: 3, attention: 3,
    solutions: [
      { name: "Stage-wise motion-to-action alignment", maturity: "promising", who: "IDM-style WAMs (WAM survey, section VI-A)", moves: ["wam"] },
      { name: "Prior preservation: frozen backbones, residual action heads", maturity: "promising", who: "WAM survey, section VI-A", moves: ["wam", "latent"] },
      { name: "Latent action interfaces with small per-robot decoders", maturity: "promising", who: "LAPA, ViPRA (chapter 7)", moves: ["latent"] },
      { name: "Executability rewards from inverse dynamics", maturity: "early", who: "EVA (chapter 8)", moves: ["simulator", "wam"] }] },
  { n: 2, short: "Factorisation", title: "World-action factorisation",
    plain: "Deciding when to learn futures and actions together, and whether to keep generating futures at test time.",
    failure: "Paying for video generation at every control step for a gain that a training-only objective would have given.", see: "figure 6.6 and the styles of figure 6.2",
    hits: ["wam", "latent"], severity: 2, attention: 2.5,
    solutions: [
      { name: "Video only in training, actions at test time", maturity: "promising", who: "Fast-WAM, GigaWorld-Policy, LingBot-VLA 2.0", moves: ["wam", "reactive"] },
      { name: "Predict representations instead of pixels", maturity: "promising", who: "JEPA-WAM, LaWAM, VLA-JEPA (chapter 7)", moves: ["latent", "wam"] },
      { name: "Distil what the future teaches into a current-only policy", maturity: "early", who: "Privileged Foresight Distillation (April 2026)", moves: ["wam", "reactive"] }] },
  { n: 3, short: "Multi-view consistency", title: "Spatial and multi-view consistency",
    plain: "Making generated futures agree across cameras and with 3D geometry.",
    failure: "Two generated camera views that place the same object in different places.", see: "figure 17.3",
    hits: ["wam", "simulator"], severity: 2.5, attention: 1.8,
    solutions: [
      { name: "Explicit 3D state: points, Gaussians, occupancy", maturity: "promising", who: "PointWorld, GWM, 4DGS-WAM (chapter 9)", moves: ["geometry", "wam"] },
      { name: "Interleaved multi-view decoding", maturity: "early", who: "VLA-MBPO (chapter 8)", moves: ["simulator"] },
      { name: "3D trajectory fields as a training signal", maturity: "early", who: "4D-WAM (chapter 9)", moves: ["wam"] },
      { name: "Cross-view consistency as a verifier for best-of-N", maturity: "early", who: "Test-time scaling for WAMs (July 2026)", moves: ["wam", "geometry"] }] },
  { n: 4, short: "Long-horizon memory", title: "Long-horizon memory",
    plain: "Remembering what has been done over tasks that last many minutes.",
    failure: "A robot ten minutes into cooking that no longer knows whether the stove is on.", see: "figure 14.5",
    hits: ["reactive", "wam", "lbm"], severity: 2.5, attention: 2,
    solutions: [
      { name: "Multi-scale memory: video short-term, text long-term", maturity: "promising", who: "MEM, π0.7 (chapter 14)", moves: ["reactive"] },
      { name: "Agentic harness with a reasoning model keeping state", maturity: "promising", who: "Gemini Robotics ER 2 (chapter 10)", moves: ["reasoning"] }] },
  { n: 5, short: "Neural simulators", title: "Neural simulators and closed-loop learning",
    plain: "Trusting a learned world model enough to train or evaluate a policy inside it.",
    failure: "A policy that finds the world model's blind spot and fails in the real world.", see: "figure 8.3",
    hits: ["simulator", "wam"], severity: 2.5, attention: 2.5,
    solutions: [
      { name: "Close the loop: refresh the model with the policy's rollouts", maturity: "promising", who: "World-VLA-Loop, Interactive World Simulator", moves: ["simulator"] },
      { name: "Dense teacher supervision instead of sparse reward", maturity: "early", who: "WAM-OPD", moves: ["wam"] },
      { name: "Unify search and value learning", maturity: "early", who: "MBDPO (May 2026)", moves: ["simulator"] }] },
  { n: 6, short: "Latency", title: "Inference latency and compute",
    plain: "Running large models fast enough for control on hardware a robot can carry.",
    failure: "A robot blind to a change for two seconds while it finishes a chunk.", see: "figure 15.1",
    hits: ["wam", "simulator", "reasoning"], severity: 2, attention: 2.7,
    solutions: [
      { name: "Asynchronous execution and real-time chunking", maturity: "established", who: "RTC, LingBot-VA, Xiaomi-Robotics-0", moves: ["reactive", "wam"] },
      { name: "Few-step denoising and parallel decoding", maturity: "established", who: "OpenVLA-OFT, flow-matching experts (chapter 5)", moves: ["reactive"] },
      { name: "Quantised, right-sized edge deployment", maturity: "promising", who: "Cross-accelerator study, GR00T TensorRT export (chapter 15)", moves: ["reactive"] },
      { name: "Replan only when imagination stops matching reality", maturity: "early", who: "FFDC (When to Trust Imagination, May 2026)", moves: ["wam"] }] },
  { n: 7, short: "Data", title: "Data scarcity and provenance",
    plain: "The robot-data layer stays small, and hours from different sources are not comparable.",
    failure: "Two curves that fit the same scaling points and disagree completely beyond them.", see: "figures 13.3 and 13.4",
    hits: ["reactive", "lbm"], severity: 3, attention: 2.5,
    solutions: [
      { name: "Egocentric human video at scale", maturity: "promising", who: "EgoScale, DreamDojo, Dyna-2, GEN-1 (chapter 13)", moves: ["latent", "wam", "lbm"] },
      { name: "Synthetic rewriting and generated trajectories", maturity: "promising", who: "DreamGen, Cosmos-Transfer (chapter 8)", moves: ["simulator", "reactive"] },
      { name: "Learning from failures through labelled prompts", maturity: "early", who: "π0.7 metadata (chapters 5 and 14)", moves: ["reactive"] }] },
  { n: 8, short: "Evaluation", title: "Evaluation",
    plain: "Fragmented, mostly simulated benchmarks, vendor leaderboards and no shared protocol for long tasks on real robots.",
    failure: "A model that scores 95 percent and drops below 30 percent under modest changes.", see: "figures 11.4 and 15.3",
    hits: ["reactive", "wam", "latent", "simulator", "geometry", "reasoning", "lbm"], severity: 3, attention: 1.3,
    solutions: [
      { name: "Distributed double-blind real-robot comparison", maturity: "promising", who: "RoboArena", moves: ["reactive", "wam"] },
      { name: "Blind A/B trials with statistical confidence", maturity: "promising", who: "TRI LBM (chapter 11)", moves: ["lbm", "reactive"] },
      { name: "Perturbation and safety-aware benchmarks", maturity: "early", who: "LIBERO-Plus, BeTTER, B1K safety protocols", moves: ["reactive"] },
      { name: "Industrial readiness frameworks", maturity: "early", who: "149-criterion survey (chapter 15)", moves: ["reactive", "reasoning"] }] },
  { n: 9, short: "Safety", title: "Safety, verification and certification",
    plain: "Fitting learned policies into safety-rated systems built for components that can be specified and tested.",
    failure: "A learned policy that sits outside the certifiable boundary of its own cell.", see: "figure 15.5",
    hits: ["reactive", "wam", "latent", "simulator", "geometry", "reasoning", "lbm"], severity: 3, attention: 0.8,
    solutions: [
      { name: "A certified envelope around the learned policy", maturity: "established", who: "Industrial practice; survey criterion on independently certified modules", moves: ["reactive", "lbm"] },
      { name: "Reasoning models as runtime monitors", maturity: "early", who: "Success detection (chapter 10)", moves: ["reasoning"] },
      { name: "Physical fallbacks for balancing robots", maturity: "early", who: "An open question for humanoids (Brooks)", moves: ["reactive"] }] },
  { n: 10, short: "Embodiment", title: "Embodiment transfer and the humanoid question",
    plain: "Deciding whether whole-body control belongs in the foundation model or in a learned controller beneath it.",
    failure: "A model that transfers to a new arm but not to a new body, or that must relearn balance.", see: "figure 16.2",
    hits: ["reactive", "latent", "lbm"], severity: 2, attention: 1.8,
    solutions: [
      { name: "Latent tokens to a learned whole-body controller", maturity: "promising", who: "GR00T N1.7 with SONIC (chapters 7 and 16)", moves: ["latent", "lbm"] },
      { name: "Embodiment-agnostic action spaces", maturity: "early", who: "PointWorld's 3D point flows (chapter 9)", moves: ["geometry"] },
      { name: "Cross-embodiment pretraining", maturity: "promising", who: "Open X-Embodiment, Octo, GR00T (chapters 5 and 11)", moves: ["reactive", "lbm"] }] },
];
