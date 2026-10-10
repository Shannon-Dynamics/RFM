import { EcosystemMap, type EcoModel } from "@/components/viz/EcosystemMap";

// Sizes and release terms as each source states them; nothing here is a ranking.
const MODELS: EcoModel[] = [
  { name: "Octo-Base", params: 0.093, sizeText: "93M parameters; a transformer policy without a pretrained VLM backbone", access: "open", date: "May 2024",
    released: "an open-source generalist policy pretrained on 800,000 Open X-Embodiment episodes", source: "Octo Model Team 2024, arXiv 2405.12213" },
  { name: "SmolVLA", params: 0.45, sizeText: "less than 0.5B parameters", access: "open", date: "June 2025",
    released: "code, pretrained models and training data", footprint: "Designed to be trained on a single GPU and deployed on consumer-grade GPUs or even CPUs", source: "Shukor et al. 2025, arXiv 2506.01844" },
  { name: "GR00T N1", params: 2.2, sizeText: "2.2B parameters (GR00T-N1-2B)", access: "open", date: "March 2025",
    released: "the GR00T-N1-2B checkpoint", footprint: "Its System 2 VLM runs at 10 Hz on an NVIDIA L40 GPU", source: "NVIDIA 2025, arXiv 2503.14734" },
  { name: "GR00T N1.7", params: 3, sizeText: "3B parameters, on a Cosmos-Reason2-2B backbone", access: "open", date: "April 2026",
    released: "weights under Apache 2.0, fully commercially licensable; the Cosmos-Reason2-2B backbone it loads is gated and needs an access request", source: "NVIDIA Isaac-GR00T repository" },
  { name: "π0", params: 3.3, sizeText: "3.3B parameters: a 3B VLM plus a 300M action expert", access: "open", date: "October 2024 (paper), February 2025 (open-sourced)",
    released: "open-sourced in February 2025", source: "Black et al. 2024, arXiv 2410.24164; MarkTechPost, April 2026" },
  { name: "Xiaomi-Robotics-0", params: 4.7, sizeText: "4.7B parameters", access: "open", date: "February 2026",
    released: "code and model checkpoints", footprint: "Rolls out smoothly on real robots using a consumer-grade GPU (maker's report)", source: "Xiaomi Robotics 2026, arXiv 2602.12684" },
  { name: "OpenVLA", params: 7, sizeText: "7B parameters, on Llama 2", access: "open", date: "June 2024",
    released: "checkpoints, fine-tuning notebooks and the training code base", footprint: "Fine-tunes on consumer GPUs with low-rank adaptation and serves quantized without a loss in success rate", source: "Kim et al. 2024, arXiv 2406.09246" },
  { name: "π0.7", params: 5, sizeText: "about 5B parameters: a Gemma 3 4B backbone, a video history encoder and an 860M action expert", access: "closed", date: "April 2026",
    released: "described in a paper; a 2026 industry overview lists only π0 as open", source: "Physical Intelligence 2026, arXiv 2604.15483; Humanoid Hub 2026" },
  { name: "Helix", params: 7.08, sizeText: "7B System 2 plus an 80M System 1", access: "closed", date: "February 2025",
    released: "proprietary, described in a company post", footprint: "Runs entirely on embedded low-power GPUs on the robot (maker's claim)", source: "Figure AI 2025" },
  { name: "RT-2", params: 55, sizeText: "up to 55B parameters (RT-2-PaLI-X-55B)", access: "closed", date: "July 2023",
    released: "described in a paper", footprint: "Served from a multi-TPU cloud service over the network; the 55B model ran at 1 to 3 Hz", source: "Brohan et al. 2023, arXiv 2307.15818" },
  { name: "Gemini Robotics On-Device", params: null, sizeText: "Size not disclosed", access: "application", date: "June 2025",
    released: "an SDK for developers who sign up to a trusted tester programme", footprint: "Runs locally on the robot; adapts with 50 to 100 demonstrations (maker's claim)", source: "Google DeepMind, 24 June 2025" },
  { name: "Gemini Robotics", params: null, sizeText: "Size not disclosed", access: "closed", date: "March 2025",
    released: "described in a technical report", footprint: "A backbone hosted in the cloud plus a local action decoder on the robot's computer", source: "Gemini Robotics Team 2025, arXiv 2503.20020" },
];

/** Figure 5.3. */
export function OpenEcosystem() {
  return <EcosystemMap models={MODELS} />;
}
