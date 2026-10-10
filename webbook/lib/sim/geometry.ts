// TypeScript port of rust/ch09-geometry.

export type P2 = [number, number];

export const dist = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function mug(n: number): P2[] {
  const line = (a: P2, b: P2): P2[] => Array.from({ length: n }, (_, i) => [a[0] + (i / n) * (b[0] - a[0]), a[1] + (i / n) * (b[1] - a[1])]);
  const handle: P2[] = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    return [80 + 22 * Math.cos(a), 55 + 25 * Math.sin(a)];
  });
  return [...line([0, 100], [0, 0]), ...line([0, 0], [80, 0]), ...line([80, 0], [80, 100]), ...handle];
}

export function transform(pts: P2[], deg: number, dx: number, dy: number): P2[] {
  const r = (deg * Math.PI) / 180, s = Math.sin(r), c = Math.cos(r);
  return pts.map((p) => [c * p[0] - s * p[1] + dx, s * p[0] + c * p[1] + dy]);
}

export function nearest(p: P2, cloud: P2[]): P2 {
  let best = cloud[0], bd = Infinity;
  for (const q of cloud) { const d = dist(p, q); if (d < bd) { bd = d; best = q; } }
  return best;
}

/** Same as the solution to exercise 9.2. */
export function chamfer(a: P2[], b: P2[]) {
  const one = (x: P2[], y: P2[]) => x.reduce((s, p) => s + dist(p, nearest(p, y)), 0) / x.length;
  return one(a, b) + one(b, a);
}

export function voxelize(pts: P2[], size: number): Set<string> {
  return new Set(pts.map((p) => `${Math.floor(p[0] / size)},${Math.floor(p[1] / size)}`));
}

export function iou(a: Set<string>, b: Set<string>) {
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 1;
  let inter = 0;
  a.forEach((k) => { if (b.has(k)) inter++; });
  return inter / union;
}
