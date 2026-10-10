//! Chapter 17 exercises. Replace each `todo!()`, then run `cargo test -p ch17-open-problems --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 17.1: errors that compound.
/// An imagined rollout's error grows each step as e <- (1 + growth) * e + noise, starting from 0.
/// If `reground_every` is Some(k), every k-th step the model is shown a real observation and the
/// error resets to `noise`. Return the error after each of `steps` steps.
pub fn rollout_error(growth: f64, noise: f64, steps: usize, reground_every: Option<usize>) -> Vec<f64> {
    todo!("Exercise 17.1")
}

/// Exercise 17.2: do the views agree?
/// Intersect the bearing rays from cameras a and b to find where they jointly place the object.
/// Return that point and the angle by which camera c's bearing misses it. None if the rays are
/// parallel.
pub fn consistency(a: Camera, ba: f64, b: Camera, bb: f64, c: Camera, bc: f64) -> Option<(P, f64)> {
    todo!("Exercise 17.2")
}

/// Exercise 17.3: the monitor.
/// For each commanded speed and the person's distance at that step, pass the command through the
/// envelope: zero if the person is closer than the stop distance, otherwise clamped to the speed
/// limit. Return the executed speeds and how many steps the monitor changed.
pub fn monitor(commands: &[f64], distances: &[f64], env: Envelope) -> (Vec<f64>, usize) {
    todo!("Exercise 17.3")
}
