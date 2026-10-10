//! Reference solutions for the Chapter 2 exercises (compiled with `--features solutions`).

use crate::*;

pub fn min_chunk_for_rate(latency_ms: f32, control_hz: f32, target_hz: f32) -> Option<usize> {
    (1..=1000).find(|&h| sync_rate_hz(latency_ms, h, control_hz) >= target_hz)
}

pub fn fit_log_linear(points: &[(f64, f64)]) -> LogLinear {
    let n = points.len() as f64;
    let mx = points.iter().map(|p| p.0.ln()).sum::<f64>() / n;
    let my = points.iter().map(|p| p.1).sum::<f64>() / n;
    let sxy: f64 = points.iter().map(|p| (p.0.ln() - mx) * (p.1 - my)).sum();
    let sxx: f64 = points.iter().map(|p| (p.0.ln() - mx).powi(2)).sum();
    let b = sxy / sxx;
    LogLinear { a: my - b * mx, b }
}

pub fn guarded_predict(fit: &LogLinear, data: &[(f64, f64)], x: f64, lo: f64, hi: f64) -> Option<f64> {
    let min = data.iter().map(|p| p.0).fold(f64::INFINITY, f64::min);
    let max = data.iter().map(|p| p.0).fold(f64::NEG_INFINITY, f64::max);
    if x < min || x > max {
        return None;
    }
    let y = fit.predict(x);
    (lo..=hi).contains(&y).then_some(y)
}
