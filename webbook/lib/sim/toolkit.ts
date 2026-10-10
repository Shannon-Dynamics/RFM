// TypeScript port of rust/ch04-toolkit: action chunking, binning and the two-mode flow.

export const target = (k: number) => Math.sin(0.08 * k);
export const PREDICTION_DRIFT = 0.004;

/** Same model as tracking_error in the crate, also returning the executed positions for plotting. */
export function track(chunk: number, latency: number, steps: number, asynchronous: boolean) {
  chunk = Math.max(1, chunk);
  let k = 0, pos = 0, err = 0, plan: number[] = [], next = 0;
  const executed: number[] = [], thinking: boolean[] = [];
  while (k < steps) {
    const t0 = k;
    for (let i = 0; i < latency && k < steps; i++) {
      if (asynchronous && next < plan.length) pos = plan[next++];
      err += Math.abs(pos - target(k)); executed.push(pos); thinking.push(true); k++;
    }
    plan = Array.from({ length: chunk }, (_, i) => target(t0 + latency + i) + PREDICTION_DRIFT * (latency + i));
    next = 0;
    const run = asynchronous ? Math.max(1, chunk - latency) : chunk;
    for (let i = 0; i < run && k < steps; i++) {
      pos = plan[next++]; err += Math.abs(pos - target(k)); executed.push(pos); thinking.push(false); k++;
    }
  }
  return { error: err / steps, executed, thinking };
}

export function velocity(mu: number, sigma: number, x: number, t: number) {
  let num = 0, den = 0;
  for (const m of [-mu, mu]) {
    const v2 = (1 - t) ** 2 + t * t * sigma * sigma;
    const w = Math.exp(-((x - t * m) ** 2) / (2 * v2)) / Math.sqrt(v2);
    num += w * (m + ((t * sigma * sigma - (1 - t)) / v2) * (x - t * m));
    den += w;
  }
  return num / den;
}

export function sample(mu: number, sigma: number, x0: number, steps: number) {
  const dt = 1 / steps;
  let x = x0;
  for (let i = 0; i < steps; i++) x += dt * velocity(mu, sigma, x, i * dt);
  return x;
}

/** Deterministic standard-normal quantiles, so the histogram is the same on every load. */
export function normalQuantiles(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const p = (i + 0.5) / n;
    const q = p < 0.5 ? p : 1 - p;
    const t = Math.sqrt(-2 * Math.log(q));
    const z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t ** 3);
    return p < 0.5 ? -z : z;
  });
}
