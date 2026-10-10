//! The toy world: a puck on a low-friction table, an obstacle, and a goal near the edge.

/// Seconds per control step.
pub const DT: f32 = 0.1;
/// Fraction of velocity kept each step. Close to 1.0 means the puck glides for a long time.
pub const DAMPING: f32 = 0.97;
/// Largest acceleration per axis the controller may command.
pub const A_MAX: f32 = 3.0;
pub const TABLE_W: f32 = 10.0;
pub const TABLE_H: f32 = 6.0;
/// The goal counts as reached below this speed.
pub const SETTLE_SPEED: f32 = 0.5;

#[derive(Clone, Copy, Debug, PartialEq, Default)]
pub struct State {
    pub x: f32,
    pub y: f32,
    pub vx: f32,
    pub vy: f32,
}

impl State {
    pub fn at(x: f32, y: f32) -> Self {
        State { x, y, vx: 0.0, vy: 0.0 }
    }
    pub fn speed(&self) -> f32 {
        self.vx.hypot(self.vy)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Default)]
pub struct Action {
    pub ax: f32,
    pub ay: f32,
}

impl Action {
    pub fn clamped(self) -> Self {
        Action { ax: self.ax.clamp(-A_MAX, A_MAX), ay: self.ay.clamp(-A_MAX, A_MAX) }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Outcome {
    Running,
    Reached,
    Collided,
    FellOff,
    TimedOut,
}

#[derive(Clone, Debug)]
pub struct World {
    pub start: State,
    pub goal: (f32, f32),
    pub goal_radius: f32,
    /// Obstacle centre x, centre y, radius.
    pub obstacle: (f32, f32, f32),
}

impl Default for World {
    fn default() -> Self {
        World { start: State::at(1.0, 3.0), goal: (8.8, 3.0), goal_radius: 0.4, obstacle: (5.0, 3.0, 1.0) }
    }
}

/// One step of point-mass dynamics with the given friction.
pub fn step_with_damping(damping: f32, s: &State, a: &Action) -> State {
    let a = a.clamped();
    let vx = damping * s.vx + DT * a.ax;
    let vy = damping * s.vy + DT * a.ay;
    State { x: s.x + DT * vx, y: s.y + DT * vy, vx, vy }
}

impl World {
    /// The real dynamics.
    pub fn step(&self, s: &State, a: &Action) -> State {
        step_with_damping(DAMPING, s, a)
    }

    pub fn status(&self, s: &State) -> Outcome {
        if s.x < 0.0 || s.x > TABLE_W || s.y < 0.0 || s.y > TABLE_H {
            return Outcome::FellOff;
        }
        let (ox, oy, r) = self.obstacle;
        if (s.x - ox).hypot(s.y - oy) < r {
            return Outcome::Collided;
        }
        let d = (s.x - self.goal.0).hypot(s.y - self.goal.1);
        if d < self.goal_radius && s.speed() < SETTLE_SPEED {
            return Outcome::Reached;
        }
        Outcome::Running
    }
}

// region: forward_model
/// A learned forward model is never exact. Here its only error is a friction bias:
/// `damping_error < 0` imagines more friction than there is, so imagined pucks stop early.
#[derive(Clone, Copy, Debug, Default)]
pub struct ForwardModel {
    pub damping_error: f32,
}

impl ForwardModel {
    pub fn perfect() -> Self {
        ForwardModel { damping_error: 0.0 }
    }

    /// Roll an action chunk forward in imagination, starting from `s`.
    pub fn rollout(&self, s: &State, actions: &[Action]) -> Vec<State> {
        let damping = (DAMPING + self.damping_error).clamp(0.0, 1.0);
        let mut out = Vec::with_capacity(actions.len());
        let mut cur = *s;
        for a in actions {
            cur = step_with_damping(damping, &cur, a);
            out.push(cur);
        }
        out
    }
}
// endregion: forward_model

impl crate::ForwardDynamics<State, Action> for ForwardModel {
    fn imagine(&self, history: &[State], actions: &[Action]) -> Vec<State> {
        let last = history.last().copied().unwrap_or_default();
        self.rollout(&last, actions)
    }
}

/// Something that picks the next action. `model_calls` counts imagined steps, the proxy this
/// chapter uses for inference cost.
pub trait Controller {
    fn control(&mut self, world: &World, s: &State) -> Action;
    fn model_calls(&self) -> u64 {
        0
    }
}

// region: reactive
/// A reactive policy: push toward the goal, look nowhere else. Cheap, and blind to
/// consequences that arrive later (momentum, the obstacle in the way).
#[derive(Clone, Debug)]
pub struct ReactiveController {
    pub gain: f32,
}

impl Default for ReactiveController {
    fn default() -> Self {
        ReactiveController { gain: 4.0 }
    }
}

impl Controller for ReactiveController {
    fn control(&mut self, world: &World, s: &State) -> Action {
        Action { ax: self.gain * (world.goal.0 - s.x), ay: self.gain * (world.goal.1 - s.y) }.clamped()
    }
}
// endregion: reactive

/// Small deterministic generator (xorshift64*), so runs are reproducible without dependencies.
#[derive(Clone, Debug)]
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Rng(seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) | 1)
    }
    pub fn next_f32(&mut self) -> f32 {
        self.0 ^= self.0 >> 12;
        self.0 ^= self.0 << 25;
        self.0 ^= self.0 >> 27;
        let v = self.0.wrapping_mul(0x2545_F491_4F6C_DD1D);
        (v >> 40) as f32 / (1u64 << 24) as f32
    }
    pub fn uniform(&mut self, lo: f32, hi: f32) -> f32 {
        lo + (hi - lo) * self.next_f32()
    }
}

#[derive(Clone, Copy, Debug)]
pub struct PlannerConfig {
    /// Imagined steps per candidate.
    pub horizon: usize,
    /// Candidate action chunks imagined per replan.
    pub samples: usize,
    /// Piecewise-constant segments per candidate chunk.
    pub knots: usize,
    /// Steps executed before replanning (the action chunk actually sent to the robot).
    pub execute: usize,
}

impl Default for PlannerConfig {
    fn default() -> Self {
        PlannerConfig { horizon: 30, samples: 48, knots: 3, execute: 5 }
    }
}

// region: imagined_cost
/// Score an imagined future: end near the goal, slowly, and never hit anything on the way.
pub fn imagined_cost(world: &World, future: &[State]) -> f32 {
    let mut cost = 0.0;
    for (t, s) in future.iter().enumerate() {
        match world.status(s) {
            Outcome::Collided | Outcome::FellOff => return 1_000.0 + (future.len() - t) as f32,
            _ => {}
        }
        cost += 0.05 * (s.x - world.goal.0).hypot(s.y - world.goal.1);
    }
    let end = future.last().copied().unwrap_or_default();
    cost + 3.0 * (end.x - world.goal.0).hypot(end.y - world.goal.1) + 1.5 * end.speed()
}
// endregion: imagined_cost

// region: shooting_planner
/// Imagine-then-act: sample candidate action chunks, imagine each with the forward model,
/// execute the start of the best one, repeat (receding horizon).
pub struct ShootingPlanner {
    pub model: ForwardModel,
    pub config: PlannerConfig,
    rng: Rng,
    queue: Vec<Action>,
    best: Vec<Action>,
    calls: u64,
    /// The candidates imagined at the last replan and the index of the chosen one.
    pub last_imagined: Vec<Vec<State>>,
    pub last_choice: usize,
}

impl ShootingPlanner {
    pub fn new(model: ForwardModel, config: PlannerConfig, seed: u64) -> Self {
        ShootingPlanner {
            model,
            config,
            rng: Rng::new(seed),
            queue: Vec::new(),
            best: Vec::new(),
            calls: 0,
            last_imagined: Vec::new(),
            last_choice: 0,
        }
    }

    fn random_chunk(&mut self) -> Vec<Action> {
        let seg = self.config.horizon.div_ceil(self.config.knots);
        let mut chunk = Vec::with_capacity(self.config.horizon);
        for _ in 0..self.config.knots {
            let a = Action { ax: self.rng.uniform(-A_MAX, A_MAX), ay: self.rng.uniform(-A_MAX, A_MAX) };
            chunk.extend(std::iter::repeat_n(a, seg));
        }
        chunk.truncate(self.config.horizon);
        chunk
    }

    fn replan(&mut self, world: &World, s: &State) {
        let h = self.config.horizon;
        let mut candidates: Vec<Vec<Action>> = Vec::with_capacity(self.config.samples + 1);
        // Warm start: the rest of the previous best chunk, padded by holding its last action.
        if self.best.len() > self.config.execute {
            let mut warm: Vec<Action> = self.best[self.config.execute..].to_vec();
            let last = *warm.last().unwrap();
            warm.resize(h, last);
            candidates.push(warm);
        }
        // Two defaults every shooting planner keeps: coast, and brake against the current motion.
        candidates.push(vec![Action::default(); h]);
        let v = s.speed().max(1e-6);
        let brake = Action { ax: -A_MAX * s.vx / v, ay: -A_MAX * s.vy / v };
        candidates.push(vec![brake; (v / (A_MAX * DT)).ceil().min(h as f32) as usize]);
        candidates.last_mut().unwrap().resize(h, Action::default());
        // A proposal from a simple approach controller, played out in imagination and then
        // judged like every other candidate: a policy proposes, the world model checks.
        let damping = (DAMPING + self.model.damping_error).clamp(0.0, 1.0);
        let (mut pd, mut cur) = (Vec::with_capacity(h), *s);
        for _ in 0..h {
            let a = Action { ax: 2.0 * (world.goal.0 - cur.x) - 2.5 * cur.vx, ay: 2.0 * (world.goal.1 - cur.y) - 2.5 * cur.vy }.clamped();
            cur = step_with_damping(damping, &cur, &a);
            pd.push(a);
        }
        self.calls += h as u64;
        candidates.push(pd);
        while candidates.len() < self.config.samples {
            let c = self.random_chunk();
            candidates.push(c);
        }
        let mut best_cost = f32::INFINITY;
        self.last_imagined.clear();
        for (i, c) in candidates.iter().enumerate() {
            let future = self.model.rollout(s, c);
            self.calls += c.len() as u64;
            let cost = imagined_cost(world, &future);
            if cost < best_cost {
                best_cost = cost;
                self.last_choice = i;
            }
            self.last_imagined.push(future);
        }
        self.best = candidates.swap_remove(self.last_choice);
        self.queue = self.best.iter().take(self.config.execute).rev().copied().collect();
    }
}

impl Controller for ShootingPlanner {
    fn control(&mut self, world: &World, s: &State) -> Action {
        if self.queue.is_empty() {
            self.replan(world, s);
        }
        self.queue.pop().unwrap_or_default()
    }
    fn model_calls(&self) -> u64 {
        self.calls
    }
}
// endregion: shooting_planner

#[derive(Clone, Debug)]
pub struct Episode {
    pub outcome: Outcome,
    pub steps: usize,
    pub model_calls: u64,
    pub path: Vec<State>,
}

pub fn run_episode(ctrl: &mut impl Controller, world: &World, max_steps: usize) -> Episode {
    run_from(ctrl, world, world.start, max_steps)
}

pub fn run_from(ctrl: &mut impl Controller, world: &World, start: State, max_steps: usize) -> Episode {
    let mut s = start;
    let mut path = vec![s];
    for step in 1..=max_steps {
        let a = ctrl.control(world, &s);
        s = world.step(&s, &a);
        path.push(s);
        let status = world.status(&s);
        if status != Outcome::Running {
            return Episode { outcome: status, steps: step, model_calls: ctrl.model_calls(), path };
        }
    }
    Episode { outcome: Outcome::TimedOut, steps: max_steps, model_calls: ctrl.model_calls(), path }
}

// region: distill
/// Fast-WAM's question in miniature: keep imagination for training, drop it at test time.
/// The student memorises what the imagine-then-act teacher did and, at test time, copies the
/// action taken in the most similar remembered states. It never calls the world model.
pub struct DistilledPolicy {
    memory: Vec<(State, Action)>,
}

pub fn distill(mut teacher: ShootingPlanner, starts: &[State], max_steps: usize) -> DistilledPolicy {
    let world = World::default();
    let mut memory = Vec::new();
    for start in starts {
        let mut s = *start;
        for _ in 0..max_steps {
            let a = teacher.control(&world, &s);
            memory.push((s, a));
            s = world.step(&s, &a);
            if world.status(&s) != Outcome::Running {
                break;
            }
        }
        teacher.queue.clear();
        teacher.best.clear();
    }
    DistilledPolicy { memory }
}

impl Controller for DistilledPolicy {
    fn control(&mut self, _world: &World, s: &State) -> Action {
        // Inverse-distance weighting over the three nearest remembered states.
        let dist = |m: &State| {
            ((m.x - s.x).powi(2) + (m.y - s.y).powi(2) + 0.25 * ((m.vx - s.vx).powi(2) + (m.vy - s.vy).powi(2))).sqrt()
        };
        let mut nearest: Vec<(f32, Action)> = self.memory.iter().map(|(m, a)| (dist(m), *a)).collect();
        nearest.sort_by(|a, b| a.0.total_cmp(&b.0));
        let (mut wsum, mut ax, mut ay) = (0.0, 0.0, 0.0);
        for (d, a) in nearest.iter().take(3) {
            let w = 1.0 / (d + 1e-3);
            wsum += w;
            ax += w * a.ax;
            ay += w * a.ay;
        }
        Action { ax: ax / wsum, ay: ay / wsum }.clamped()
    }
}
// endregion: distill

/// Starting states the student is trained from: the default start and nearby variations.
pub fn training_starts() -> Vec<State> {
    vec![
        State::at(1.0, 3.0),
        State::at(1.0, 2.4),
        State::at(1.0, 3.6),
        State::at(1.6, 2.7),
        State::at(1.6, 3.3),
        State::at(0.7, 3.0),
    ]
}

// region: compounding_error
/// How far imagination drifts from reality when the same open-loop chunk is executed:
/// one entry per step, the distance between the imagined and the real puck.
pub fn compounding_error_curve(model: &ForwardModel, world: &World, horizon: usize) -> Vec<f32> {
    let chunk: Vec<Action> = (0..horizon)
        .map(|t| if t < horizon / 2 { Action { ax: A_MAX, ay: 0.5 } } else { Action::default() })
        .collect();
    let imagined = model.rollout(&world.start, &chunk);
    let real = ForwardModel::perfect().rollout(&world.start, &chunk);
    imagined.iter().zip(&real).map(|(i, r)| (i.x - r.x).hypot(i.y - r.y)).collect()
}
// endregion: compounding_error
