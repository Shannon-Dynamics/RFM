// Table of contents and chapter briefs, taken from Book.md section 4 (working draft v0.2).

export type FamilyId = "reactive" | "wam" | "latent" | "simulator" | "geometry" | "reasoning" | "lbm";

export interface Family {
  id: FamilyId;
  chapter: number;
  name: string;
  short: string;
  predicts: string;
}

/** One colour per family, fixed across the book (Book.md section 6). Colour means family, nothing else. */
export const FAMILIES: Family[] = [
  { id: "reactive", chapter: 5, name: "Reactive vision-language-action models", short: "Reactive VLAs", predicts: "Actions only" },
  { id: "wam", chapter: 6, name: "World-action models", short: "World-action models", predicts: "Actions plus futures" },
  { id: "latent", chapter: 7, name: "Latent prediction and latent actions", short: "Latent prediction", predicts: "Futures in feature space" },
  { id: "simulator", chapter: 8, name: "World models as simulators", short: "World simulators", predicts: "Futures only" },
  { id: "geometry", chapter: 9, name: "Geometry-first world models", short: "Geometry-first", predicts: "Futures as geometry" },
  { id: "reasoning", chapter: 10, name: "Embodied reasoning models", short: "Embodied reasoning", predicts: "A plan in language" },
  { id: "lbm", chapter: 11, name: "Large behavior models", short: "Large behavior models", predicts: "Actions, no language" },
];

export const family = (id: FamilyId) => FAMILIES.find((f) => f.id === id)!;

export type MathLevel = "L0" | "L1" | "L2";

export interface Chapter {
  n: number;
  slug: string;
  title: string;
  part: 1 | 2 | 3 | 4;
  pages: number;
  level: MathLevel;
  purpose: string;
  family?: FamilyId;
  figures: string[];
  /** "written": full chapter; "brief": the Book.md brief only, chapter still to be drafted. */
  status: "written" | "brief";
  lastChecked?: string;
}

export const PARTS = [
  { n: 1, title: "Foundations", pages: 34 },
  { n: 2, title: "The seven families", pages: 58 },
  { n: 3, title: "Cross-cutting engineering", pages: 37 },
  { n: 4, title: "Open problems and futures", pages: 31 },
] as const;

export const CHAPTERS: Chapter[] = [
  { n: 1, slug: "what-is-a-robot-foundation-model", title: "What is a robot foundation model", part: 1, pages: 8, level: "L1", status: "written", lastChecked: "2026-10-03",
    purpose: "Define the term precisely enough to use and loosely enough to survive new releases, and contrast it with task-specific policies, modular pipelines and plain vision-language models.",
    figures: ["The family grid", "In scope versus out of scope", "The minimum interface", "Three boundary cases on the grid"] },
  { n: 2, slug: "why-now", title: "Why now: the convergence", part: 1, pages: 8, level: "L0", status: "written", lastChecked: "2026-10-03",
    purpose: "Explain the timing as six ingredients that matured within roughly the same 24 months.",
    figures: ["Six ingredient tracks converging", "The data pyramid", "Inference rate by year", "The imitation-learning flip"] },
  { n: 3, slug: "history-in-five-phases", title: "A short history in five phases", part: 1, pages: 10, level: "L0", status: "written", lastChecked: "2026-10-03",
    purpose: "Give the newcomer the arc, so every later chapter reads as a response to a prior limitation.",
    figures: ["Five-phase timeline", "What each phase fixed and broke", "Lineage tree"] },
  { n: 4, slug: "readers-toolkit", title: "The reader's toolkit", part: 1, pages: 8, level: "L2", status: "written", lastChecked: "2026-10-03",
    purpose: "The one chapter with real notation: policies, action chunks, world models, latent actions and the four-component decomposition.",
    figures: ["Notation card", "Action chunking film strip", "Tokens versus denoising", "Four-component template", "World-action 2x2, empty"] },
  { n: 5, slug: "reactive-vlas", title: "Reactive vision-language-action models", part: 2, pages: 12, level: "L1", family: "reactive", status: "written", lastChecked: "2026-10-03",
    purpose: "A pretrained VLM backbone plus an action head: observations and language in, an action chunk out, no modelling of the future.",
    figures: ["VLA anatomy: three heads", "Fast-slow dual system", "Open ecosystem map", "π0.7 prompt anatomy"] },
  { n: 6, slug: "world-action-models", title: "World-action models", part: 2, pages: 12, level: "L2", family: "wam", status: "written", lastChecked: "2026-09-26",
    purpose: "Couple future-state prediction with action generation in one model or one training loop.",
    figures: ["World-action 2x2", "Four components for WAMs", "Imagine, then act", "Imagination drift", "Joint denoising versus latent frames", "Inference cost versus horizon", "RoboArena scores"] },
  { n: 7, slug: "latent-prediction", title: "Latent prediction and latent action models", part: 2, pages: 8, level: "L2", family: "latent", status: "written", lastChecked: "2026-10-03",
    purpose: "Predict in representation space rather than pixel space, or infer latent actions so that action-free video becomes training signal.",
    figures: ["Pixel versus latent prediction", "A latent action", "Human video to robot control", "Latent tokens to a whole-body controller", "Four components for latent models"] },
  { n: 8, slug: "world-models-as-simulators", title: "World models as simulators, data engines and RL environments", part: 2, pages: 8, level: "L1", family: "simulator", status: "written", lastChecked: "2026-10-03",
    purpose: "The world model is not the policy: it generates futures, synthetic trajectories or imagined environments that other models train or plan in.",
    figures: ["Four roles of a world model", "Synthetic data loop", "Training in imagination", "Plausible versus feasible rollouts"] },
  { n: 9, slug: "geometry-first", title: "Geometry-first and structured world models", part: 2, pages: 8, level: "L1", family: "geometry", status: "written", lastChecked: "2026-10-03",
    purpose: "Predict in an explicit spatial or physical representation (points, Gaussians, particles, occupancy, touch) instead of RGB.",
    figures: ["Representation ladder", "What RGB misses", "Models by representation", "Scoring a point cloud", "Four components for geometry models"] },
  { n: 10, slug: "embodied-reasoning", title: "Embodied reasoning models", part: 2, pages: 5, level: "L0", family: "reasoning", status: "written", lastChecked: "2026-10-09",
    purpose: "VLM-level models for spatial understanding, task decomposition and success detection that sit above a controller from another family.",
    figures: ["Where the reasoning sits", "Success-detection loop", "Reasoning models, 2025 to 2026"] },
  { n: 11, slug: "large-behavior-models", title: "Large behavior models and scaled imitation", part: 2, pages: 5, level: "L1", family: "lbm", status: "written", lastChecked: "2026-10-09",
    purpose: "Imitation learning at scale without a language backbone: Diffusion Policy, ACT and their descendants.",
    figures: ["Imitation primitives inside every family", "Four components for large behavior models", "Temporal ensembling", "How many trials"] },
  { n: 12, slug: "choosing-between-families", title: "Choosing between families", part: 2, pages: 6, level: "L0", status: "written", lastChecked: "2026-10-09",
    purpose: "The practitioner chapter: a comparison matrix, a decision flow and three worked scenarios.",
    figures: ["Comparison matrix", "Decision flowchart", "Three scenario cards"] },
  { n: 13, slug: "data", title: "Data: the pyramid, scaling and provenance", part: 3, pages: 10, level: "L1", status: "written", lastChecked: "2026-10-09",
    purpose: "Every family's strengths trace to which data layer it can use. This chapter makes that explicit.",
    figures: ["The data pyramid", "Reported dataset sizes", "Scaling curves and their limits", "An hour is not an hour", "Mixing sources"] },
  { n: 14, slug: "post-training", title: "Post-training: adaptation, RL, steerability, memory", part: 3, pages: 9, level: "L1", status: "written", lastChecked: "2026-10-09",
    purpose: "Fine-tuning economics, three routes to reinforcement learning, steerability and memory.",
    figures: ["The post-training pipeline", "Three RL routes", "Anchored refinement", "Steering with the prompt", "Memory at two time scales"] },
  { n: 15, slug: "deployment-and-evaluation", title: "Deployment, evaluation and industrial readiness", part: 3, pages: 8, level: "L0", status: "written", lastChecked: "2026-10-09",
    purpose: "Latency budgets, compute placement, benchmarks and what a readiness assessment looks like for a real cell.",
    figures: ["Latency budget", "Compute placement", "Benchmark map", "Readiness profiles", "Where the certifiable boundary sits"] },
  { n: 16, slug: "applications", title: "Applications by domain", part: 3, pages: 10, level: "L0", status: "written", lastChecked: "2026-10-09",
    purpose: "Manipulation, humanoids, navigation, driving, industrial and service robots: which family dominates and what shipped.",
    figures: ["Families by domain", "Humanoid control stacks", "Look-ahead navigation", "World models in driving", "Readiness in a picking cell"] },
  { n: 17, slug: "open-problems", title: "Open problems", part: 4, pages: 10, level: "L1", status: "written", lastChecked: "2026-10-09",
    purpose: "The ten problems the 2026 surveys converge on, each with a concrete failure example.",
    figures: ["Problem map", "Severity against attention", "Multi-view consistency check", "A safety envelope"] },
  { n: 18, slug: "candidate-solutions", title: "Candidate solutions and research bets", part: 4, pages: 8, level: "L1", status: "written", lastChecked: "2026-10-09",
    purpose: "For each open problem: the approaches being tried, who is trying them, and how mature they are.",
    figures: ["Solutions by maturity", "Where solutions move the families", "Test-time scaling and its ceiling"] },
  { n: 19, slug: "scenarios-to-2030", title: "Three scenarios for 2027 to 2030", part: 4, pages: 7, level: "L0", status: "written", lastChecked: "2026-10-10",
    purpose: "Turn the open problems into futures the reader can watch for, without picking one.",
    figures: ["Three scenario timelines", "Evidence that tells them apart", "Release-reading worksheet"] },
];

export const chapterBySlug = (slug: string) => CHAPTERS.find((c) => c.slug === slug);

/** Core diagram 1 from Book.md section 3: where each family sits. */
export const GRID_COLUMNS = ["Actions only", "Actions plus futures", "Futures only", "Plan in language"] as const;
export const GRID_ROWS = [
  "Pixels or video latents",
  "Learned feature latents",
  "Explicit geometry",
  "Language or action tokens",
  "Continuous actions, no language backbone",
] as const;
export const GRID_CELLS: { row: number; col: number; family: FamilyId; label: string }[] = [
  { row: 0, col: 0, family: "reactive", label: "Flow-matching and diffusion VLAs" },
  { row: 0, col: 1, family: "wam", label: "World-action models on video backbones" },
  { row: 0, col: 2, family: "simulator", label: "Video world models and simulators" },
  { row: 1, col: 0, family: "latent", label: "Latent-action policies" },
  { row: 1, col: 1, family: "latent", label: "JEPA-style VLAs and WAMs" },
  { row: 1, col: 2, family: "latent", label: "Latent world models" },
  { row: 2, col: 0, family: "geometry", label: "3D-aware VLAs" },
  { row: 2, col: 1, family: "geometry", label: "Geometry world-action models" },
  { row: 2, col: 2, family: "geometry", label: "Structured world models" },
  { row: 3, col: 0, family: "reactive", label: "Autoregressive token VLAs" },
  { row: 3, col: 3, family: "reasoning", label: "Embodied reasoning models" },
  { row: 4, col: 0, family: "lbm", label: "Large behavior models" },
];
