use ch13_data::exercises::*;
use ch13_data::*;

#[test]
fn ex13_1_temperature_moves_from_uniform_to_proportional() {
    let m = example_mixture();
    let close = |a: &[f64], b: &[f64]| a.iter().zip(b).all(|(x, y)| (x - y).abs() < 1e-9);
    assert!(close(&mixture_weights(&m, 0.0), &[0.2; 5]));
    let total: f64 = m.iter().map(|s| s.hours).sum();
    let prop: Vec<f64> = m.iter().map(|s| s.hours / total).collect();
    assert!(close(&mixture_weights(&m, 1.0), &prop));
    let half = mixture_weights(&m, 0.5);
    assert!((half.iter().sum::<f64>() - 1.0).abs() < 1e-12);
    // The smallest dataset's share falls as alpha rises.
    assert!(half[0] < 0.2 && half[0] > prop[0]);
}

#[test]
fn ex13_2_uniform_mixtures_repeat_small_datasets() {
    let m = example_mixture();
    let total: f64 = m.iter().map(|s| s.hours).sum();
    // Uniform sampling shows DROID's 350 hours more than 16 times in one pass over the total.
    assert!((max_epochs(&m, 0.0, total) - 0.2 * total / 350.0).abs() < 1e-9);
    // Proportional sampling sees every dataset exactly once.
    assert!((max_epochs(&m, 1.0, total) - 1.0).abs() < 1e-9);
    let a = alpha_for(&m, total, 5.0).expect("some alpha keeps repetition at 5 or below");
    assert!((a - 0.55).abs() < 1e-9, "{a}");
    assert_eq!(alpha_for(&m, total, 0.5), None);
}

#[test]
fn ex13_3_two_curves_fit_the_same_points_and_disagree_beyond_them() {
    let pow = fit_power_law(&EGOSCALE);
    let lin = LogLinear::fit(&EGOSCALE);
    // Both describe the measured range about equally well ...
    assert!(rmse(&EGOSCALE, |x| pow.predict(x)) < 0.035);
    assert!(rmse(&EGOSCALE, |x| lin.predict(x)) < 0.035);
    // ... and part ways outside it: at 100,000 hours one predicts a task completion above 100%.
    assert!(pow.predict(100_000.0) > 1.0 && lin.predict(100_000.0) < 0.9);
    // An exact power law is recovered exactly.
    let exact: Vec<(f64, f64)> = [1.0, 2.0, 5.0, 10.0].iter().map(|&x: &f64| (x, 3.0 * x.powf(0.4))).collect();
    let p = fit_power_law(&exact);
    assert!((p.c - 3.0).abs() < 1e-9 && (p.k - 0.4).abs() < 1e-9);
}
