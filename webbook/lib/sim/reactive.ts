// TypeScript port of rust/ch05-reactive-vla: action-head cost, FAST-style DCT, the fast-slow loop
// and the metadata-prompt toy. Keep the constants in step with the crate.

export type Head = { kind: "tokens" } | { kind: "parallel" } | { kind: "denoising"; steps: number };

export function sequentialPasses(head: Head, horizon: number, dof: number) {
  return head.kind === "tokens" ? horizon * dof : head.kind === "parallel" ? 1 : head.steps;
}

export function dct(x: number[]) {
  const n = x.length;
  return x.map((_, k) => (k === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n)) *
    x.reduce((s, v, i) => s + v * Math.cos((Math.PI * (i + 0.5) * k) / n), 0));
}

export function idct(c: number[]) {
  const n = c.length;
  return c.map((_, i) => c.reduce((s, ck, k) =>
    s + (k === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n)) * ck * Math.cos((Math.PI * (i + 0.5) * k) / n), 0));
}

export const SWITCH_S = 1.45;
export const DURATION_S = 3.0;
export const HAND_SPEED = 3.0;

export const cup = (which: number, t: number) => which + 0.25 * Math.sin(2 * Math.PI * 0.6 * t + 1.3 * which);
export const instructed = (t: number) => (t >= SWITCH_S ? 1 : 0);

export type Loop = { kind: "single"; hz: number } | { kind: "dual"; slowHz: number; fastHz: number };

export interface Trace { t: number[]; target: number[]; hand: number[]; slowTicks: number[]; fastTicks: number[] }

/** Same model as `simulate` in the crate: 1 kHz, each model's latency equals its period. */
export function simulate(l: Loop): Trace {
  const period = (hz: number) => Math.max(1, Math.round(1000 / hz));
  const slowP = period(l.kind === "single" ? l.hz : l.slowHz);
  const fastP = l.kind === "dual" ? period(l.fastHz) : 0;
  const n = Math.round(DURATION_S * 1000);
  let hand = cup(0, 0), command = hand, belief = 0;
  let slowSnap: [number, number] | null = null, fastSnap: number | null = null;
  const tr: Trace = { t: [], target: [], hand: [], slowTicks: [], fastTicks: [] };
  for (let k = 0; k < n; k++) {
    const t = k / 1000;
    if (k % slowP === 0) {
      if (slowSnap) { if (l.kind === "single") command = slowSnap[1]; else belief = slowSnap[0]; }
      const which = instructed(t);
      slowSnap = [which, cup(which, t)];
      tr.slowTicks.push(t);
    }
    if (fastP > 0 && k % fastP === 0) {
      if (fastSnap !== null) command = fastSnap;
      fastSnap = cup(belief, t);
      tr.fastTicks.push(t);
    }
    const step = HAND_SPEED / 1000;
    hand += Math.max(-step, Math.min(step, command - hand));
    tr.t.push(t); tr.target.push(cup(instructed(t), t)); tr.hand.push(hand);
  }
  return tr;
}

export function trackingError(tr: Trace, from: number, to: number) {
  let sum = 0, n = 0;
  tr.t.forEach((t, i) => { if (t >= from && t < to) { sum += Math.abs(tr.hand[i] - tr.target[i]); n++; } });
  return sum / Math.max(1, n);
}

export function reactionTime(tr: Trace, tol: number): number | null {
  let settle: number | null = null;
  for (let i = tr.t.length - 1; i >= 0; i--) {
    if (tr.t[i] < SWITCH_S || Math.abs(tr.hand[i] - tr.target[i]) > tol) break;
    settle = tr.t[i];
  }
  return settle === null ? null : settle - SWITCH_S;
}

export type Recipe = "language" | "filter" | "metadata";

export function outcome(recipe: Recipe, failureFrac: number, labelAccuracy: number) {
  const f = failureFrac, a = labelAccuracy;
  const labelledClean = (1 - f) * a + f * (1 - a);
  const mistakesAmongClean = labelledClean > 0 ? (f * (1 - a)) / labelledClean : 0;
  if (recipe === "language") return { dataUsed: 1, mistakeRate: f };
  if (recipe === "filter") return { dataUsed: labelledClean, mistakeRate: mistakesAmongClean };
  return { dataUsed: 1, mistakeRate: mistakesAmongClean };
}
