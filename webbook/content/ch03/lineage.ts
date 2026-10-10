// Mirrors book_lineage() in rust/ch03-lineage. Keys point into reference/references.csv.

export type Phase = 1 | 2 | 3 | 4 | 5;
export const PHASES: { n: Phase; name: string; span: string }[] = [
  { n: 1, name: "Modular pipelines", span: "before 2017" },
  { n: 2, name: "Learning in the lab", span: "2017 to 2023" },
  { n: 3, name: "Language and vision enter", span: "2022 to 2024" },
  { n: 4, name: "Generalist policies as products", span: "2024 to 2025" },
  { n: 5, name: "The world-action turn", span: "2026" },
];

export interface Node { name: string; key: string; date: string; phase: Phase; line: string }
export interface Link { from: string; to: string; kind: "successor" | "builds-on" }

export const LINES = ["World models", "Imitation", "Google", "Open VLAs", "Physical Intelligence", "NVIDIA GR00T", "Video backbones", "World-action models", "Products"];

export const NODES: Node[] = [
  { name: "PlaNet", key: "planet", date: "2018-11", phase: 2, line: "World models" },
  { name: "Dreamer", key: "dreamer", date: "2019-12", phase: 2, line: "World models" },
  { name: "TD-MPC", key: "td-mpc", date: "2022-03", phase: 2, line: "World models" },
  { name: "DreamerV3", key: "dreamerv3", date: "2023-01", phase: 2, line: "World models" },
  { name: "Diffusion Policy", key: "diffusion-policy", date: "2023-03", phase: 2, line: "Imitation" },
  { name: "ACT", key: "act-aloha", date: "2023-04", phase: 2, line: "Imitation" },
  { name: "RT-1", key: "rt-1", date: "2022-12", phase: 3, line: "Google" },
  { name: "RT-2", key: "rt-2", date: "2023-07", phase: 3, line: "Google" },
  { name: "RoboFlamingo", key: "roboflamingo", date: "2023-11", phase: 3, line: "Open VLAs" },
  { name: "Octo", key: "octo", date: "2024-05", phase: 3, line: "Open VLAs" },
  { name: "OpenVLA", key: "openvla", date: "2024-06", phase: 3, line: "Open VLAs" },
  { name: "Covariant RFM-1", key: "covariant-rfm1", date: "2024-03", phase: 4, line: "Products" },
  { name: "π0", key: "pi0", date: "2024-10", phase: 4, line: "Physical Intelligence" },
  { name: "Cosmos", key: "cosmos-wfm", date: "2025-01", phase: 4, line: "Video backbones" },
  { name: "OpenVLA-OFT", key: "openvla-oft", date: "2025-02", phase: 4, line: "Open VLAs" },
  { name: "Helix", key: "figure-helix", date: "2025-02", phase: 4, line: "Products" },
  { name: "GR00T N1", key: "gr00t-n1", date: "2025-03", phase: 4, line: "NVIDIA GR00T" },
  { name: "Gemini Robotics", key: "gemini-robotics", date: "2025-03", phase: 4, line: "Google" },
  { name: "Wan", key: "wan", date: "2025-03", phase: 4, line: "Video backbones" },
  { name: "π0.5", key: "pi05", date: "2025-04", phase: 4, line: "Physical Intelligence" },
  { name: "π*0.6", key: "pi06-star", date: "2025-11", phase: 4, line: "Physical Intelligence" },
  { name: "Cosmos Policy", key: "cosmos-policy", date: "2026-01", phase: 5, line: "World-action models" },
  { name: "LingBot-VA", key: "lingbot-va", date: "2026-01", phase: 5, line: "World-action models" },
  { name: "DreamZero", key: "dreamzero", date: "2026-02", phase: 5, line: "World-action models" },
  { name: "GR00T N2 (preview)", key: "gr00t-n2-preview", date: "2026-03", phase: 5, line: "NVIDIA GR00T" },
  { name: "Fast-WAM", key: "fast-wam", date: "2026-03", phase: 5, line: "World-action models" },
  { name: "π0.7", key: "pi07", date: "2026-04", phase: 5, line: "Physical Intelligence" },
  { name: "GR00T N1.7", key: "gr00t-n17-isaac-gr00t-repo", date: "2026-04", phase: 5, line: "NVIDIA GR00T" },
];

export const LINKS: Link[] = [
  { from: "PlaNet", to: "Dreamer", kind: "successor" },
  { from: "Dreamer", to: "DreamerV3", kind: "successor" },
  { from: "RT-1", to: "RT-2", kind: "successor" },
  { from: "RT-2", to: "OpenVLA", kind: "builds-on" },
  { from: "OpenVLA", to: "OpenVLA-OFT", kind: "successor" },
  { from: "Diffusion Policy", to: "Octo", kind: "builds-on" },
  { from: "ACT", to: "π0", kind: "builds-on" },
  { from: "Diffusion Policy", to: "π0", kind: "builds-on" },
  { from: "π0", to: "π0.5", kind: "successor" },
  { from: "π0.5", to: "π*0.6", kind: "successor" },
  { from: "π*0.6", to: "π0.7", kind: "successor" },
  { from: "RT-2", to: "Gemini Robotics", kind: "builds-on" },
  { from: "GR00T N1", to: "GR00T N1.7", kind: "successor" },
  { from: "GR00T N1", to: "GR00T N2 (preview)", kind: "successor" },
  { from: "Cosmos", to: "Cosmos Policy", kind: "builds-on" },
  { from: "Wan", to: "DreamZero", kind: "builds-on" },
  { from: "Wan", to: "LingBot-VA", kind: "builds-on" },
  { from: "Wan", to: "Fast-WAM", kind: "builds-on" },
  { from: "DreamerV3", to: "DreamZero", kind: "builds-on" },
  { from: "DreamZero", to: "GR00T N2 (preview)", kind: "builds-on" },
];
