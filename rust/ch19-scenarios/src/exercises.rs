//! Chapter 19 exercises. Replace each `todo!()`, then run `cargo test -p ch19-scenarios --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 19.1: keep score.
/// For each scenario, add one for every observed result that supports it and subtract one for
/// every observed result that undercuts it. `observed[i]` says whether row i has been seen.
pub fn tally(table: &[Evidence], observed: &[bool]) -> [i32; 3] {
    todo!("Exercise 19.1")
}

/// Exercise 19.2: is anything ahead?
/// The index of the scenario with the strictly highest score, or None if the top is shared.
pub fn leading(scores: [i32; 3]) -> Option<usize> {
    todo!("Exercise 19.2")
}

/// Exercise 19.3: read a release.
/// Return a short description of every red flag, in this order:
/// "no weights or licence", "no size or hardware", "no latency on named hardware",
/// "simulation only", "too few trials" (fewer than 50 per condition, or not stated),
/// "no intervals", "no independent evaluation", "own numbers not flagged",
/// "baselines not matched", "no failures reported".
pub fn red_flags(r: &Release) -> Vec<&'static str> {
    todo!("Exercise 19.3")
}
