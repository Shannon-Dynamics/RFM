//! Chapter 5 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn sequential_passes(head: Head, horizon: usize, dof: usize) -> usize {
    match head {
        Head::Tokens => horizon * dof,
        Head::Parallel => 1,
        Head::Denoising { steps } => steps,
    }
}

pub fn chunk_latency_ms(head: Head, horizon: usize, dof: usize, cost: &PassCost) -> f64 {
    let per_pass = match head {
        Head::Tokens | Head::Parallel => cost.decoder_ms,
        Head::Denoising { .. } => cost.expert_ms,
    };
    cost.backbone_ms + sequential_passes(head, horizon, dof) as f64 * per_pass
}

pub fn dct(x: &[f64]) -> Vec<f64> {
    let nf = x.len() as f64;
    (0..x.len())
        .map(|k| {
            let scale = if k == 0 { (1.0 / nf).sqrt() } else { (2.0 / nf).sqrt() };
            scale
                * x.iter()
                    .enumerate()
                    .map(|(i, v)| v * (std::f64::consts::PI * (i as f64 + 0.5) * k as f64 / nf).cos())
                    .sum::<f64>()
        })
        .collect()
}

pub fn compress(x: &[f64], keep: usize) -> Vec<f64> {
    let mut c = dct(x);
    c.iter_mut().skip(keep).for_each(|v| *v = 0.0);
    idct(&c)
}

pub fn reaction_time(tr: &Trace, tol: f64) -> Option<f64> {
    // Walk backwards to find the start of the final run of in-tolerance samples.
    let mut settle = None;
    for i in (0..tr.t.len()).rev() {
        if tr.t[i] < SWITCH_S || (tr.hand[i] - tr.target[i]).abs() > tol {
            break;
        }
        settle = Some(tr.t[i]);
    }
    settle.map(|t| t - SWITCH_S)
}
