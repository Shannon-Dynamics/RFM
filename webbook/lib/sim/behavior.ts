// TypeScript port of rust/ch11-behavior. The noise uses BigInt so traces match the crate exactly.

export const target = (t: number) => 0.6 * Math.sin(0.07 * t) + 0.25 * Math.sin(0.19 * t + 1);
export const NUDGE_AT = 150;
export const NUDGE = 0.3;
export const world = (t: number) => target(t) + (t >= NUDGE_AT ? NUDGE : 0);

const B = (v: string | number) => BigInt(v);
const M64 = (B(1) << B(64)) - B(1);
const K1 = B("0x9E3779B97F4A7C15"), K2 = B("0xC2B2AE3D27D4EB4F"), K3 = B("0x165667B19E3779F9"), K4 = B("0xFF51AFD7ED558CCD");
export function noise(a: number, b: number): number {
  let x = ((B(a) * K1) & M64) ^ ((B(b) * K2) & M64) ^ K3;
  x ^= x >> B(33);
  x = (x * K4) & M64;
  x ^= x >> B(33);
  return Number(x % B(20001)) / 10000 - 1;
}

export interface Policy { horizon: number; offset: number; drift: number; seed: number }

export function predict(p: Policy, t: number): number[] {
  const bias = p.offset * noise(p.seed, t), slope = p.drift * noise(p.seed + 1, t), seen = t >= NUDGE_AT ? NUDGE : 0;
  return Array.from({ length: p.horizon }, (_, i) => target(t + i) + seen + bias + slope * i);
}

export function runOpenLoop(p: Policy, steps: number) {
  const out: number[] = [];
  while (out.length < steps) out.push(...predict(p, out.length).slice(0, steps - out.length));
  return out;
}

export const runLatest = (p: Policy, steps: number) => Array.from({ length: steps }, (_, t) => predict(p, t)[0]);

/** Same as the solution to exercise 11.1. Also returns each step's buffer for drawing. */
export function runEnsemble(p: Policy, steps: number, m: number) {
  const buffers: number[][] = Array.from({ length: steps }, () => []);
  const out: number[] = [];
  for (let t = 0; t < steps; t++) {
    predict(p, t).forEach((a, i) => { if (t + i < steps) buffers[t + i].push(a); });
    let num = 0, den = 0;
    buffers[t].forEach((a, i) => { const w = Math.exp(-m * i); num += w * a; den += w; });
    out.push(num / den);
  }
  return { out, buffers };
}

export const trackingError = (a: number[], from = 0, to = a.length) =>
  a.slice(from, to).reduce((s, v, i) => s + Math.abs(v - world(from + i)), 0) / Math.max(1, to - from);

export const jerk = (a: number[]) => {
  let s = 0;
  for (let i = 2; i < a.length; i++) s += Math.abs(a[i] - 2 * a[i - 1] + a[i - 2]);
  return s / Math.max(1, a.length - 2);
};

export function binomPmf(n: number, k: number, p: number) {
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  let lc = 0;
  for (let i = 0; i < k; i++) lc += Math.log(n - i) - Math.log(i + 1);
  return Math.exp(lc + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function zStatistic(ka: number, kb: number, n: number) {
  const pooled = (ka + kb) / (2 * n), se = Math.sqrt((pooled * (1 - pooled) * 2) / n);
  return se === 0 ? 0 : (kb / n - ka / n) / se;
}

/** Same as the solution to exercise 11.2. */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (n === 0) return [0, 1];
  const ph = k / n, d = 1 + (z * z) / n, c = (ph + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((ph * (1 - ph)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

/** Same as the solution to exercise 11.3. */
export function power(pa: number, pb: number, n: number, zCrit = 1.645) {
  const fa = Array.from({ length: n + 1 }, (_, k) => binomPmf(n, k, pa));
  const fb = Array.from({ length: n + 1 }, (_, k) => binomPmf(n, k, pb));
  let total = 0;
  for (let ka = 0; ka <= n; ka++) {
    if (fa[ka] < 1e-12) continue;
    for (let kb = 0; kb <= n; kb++) if (zStatistic(ka, kb, n) > zCrit) total += fa[ka] * fb[kb];
  }
  return total;
}
