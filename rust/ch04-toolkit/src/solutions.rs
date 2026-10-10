//! Reference solutions for the Chapter 4 exercises (compiled with `--features solutions`).

use crate::*;

pub fn encode(b: &Binning, x: f32) -> u32 {
    let u = ((x.clamp(b.lo, b.hi) - b.lo) / (b.hi - b.lo)) * b.bins as f32;
    (u as u32).min(b.bins - 1)
}

pub fn decode(b: &Binning, token: u32) -> f32 {
    b.lo + (token as f32 + 0.5) * (b.hi - b.lo) / b.bins as f32
}

pub fn sample(flow: &TwoModes, x0: f64, steps: usize) -> f64 {
    let dt = 1.0 / steps as f64;
    let mut x = x0;
    for i in 0..steps {
        x += dt * flow.velocity(x, i as f64 * dt);
    }
    x
}

pub fn fraction_near_modes(flow: &TwoModes, noises: &[f64], steps: usize, tol: f64) -> f64 {
    let near = noises.iter().filter(|&&z| (sample(flow, z, steps).abs() - flow.mu).abs() < tol).count();
    near as f64 / noises.len() as f64
}
