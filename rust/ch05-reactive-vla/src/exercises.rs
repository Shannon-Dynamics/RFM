//! Chapter 5 exercises. Replace each `todo!()`, then run `cargo test -p ch05-reactive-vla --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 5.1: what a chunk costs.
/// The number of passes that must run one after another to produce a chunk of `horizon` steps
/// with `dof` action dimensions, after the backbone has read the inputs once.
pub fn sequential_passes(head: Head, horizon: usize, dof: usize) -> usize {
    todo!("Exercise 5.1a")
}
/// Latency of one chunk: the backbone once, then every sequential pass of the head
/// (decoder passes for token heads, expert passes for denoising heads).
pub fn chunk_latency_ms(head: Head, horizon: usize, dof: usize, cost: &PassCost) -> f64 {
    todo!("Exercise 5.1b")
}

/// Exercise 5.2: FAST in miniature.
/// The orthonormal DCT-II, so that `idct(&dct(x))` returns `x`:
/// c_k = s_k * sum_i x_i * cos(pi * (i + 0.5) * k / n), with s_0 = sqrt(1/n) and s_k = sqrt(2/n).
pub fn dct(x: &[f64]) -> Vec<f64> {
    todo!("Exercise 5.2a")
}
/// Keep the first `keep` coefficients, set the rest to zero, and transform back.
pub fn compress(x: &[f64], keep: usize) -> Vec<f64> {
    todo!("Exercise 5.2b")
}

/// Exercise 5.3: what the slow system costs.
/// Seconds from the instruction switch until the hand first comes within `tol` of the newly
/// named cup and stays within `tol` for the rest of the trace. `None` if it never settles.
pub fn reaction_time(tr: &Trace, tol: f64) -> Option<f64> {
    todo!("Exercise 5.3")
}
