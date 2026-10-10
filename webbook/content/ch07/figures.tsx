import { FourComponents, type Style } from "@/components/viz/FourComponents";

// The four-component template of chapter 4 filled in for latent models. "Future observations" are
// features here, not pixels; placements follow each paper's abstract.
const LATENT: Style[] = [
  { id: "lapa", label: "Latent-action policy", examples: "LAPA, ViPRA", train: ["inverse", "policy"], infer: [["policy"]],
    note: "Training first runs inverse dynamics on unlabelled video to read off latent actions, then teaches a policy to predict them. At inference only the policy runs, followed by a small per-robot decoder." },
  { id: "lwm", label: "Latent world model", examples: "V-JEPA 2-AC, DINO-WM", train: ["forward"], infer: [["forward"]],
    note: "Learns forward dynamics in feature space. At inference it plans by searching for actions whose predicted features match a goal image's features." },
  { id: "aux", label: "Latent foresight in training", examples: "VLA-JEPA, JEPA-WAM", train: ["policy", "planning"], infer: [["policy"]],
    note: "Predicting future features shapes the backbone during training; at inference the model acts like a VLA, with no futures generated." },
  { id: "lawam", label: "Latent subgoals, then act", examples: "LaWAM", train: ["planning", "inverse"], infer: [["planning"], ["inverse"]],
    note: "Predicts the features of a near-future subgoal, then generates actions conditioned on it: the plan-then-act style of chapter 6, without rendering a single pixel." },
];

/** Figure 7.5. */
export function LatentFourComponents() {
  return <FourComponents modes={LATENT} initial="lapa" futures="Future features" futuresSym="z t:t+H" />;
}
