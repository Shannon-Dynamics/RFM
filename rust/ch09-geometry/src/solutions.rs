//! Chapter 9 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;
use std::collections::BTreeSet;

pub fn invisible_jams(clearance_mm: f64, px_mm: f64, step_mm: f64, max_mm: f64) -> Vec<f64> {
    let centred = PegInHole { offset_mm: 0.0, clearance_mm, px_mm }.edge_pixel();
    let steps = (max_mm / step_mm).round() as usize;
    (0..=steps)
        .map(|i| i as f64 * step_mm)
        .filter(|&o| {
            let p = PegInHole { offset_mm: o, clearance_mm, px_mm };
            p.edge_pixel() == centred && p.jams()
        })
        .collect()
}

pub fn chamfer(a: &[P2], b: &[P2]) -> f64 {
    let one_way = |x: &[P2], y: &[P2]| {
        x.iter().map(|p| y.iter().map(|q| dist(*p, *q)).fold(f64::INFINITY, f64::min)).sum::<f64>() / x.len() as f64
    };
    one_way(a, b) + one_way(b, a)
}

pub fn voxelize(pts: &[P2], size: f64) -> BTreeSet<(i64, i64)> {
    pts.iter().map(|p| ((p[0] / size).floor() as i64, (p[1] / size).floor() as i64)).collect()
}

pub fn iou(a: &BTreeSet<(i64, i64)>, b: &BTreeSet<(i64, i64)>) -> f64 {
    let union = a.union(b).count();
    if union == 0 { 1.0 } else { a.intersection(b).count() as f64 / union as f64 }
}
