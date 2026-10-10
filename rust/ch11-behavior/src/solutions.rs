//! Chapter 11 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn run_ensemble(p: &Policy, steps: usize, m: f64) -> Vec<f64> {
    // buffers[t] holds every prediction for step t, oldest first.
    let mut buffers: Vec<Vec<f64>> = vec![Vec::new(); steps];
    let mut out = Vec::with_capacity(steps);
    for t in 0..steps {
        for (i, a) in p.predict(t).into_iter().enumerate() {
            if t + i < steps {
                buffers[t + i].push(a);
            }
        }
        let (mut num, mut den) = (0.0, 0.0);
        for (i, a) in buffers[t].iter().enumerate() {
            let w = (-m * i as f64).exp();
            num += w * a;
            den += w;
        }
        out.push(num / den);
    }
    out
}

pub fn wilson(k: u32, n: u32, z: f64) -> (f64, f64) {
    if n == 0 {
        return (0.0, 1.0);
    }
    let (nf, ph) = (n as f64, k as f64 / n as f64);
    let denom = 1.0 + z * z / nf;
    let centre = (ph + z * z / (2.0 * nf)) / denom;
    let half = z * (ph * (1.0 - ph) / nf + z * z / (4.0 * nf * nf)).sqrt() / denom;
    ((centre - half).max(0.0), (centre + half).min(1.0))
}

pub fn power(pa: f64, pb: f64, n: u32, z_crit: f64) -> f64 {
    let fa: Vec<f64> = (0..=n).map(|k| binom_pmf(n, k, pa)).collect();
    let fb: Vec<f64> = (0..=n).map(|k| binom_pmf(n, k, pb)).collect();
    let mut total = 0.0;
    for ka in 0..=n {
        if fa[ka as usize] < 1e-12 {
            continue;
        }
        for kb in 0..=n {
            if z_statistic(ka, kb, n) > z_crit {
                total += fa[ka as usize] * fb[kb as usize];
            }
        }
    }
    total
}
