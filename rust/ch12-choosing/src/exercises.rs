//! Chapter 12 exercises. Replace each `todo!()`, then run `cargo test -p ch12-choosing --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 12.1: a weighted score.
/// The sum over criteria of weight times score, divided by the sum of the weights (0 if all
/// weights are 0), so the result is on the same 1 to 3 scale as the matrix.
pub fn weighted_score(f: Family, weights: &[f64; 8]) -> f64 {
    todo!("Exercise 12.1a")
}
/// The family with the highest weighted score; ties go to the family listed first in `ALL`.
pub fn best(weights: &[f64; 8]) -> Family {
    todo!("Exercise 12.1b")
}

/// Exercise 12.2: who is never the right answer?
/// The families in `rows` that are dominated: some other row scores at least as high on every
/// criterion and strictly higher on at least one. Return them in the order they appear in `rows`.
pub fn dominated(rows: &[(Family, [u8; 8])]) -> Vec<Family> {
    todo!("Exercise 12.2")
}

/// Exercise 12.3: how fragile is the ranking?
/// Starting from `weights`, the smallest increase (in steps of 0.25, at most 10) to the weight of
/// criterion `c` that changes the winner. `None` if no increase up to 10 does.
pub fn flip(weights: &[f64; 8], c: usize) -> Option<f64> {
    todo!("Exercise 12.3")
}
