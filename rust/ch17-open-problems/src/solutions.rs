//! Chapter 17 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn rollout_error(growth: f64, noise: f64, steps: usize, reground_every: Option<usize>) -> Vec<f64> {
    let mut e = 0.0;
    (1..=steps)
        .map(|t| {
            e = (1.0 + growth) * e + noise;
            if reground_every.is_some_and(|k| t % k == 0) {
                e = noise;
            }
            e
        })
        .collect()
}

pub fn consistency(a: Camera, ba: f64, b: Camera, bb: f64, c: Camera, bc: f64) -> Option<(P, f64)> {
    let (da, db) = ([ba.cos(), ba.sin()], [bb.cos(), bb.sin()]);
    let den = da[0] * db[1] - da[1] * db[0];
    if den.abs() < 1e-12 {
        return None;
    }
    let (wx, wy) = (b.at[0] - a.at[0], b.at[1] - a.at[1]);
    let s = (wx * db[1] - wy * db[0]) / den;
    let p = [a.at[0] + s * da[0], a.at[1] + s * da[1]];
    Some((p, angle_diff(bearing(c, p), bc)))
}

pub fn monitor(commands: &[f64], distances: &[f64], env: Envelope) -> (Vec<f64>, usize) {
    let mut changed = 0;
    let out = commands
        .iter()
        .zip(distances)
        .map(|(&v, &d)| {
            let safe = if d < env.stop_distance { 0.0 } else { v.clamp(-env.max_speed, env.max_speed) };
            if safe != v {
                changed += 1;
            }
            safe
        })
        .collect();
    (out, changed)
}
