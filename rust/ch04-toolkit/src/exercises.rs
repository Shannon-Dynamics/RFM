//! Chapter 4 exercises. Replace each `todo!()`, then run `cargo test -p ch04-toolkit --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 4.1: tokens.
/// Map `x` (clamped to [lo, hi]) to its bin index, and a bin index back to the bin's centre.
/// The round trip should never move a value by more than half a bin width.
pub fn encode(b: &Binning, x: f32) -> u32 {
    todo!("Exercise 4.1a")
}
pub fn decode(b: &Binning, token: u32) -> f32 {
    todo!("Exercise 4.1b")
}

/// Exercise 4.2: denoising.
/// Turn noise `x0` into an action by integrating the flow's velocity from t = 0 to t = 1 with
/// `steps` equal Euler steps: x <- x + dt * v(x, t).
pub fn sample(flow: &TwoModes, x0: f64, steps: usize) -> f64 {
    todo!("Exercise 4.2")
}

/// Exercise 4.3: the regression trap.
/// The mean squared error regressor's answer is the mean of the distribution. Return the fraction
/// of `samples` (drawn by `sample` from noise values `noises`) that land within `tol` of a mode,
/// so you can compare one denoising step with many.
pub fn fraction_near_modes(flow: &TwoModes, noises: &[f64], steps: usize, tol: f64) -> f64 {
    todo!("Exercise 4.3")
}
