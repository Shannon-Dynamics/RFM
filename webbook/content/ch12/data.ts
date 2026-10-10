// The book's comparison matrix as of October 2026 (Book.md chapter 12). Scores run from 1 to 3 and
// higher is always better; every cell carries the reason, drawn from chapters 5 to 11.
// Keep the scores in step with rust/ch12-choosing/src/lib.rs.
import type { FamilyId } from "@/content/book";

export const CRITERIA = ["Cheap inference", "Little robot data needed", "Language grounding", "Reasons about consequences",
  "Cross-embodiment transfer", "Maturity", "Open weights", "Evidence quality"] as const;

export interface Row { family: FamilyId; scores: number[]; why: string[] }

export const MATRIX: Row[] = [
  { family: "reactive", scores: [2, 2, 3, 1, 2, 3, 3, 3], why: [
    "A VLM backbone, brought to control rates by chunking and quantisation; 10 to 25 Hz on consumer GPUs (industry survey).",
    "Needs action-labelled robot data, but fine-tunes on hundreds of demonstrations.",
    "Inherits a pretrained vision-language model.",
    "Predicts no futures at all.",
    "Pooled datasets such as Open X-Embodiment help; fine-tuning per robot is still usual.",
    "The longest deployment record: at least eleven commercial deployments by early 2026 (industry survey).",
    "OpenVLA, π0, SmolVLA, Xiaomi-Robotics-0, GR00T N1.7 and MolmoAct2 are downloadable.",
    "Shared benchmarks and an independent leaderboard, RoboArena." ] },
  { family: "wam", scores: [1, 3, 2, 3, 3, 1, 2, 2], why: [
    "Generating video costs time; Fast-WAM exists to drop it at test time.",
    "Learns from action-free video; DreamZero reports needing about 30 minutes of robot data (vendor claim).",
    "Text-conditioned video backbones, but instruction following on text alone can be weak (JEPA-WAM).",
    "Predicts the future it acts in.",
    "Strong transfer with little robot data is reported, mostly by the makers.",
    "Named as a category less than a year before this chapter was written.",
    "Some releases; many models exist only as papers.",
    "A robustness study and RoboArena entries; many papers not yet peer-reviewed." ] },
  { family: "latent", scores: [2, 3, 2, 2, 3, 1, 2, 2], why: [
    "Nothing is rendered; LaWAM reports 187 ms per action chunk.",
    "Latent actions come from video; ViPRA's decoder needs 100 to 200 demonstrations.",
    "Language enters through VLA-style variants such as LAPA and VLA-JEPA.",
    "Forward models in feature space: predictive, but hard to inspect.",
    "A hand and a gripper making the same motion share latent actions.",
    "Research stage, with few deployments.",
    "V-JEPA 2 and ViPRA released models and code.",
    "Mostly simulated benchmarks plus authors' own real-robot tasks." ] },
  { family: "simulator", scores: [1, 3, 2, 3, 2, 2, 3, 1], why: [
    "The most compute-heavy family; used offline rather than in the control loop.",
    "Multiplies scarce data: DreamGen taught 22 behaviours from teleoperation of one task.",
    "Text-conditioned generation.",
    "Predicting consequences is its whole job.",
    "Usually fine-tuned on the target robot first.",
    "Open models and pipelines exist; published production use is rare.",
    "Cosmos-Predict2.5 and Cosmos-Transfer2.5 are open under the NVIDIA Open Model License.",
    "Headline numbers are vendor claims or unsourced survey figures; visual quality is a poor proxy (WorldArena)." ] },
  { family: "geometry", scores: [2, 1, 1, 3, 2, 1, 1, 1], why: [
    "No rendering needed; PointWorld predicts in 0.1 s.",
    "Little 3D or tactile data exists to pretrain on, and models are sensor-specific.",
    "Rarely conditioned on language.",
    "An explicit physical state that can be measured.",
    "Point flows let PointWorld learn across bodies.",
    "A young thread with narrow task suites.",
    "Few released models in this book's sources.",
    "No shared benchmark." ] },
  { family: "reasoning", scores: [1, 3, 3, 2, 3, 2, 2, 1], why: [
    "Large VLMs, often in the cloud; latency is the main engineering problem.",
    "Changing a prompt or a tool needs no robot data.",
    "A frontier vision-language model.",
    "Plans and judges progress, but has no model of physics.",
    "Embodiment-agnostic by design: it calls whatever controllers exist.",
    "Public developer APIs since 2025.",
    "Cosmos-Reason models are open; Gemini Robotics-ER is available through an API.",
    "Mostly vendor posts; the first independent checks arrived in 2026." ] },
  { family: "lbm", scores: [3, 1, 1, 1, 2, 3, 3, 3], why: [
    "Small and fast: Octo's larger model has 93M parameters.",
    "Every task is taught by demonstration, on top of pretraining on thousands of hours.",
    "At most a small text encoder such as CLIP.",
    "Predicts no futures at all.",
    "Octo was evaluated across nine robot platforms; fine-tuning per robot is usual.",
    "The bimanual teleoperation workhorse since 2023.",
    "Diffusion Policy, ACT, Octo and LeRobot are open.",
    "TRI's blind, randomised A/B trials with statistical confidence." ] },
];
