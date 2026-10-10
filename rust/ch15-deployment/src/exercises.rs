//! Chapter 15 exercises. Replace each `todo!()`, then run `cargo test -p ch15-deployment --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 15.1: how long until the robot reacts?
/// Something changes just after a frame is captured. Synchronous execution starts the next
/// inference only after the current chunk of `chunk_ms` finishes, so in the worst case the change
/// is first seen after the chunk, then takes the pipeline latency to act on. Asynchronous
/// execution starts a new inference as soon as the last one ends, so the change is seen at most
/// one latency later. Return the worst-case reaction time in milliseconds.
pub fn worst_reaction_ms(stages: &[Stage], chunk_ms: f64, asynchronous: bool) -> f64 {
    todo!("Exercise 15.1")
}

/// Exercise 15.2: what the network does to a deadline.
/// For each network round trip in `round_trips`, the pipeline's latency is `compute_ms` plus that
/// round trip. Return the fraction of cycles whose latency is at most `deadline_ms`.
pub fn deadline_hit_rate(compute_ms: f64, round_trips: &[f64], deadline_ms: f64) -> f64 {
    todo!("Exercise 15.2")
}

/// Exercise 15.3: the weakest link.
/// Return the index and value of the implication with the lowest fulfilment, and the number of
/// implications at or above `threshold`.
pub fn weakest(profile: &[f64], threshold: f64) -> (usize, f64, usize) {
    todo!("Exercise 15.3")
}
