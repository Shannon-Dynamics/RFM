//! Chapter 18 exercises. Replace each `todo!()`, then run `cargo test -p ch18-research-bets --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 18.1: what best-of-n buys.
/// The exact chance of success with `n` candidates. Hint: a candidate is accepted with chance q;
/// given that it is accepted, it is good with chance p_good * accept_good / q; given that it is
/// rejected, with chance p_good * (1 - accept_good) / (1 - q).
pub fn success(s: &Setup, n: usize) -> f64 {
    todo!("Exercise 18.1")
}

/// Exercise 18.2: the ceiling.
/// The success rate as n grows without bound, and the smallest n (up to 1000) that reaches
/// `target`, or None if the ceiling is below it.
pub fn ceiling(s: &Setup) -> f64 {
    todo!("Exercise 18.2a")
}
pub fn n_for(s: &Setup, target: f64) -> Option<usize> {
    todo!("Exercise 18.2b")
}

/// Exercise 18.3: what it costs.
/// The expected number of candidates examined with `n` allowed, and the expected latency if each
/// candidate costs `generate_ms + verify_ms`.
pub fn expected_latency_ms(s: &Setup, n: usize, generate_ms: f64, verify_ms: f64) -> f64 {
    todo!("Exercise 18.3")
}
