// Checks on the chapter's models that do not depend on the exercises.
use ch11_behavior::*;

#[test]
fn binomial_sums_to_one_and_peaks_near_np() {
    let s: f64 = (0..=200).map(|k| binom_pmf(200, k, 0.7)).sum();
    assert!((s - 1.0).abs() < 1e-9);
    let mode = (0..=200).max_by(|a, b| binom_pmf(200, *a, 0.7).total_cmp(&binom_pmf(200, *b, 0.7))).unwrap();
    assert_eq!(mode, 140);
}

#[test]
fn re_planning_every_step_is_jerky_and_open_loop_drifts() {
    let p = Policy { horizon: 20, offset: 0.05, drift: 0.004, seed: 9 };
    let (open, latest) = (run_open_loop(&p, 300), run_latest(&p, 300));
    assert!(jerk(&latest) > jerk(&open));
    assert!(tracking_error(&open) > tracking_error(&latest));
}
