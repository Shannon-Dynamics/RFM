//! Chapter 8 companion crate: a world model used as an RL environment, and how a policy learns
//! to exploit its mistakes; plus the check that separates plausible rollouts from feasible ones.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: world
/// A robot pushes a block towards a target mark near the table's edge. `theta` in [0, 1] is how
/// hard it pushes. Past the edge the block falls off.
pub const TARGET: f64 = 0.6;
pub const EDGE: f64 = 0.8;

/// How far the block really slides: faster than proportional, because friction matters less at speed.
pub fn true_distance(theta: f64) -> f64 {
    0.3 * theta + 0.9 * theta * theta
}

/// Reward for a slide of `d`: 1 on the mark, falling off linearly, and -1 if the block falls.
pub fn reward(d: f64) -> f64 {
    if d > EDGE { -1.0 } else { 1.0 - (d - TARGET).abs() / TARGET }
}

pub fn true_reward(theta: f64) -> f64 {
    reward(true_distance(theta))
}

/// A learned world model: a straight-line fit of distance against push strength, plus the edge
/// if the data ever showed the block falling.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct WorldModel {
    pub intercept: f64,
    pub slope: f64,
    /// Push strength beyond which the model predicts a fall; `None` if it never saw one.
    pub edge_theta: Option<f64>,
}

impl WorldModel {
    pub fn distance(&self, theta: f64) -> f64 {
        self.intercept + self.slope * theta
    }
    /// The reward the policy sees when it trains inside the model.
    pub fn reward(&self, theta: f64) -> f64 {
        match self.edge_theta {
            Some(e) if theta > e => -1.0,
            _ => reward(self.distance(theta).min(EDGE)),
        }
    }
}

/// Logged pushes the world model is trained on: `n` evenly spaced strengths from `lo` to `hi`.
pub fn collect(lo: f64, hi: f64, n: usize) -> Vec<(f64, f64)> {
    (0..n)
        .map(|i| {
            let th = if n == 1 { lo } else { lo + (hi - lo) * i as f64 / (n - 1) as f64 };
            (th, true_distance(th))
        })
        .collect()
}
// endregion: world

// region: feasible
/// A generated rollout, read by an inverse dynamics model as gripper positions at a fixed rate.
/// It is feasible only if the actions it implies stay within the robot's speed and acceleration.
pub fn velocities(pos: &[f64], dt: f64) -> Vec<f64> {
    pos.windows(2).map(|w| (w[1] - w[0]) / dt).collect()
}

/// Two rollouts that look alike frame by frame. In the second, the gripper covers a third of the
/// table between two frames: each frame is plausible, the motion between them is not.
pub fn rollout_feasible() -> Vec<f64> {
    (0..10).map(|i| 0.1 + 0.6 * (1.0 - (std::f64::consts::PI * i as f64 / 9.0).cos()) / 2.0).collect()
}
pub fn rollout_plausible_only() -> Vec<f64> {
    vec![0.10, 0.12, 0.15, 0.18, 0.20, 0.55, 0.60, 0.64, 0.68, 0.70]
}
// endregion: feasible
