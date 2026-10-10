import { Timeline, type TimelineItem } from "@/components/viz/Timeline";

const LANES = ["2. Learning in the lab", "3. Language and vision", "4. Policies as products", "5. World-action turn"];

const I = (id: string, lane: number, date: string, label: string, detail: string, family?: string): TimelineItem =>
  ({ id, lane: LANES[lane - 2], date, label, detail, family });

const ITEMS: TimelineItem[] = [
  I("planet", 2, "2018-11", "PlaNet", "Learns latent dynamics from pixels and plans in latent space.", "simulator"),
  I("dreamer", 2, "2019-12", "Dreamer", "Learns behaviours purely by imagining trajectories in a learned world model.", "simulator"),
  I("tdmpc", 2, "2022-03", "TD-MPC", "Short-horizon planning in a learned latent model plus a learned value for the long term.", "simulator"),
  I("dreamerv3", 2, "2023-01", "DreamerV3", "One configuration across more than 150 tasks; first to collect diamonds in Minecraft from scratch.", "simulator"),
  I("dp", 2, "2023-03", "Diffusion Policy", "A visuomotor policy as a conditional denoising diffusion process.", "lbm"),
  I("act", 2, "2023-04", "ACT", "Action chunking with transformers, on low-cost bimanual hardware.", "lbm"),
  I("rt1", 3, "2022-12", "RT-1", "A robotics transformer trained on large, diverse real-world robot data.", "reactive"),
  I("rt2", 3, "2023-07", "RT-2", "Actions written as text tokens, so a web-pretrained VLM learns to act.", "reactive"),
  I("oxe", 3, "2023-10", "Open X-Embodiment", "Over one million trajectories from 22 robot types, pooled.", undefined),
  I("roboflamingo", 3, "2023-11", "RoboFlamingo", "An open VLM, lightly fine-tuned into a robot imitator.", "reactive"),
  I("octo", 3, "2024-05", "Octo", "An open generalist policy trained on 800,000 Open X-Embodiment trajectories.", "lbm"),
  I("openvla", 3, "2024-06", "OpenVLA", "A 7B open VLA trained on 970,000 robot demonstrations.", "reactive"),
  I("rfm1", 4, "2024-03", "Covariant RFM-1", "An 8B any-to-any model trained on text, images, video, actions and measurements from a warehouse fleet.", "reactive"),
  I("pi0", 4, "2024-10", "π0", "A flow-matching action expert on a pretrained VLM, trained across many robots.", "reactive"),
  I("helix", 4, "2025-02", "Helix", "A fast-slow humanoid VLA: a 7 to 9 Hz VLM over a 200 Hz control policy.", "reactive"),
  I("groot", 4, "2025-03", "GR00T N1", "An open dual-system foundation model for humanoids.", "reactive"),
  I("gemini", 4, "2025-03", "Gemini Robotics", "Gemini 2.0 with physical actions as an output; an embodied-reasoning sibling.", "reactive"),
  I("pi05", 4, "2025-04", "π0.5", "Open-world generalisation from co-training on heterogeneous data.", "reactive"),
  I("gen0", 4, "2025-11", "GEN-0", "Scaling laws from over 270,000 hours of real-world manipulation data, and a reported phase transition at 7B parameters (vendor claims).", "reactive"),
  I("pi06", 4, "2025-11", "π*0.6", "A VLA that improves from its own experience with reinforcement learning.", "reactive"),
  I("cosmospolicy", 5, "2026-01", "Cosmos Policy", "A video model fine-tuned to act and plan: actions as latent frames.", "wam"),
  I("lingbotva", 5, "2026-01", "LingBot-VA", "Video and action in one causal model with closed-loop rollouts.", "wam"),
  I("dreamzero", 5, "2026-02", "DreamZero", "Video and action tokens denoised together in a 14B model.", "wam"),
  I("n2", 5, "2026-03", "GR00T N2 preview", "NVIDIA's next humanoid model, previewed as based on DreamZero.", "wam"),
  I("fastwam", 5, "2026-03", "Fast-WAM", "Keeps video for training, drops it at test time.", "wam"),
  I("pi07", 5, "2026-04", "π0.7", "Steerable through goal images, metadata and language.", "reactive"),
  I("er2", 5, "2026-07", "Gemini Robotics ER 2", "Real-time embodied reasoning for orchestrating robots.", "reasoning"),
  I("survey", 5, "2026-09", "WAM survey", "World-action models named and mapped as a family.", "wam"),
];

/** Figure 3.1: the five phases, with milestones coloured by the family they belong to. */
export function PhaseTimeline() {
  return <Timeline lanes={LANES} items={ITEMS} start={2018.5} end={2026.95} />;
}
