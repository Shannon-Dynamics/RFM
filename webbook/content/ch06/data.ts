// Chapter 6 data. Mechanism summaries paraphrase each paper's abstract or the WAM survey
// (Lu et al., arXiv 2609.16074, sections III-B and III-C); numbers are the authors' own.

export type Transition = "joint" | "idm";
export type Structure = "e2e" | "dual";

export interface WamModel {
  key: string; // citation key in reference/references.csv
  name: string;
  transition: Transition;
  structure: Structure;
  summary: string;
  argued?: string;
}

/** Placement follows Book.md chapter 6, which follows the WAM survey's figure 5. */
export const WAM_MODELS: WamModel[] = [
  { key: "dreamzero", name: "DreamZero", transition: "joint", structure: "e2e",
    summary: "Starts from a 14B Wan video diffusion model and denoises video and action tokens together in one transformer. Reports real-time closed-loop control at 7 Hz after model and system optimisations." },
  { key: "cosmos-policy", name: "Cosmos Policy", transition: "joint", structure: "e2e",
    summary: "Fine-tunes Cosmos-Predict2 in a single stage with no architectural changes. Actions, future states and values are encoded as extra latent frames, so the same model can act directly or plan." },
  { key: "uwm", name: "UWM", transition: "joint", structure: "e2e",
    summary: "Unifies video and action diffusion in one transformer with independent noise for each, so one model can serve several inference modes." },
  { key: "worldvla", name: "WorldVLA", transition: "joint", structure: "e2e",
    summary: "Places text, images and actions in one shared autoregressive token space." },
  { key: "pad", name: "PAD", transition: "joint", structure: "e2e",
    summary: "An early joint approach: future images and actions are denoised together inside one diffusion transformer." },
  { key: "vipra", name: "ViPRA", transition: "joint", structure: "e2e",
    summary: "Learns latent actions from video first, then aligns them with robot-specific visual representations and decodes actions with flow matching." },
  { key: "motus", name: "Motus", transition: "joint", structure: "dual",
    summary: "Structured joint attention with separate noise schedules for video and action generation." },
  { key: "motubrain", name: "MotuBrain", transition: "joint", structure: "dual",
    summary: "Builds on Motus with a three-stream Mixture-of-Transformers: one model acts as policy, world model, video generator and inverse dynamics. Reports up to 11 Hz after a 50x inference speed-up." },
  { key: "gigaworld-policy", name: "GigaWorld-Policy", transition: "joint", structure: "dual",
    summary: "Action-centred: predicts actions first, then video conditioned on them. A causal mask keeps video tokens from influencing actions, so video generation is optional at test time.",
    argued: "The WAM survey groups it with Fast-WAM as close to an implicit inverse-dynamics model." },
  { key: "seer", name: "Seer", transition: "idm", structure: "e2e",
    summary: "Action tokens may attend only to the current and predicted future states: a structured inverse-dynamics interface inside one transformer." },
  { key: "act2goal", name: "Act2Goal", transition: "idm", structure: "e2e",
    summary: "A goal-conditioned inverse-dynamics model that predicts target future states rather than only the next observation." },
  { key: "dreamwam", name: "DreamWAM", transition: "idm", structure: "e2e",
    summary: "Represents the future as appearance, motion, geometry and semantics rather than RGB alone; the extra branches are used only in training.",
    argued: "Not in the survey's figure; placed by this book. Its VideoDiT and ActionDiT share attention, which could equally read as a dual system." },
  { key: "lingbot-va", name: "LingBot-VA", transition: "idm", structure: "dual",
    summary: "Autoregressive diffusion over a shared latent space of video and action tokens (Mixture-of-Transformers), closed-loop rollouts that take in real observations, and asynchronous inference." },
  { key: "fast-wam", name: "Fast-WAM", transition: "idm", structure: "dual",
    summary: "Keeps video co-training but skips future prediction at test time. Reports 190 ms latency, over 4x faster than imagine-then-execute WAMs.",
    argued: "The survey calls it closer to an implicit inverse-dynamics model than an explicit predict-then-act pipeline." },
  { key: "vidman", name: "VidMan", transition: "idm", structure: "dual",
    summary: "Uses a video diffusion model's implicit dynamics and decouples video modelling from downstream action generation." },
  { key: "vpp", name: "VPP", transition: "idm", structure: "dual",
    summary: "A text-guided video prediction model whose predictive representations condition a diffusion policy head." },
  { key: "mimic-video", name: "mimic-video", transition: "idm", structure: "dual",
    summary: "Pairs an internet-scale video model with a flow-matching action decoder that acts as an inverse-dynamics model on video latents." },
  { key: "imagewam", name: "ImageWAM", transition: "idm", structure: "dual",
    summary: "Replaces video generation with a pretrained image-editing model; its key-value caches condition a flow-matching action expert without decoding the target frame." },
];

/** RoboArena scores for the four DROID policies Book.md discusses. */
export const ROBOARENA = [
  { policy: "DreamZero", family: "wam", april: 1750, september: 1735, evals: 190 },
  { policy: "π0.5", family: "reactive", april: 1622, september: 1608, evals: 745 },
  { policy: "π0-FAST", family: "reactive", april: 1592, september: 1582, evals: 941 },
  { policy: "π0", family: "reactive", april: 1475, september: 1461, evals: 1120 },
] as const;
