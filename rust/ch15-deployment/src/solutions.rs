//! Chapter 15 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn worst_reaction_ms(stages: &[Stage], chunk_ms: f64, asynchronous: bool) -> f64 {
    let l = latency_ms(stages);
    if asynchronous { 2.0 * l } else { chunk_ms + l }
}

pub fn deadline_hit_rate(compute_ms: f64, round_trips: &[f64], deadline_ms: f64) -> f64 {
    if round_trips.is_empty() {
        return 0.0;
    }
    round_trips.iter().filter(|r| compute_ms + **r <= deadline_ms).count() as f64 / round_trips.len() as f64
}

pub fn weakest(profile: &[f64], threshold: f64) -> (usize, f64, usize) {
    let (mut i, mut v) = (0, f64::INFINITY);
    for (k, &p) in profile.iter().enumerate() {
        if p < v {
            i = k;
            v = p;
        }
    }
    (i, v, profile.iter().filter(|p| **p >= threshold).count())
}
