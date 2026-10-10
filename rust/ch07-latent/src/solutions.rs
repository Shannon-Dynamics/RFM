//! Chapter 7 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn quantize(cb: &Codebook, v: [f64; 2]) -> usize {
    let d = |c: &[f64; 2]| (c[0] - v[0]).powi(2) + (c[1] - v[1]).powi(2);
    (0..cb.codes.len()).fold(0, |best, i| if d(&cb.codes[i]) < d(&cb.codes[best]) { i } else { best })
}

pub fn usage(cb: &Codebook, vs: &[[f64; 2]]) -> f64 {
    let mut used = vec![false; cb.codes.len()];
    for v in vs {
        used[quantize(cb, *v)] = true;
    }
    used.iter().filter(|u| **u).count() as f64 / cb.codes.len() as f64
}

pub fn signal_share(pos: f64, action: f64, err: f64, flicker: f64, seed: u64) -> f64 {
    let actual = render(pos + action, flicker, seed);
    let right = pixel_loss(&predict_pixels(pos, action), &actual);
    let wrong = pixel_loss(&predict_pixels(pos, action + err), &actual);
    if wrong == 0.0 { 0.0 } else { (wrong - right) / wrong }
}

pub fn fit_decoder(pairs: &[([f64; 2], [f64; 2])]) -> Option<Mat2> {
    if pairs.len() < 2 {
        return None;
    }
    // Normal equations: M = (sum a z^T) (sum z z^T)^-1.
    let (mut zz, mut az) = ([[0.0; 2]; 2], [[0.0; 2]; 2]);
    for (z, a) in pairs {
        for i in 0..2 {
            for j in 0..2 {
                zz[i][j] += z[i] * z[j];
                az[i][j] += a[i] * z[j];
            }
        }
    }
    let det = zz[0][0] * zz[1][1] - zz[0][1] * zz[1][0];
    if det.abs() < 1e-9 * (zz[0][0] + zz[1][1]).powi(2).max(1e-12) {
        return None;
    }
    let inv = [[zz[1][1] / det, -zz[0][1] / det], [-zz[1][0] / det, zz[0][0] / det]];
    let mut m = [[0.0; 2]; 2];
    for i in 0..2 {
        for j in 0..2 {
            m[i][j] = az[i][0] * inv[0][j] + az[i][1] * inv[1][j];
        }
    }
    Some(m)
}
