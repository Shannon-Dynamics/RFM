import { Timeline, type TimelineItem } from "@/components/viz/Timeline";
import { Pyramid, type PyramidLayer } from "@/components/viz/Pyramid";
import { SimpleBars } from "@/components/viz/SimpleBars";
import { RangeBars } from "@/components/viz/RangeBars";

const LANES = ["VLM backbones", "Video generators", "Robot datasets", "Human video", "Fast inference", "Economics"];

const ITEMS: TimelineItem[] = [
  { id: "qwen-vl", lane: "VLM backbones", date: "2023-08", label: "Qwen-VL", detail: "An open vision-language model later reused as a VLA backbone." },
  { id: "paligemma", lane: "VLM backbones", date: "2024-07", label: "PaliGemma", detail: "A 3B open VLM built for transfer; the backbone of π0 and π0.5." },
  { id: "gemma3", lane: "VLM backbones", date: "2025-03", label: "Gemma 3", detail: "The backbone π0.7 builds on." },
  { id: "cosmos-reason2", lane: "VLM backbones", date: "2025-12", label: "Cosmos-Reason2", detail: "A reasoning VLM for physical AI released on 19 December 2025; the backbone of GR00T N1.7." },
  { id: "cosmos", lane: "Video generators", date: "2025-01", label: "Cosmos world foundation models", detail: "Video world models trained on about 100 million clips drawn from roughly 20 million hours of raw video." },
  { id: "wan", lane: "Video generators", date: "2025-03", label: "Wan", detail: "Open video generation models; the 14B model was trained on billions of images and videos. DreamZero, LingBot-VA and Fast-WAM build on it." },
  { id: "veo", lane: "Video generators", date: "2025-09", label: "Veo 3 as zero-shot reasoner", detail: "A study showing a frontier video model solving visual tasks it was never trained for." },
  { id: "bridge", lane: "Robot datasets", date: "2023-08", label: "BridgeData V2", detail: "60,096 trajectories across 24 environments on a low-cost robot." },
  { id: "oxe", lane: "Robot datasets", date: "2023-10", label: "Open X-Embodiment", detail: "Over one million real robot trajectories from 22 embodiments, pooled by 21 institutions." },
  { id: "droid", lane: "Robot datasets", date: "2024-03", label: "DROID", detail: "76,000 trajectories (350 hours) across 564 scenes, collected in the wild." },
  { id: "ego4d", lane: "Human video", date: "2021-10", label: "Ego4D", detail: "3,670 hours of daily-life egocentric video, not made for robots." },
  { id: "umi", lane: "Human video", date: "2024-02", label: "UMI", detail: "Hand-held grippers that turn human demonstrations into robot-ready data." },
  { id: "egodex", lane: "Human video", date: "2025-05", label: "EgoDex", detail: "829 hours of egocentric video with tracked 3D hand and finger poses." },
  { id: "egoscale", lane: "Human video", date: "2026-02", label: "EgoScale", detail: "20,854 hours of action-labelled egocentric video and a log-linear scaling law (vendor claim)." },
  { id: "dreamdojo", lane: "Human video", date: "2026-02", label: "DreamDojo", detail: "A world model pretrained on 44,000 hours of egocentric human video." },
  { id: "dyna2", lane: "Human video", date: "2026-08", label: "Dyna-2", detail: "A world-action model pretrained on more than one million hours of egocentric video (vendor claim)." },
  { id: "act", lane: "Fast inference", date: "2023-04", label: "Action chunking (ACT)", detail: "Predict a chunk of future actions per inference instead of one." },
  { id: "fast", lane: "Fast inference", date: "2025-01", label: "FAST tokenizer", detail: "Compresses action chunks with the discrete cosine transform so autoregressive VLAs emit fewer tokens." },
  { id: "rtc", lane: "Fast inference", date: "2025-06", label: "Real-time chunking", detail: "Generate the next chunk while executing the current one, with no retraining." },
  { id: "xpu", lane: "Fast inference", date: "2026-04", label: "VLAs on edge accelerators", detail: "A cross-accelerator study: right-sized edge devices can meet control rates at lower cost and energy than flagship GPUs." },
  { id: "svrc", lane: "Economics", date: "2026-03", label: "State of Robotics 2026", detail: "Teleoperation data at $118 an hour, down from about $340 in early 2024; fine-tuning on 200 to 500 demonstrations beats training from scratch on 1,000 or more (industry survey)." },
];

/** Figure 2.1: six tracks maturing within the same few years. */
export function IngredientTimeline() {
  return <Timeline lanes={LANES} items={ITEMS} start={2021.5} end={2026.95} />;
}

export const PYRAMID: PyramidLayer[] = [
  { name: "Robot trajectories", property: "action-labelled, smallest, most expensive",
    examples: [
      { label: "Open X-Embodiment", size: "1M+ trajectories, 22 embodiments", source: "O'Neill et al. 2023, arXiv 2310.08864" },
      { label: "DROID", size: "76k trajectories, 350 hours, 564 scenes", source: "Khazatsky et al. 2024, arXiv 2403.12945" },
      { label: "BridgeData V2", size: "60,096 trajectories, 24 environments", source: "Walke et al. 2023, arXiv 2308.12952" },
    ],
    usedBy: "every family for fine-tuning; reactive VLAs (chapter 5) and large behavior models (chapter 11) learn mostly from this layer." },
  { name: "Egocentric human video", property: "task-relevant, no robot actions",
    examples: [
      { label: "Ego4D", size: "3,670 hours", source: "Grauman et al. 2021, arXiv 2110.07058" },
      { label: "EgoDex", size: "829 hours with 3D hand poses", source: "Hoque et al. 2025, arXiv 2505.11709" },
      { label: "EgoScale", size: "20,854 hours, action-labelled", source: "Zheng et al. 2026, arXiv 2602.16710 (vendor claim)" },
      { label: "DreamDojo", size: "44,000 hours", source: "Gao et al. 2026, arXiv 2602.06949" },
      { label: "Dyna-2", size: "1M+ hours", source: "Dyna Robotics report, August 2026 (vendor claim)" },
    ],
    usedBy: "latent-action models (chapter 7) and world-action models (chapter 6) directly; VLAs once human hand motion is mapped to robot actions." },
  { name: "Internet video", property: "task-agnostic, no actions, largest",
    examples: [
      { label: "Cosmos training data", size: "about 100M clips from about 20M hours", source: "NVIDIA 2025, arXiv 2501.03575" },
      { label: "Wan training data", size: "billions of images and videos", source: "Team Wan 2025, arXiv 2503.20314" },
    ],
    usedBy: "as a dynamics prior: video backbones for world-action models (chapter 6) and world models as simulators (chapter 8)." },
];

export function DataPyramid() {
  return <Pyramid layers={PYRAMID} />;
}

/** Figure 2.4: the price of an hour of teleoperation data (industry survey). */
export function TeleopCost() {
  return (
    <SimpleBars label="Cost of one hour of teleoperation data" unit="$/h"
      data={[{ label: "early 2024", value: 340 }, { label: "Q4 2025", value: 136 }, { label: "March 2026", value: 118 }]} />
  );
}

/** Figure 2.5: demonstrations needed, as reported. */
export function DemonstrationFlip() {
  return (
    <RangeBars unit="demonstrations" max={1400} ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400]}
      rows={[
        { label: "Task policy from scratch", lo: 1000, hi: 1400, note: "SVRC 2026, industry survey", text: "1,000 or more" },
        { label: "Generalise over 80% of variations", lo: 300, hi: 1200, note: "SVRC 2026, industry survey" },
        { label: "Fine-tune a pretrained VLA", lo: 200, hi: 500, note: "SVRC 2026, industry survey", family: "reactive" },
        { label: "LingBot-VLA, per task", lo: 130, hi: 130, note: "Wu et al. 2026, vendor claim", family: "reactive", text: "130 episodes per task" },
        { label: "MotuBrain, new humanoid", lo: 50, hi: 100, note: "Motubrain Team 2026, vendor claim", family: "wam", text: "50 to 100 trajectories" },
      ]} />
  );
}
