import { Timeline, type TimelineItem } from "@/components/viz/Timeline";

const LANES = ["Reasoning models", "Inside controllers", "Independent evaluation"];

const ITEMS: TimelineItem[] = [
  { id: "cr1", lane: "Reasoning models", date: "2025-03", label: "Cosmos-Reason1", family: "reasoning",
    detail: "7B and 56B models that reason in language about physical common sense and the next embodied step; open under the NVIDIA Open Model License." },
  { id: "er", lane: "Reasoning models", date: "2025-03", label: "Gemini Robotics-ER", family: "reasoning",
    detail: "Introduced with Gemini Robotics: Gemini extended with spatial and temporal understanding, such as object detection and pointing." },
  { id: "er15", lane: "Reasoning models", date: "2025-09", label: "ER 1.5", family: "reasoning",
    detail: "Gemini Robotics-ER 1.5: plans, estimates its success and progress, and calls tools; available to developers through the Gemini API." },
  { id: "cr2", lane: "Reasoning models", date: "2025-12", label: "Cosmos-Reason2", family: "reasoning",
    detail: "NVIDIA's reasoning VLM for physical AI, released on 19 December 2025; later the backbone of GR00T N1.7." },
  { id: "er16", lane: "Reasoning models", date: "2026-04", label: "ER 1.6", family: "reasoning",
    detail: "Better pointing, counting, multi-view success detection and a new instrument-reading capability developed with Boston Dynamics (vendor claims)." },
  { id: "er2", lane: "Reasoning models", date: "2026-07", label: "ER 2", family: "reasoning",
    detail: "Based on Gemini 3.5 Flash; tracks task progress from continuous video, orchestrates tools through the Live API and coordinates several robots (vendor claims)." },
  { id: "pi05", lane: "Inside controllers", date: "2025-04", label: "π0.5",
    detail: "Predicts a high-level semantic subtask, then the actions for it, inside one model." },
  { id: "gr15", lane: "Inside controllers", date: "2025-09", label: "Gemini Robotics 1.5",
    detail: "A VLA that interleaves actions with a multi-level internal reasoning process in natural language: it thinks before acting." },
  { id: "n17", lane: "Inside controllers", date: "2026-04", label: "GR00T N1.7",
    detail: "A 3B VLA on the Cosmos-Reason2-2B backbone, released under Apache 2.0." },
  { id: "molmo", lane: "Inside controllers", date: "2026-05", label: "MolmoAct2",
    detail: "A fully open action reasoning model on Molmo2-ER, a backbone specialised for spatial and embodied reasoning." },
  { id: "rr", lane: "Independent evaluation", date: "2026-01", label: "RoboReward",
    detail: "A benchmark of VLMs as reward models on real robot data: no model excels across tasks; trained 4B and 8B models beat much larger ones on short-horizon tasks." },
  { id: "better", lane: "Independent evaluation", date: "2026-04", label: "BeTTER",
    detail: "A diagnostic benchmark that finds state-of-the-art VLAs fail catastrophically when layouts shift or tasks require temporal extrapolation." },
];

/** Figure 10.3: reasoning models, reasoning inside controllers, and the first independent checks. */
export function ReasoningTimeline() {
  return <Timeline lanes={LANES} items={ITEMS} start={2025.0} end={2026.95} />;
}
