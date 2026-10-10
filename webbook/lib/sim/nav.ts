// TypeScript port of rust/ch16-applications.
export type P = [number, number];
export const START = { x: 0, y: 0, heading: 0 };
export const GOAL: P = [4.6, 3.1];
export const OBSTACLES = [{ c: [2.6, -0.2] as P, r: 0.5 }, { c: [3.6, 4.6] as P, r: 0.5 }];
export const CURVATURES = [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
export const STEPS = 30, STEP = 0.2, ROBOT_R = 0.25;
export const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function arc(k: number): P[] {
  let x = START.x, y = START.y, h = START.heading;
  const out: P[] = [[x, y]];
  for (let i = 0; i < STEPS; i++) { h += k * STEP; x += STEP * Math.cos(h); y += STEP * Math.sin(h); out.push([x, y]); }
  return out;
}
export const collides = (path: P[]) => path.some((p) => OBSTACLES.some((o) => dist(p, o.c) < o.r + ROBOT_R));

/** Same as the solution to exercise 16.3. */
export function choose(bias: number): number | null {
  let best: [number, number] | null = null;
  CURVATURES.forEach((k, i) => {
    const p = arc(k * bias);
    if (collides(p)) return;
    const d = dist(p[p.length - 1], GOAL);
    if (!best || d < best[1]) best = [i, d];
  });
  return best ? (best as [number, number])[0] : null;
}
