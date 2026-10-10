// Checks on the chapter's models that do not depend on the exercises.
use ch05_reactive_vla::*;

#[test]
fn the_fast_loop_sets_tracking_and_the_single_model_lags() {
    let single = simulate(Loop::Single { hz: 8.0 });
    let dual = simulate(Loop::Dual { slow_hz: 8.0, fast_hz: 200.0 });
    let (es, ed) = (tracking_error(&single, 0.3, SWITCH_S), tracking_error(&dual, 0.3, SWITCH_S));
    assert!(ed * 5.0 < es, "dual {ed} should track far better than single {es}");
    // Tracking error falls as the fast loop speeds up.
    let e = |hz: f64| tracking_error(&simulate(Loop::Dual { slow_hz: 8.0, fast_hz: hz }), 0.3, SWITCH_S);
    assert!(e(200.0) < e(50.0) && e(50.0) < e(15.0));
}

#[test]
fn metadata_keeps_all_data_at_the_filtered_mistake_rate() {
    let l = outcome(Recipe::LanguageOnly, 0.3, 0.9);
    let f = outcome(Recipe::FilterFailures, 0.3, 0.9);
    let m = outcome(Recipe::MetadataPrompt, 0.3, 0.9);
    assert_eq!(l.mistake_rate, 0.3);
    assert!((f.data_used - 0.66).abs() < 1e-9);
    assert!((m.mistake_rate - f.mistake_rate).abs() < 1e-12 && m.mistake_rate < 0.05);
    assert_eq!(m.data_used, 1.0);
    // Perfect labels remove imitated mistakes entirely.
    assert_eq!(outcome(Recipe::MetadataPrompt, 0.5, 1.0).mistake_rate, 0.0);
}
