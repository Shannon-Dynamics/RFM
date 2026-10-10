//! Chapter 14 companion crate: three post-training ideas in miniature.
//! Low-rank adaptation's parameter budget, policy improvement from reward that stays anchored to
//! the pretrained policy, and memory at two time scales.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: lora
/// A weight matrix of a transformer layer: `d_out` by `d_in`.
#[derive(Clone, Copy, Debug)]
pub struct Matrix {
    pub d_in: usize,
    pub d_out: usize,
}

/// The adapted matrices of a toy 2-billion-parameter-class backbone: 26 layers, each with four
/// 2048 x 2048 attention projections and two 2048 x 16384 feed-forward projections.
pub fn backbone() -> Vec<Matrix> {
    let mut m = Vec::new();
    for _ in 0..26 {
        m.extend([Matrix { d_in: 2048, d_out: 2048 }; 4]);
        m.push(Matrix { d_in: 2048, d_out: 16384 });
        m.push(Matrix { d_in: 16384, d_out: 2048 });
    }
    m
}
// endregion: lora

// region: refine
/// A one-dimensional skill, such as how far to push a connector. The pretrained policy aims at
/// `BASE`; the task rewards aiming at `BEST`.
pub const BASE: f64 = 0.0;
pub const BEST: f64 = 0.6;

/// Reward of an attempt at `a`: 1 at the best setting, falling off with distance.
pub fn reward(a: f64) -> f64 {
    (-((a - BEST) / 0.3).powi(2)).exp()
}

/// Deterministic standard-normal quantiles for `k` attempts, so runs are reproducible.
pub fn quantiles(k: usize) -> Vec<f64> {
    (0..k)
        .map(|i| {
            let p = (i as f64 + 0.5) / k as f64;
            let q = if p < 0.5 { p } else { 1.0 - p };
            let t = (-2.0 * q.ln()).sqrt();
            let z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1.0 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
            if p < 0.5 { -z } else { z }
        })
        .collect()
}
// endregion: refine

// region: memory
/// One thing that happens during a long task.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Event {
    /// Seconds since the task began.
    pub t: f64,
    /// A fact worth remembering, such as "cheese placed on bread" or "pan is hot".
    pub fact: &'static str,
}

/// Stages of a 15-minute cooking task, after MEM's grilled-cheese example.
pub fn grilled_cheese() -> Vec<Event> {
    vec![
        Event { t: 20.0, fact: "pan on the stove" },
        Event { t: 60.0, fact: "stove turned on" },
        Event { t: 150.0, fact: "butter spread" },
        Event { t: 240.0, fact: "cheese on bread" },
        Event { t: 300.0, fact: "sandwich in pan" },
        Event { t: 480.0, fact: "sandwich flipped" },
        Event { t: 690.0, fact: "sandwich on plate" },
        Event { t: 840.0, fact: "stove turned off" },
    ]
}
// endregion: memory
