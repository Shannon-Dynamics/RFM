use ch01_interface::exercises::*;
use ch01_interface::*;

fn card(name: &str) -> ModelCard {
    sample_cards().into_iter().find(|c| c.name == name).unwrap()
}

#[test]
fn ex1_1_models_land_in_their_cells() {
    assert_eq!(place_on_grid(&card("pi-0.5")), Some((Space::PixelsOrVideoLatents, Predicts::ActionsOnly)));
    assert_eq!(place_on_grid(&card("DreamZero")), Some((Space::PixelsOrVideoLatents, Predicts::ActionsPlusFutures)));
    assert_eq!(place_on_grid(&card("V-JEPA 2-AC")), Some((Space::FeatureLatents, Predicts::ActionsPlusFutures)));
    assert_eq!(place_on_grid(&card("PointWorld")), Some((Space::ExplicitGeometry, Predicts::FuturesOnly)));
    assert_eq!(place_on_grid(&card("Gemini Robotics-ER 1.6")), Some((Space::LanguageOrActionTokens, Predicts::PlanInLanguage)));
    assert_eq!(place_on_grid(&card("TRI Large Behavior Model")), Some((Space::ContinuousNoLanguage, Predicts::ActionsOnly)));
    assert_eq!(place_on_grid(&card("Segment Anything (perception only)")), None);
}

#[test]
fn ex1_2_the_definition_draws_the_line() {
    for name in ["pi-0.5", "OpenVLA", "DreamZero", "V-JEPA 2-AC", "Cosmos-Predict2.5", "PointWorld", "Gemini Robotics-ER 1.6", "TRI Large Behavior Model"] {
        assert!(is_in_scope(&card(name)), "{name} should be in scope");
    }
    for name in ["Segment Anything (perception only)", "LLM planner over hand-coded skills", "Single-task Diffusion Policy"] {
        assert!(!is_in_scope(&card(name)), "{name} should be out of scope");
    }
}

#[test]
fn ex1_3_chunks_are_checked_before_they_run() {
    let ok = ActionChunk { rate_hz: 50.0, actions: vec![vec![0.0; 7]; 25] };
    assert_eq!(chunk_duration_ms(&ok), Some(500.0));
    assert_eq!(chunk_duration_ms(&ActionChunk { rate_hz: 50.0, actions: vec![] }), None);
    assert_eq!(chunk_duration_ms(&ActionChunk { rate_hz: 0.0, actions: vec![vec![0.0; 7]] }), None);
    assert_eq!(chunk_duration_ms(&ActionChunk { rate_hz: 50.0, actions: vec![vec![0.0; 7], vec![0.0; 6]] }), None);
    assert_eq!(chunk_duration_ms(&ActionChunk { rate_hz: 50.0, actions: vec![vec![]] }), None);
}
