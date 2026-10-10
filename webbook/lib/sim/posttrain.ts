// TypeScript port of rust/ch14-post-training.

export const BASE = 0, BEST = 0.6;
export const reward = (a: number) => Math.exp(-(((a - BEST) / 0.3) ** 2));

export function quantiles(k: number) {
  return Array.from({ length: k }, (_, i) => {
    const p = (i + 0.5) / k, q = p < 0.5 ? p : 1 - p, t = Math.sqrt(-2 * Math.log(q));
    const z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t ** 3);
    return p < 0.5 ? -z : z;
  });
}

/** Same as the solution to exercise 14.2; also returns each round's attempts for drawing. */
export function refine(rounds: number, k: number, sigma: number, beta: number, anchor: number) {
  const zs = quantiles(k);
  let mu = BASE;
  const aims = [mu], tries: number[][] = [];
  for (let r = 0; r < rounds; r++) {
    const as = zs.map((z) => mu + sigma * z);
    const ws = as.map((a) => Math.exp(reward(a) / beta));
    const next = as.reduce((s, a, i) => s + ws[i] * a, 0) / ws.reduce((s, w) => s + w, 0);
    tries.push(as);
    mu = (1 - anchor) * next + anchor * BASE;
    aims.push(mu);
  }
  return { aims, tries };
}
