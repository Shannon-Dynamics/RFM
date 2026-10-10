//! Chapter 7 exercises. Replace each `todo!()`, then run `cargo test -p ch07-latent --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 7.1: a latent action codebook.
/// Return the index of the code nearest to `v` (Euclidean distance), as a VQ layer does.
pub fn quantize(cb: &Codebook, v: [f64; 2]) -> usize {
    todo!("Exercise 7.1a")
}
/// The fraction of codes that at least one of `vs` quantizes to. A value near 1/len means the
/// codebook has collapsed: every transition gets the same latent action.
pub fn usage(cb: &Codebook, vs: &[[f64; 2]]) -> f64 {
    todo!("Exercise 7.1b")
}

/// Exercise 7.2: what the pixel loss hears.
/// A predictor knows the block at `pos` and the action, but gets the action wrong by `err`
/// pixels. Compare its pixel loss against the next frame (rendered with `flicker` and `seed`) with
/// the loss it would have with the right action. Return the share of its loss caused by the
/// action error: (loss_wrong - loss_right) / loss_wrong, or 0 when loss_wrong is 0.
pub fn signal_share(pos: f64, action: f64, err: f64, flicker: f64, seed: u64) -> f64 {
    todo!("Exercise 7.2")
}

/// Exercise 7.3: the per-robot decoder.
/// Fit the 2 x 2 map M with a = M z by least squares from labelled pairs (z, a). Return `None`
/// if the pairs cannot determine M (fewer than two, or all z on one line through the origin).
pub fn fit_decoder(pairs: &[([f64; 2], [f64; 2])]) -> Option<Mat2> {
    todo!("Exercise 7.3")
}
