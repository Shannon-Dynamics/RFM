import type { ComponentType } from "react";

/** Chapters with full text. Everything else in CHAPTERS renders its Book.md brief. */
export const CHAPTER_CONTENT: Record<string, { file: string; load: () => Promise<{ default: ComponentType }> }> = {
  "what-is-a-robot-foundation-model": { file: "01-what-is-a-robot-foundation-model.mdx", load: () => import("./01-what-is-a-robot-foundation-model.mdx") },
  "why-now": { file: "02-why-now.mdx", load: () => import("./02-why-now.mdx") },
  "history-in-five-phases": { file: "03-history-in-five-phases.mdx", load: () => import("./03-history-in-five-phases.mdx") },
  "readers-toolkit": { file: "04-readers-toolkit.mdx", load: () => import("./04-readers-toolkit.mdx") },
  "reactive-vlas": { file: "05-reactive-vlas.mdx", load: () => import("./05-reactive-vlas.mdx") },
  "world-action-models": { file: "06-world-action-models.mdx", load: () => import("./06-world-action-models.mdx") },
  "latent-prediction": { file: "07-latent-prediction.mdx", load: () => import("./07-latent-prediction.mdx") },
  "world-models-as-simulators": { file: "08-world-models-as-simulators.mdx", load: () => import("./08-world-models-as-simulators.mdx") },
  "geometry-first": { file: "09-geometry-first.mdx", load: () => import("./09-geometry-first.mdx") },
  "embodied-reasoning": { file: "10-embodied-reasoning.mdx", load: () => import("./10-embodied-reasoning.mdx") },
  "large-behavior-models": { file: "11-large-behavior-models.mdx", load: () => import("./11-large-behavior-models.mdx") },
  "choosing-between-families": { file: "12-choosing-between-families.mdx", load: () => import("./12-choosing-between-families.mdx") },
  "data": { file: "13-data.mdx", load: () => import("./13-data.mdx") },
  "post-training": { file: "14-post-training.mdx", load: () => import("./14-post-training.mdx") },
  "deployment-and-evaluation": { file: "15-deployment-and-evaluation.mdx", load: () => import("./15-deployment-and-evaluation.mdx") },
  "applications": { file: "16-applications.mdx", load: () => import("./16-applications.mdx") },
  "open-problems": { file: "17-open-problems.mdx", load: () => import("./17-open-problems.mdx") },
  "candidate-solutions": { file: "18-candidate-solutions.mdx", load: () => import("./18-candidate-solutions.mdx") },
  "scenarios-to-2030": { file: "19-scenarios-to-2030.mdx", load: () => import("./19-scenarios-to-2030.mdx") },
};
