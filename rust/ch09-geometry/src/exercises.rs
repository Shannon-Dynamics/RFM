//! Chapter 9 exercises. Replace each `todo!()`, then run `cargo test -p ch09-geometry --test exercises`.
#![allow(unused_variables)]

use crate::*;
use std::collections::BTreeSet;

/// Exercise 9.1: what the camera cannot tell apart.
/// Offsets from 0 to `max_mm` in steps of `step_mm` (inclusive of 0) for which the camera's edge
/// pixel is the same as for a perfectly centred peg, yet the peg jams.
pub fn invisible_jams(clearance_mm: f64, px_mm: f64, step_mm: f64, max_mm: f64) -> Vec<f64> {
    todo!("Exercise 9.1")
}

/// Exercise 9.2: chamfer distance.
/// The mean, over points of `a`, of the distance to the nearest point of `b`, plus the same from
/// `b` to `a`. Zero exactly when every point of each cloud is also in the other.
pub fn chamfer(a: &[P2], b: &[P2]) -> f64 {
    todo!("Exercise 9.2")
}

/// Exercise 9.3: occupancy.
/// The set of grid cells (cell size `size`) containing at least one point, using floor division.
pub fn voxelize(pts: &[P2], size: f64) -> BTreeSet<(i64, i64)> {
    todo!("Exercise 9.3a")
}
/// Intersection over union of two occupancy sets; 1.0 when both are empty.
pub fn iou(a: &BTreeSet<(i64, i64)>, b: &BTreeSet<(i64, i64)>) -> f64 {
    todo!("Exercise 9.3b")
}
