//! Chapter 14 exercises. Replace each `todo!()`, then run `cargo test -p ch14-post-training --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 14.1: what LoRA trains.
/// Full fine-tuning trains every entry of every matrix. LoRA trains two thin matrices per adapted
/// matrix, of shapes d_out x r and r x d_in. Return (full, lora) parameter counts.
pub fn trainable(ms: &[Matrix], r: usize) -> (usize, usize) {
    todo!("Exercise 14.1")
}

/// Exercise 14.2: improve from reward, but stay close to the base policy.
/// The policy aims at `mu` with spread `sigma`. One round: try mu + sigma * z for each z in
/// `quantiles(k)`, weight each attempt by exp(reward / beta), move to the weighted mean of the
/// attempts, then pull back towards BASE: mu <- (1 - anchor) * new + anchor * BASE.
/// Return the aim after every round, starting with BASE.
pub fn refine(rounds: usize, k: usize, sigma: f64, beta: f64, anchor: f64) -> Vec<f64> {
    todo!("Exercise 14.2")
}

/// Exercise 14.3: two memories.
/// At time `now`, a short-term memory holds the facts from the last `window` seconds; a
/// long-term memory holds every fact so far. Return (short, long) as the facts each one holds.
pub fn recall(events: &[Event], now: f64, window: f64) -> (Vec<&'static str>, Vec<&'static str>) {
    todo!("Exercise 14.3")
}
