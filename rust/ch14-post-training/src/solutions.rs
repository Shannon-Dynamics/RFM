//! Chapter 14 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn trainable(ms: &[Matrix], r: usize) -> (usize, usize) {
    let full = ms.iter().map(|m| m.d_in * m.d_out).sum();
    let lora = ms.iter().map(|m| r * (m.d_in + m.d_out)).sum();
    (full, lora)
}

pub fn refine(rounds: usize, k: usize, sigma: f64, beta: f64, anchor: f64) -> Vec<f64> {
    let zs = quantiles(k);
    let mut mu = BASE;
    let mut out = vec![mu];
    for _ in 0..rounds {
        let (mut num, mut den) = (0.0, 0.0);
        for z in &zs {
            let a = mu + sigma * z;
            let w = (reward(a) / beta).exp();
            num += w * a;
            den += w;
        }
        mu = (1.0 - anchor) * (num / den) + anchor * BASE;
        out.push(mu);
    }
    out
}

pub fn recall(events: &[Event], now: f64, window: f64) -> (Vec<&'static str>, Vec<&'static str>) {
    let past: Vec<&Event> = events.iter().filter(|e| e.t <= now).collect();
    let short = past.iter().filter(|e| e.t > now - window).map(|e| e.fact).collect();
    let long = past.iter().map(|e| e.fact).collect();
    (short, long)
}
