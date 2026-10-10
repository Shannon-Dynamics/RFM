// TypeScript port of rust/ch17-open-problems.
export type P = [number, number];
export const CAMS: P[] = [[0, 0], [4, 0], [2, -1.5]];
export const bearing = (cam: P, p: P) => Math.atan2(p[1] - cam[1], p[0] - cam[0]);
export const angleDiff = (a: number, b: number) => { const d = (((a - b) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); };

/** Same as the solution to exercise 17.2. */
export function consistency(a: P, ba: number, b: P, bb: number, c: P, bc: number): { p: P; miss: number } | null {
  const da = [Math.cos(ba), Math.sin(ba)], db = [Math.cos(bb), Math.sin(bb)];
  const den = da[0] * db[1] - da[1] * db[0];
  if (Math.abs(den) < 1e-12) return null;
  const wx = b[0] - a[0], wy = b[1] - a[1], s = (wx * db[1] - wy * db[0]) / den;
  const p: P = [a[0] + s * da[0], a[1] + s * da[1]];
  return { p, miss: angleDiff(bearing(c, p), bc) };
}

/** Same as the solution to exercise 17.3. */
export function monitor(commands: number[], distances: number[], maxSpeed: number, stopDistance: number) {
  let changed = 0;
  const out = commands.map((v, i) => {
    const safe = distances[i] < stopDistance ? 0 : Math.max(-maxSpeed, Math.min(maxSpeed, v));
    if (safe !== v) changed++;
    return safe;
  });
  return { out, changed };
}
