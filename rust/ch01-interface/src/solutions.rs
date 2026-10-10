//! Reference solutions for the Chapter 1 exercises (compiled with `--features solutions`).

use crate::*;

pub fn place_on_grid(card: &ModelCard) -> Option<(Space, Predicts)> {
    let predicts = match (card.outputs_actions, card.outputs_futures, card.outputs_language_plan) {
        (true, true, _) => Predicts::ActionsPlusFutures,
        (true, false, _) => Predicts::ActionsOnly,
        (false, true, _) => Predicts::FuturesOnly,
        (false, false, true) => Predicts::PlanInLanguage,
        (false, false, false) => return None,
    };
    Some((card.space, predicts))
}

pub fn is_in_scope(card: &ModelCard) -> bool {
    let actionable = card.outputs_actions || card.outputs_futures || card.outputs_language_plan;
    actionable && card.broad_pretraining && card.adapts_cheaply && card.embodied_training
}

pub fn chunk_duration_ms(chunk: &ActionChunk) -> Option<f32> {
    let dim = chunk.actions.first()?.len();
    if dim == 0 || chunk.rate_hz <= 0.0 || chunk.actions.iter().any(|a| a.len() != dim) {
        return None;
    }
    Some(chunk.actions.len() as f32 * 1000.0 / chunk.rate_hz)
}
