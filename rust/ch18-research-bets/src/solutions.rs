//! Chapter 18 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn success(s: &Setup, n: usize) -> f64 {
    let q = s.accept_rate();
    let none = (1.0 - q).powi(n as i32);
    let precision = if q > 0.0 { s.p_good * s.verifier.accept_good / q } else { 0.0 };
    // If every candidate was rejected, the one executed was itself rejected.
    let good_if_rejected = if q < 1.0 { s.p_good * (1.0 - s.verifier.accept_good) / (1.0 - q) } else { 0.0 };
    (1.0 - none) * precision + none * good_if_rejected
}

pub fn ceiling(s: &Setup) -> f64 {
    let q = s.accept_rate();
    if q > 0.0 { s.p_good * s.verifier.accept_good / q } else { s.p_good }
}

pub fn n_for(s: &Setup, target: f64) -> Option<usize> {
    (1..=1000).find(|&n| success(s, n) >= target)
}

pub fn expected_latency_ms(s: &Setup, n: usize, generate_ms: f64, verify_ms: f64) -> f64 {
    let q = s.accept_rate();
    let examined = if q > 0.0 { (1.0 - (1.0 - q).powi(n as i32)) / q } else { n as f64 };
    examined * (generate_ms + verify_ms)
}
