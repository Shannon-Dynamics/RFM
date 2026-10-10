//! Reference solutions for the Chapter 6 exercises (compiled with `--features solutions`).

use crate::world::*;

pub fn inverse_dynamics(prev: &State, next: &State) -> Action {
    Action { ax: (next.vx - DAMPING * prev.vx) / DT, ay: (next.vy - DAMPING * prev.vy) / DT }
}

pub fn drift(
    world: &World,
    model: &ForwardModel,
    start: &State,
    actions: &[Action],
    tolerance: f32,
) -> (Vec<f32>, Option<usize>) {
    let imagined = model.rollout(start, actions);
    let mut real = *start;
    let mut gaps = Vec::with_capacity(actions.len());
    for (a, i) in actions.iter().zip(&imagined) {
        real = world.step(&real, a);
        gaps.push((real.x - i.x).hypot(real.y - i.y));
    }
    let first = gaps.iter().position(|g| *g > tolerance);
    (gaps, first)
}

pub fn choose_chunk(world: &World, model: &ForwardModel, start: &State, candidates: &[Vec<Action>]) -> usize {
    let mut best = (0, f32::INFINITY);
    for (i, c) in candidates.iter().enumerate() {
        let cost = imagined_cost(world, &model.rollout(start, c));
        if cost < best.1 {
            best = (i, cost);
        }
    }
    best.0
}

pub fn sustainable_rate_hz(samples: usize, horizon: usize, ms_per_step: f32, overhead_ms: f32, execute: usize) -> f32 {
    let ms_per_replan = samples as f32 * horizon as f32 * ms_per_step + overhead_ms;
    execute as f32 * 1000.0 / ms_per_replan
}
