import { Timeline, type TimelineItem } from "@/components/viz/Timeline";
import { SHORT } from "./data";

const [A, B, C] = SHORT;
const LANES = [A, B, C];

// Items up to October 2026 are things that happened, cited in earlier chapters. Later items are
// what each scenario would predict, not forecasts.
const ITEMS: TimelineItem[] = [
  { id: "a0", lane: A, date: "2026-04", label: "π0.7, MEM", detail: "Happened: steerable prompts (April 2026) and fifteen-minute memory (March 2026) extend what a reactive VLA can do (chapters 5 and 14)." },
  { id: "a1", lane: A, date: "2027-06", label: "RL from deployment is routine", detail: "If this scenario holds: fleets of VLAs improve from their own deployment data, as π*0.6 and SOP showed was possible (chapter 14)." },
  { id: "a2", lane: A, date: "2028-06", label: "No robustness gap", detail: "If this scenario holds: independent real-robot studies at matched data find VLAs as robust as WAMs." },
  { id: "a3", lane: A, date: "2029-09", label: "WAMs a niche", detail: "If this scenario holds: world-action models stay in research for contact-rich tasks; deployments are VLAs with reasoning models above them." },
  { id: "b0", lane: B, date: "2026-03", label: "GR00T N2 preview, Fast-WAM", detail: "Happened: NVIDIA previews a world-action model for humanoids, and Fast-WAM shows video co-training without test-time generation (chapter 6)." },
  { id: "b1", lane: B, date: "2027-03", label: "WAMs ship at control rates", detail: "If this scenario holds: GR00T N2-class models run at control rates on robot hardware." },
  { id: "b2", lane: B, date: "2028-03", label: "Robustness replicates", detail: "If this scenario holds: the WAM robustness advantage of the March 2026 study is reproduced by other labs." },
  { id: "b3", lane: B, date: "2029-06", label: "Prediction inside every policy", detail: "If this scenario holds: every deployed policy is trained to predict the future, mostly through implicit inverse dynamics that costs little at inference; 'VLA' and 'WAM' stop being separate words." },
  { id: "c0", lane: C, date: "2026-06", label: "LaWAM, PointWorld", detail: "Happened: latent subgoals at a fraction of pixel WAMs' latency (June 2026) and 3D world models at scale (January 2026) (chapters 7 and 9)." },
  { id: "c1", lane: C, date: "2027-09", label: "Latent beats pixel", detail: "If this scenario holds: matched-compute comparisons favour latent targets over pixel prediction for control." },
  { id: "c2", lane: C, date: "2028-09", label: "A geometry benchmark", detail: "If this scenario holds: a shared benchmark for geometry-first models appears, and contact-rich industrial tasks adopt structured world models." },
  { id: "c3", lane: C, date: "2029-12", label: "RGB generators as simulators", detail: "If this scenario holds: pixel generation survives as a data engine and simulator (chapter 8), not as the policy." },
];

/** Figure 19.1: three scenarios, with what has happened and what each would predict next. */
export function ScenarioTimelines() {
  return <Timeline lanes={LANES} items={ITEMS} start={2026} end={2030.4} bands={[{ label: "so far", from: "2026-01", to: "2026-10" }, { label: "what each scenario would predict", from: "2026-10", to: "2030-05" }]} />;
}
