// TypeScript port of rust/ch07-latent. The noise uses BigInt so the strip matches the crate exactly.

export const WIDTH = 48;
export const BLOCK = 6;

// BigInt() calls rather than literals: the project targets ES2017.
const B = (v: string | number) => BigInt(v);
const M64 = (B(1) << B(64)) - B(1);
const K1 = B("0x9E3779B97F4A7C15"), K2 = B("0xBF58476D1CE4E5B9"), K3 = B("0x94D049BB133111EB");
export function noise(seed: number, i: number): number {
  let x = ((B(seed) * K1) & M64) ^ ((B(i) * K2) & M64);
  x ^= x >> B(31);
  x = (x * K3) & M64;
  x ^= x >> B(29);
  return Number(x % B(20001)) / 10000 - 1;
}

export function render(pos: number, flicker: number, seed: number): number[] {
  return Array.from({ length: WIDTH }, (_, i) => {
    const cover = Math.max(0, Math.min(1, Math.min(i + 1, pos + BLOCK) - Math.max(i, pos)));
    return cover + (1 - cover) * flicker * noise(seed, i);
  });
}

export const predictPixels = (pos: number, action: number) => render(pos + action, 0, 0);

export function encode(frame: number[]): number {
  let best = 0, bestSum = -Infinity;
  for (let s = 0; s <= WIDTH - BLOCK; s++) {
    const sum = frame.slice(s, s + BLOCK).reduce((a, b) => a + b, 0);
    if (sum > bestSum) { bestSum = sum; best = s; }
  }
  return best;
}

export const pixelLoss = (p: number[], a: number[]) => p.reduce((s, v, i) => s + (v - a[i]) ** 2, 0) / p.length;

/** Same as the solution to exercise 7.2. */
export function signalShare(pos: number, action: number, err: number, flicker: number, seed: number) {
  const actual = render(pos + action, flicker, seed);
  const right = pixelLoss(predictPixels(pos, action), actual);
  const wrong = pixelLoss(predictPixels(pos, action + err), actual);
  return wrong === 0 ? 0 : (wrong - right) / wrong;
}

export type V2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export function ring(k: number, step: number): V2[] {
  return [[0, 0], ...Array.from({ length: k }, (_, j) => {
    const a = (2 * Math.PI * j) / k;
    return [step * Math.cos(a), step * Math.sin(a)] as V2;
  })];
}

export function quantize(codes: V2[], v: V2) {
  let best = 0;
  codes.forEach((c, i) => {
    const d = (c[0] - v[0]) ** 2 + (c[1] - v[1]) ** 2, db = (codes[best][0] - v[0]) ** 2 + (codes[best][1] - v[1]) ** 2;
    if (d < db) best = i;
  });
  return best;
}

export const apply = (m: Mat2, z: V2): V2 => [m[0][0] * z[0] + m[0][1] * z[1], m[1][0] * z[0] + m[1][1] * z[1]];

export function exampleRobot(): Mat2 {
  const s = Math.sin(Math.PI / 6), c = Math.cos(Math.PI / 6);
  return [[0.4 * c, -0.4 * s], [0.4 * s, 0.4 * c]];
}

export function fitDecoder(pairs: [V2, V2][]): Mat2 | null {
  if (pairs.length < 2) return null;
  const zz = [[0, 0], [0, 0]], az = [[0, 0], [0, 0]];
  for (const [z, a] of pairs) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { zz[i][j] += z[i] * z[j]; az[i][j] += a[i] * z[j]; }
  const det = zz[0][0] * zz[1][1] - zz[0][1] * zz[1][0];
  if (Math.abs(det) < 1e-9 * Math.max(1e-12, (zz[0][0] + zz[1][1]) ** 2)) return null;
  const inv = [[zz[1][1] / det, -zz[0][1] / det], [-zz[1][0] / det, zz[0][0] / det]];
  return [0, 1].map((i) => [0, 1].map((j) => az[i][0] * inv[0][j] + az[i][1] * inv[1][j])) as Mat2;
}

export const decoderError = (a: Mat2, b: Mat2) =>
  Math.sqrt([0, 1].flatMap((i) => [0, 1].map((j) => (a[i][j] - b[i][j]) ** 2)).reduce((s, v) => s + v, 0));
