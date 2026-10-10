//! Chapter 8 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn fit_world_model(samples: &[(f64, f64)]) -> WorldModel {
    let n = samples.len() as f64;
    let mx = samples.iter().map(|s| s.0).sum::<f64>() / n;
    let my = samples.iter().map(|s| s.1).sum::<f64>() / n;
    let sxx: f64 = samples.iter().map(|s| (s.0 - mx).powi(2)).sum();
    let sxy: f64 = samples.iter().map(|s| (s.0 - mx) * (s.1 - my)).sum();
    let slope = if sxx > 0.0 { sxy / sxx } else { 0.0 };
    let stayed = samples.iter().filter(|s| s.1 <= EDGE).map(|s| s.0).fold(f64::NEG_INFINITY, f64::max);
    let fell = samples.iter().filter(|s| s.1 > EDGE).map(|s| s.0).fold(f64::INFINITY, f64::min);
    let edge_theta = (stayed.is_finite() && fell.is_finite()).then(|| (stayed + fell) / 2.0);
    WorldModel { intercept: my - slope * mx, slope, edge_theta }
}

pub fn optimize(model: &WorldModel, start: f64, step: f64, iters: usize, trust: Option<f64>) -> Vec<f64> {
    let hi = trust.unwrap_or(1.0).min(1.0);
    let mut path = vec![start];
    let mut th = start;
    for _ in 0..iters {
        let mut best = th;
        for cand in [th - step, th + step] {
            let c = cand.clamp(0.0, hi);
            if model.reward(c) > model.reward(best) {
                best = c;
            }
        }
        th = best;
        path.push(th);
    }
    path
}

pub fn violations(pos: &[f64], dt: f64, vmax: f64, amax: f64) -> usize {
    let v = velocities(pos, dt);
    let fast = v.iter().filter(|x| x.abs() > vmax).count();
    let jerky = v.windows(2).filter(|w| ((w[1] - w[0]) / dt).abs() > amax).count();
    fast + jerky
}
