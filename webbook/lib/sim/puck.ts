// TypeScript port of rust/ch06-world-action/src/world.rs. Same constants, same algorithms,
// so the simulation in the book behaves like `cargo run -p ch06-world-action --example summary`.
// Two differences: JavaScript computes in f64 (the crate in f32) and samples with mulberry32
// (the crate with xorshift64*), so individual runs differ while the behaviour is the same.

export const DT = 0.1;
export const DAMPING = 0.97;
export const A_MAX = 3.0;
export const TABLE_W = 10.0;
export const TABLE_H = 6.0;
export const SETTLE_SPEED = 0.5;

export interface State { x: number; y: number; vx: number; vy: number }
export interface Action { ax: number; ay: number }
export type Outcome = "running" | "reached" | "collided" | "fell" | "timeout";

export interface World {
  start: State;
  goal: [number, number];
  goalRadius: number;
  obstacle: [number, number, number];
}

export const at = (x: number, y: number): State => ({ x, y, vx: 0, vy: 0 });
export const speed = (s: State) => Math.hypot(s.vx, s.vy);
const clampA = (a: number) => Math.max(-A_MAX, Math.min(A_MAX, a));

export const defaultWorld = (): World => ({ start: at(1, 3), goal: [8.8, 3], goalRadius: 0.4, obstacle: [5, 3, 1] });

export function stepWithDamping(damping: number, s: State, a: Action): State {
  const vx = damping * s.vx + DT * clampA(a.ax);
  const vy = damping * s.vy + DT * clampA(a.ay);
  return { x: s.x + DT * vx, y: s.y + DT * vy, vx, vy };
}

export const realStep = (s: State, a: Action) => stepWithDamping(DAMPING, s, a);

export function status(w: World, s: State): Outcome {
  if (s.x < 0 || s.x > TABLE_W || s.y < 0 || s.y > TABLE_H) return "fell";
  const [ox, oy, r] = w.obstacle;
  if (Math.hypot(s.x - ox, s.y - oy) < r) return "collided";
  if (Math.hypot(s.x - w.goal[0], s.y - w.goal[1]) < w.goalRadius && speed(s) < SETTLE_SPEED) return "reached";
  return "running";
}

/** Imperfect forward model: its only error is a friction bias (negative = imagines more friction). */
export function rollout(dampingError: number, s: State, actions: Action[]): State[] {
  const d = Math.max(0, Math.min(1, DAMPING + dampingError));
  const out: State[] = [];
  let cur = s;
  for (const a of actions) {
    cur = stepWithDamping(d, cur, a);
    out.push(cur);
  }
  return out;
}

export function imaginedCost(w: World, future: State[]): number {
  let cost = 0;
  for (let t = 0; t < future.length; t++) {
    const st = status(w, future[t]);
    if (st === "collided" || st === "fell") return 1000 + (future.length - t);
    cost += 0.05 * Math.hypot(future[t].x - w.goal[0], future[t].y - w.goal[1]);
  }
  const end = future[future.length - 1] ?? at(0, 0);
  return cost + 3 * Math.hypot(end.x - w.goal[0], end.y - w.goal[1]) + 1.5 * speed(end);
}

/** mulberry32: small, seedable, good enough for sampling candidate action chunks. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Controller {
  control(w: World, s: State): Action;
  modelCalls: number;
  /** For drawing: imagined futures at the last replan and the index chosen. */
  imagined?: State[][];
  choice?: number;
}

export function reactive(gain = 4): Controller {
  return {
    modelCalls: 0,
    control: (w, s) => ({ ax: clampA(gain * (w.goal[0] - s.x)), ay: clampA(gain * (w.goal[1] - s.y)) }),
  };
}

export interface PlannerConfig { horizon: number; samples: number; knots: number; execute: number; dampingError: number }
export const defaultPlanner: PlannerConfig = { horizon: 30, samples: 48, knots: 3, execute: 5, dampingError: 0 };

/** Imagine-then-act by random shooting with a receding horizon (ShootingPlanner in world.rs). */
export function shootingPlanner(cfg: PlannerConfig, seed = 7): Controller & { reset(): void } {
  const rand = rng(seed);
  let queue: Action[] = [];
  let best: Action[] = [];
  const self: Controller & { reset(): void } = {
    modelCalls: 0,
    imagined: [],
    choice: 0,
    reset() { queue = []; best = []; },
    control(w, s) {
      if (queue.length === 0) {
        const h = cfg.horizon;
        const candidates: Action[][] = [];
        if (best.length > cfg.execute) {
          const warm = best.slice(cfg.execute);
          while (warm.length < h) warm.push(warm[warm.length - 1]);
          candidates.push(warm);
        }
        // Two defaults every shooting planner keeps: coast, and brake against the current motion.
        candidates.push(Array.from({ length: h }, () => ({ ax: 0, ay: 0 })));
        const v = Math.max(speed(s), 1e-6);
        const brakeSteps = Math.min(h, Math.ceil(v / (A_MAX * DT)));
        candidates.push(Array.from({ length: h }, (_, i) => (i < brakeSteps ? { ax: (-A_MAX * s.vx) / v, ay: (-A_MAX * s.vy) / v } : { ax: 0, ay: 0 })));
        // A proposal from a simple approach controller, played out in imagination and then
        // judged like every other candidate: a policy proposes, the world model checks.
        const damping = Math.max(0, Math.min(1, DAMPING + cfg.dampingError));
        const pd: Action[] = [];
        let cur = s;
        for (let i = 0; i < h; i++) {
          const a = { ax: clampA(2 * (w.goal[0] - cur.x) - 2.5 * cur.vx), ay: clampA(2 * (w.goal[1] - cur.y) - 2.5 * cur.vy) };
          cur = stepWithDamping(damping, cur, a);
          pd.push(a);
        }
        self.modelCalls += h;
        candidates.push(pd);
        const seg = Math.ceil(h / cfg.knots);
        while (candidates.length < cfg.samples) {
          const c: Action[] = [];
          for (let k = 0; k < cfg.knots; k++) {
            const a = { ax: -A_MAX + 2 * A_MAX * rand(), ay: -A_MAX + 2 * A_MAX * rand() };
            for (let i = 0; i < seg; i++) c.push(a);
          }
          candidates.push(c.slice(0, h));
        }
        let bestCost = Infinity;
        self.imagined = [];
        candidates.forEach((c, i) => {
          const future = rollout(cfg.dampingError, s, c);
          self.modelCalls += c.length;
          const cost = imaginedCost(w, future);
          if (cost < bestCost) { bestCost = cost; self.choice = i; }
          self.imagined!.push(future);
        });
        best = candidates[self.choice!];
        queue = best.slice(0, cfg.execute).reverse();
      }
      return queue.pop() ?? { ax: 0, ay: 0 };
    },
  };
  return self;
}

/** Fast-WAM in miniature: learn from the imagining teacher, then act with no imagination at all. */
export function distill(teacherCfg: PlannerConfig, starts: State[], maxSteps = 200): Controller & { memorySize: number } {
  const w = defaultWorld();
  const memory: [State, Action][] = [];
  const teacher = shootingPlanner({ ...teacherCfg, dampingError: 0 }, 11);
  for (const start of starts) {
    teacher.reset();
    let s = start;
    for (let i = 0; i < maxSteps; i++) {
      const a = teacher.control(w, s);
      memory.push([s, a]);
      s = realStep(s, a);
      if (status(w, s) !== "running") break;
    }
  }
  return {
    modelCalls: 0,
    memorySize: memory.length,
    control(_w, s) {
      const scored = memory.map(([m, a]) => [
        Math.sqrt((m.x - s.x) ** 2 + (m.y - s.y) ** 2 + 0.25 * ((m.vx - s.vx) ** 2 + (m.vy - s.vy) ** 2)), a] as const);
      scored.sort((p, q) => p[0] - q[0]);
      let ws = 0, ax = 0, ay = 0;
      for (const [d, a] of scored.slice(0, 3)) { const k = 1 / (d + 1e-3); ws += k; ax += k * a.ax; ay += k * a.ay; }
      return { ax: clampA(ax / ws), ay: clampA(ay / ws) };
    },
  };
}

export const trainingStarts = (): State[] => [at(1, 3), at(1, 2.4), at(1, 3.6), at(1.6, 2.7), at(1.6, 3.3), at(0.7, 3)];

/** Distance between imagined and real puck per step, for one fixed open-loop chunk. */
export function driftCurve(dampingError: number, horizon: number): number[] {
  const w = defaultWorld();
  const chunk: Action[] = Array.from({ length: horizon }, (_, t) => (t < horizon / 2 ? { ax: A_MAX, ay: 0.5 } : { ax: 0, ay: 0 }));
  const imagined = rollout(dampingError, w.start, chunk);
  const real = rollout(0, w.start, chunk);
  return imagined.map((s, i) => Math.hypot(s.x - real[i].x, s.y - real[i].y));
}
