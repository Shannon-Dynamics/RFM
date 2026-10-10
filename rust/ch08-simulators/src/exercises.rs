//! Chapter 8 exercises. Replace each `todo!()`, then run `cargo test -p ch08-simulators --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 8.1: learn a world model from logged pushes.
/// Fit `distance = intercept + slope * theta` by least squares over all samples (`theta`, `d`).
/// If any sample fell off (d > EDGE) and any did not, set the edge halfway between the strongest
/// push that stayed on and the weakest push that fell; otherwise leave it `None`.
pub fn fit_world_model(samples: &[(f64, f64)]) -> WorldModel {
    todo!("Exercise 8.1")
}

/// Exercise 8.2: train a policy inside the model.
/// Greedy local search from `start`: each iteration, compare the model's reward at theta - step,
/// theta and theta + step (kept within [0, 1], and at most `trust` if given) and move to the
/// best, preferring to stay put on ties. Return every theta visited, starting with `start`.
pub fn optimize(model: &WorldModel, start: f64, step: f64, iters: usize, trust: Option<f64>) -> Vec<f64> {
    todo!("Exercise 8.2")
}

/// Exercise 8.3: plausible is not feasible.
/// Count the steps of a rollout whose implied speed exceeds `vmax`, plus the steps whose implied
/// acceleration (change of velocity per second) exceeds `amax`.
pub fn violations(pos: &[f64], dt: f64, vmax: f64, amax: f64) -> usize {
    todo!("Exercise 8.3")
}
