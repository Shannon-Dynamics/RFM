// Checks on the chapter's models that do not depend on the exercises.
use ch14_post_training::*;

#[test]
fn quantiles_are_symmetric_and_spread() {
    let q = quantiles(16);
    assert!((q.iter().sum::<f64>()).abs() < 1e-9);
    assert!(q[0] < -1.5 && q[15] > 1.5);
}

#[test]
fn reward_peaks_at_the_best_setting() {
    assert_eq!(reward(BEST), 1.0);
    assert!(reward(BASE) < 0.03);
}
