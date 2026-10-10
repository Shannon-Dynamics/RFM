// TypeScript port of rust/ch08-simulators. Keep the constants in step with the crate.

export const TARGET = 0.6;
export const EDGE = 0.8;

export const trueDistance = (th: number) => 0.3 * th + 0.9 * th * th;
export const reward = (d: number) => (d > EDGE ? -1 : 1 - Math.abs(d - TARGET) / TARGET);
export const trueReward = (th: number) => reward(trueDistance(th));

export interface WorldModel { intercept: number; slope: number; edgeTheta: number | null }

export const modelDistance = (m: WorldModel, th: number) => m.intercept + m.slope * th;
export const modelReward = (m: WorldModel, th: number) =>
  m.edgeTheta !== null && th > m.edgeTheta ? -1 : reward(Math.min(EDGE, modelDistance(m, th)));

export function collect(lo: number, hi: number, n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const th = n === 1 ? lo : lo + ((hi - lo) * i) / (n - 1);
    return [th, trueDistance(th)];
  });
}

/** Same as the solution to exercise 8.1. */
export function fitWorldModel(samples: [number, number][]): WorldModel {
  const n = samples.length;
  const mx = samples.reduce((s, p) => s + p[0], 0) / n, my = samples.reduce((s, p) => s + p[1], 0) / n;
  const sxx = samples.reduce((s, p) => s + (p[0] - mx) ** 2, 0), sxy = samples.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  const slope = sxx > 0 ? sxy / sxx : 0;
  const stayed = Math.max(...samples.filter((p) => p[1] <= EDGE).map((p) => p[0]), -Infinity);
  const fell = Math.min(...samples.filter((p) => p[1] > EDGE).map((p) => p[0]), Infinity);
  return { intercept: my - slope * mx, slope, edgeTheta: Number.isFinite(stayed) && Number.isFinite(fell) ? (stayed + fell) / 2 : null };
}

/** Same as the solution to exercise 8.2. */
export function optimize(m: WorldModel, start: number, step: number, iters: number, trust: number | null): number[] {
  const hi = Math.min(1, trust ?? 1);
  const path = [start];
  let th = start;
  for (let k = 0; k < iters; k++) {
    let best = th;
    for (const cand of [th - step, th + step]) {
      const c = Math.max(0, Math.min(hi, cand));
      if (modelReward(m, c) > modelReward(m, best)) best = c;
    }
    th = best;
    path.push(th);
  }
  return path;
}

export const velocities = (pos: number[], dt: number) => pos.slice(1).map((p, i) => (p - pos[i]) / dt);

export const rolloutFeasible = () => Array.from({ length: 10 }, (_, i) => 0.1 + (0.6 * (1 - Math.cos((Math.PI * i) / 9))) / 2);
export const rolloutPlausibleOnly = () => [0.1, 0.12, 0.15, 0.18, 0.2, 0.55, 0.6, 0.64, 0.68, 0.7];
