use ch11_behavior::exercises::*;
use ch11_behavior::*;

const P: Policy = Policy { horizon: 20, offset: 0.05, drift: 0.004, seed: 9 };

#[test]
fn ex11_1_ensembling_is_smooth_and_stays_on_track() {
    let n = 300;
    let (open, latest, ens) = (run_open_loop(&P, n), run_latest(&P, n), run_ensemble(&P, n, 0.1));
    assert_eq!(ens.len(), n);
    // Smoother than re-planning every step, and than jumping at chunk boundaries.
    assert!(jerk(&ens) < 0.5 * jerk(&latest), "ensemble {} latest {}", jerk(&ens), jerk(&latest));
    assert!(jerk(&ens) < jerk(&open));
    // More accurate than executing whole chunks open loop.
    assert!(tracking_error(&ens) < tracking_error(&open));
    // At step 0 there is only one prediction, so the ensemble equals it.
    assert!((ens[0] - P.predict(0)[0]).abs() < 1e-12);
    // A huge m trusts only the oldest prediction: that is open-loop execution of the first chunk.
    let oldest = run_ensemble(&P, 20, 50.0);
    assert!(oldest.iter().zip(P.predict(0)).all(|(a, b)| (a - b).abs() < 1e-9));
}

#[test]
fn ex11_2_wilson_intervals_behave_at_the_edges() {
    let (lo, hi) = wilson(8, 10, 1.96);
    assert!((lo - 0.490).abs() < 0.002 && (hi - 0.943).abs() < 0.002, "{lo} {hi}");
    // Ten out of ten is not certainty.
    let (lo, hi) = wilson(10, 10, 1.96);
    assert!(lo < 0.73 && (hi - 1.0).abs() < 1e-12);
    let (lo, _) = wilson(0, 10, 1.96);
    assert!(lo.abs() < 1e-12);
    // More trials, narrower interval.
    let w = |n: u32| { let (a, b) = wilson(n * 7 / 10, n, 1.96); b - a };
    assert!(w(200) < w(50) && w(50) < w(10));
}

#[test]
fn ex11_3_power_grows_with_trials_and_gap() {
    let z = 1.645;
    // Identical policies: the test fires about 5 percent of the time, never much more.
    let null = power(0.6, 0.6, 50, z);
    assert!(null < 0.07, "{null}");
    // A 10-point gap is easy to miss with 20 trials each and usually caught with 300.
    assert!(power(0.6, 0.7, 20, z) < 0.3);
    assert!(power(0.6, 0.7, 300, z) > 0.8);
    assert!(power(0.5, 0.8, 30, z) > power(0.6, 0.7, 30, z));
}
