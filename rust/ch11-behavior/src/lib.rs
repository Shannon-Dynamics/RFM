//! Chapter 11 companion crate: two tools from the imitation-learning workhorses.
//! ACT's temporal ensembling of overlapping action chunks, and the statistics that decide how
//! many real-robot trials it takes to tell two policies apart.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: chunks
/// The motion the demonstrations show.
pub fn target(t: usize) -> f64 {
    let t = t as f64;
    0.6 * (0.07 * t).sin() + 0.25 * (0.19 * t + 1.0).sin()
}

/// At step `NUDGE_AT` someone moves the object by `NUDGE`: the right motion shifts from then on.
pub const NUDGE_AT: usize = 150;
pub const NUDGE: f64 = 0.3;

/// Where the robot should be at step t, nudge included.
pub fn world(t: usize) -> f64 {
    target(t) + if t >= NUDGE_AT { NUDGE } else { 0.0 }
}

/// Deterministic noise in [-1, 1].
pub fn noise(a: u64, b: u64) -> f64 {
    let mut x = a.wrapping_mul(0x9E37_79B9_7F4A_7C15) ^ b.wrapping_mul(0xC2B2_AE3D_27D4_EB4F) ^ 0x1656_67B1_9E37_79F9;
    x ^= x >> 33;
    x = x.wrapping_mul(0xFF51_AFD7_ED55_8CCD);
    x ^= x >> 33;
    (x % 20_001) as f64 / 10_000.0 - 1.0
}

/// A learned policy queried at step `t` predicts a chunk of `horizon` actions for t, t+1, ...
/// Each query commits to a slightly different plan (`offset`), and its error grows the further
/// ahead it looks (`drift` per step), as a real imitation policy's does.
#[derive(Clone, Copy, Debug)]
pub struct Policy {
    pub horizon: usize,
    pub offset: f64,
    pub drift: f64,
    pub seed: u64,
}

impl Policy {
    /// The chunk predicted at step t. It sees the nudge only if it has already happened.
    pub fn predict(&self, t: usize) -> Vec<f64> {
        let bias = self.offset * noise(self.seed, t as u64);
        let slope = self.drift * noise(self.seed + 1, t as u64);
        let seen = if t >= NUDGE_AT { NUDGE } else { 0.0 };
        (0..self.horizon).map(|i| target(t + i) + seen + bias + slope * i as f64).collect()
    }
}

/// Query once per chunk and execute it to the end, then query again.
pub fn run_open_loop(p: &Policy, steps: usize) -> Vec<f64> {
    let mut out = Vec::with_capacity(steps);
    while out.len() < steps {
        let t = out.len();
        out.extend(p.predict(t).into_iter().take(steps - t));
    }
    out
}

/// Query every step and execute only the first action of the newest chunk.
pub fn run_latest(p: &Policy, steps: usize) -> Vec<f64> {
    (0..steps).map(|t| p.predict(t)[0]).collect()
}

/// Mean distance from where the robot should be.
pub fn tracking_error(actions: &[f64]) -> f64 {
    actions.iter().enumerate().map(|(t, a)| (a - world(t)).abs()).sum::<f64>() / actions.len() as f64
}

/// Steps after the nudge until the robot is within `tol` of where it should be, and stays there
/// for the rest of `actions`.
pub fn reaction_steps(actions: &[f64], tol: f64) -> Option<usize> {
    let mut settle = None;
    for t in (NUDGE_AT..actions.len()).rev() {
        if (actions[t] - world(t)).abs() > tol {
            break;
        }
        settle = Some(t - NUDGE_AT);
    }
    settle
}

/// Mean size of the second difference: how jerky the executed motion is.
pub fn jerk(actions: &[f64]) -> f64 {
    let n = actions.len().saturating_sub(2).max(1);
    actions.windows(3).map(|w| (w[2] - 2.0 * w[1] + w[0]).abs()).sum::<f64>() / n as f64
}
// endregion: chunks

// region: trials
/// Probability of exactly `k` successes in `n` trials with success rate `p`.
pub fn binom_pmf(n: u32, k: u32, p: f64) -> f64 {
    if p <= 0.0 {
        return if k == 0 { 1.0 } else { 0.0 };
    }
    if p >= 1.0 {
        return if k == n { 1.0 } else { 0.0 };
    }
    // Work in logs so large n does not underflow.
    let ln_choose: f64 = (0..k).map(|i| ((n - i) as f64).ln() - ((i + 1) as f64).ln()).sum();
    (ln_choose + k as f64 * p.ln() + (n - k) as f64 * (1.0 - p).ln()).exp()
}

/// The pooled two-proportion z statistic for B's success count `kb` against A's `ka`, n trials each.
pub fn z_statistic(ka: u32, kb: u32, n: u32) -> f64 {
    let (pa, pb) = (ka as f64 / n as f64, kb as f64 / n as f64);
    let pooled = (ka + kb) as f64 / (2 * n) as f64;
    let se = (pooled * (1.0 - pooled) * 2.0 / n as f64).sqrt();
    if se == 0.0 { 0.0 } else { (pb - pa) / se }
}
// endregion: trials
