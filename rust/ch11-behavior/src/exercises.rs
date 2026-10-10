//! Chapter 11 exercises. Replace each `todo!()`, then run `cargo test -p ch11-behavior --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 11.1: temporal ensembling (ACT, Zhao et al. 2023).
/// Query the policy at every step. The action executed at step t is the weighted average of every
/// prediction made so far for step t, with weight exp(-m * i), where i = 0 is the oldest of them.
pub fn run_ensemble(p: &Policy, steps: usize, m: f64) -> Vec<f64> {
    todo!("Exercise 11.1")
}

/// Exercise 11.2: an honest error bar.
/// The Wilson score interval for `k` successes in `n` trials at critical value `z` (1.96 for 95%).
pub fn wilson(k: u32, n: u32, z: f64) -> (f64, f64) {
    todo!("Exercise 11.2")
}

/// Exercise 11.3: how many trials?
/// The probability that, with `n` trials of each policy, a one-sided pooled z-test finds policy B
/// better than policy A (z_statistic above `z_crit`), when their true success rates are `pa` and `pb`.
pub fn power(pa: f64, pb: f64, n: u32, z_crit: f64) -> f64 {
    todo!("Exercise 11.3")
}
