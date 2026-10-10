//! Chapter 13 exercises. Replace each `todo!()`, then run `cargo test -p ch13-data --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 13.1: temperature sampling.
/// Mixture weights proportional to hours^alpha, normalised to sum to 1. alpha = 1 samples in
/// proportion to size; alpha = 0 gives every dataset the same share.
pub fn mixture_weights(sources: &[Source], alpha: f64) -> Vec<f64> {
    todo!("Exercise 13.1")
}

/// Exercise 13.2: how often is the smallest dataset repeated?
/// With a training budget of `budget_hours` of samples drawn by the mixture, each dataset is seen
/// budget * weight / hours times. Return the largest such repetition count; then return the
/// smallest alpha in steps of 0.05 from 0 to 1 for which it is at most `limit`, or None.
pub fn max_epochs(sources: &[Source], alpha: f64, budget_hours: f64) -> f64 {
    todo!("Exercise 13.2a")
}
pub fn alpha_for(sources: &[Source], budget_hours: f64, limit: f64) -> Option<f64> {
    todo!("Exercise 13.2b")
}

/// Exercise 13.3: the other curve.
/// Fit y = c x^k by least squares on (ln x, ln y).
pub fn fit_power_law(points: &[(f64, f64)]) -> PowerLaw {
    todo!("Exercise 13.3")
}
