//! Chapter 4 companion crate: the reader's toolkit in code.
//! Two ways to emit actions (tokens and denoising), and action chunking.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: tokenizer
/// Uniform binning, the simplest action tokenizer (RT-2 and OpenVLA use 256 bins per dimension):
/// each continuous value in [lo, hi] becomes one of `bins` integers an LLM can predict.
#[derive(Clone, Copy, Debug)]
pub struct Binning {
    pub lo: f32,
    pub hi: f32,
    pub bins: u32,
}
// endregion: tokenizer

// region: flow
/// A one-dimensional action distribution with two modes: steer left (-1) or right (+1) around an
/// obstacle, never straight ahead. Averaging the two is the one thing a policy must not do.
#[derive(Clone, Copy, Debug)]
pub struct TwoModes {
    pub mu: f64,
    pub sigma: f64,
}

impl TwoModes {
    /// Exact velocity of the straight-line (rectified) flow from N(0, 1) noise to this mixture:
    /// the expected value of (action - noise) given the current point x at time t. A flow-matching
    /// action head learns to approximate exactly this field; here we can write it down.
    pub fn velocity(&self, x: f64, t: f64) -> f64 {
        let (mut num, mut den) = (0.0, 0.0);
        for mu in [-self.mu, self.mu] {
            let var = (1.0 - t).powi(2) + t * t * self.sigma * self.sigma;
            let w = (-(x - t * mu).powi(2) / (2.0 * var)).exp() / var.sqrt();
            let v = mu + (t * self.sigma * self.sigma - (1.0 - t)) / var * (x - t * mu);
            num += w * v;
            den += w;
        }
        num / den
    }
}
// endregion: flow

// region: chunking
/// The target the robot must follow.
pub fn target(k: usize) -> f64 {
    (0.08 * k as f64).sin()
}

/// How far a prediction j steps ahead is off: learned predictions get worse the further out they reach.
pub const PREDICTION_DRIFT: f64 = 0.004;

/// Follow the target with chunks of `chunk` predicted positions, executed open loop.
/// Inference takes `latency_steps` control steps. Synchronous: the robot holds still while the
/// model thinks. Asynchronous: it keeps executing the previous chunk meanwhile.
/// Returns the mean distance between robot and target.
pub fn tracking_error(chunk: usize, latency_steps: usize, steps: usize, asynchronous: bool) -> f64 {
    let chunk = chunk.max(1);
    let (mut k, mut pos, mut err) = (0usize, 0.0f64, 0.0f64);
    let (mut plan, mut next): (Vec<f64>, usize) = (Vec::new(), 0);
    while k < steps {
        let t0 = k; // the model sees the world now ...
        for _ in 0..latency_steps {
            if k >= steps { break; }
            if asynchronous && next < plan.len() { pos = plan[next]; next += 1; }
            err += (pos - target(k)).abs();
            k += 1;
        }
        // ... and its plan covers the steps after it finishes thinking.
        plan = (0..chunk).map(|i| target(t0 + latency_steps + i) + PREDICTION_DRIFT * (latency_steps + i) as f64).collect();
        next = 0;
        let run = if asynchronous { chunk.saturating_sub(latency_steps).max(1) } else { chunk };
        for _ in 0..run {
            if k >= steps { break; }
            pos = plan[next];
            next += 1;
            err += (pos - target(k)).abs();
            k += 1;
        }
    }
    err / steps as f64
}
// endregion: chunking

