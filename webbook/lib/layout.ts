/** Label placement for dot plots: each label sits right of its mark, or left of it when it would
 *  run past `limit`. Marks sorted by x go into the first sub-row where their label fits. */
export interface Placed { row: number; left: boolean }

export function packRows<T>(items: T[], x: (t: T) => number, labelWidth: (t: T) => number, limit: number, gap = 8): { rows: number; slot: Map<T, Placed> } {
  const sorted = [...items].sort((a, b) => x(a) - x(b));
  const ends: number[] = [];
  const slot = new Map<T, Placed>();
  for (const it of sorted) {
    const w = labelWidth(it);
    const left = x(it) + w > limit;
    const start = left ? x(it) - w : x(it) - 7;
    const end = left ? x(it) + 7 : x(it) + w;
    let r = ends.findIndex((e) => e + gap <= start);
    if (r < 0) { r = ends.length; ends.push(0); }
    ends[r] = end;
    slot.set(it, { row: r, left });
  }
  return { rows: Math.max(1, ends.length), slot };
}

/** Rough width of a label in the UI typeface (Inter) at the given size. */
export const textWidth = (s: string, size = 12) => s.length * size * 0.56 + 14;

/** SVG text props that draw a halo in the surface colour, so lines pass behind the label. */
export const halo = { stroke: "var(--surface)", strokeWidth: 4, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
