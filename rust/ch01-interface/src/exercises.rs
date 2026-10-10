//! Chapter 1 exercises. Replace each `todo!()`, then run
//! `cargo test -p ch01-interface --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 1.1: place a model on the family grid.
/// Return the cell `(space, predicts)`, or `None` if the model predicts nothing the grid covers
/// (no actions, no futures, no plan).
pub fn place_on_grid(card: &ModelCard) -> Option<(Space, Predicts)> {
    todo!("Exercise 1.1")
}

/// Exercise 1.2: apply the book's definition.
/// In scope: the model produces something a robot can act on (actions, predicted futures or a plan),
/// it was pretrained broadly, it adapts by prompting or light fine-tuning, and it was trained on
/// embodied data. Everything else is out of scope, however useful it is to roboticists.
pub fn is_in_scope(card: &ModelCard) -> bool {
    todo!("Exercise 1.2")
}

/// Exercise 1.3: a chunk the controller can run.
/// Valid when it is non-empty, every action has the same, non-zero dimension, and the rate is
/// positive. Return the chunk's duration in milliseconds, or `None` if it is invalid.
pub fn chunk_duration_ms(chunk: &ActionChunk) -> Option<f32> {
    todo!("Exercise 1.3")
}
