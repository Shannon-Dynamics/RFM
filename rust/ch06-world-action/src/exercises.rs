//! Chapter 6 exercises. Replace each `todo!()`, then run
//! `cargo test -p ch06-world-action --test exercises`.
//! Reference solutions: `cargo test -p ch06-world-action --features solutions`.
#![allow(unused_variables)]

use crate::world::*;

/// Exercise 6.1: inverse dynamics.
/// Given two consecutive real states, recover the action that produced the transition.
/// Hint: the real dynamics are `v' = DAMPING * v + DT * a`.
pub fn inverse_dynamics(prev: &State, next: &State) -> Action {
    todo!("Exercise 6.1")
}

/// Exercise 6.2: watch imagination drift.
/// Execute `actions` from `start` in the real world and in `model`'s imagination. Return the
/// distance between real and imagined puck after every step, and the first step (0-based) at
/// which that distance exceeds `tolerance`, or `None` if it never does.
pub fn drift(
    world: &World,
    model: &ForwardModel,
    start: &State,
    actions: &[Action],
    tolerance: f32,
) -> (Vec<f32>, Option<usize>) {
    todo!("Exercise 6.2")
}

/// Exercise 6.3: choose by imagining.
/// Imagine every candidate chunk with `model` and return the index of the one whose imagined
/// future has the lowest `imagined_cost`. Ties go to the lower index.
pub fn choose_chunk(world: &World, model: &ForwardModel, start: &State, candidates: &[Vec<Action>]) -> usize {
    todo!("Exercise 6.3")
}

/// Exercise 6.4 (stretch): the price of imagination.
/// A planner imagines `samples` candidates of `horizon` steps before every replan; each imagined
/// step costs `ms_per_step` milliseconds and every replan adds `overhead_ms`. It replans once per
/// executed chunk of `execute` control steps. Return the highest control rate in Hz it can sustain,
/// i.e. executed steps per second of compute.
pub fn sustainable_rate_hz(samples: usize, horizon: usize, ms_per_step: f32, overhead_ms: f32, execute: usize) -> f32 {
    todo!("Exercise 6.4")
}
