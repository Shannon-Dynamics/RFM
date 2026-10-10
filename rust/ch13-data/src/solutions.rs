//! Chapter 13 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn mixture_weights(sources: &[Source], alpha: f64) -> Vec<f64> {
    let raw: Vec<f64> = sources.iter().map(|s| s.hours.powf(alpha)).collect();
    let total: f64 = raw.iter().sum();
    raw.iter().map(|r| r / total).collect()
}

pub fn max_epochs(sources: &[Source], alpha: f64, budget_hours: f64) -> f64 {
    mixture_weights(sources, alpha)
        .iter()
        .zip(sources)
        .map(|(w, s)| budget_hours * w / s.hours)
        .fold(0.0, f64::max)
}

pub fn alpha_for(sources: &[Source], budget_hours: f64, limit: f64) -> Option<f64> {
    (0..=20).map(|i| i as f64 * 0.05).find(|&a| max_epochs(sources, a, budget_hours) <= limit + 1e-9)
}

pub fn fit_power_law(points: &[(f64, f64)]) -> PowerLaw {
    let logs: Vec<(f64, f64)> = points.iter().map(|p| (p.0.ln(), p.1.ln())).collect();
    let n = logs.len() as f64;
    let mx = logs.iter().map(|p| p.0).sum::<f64>() / n;
    let my = logs.iter().map(|p| p.1).sum::<f64>() / n;
    let sxy: f64 = logs.iter().map(|p| (p.0 - mx) * (p.1 - my)).sum();
    let sxx: f64 = logs.iter().map(|p| (p.0 - mx).powi(2)).sum();
    let k = sxy / sxx;
    PowerLaw { c: (my - k * mx).exp(), k }
}
