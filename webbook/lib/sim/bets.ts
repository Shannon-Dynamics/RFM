// TypeScript port of rust/ch18-research-bets.
export interface Setup { p: number; a: number; b: number }
export const acceptRate = (s: Setup) => s.p * s.a + (1 - s.p) * s.b;
/** Same as the solution to exercise 18.1. */
export function success(s: Setup, n: number) {
  const q = acceptRate(s), none = (1 - q) ** n;
  const precision = q > 0 ? (s.p * s.a) / q : 0, rejected = q < 1 ? (s.p * (1 - s.a)) / (1 - q) : 0;
  return (1 - none) * precision + none * rejected;
}
export const ceiling = (s: Setup) => { const q = acceptRate(s); return q > 0 ? (s.p * s.a) / q : s.p; };
export const expectedLatencyMs = (s: Setup, n: number, gen: number, ver: number) => {
  const q = acceptRate(s); return (q > 0 ? (1 - (1 - q) ** n) / q : n) * (gen + ver);
};
