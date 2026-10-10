// TypeScript port of rust/ch15-deployment.

export interface Stage { name: string; ms: number }

export const onDevice = (): Stage[] => [
  { name: "camera frame", ms: 33 }, { name: "preprocess and transfer", ms: 8 }, { name: "VLM backbone", ms: 60 },
  { name: "action expert, 10 steps", ms: 30 }, { name: "send to controller", ms: 2 },
];
export const inTheCloud = (rtt: number): Stage[] => [
  { name: "camera frame", ms: 33 }, { name: "preprocess and transfer", ms: 8 }, { name: "network round trip", ms: rtt },
  { name: "VLM backbone", ms: 25 }, { name: "action expert, 10 steps", ms: 12 }, { name: "send to controller", ms: 2 },
];
export const latencyMs = (s: Stage[]) => s.reduce((a, b) => a + b.ms, 0);

/** Solution to exercise 15.1. */
export const worstReactionMs = (s: Stage[], chunkMs: number, asynchronous: boolean) =>
  asynchronous ? 2 * latencyMs(s) : chunkMs + latencyMs(s);

const B = (v: string | number) => BigInt(v);
const M64 = (B(1) << B(64)) - B(1), K = B("0x9E3779B97F4A7C15");
export function networkSamples(base: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = Number(((B(i) * K) & M64) >> B(40)) / 2 ** 24;
    return x > 0.97 ? base * 8 : x > 0.85 ? base * 2.5 : base * (0.8 + 0.4 * x);
  });
}

export const IMPLICATIONS = ["Adaptability and flexibility", "Safety and compliance", "Human-robot interaction and collaboration",
  "Robustness and reliability", "Precision and accuracy", "Real-time performance", "Cost-effectiveness and integration",
  "Explainability and trust", "Sensor fusion and perception", "Standardised benchmarking and evaluation", "Data requirements and usage"];

/** Table 11 of the industrial readiness survey (arXiv 2603.06749): fraction of each implication's criteria fulfilled. */
export const TOP_FIVE: { model: string; total: number; profile: number[] }[] = [
  { model: "Gemini Robotics 1.5", total: 0.12, profile: [0.44, 0.06, 0.07, 0.07, 0.0, 0.0, 0.0, 0.07, 0.14, 0.23, 0.09] },
  { model: "CollabVLA", total: 0.11, profile: [0.28, 0.0, 0.2, 0.07, 0.08, 0.11, 0.0, 0.07, 0.21, 0.08, 0.09] },
  { model: "GF-VLA", total: 0.11, profile: [0.28, 0.0, 0.0, 0.14, 0.08, 0.0, 0.0, 0.07, 0.14, 0.23, 0.27] },
  { model: "OneTwoVLA", total: 0.11, profile: [0.33, 0.0, 0.2, 0.14, 0.0, 0.11, 0.1, 0.07, 0.14, 0.0, 0.09] },
  { model: "SC-VLA", total: 0.11, profile: [0.33, 0.06, 0.0, 0.21, 0.23, 0.11, 0.0, 0.0, 0.0, 0.15, 0.09] },
];
