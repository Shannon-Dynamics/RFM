//! Chapter 12 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn weighted_score(f: Family, weights: &[f64; 8]) -> f64 {
    let total: f64 = weights.iter().sum();
    if total == 0.0 {
        return 0.0;
    }
    scores(f).iter().zip(weights).map(|(s, w)| *s as f64 * w).sum::<f64>() / total
}

pub fn best(weights: &[f64; 8]) -> Family {
    let mut top = ALL[0];
    for f in ALL {
        if weighted_score(f, weights) > weighted_score(top, weights) + 1e-12 {
            top = f;
        }
    }
    top
}

pub fn dominated(rows: &[(Family, [u8; 8])]) -> Vec<Family> {
    rows.iter()
        .filter(|(f, a)| {
            rows.iter().any(|(g, b)| {
                g != f && b.iter().zip(a).all(|(x, y)| x >= y) && b.iter().zip(a).any(|(x, y)| x > y)
            })
        })
        .map(|(f, _)| *f)
        .collect()
}

pub fn flip(weights: &[f64; 8], c: usize) -> Option<f64> {
    let start = best(weights);
    (1..=40).map(|k| k as f64 * 0.25).find(|&d| {
        let mut w = *weights;
        w[c] += d;
        best(&w) != start
    })
}
