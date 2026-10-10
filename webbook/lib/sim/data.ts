// TypeScript port of rust/ch13-data.

export const EGOSCALE: [number, number][] = [[1000, 0.3], [2000, 0.45], [4000, 0.48], [10000, 0.57], [20000, 0.71]];

function leastSquares(pts: [number, number][]) {
  const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  const sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0), sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const b = sxy / sxx;
  return { a: my - b * mx, b };
}

/** y = a + b ln x. */
export function fitLogLinear(pts: [number, number][]) {
  const { a, b } = leastSquares(pts.map(([x, y]) => [Math.log(x), y]));
  return (x: number) => a + b * Math.log(x);
}

/** y = c x^k, fitted on (ln x, ln y): the solution to exercise 13.3. */
export function fitPowerLaw(pts: [number, number][]) {
  const { a, b } = leastSquares(pts.map(([x, y]) => [Math.log(x), Math.log(y)]));
  return (x: number) => Math.exp(a) * x ** b;
}

/** Solution to exercise 13.1. */
export function mixtureWeights(hours: number[], alpha: number) {
  const raw = hours.map((h) => h ** alpha), total = raw.reduce((s, v) => s + v, 0);
  return raw.map((r) => r / total);
}
