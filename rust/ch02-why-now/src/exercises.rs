//! Chapter 2 exercises. Replace each `todo!()`, then run `cargo test -p ch02-why-now --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 2.1: how long must a chunk be?
/// With synchronous execution, find the shortest chunk length (up to 1,000) whose delivered rate
/// reaches `target_hz`, or `None` if no chunk length does.
pub fn min_chunk_for_rate(latency_ms: f32, control_hz: f32, target_hz: f32) -> Option<usize> {
    todo!("Exercise 2.1")
}

/// Exercise 2.2: fit the curve.
/// Least-squares fit of y = a + b ln(x) through any number of (x, y) points (x > 0, at least two
/// distinct x values).
pub fn fit_log_linear(points: &[(f64, f64)]) -> LogLinear {
    todo!("Exercise 2.2")
}

/// Exercise 2.3: know when to stop believing it.
/// Predict y at `x` from the fit, but return `None` when `x` lies outside the range of the data the
/// curve was fitted on, or when the prediction leaves the valid interval [lo, hi].
pub fn guarded_predict(fit: &LogLinear, data: &[(f64, f64)], x: f64, lo: f64, hi: f64) -> Option<f64> {
    todo!("Exercise 2.3")
}
