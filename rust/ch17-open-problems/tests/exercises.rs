use ch17_open_problems::exercises::*;
use ch17_open_problems::*;

#[test]
fn ex17_1_errors_compound_unless_the_model_looks_again() {
    let free = rollout_error(0.1, 0.01, 30, None);
    assert_eq!(free.len(), 30);
    assert!((free[0] - 0.01).abs() < 1e-12 && (free[1] - 0.021).abs() < 1e-12);
    // Geometric growth: after 30 steps the error is (1.1^30 - 1) / 0.1 times the per-step noise.
    assert!((free[29] - 0.01 * (1.1f64.powi(30) - 1.0) / 0.1).abs() < 1e-9);
    let grounded = rollout_error(0.1, 0.01, 30, Some(5));
    assert!(grounded.iter().cloned().fold(0.0, f64::max) < 0.07);
    assert!(free[29] > 10.0 * grounded[29]);
    // No growth: error just accumulates linearly.
    assert!((rollout_error(0.0, 0.01, 10, None)[9] - 0.1).abs() < 1e-12);
}

#[test]
fn ex17_2_consistent_views_meet_and_inconsistent_ones_do_not() {
    let [a, b, c] = rig();
    let obj = [2.5, 2.0];
    let (p, miss) = consistency(a, bearing(a, obj), b, bearing(b, obj), c, bearing(c, obj)).unwrap();
    assert!((p[0] - 2.5).abs() < 1e-9 && (p[1] - 2.0).abs() < 1e-9);
    assert!(miss < 1e-9);
    // Camera b's generated view puts the object 4 degrees off: the third view no longer agrees.
    let (_, miss) = consistency(a, bearing(a, obj), b, bearing(b, obj) + 4f64.to_radians(), c, bearing(c, obj)).unwrap();
    assert!(miss > 1f64.to_radians(), "{}", miss.to_degrees());
    // Parallel rays cannot be intersected.
    assert!(consistency(a, 0.0, Camera { at: [0.0, 1.0] }, 0.0, c, 0.0).is_none());
}

#[test]
fn ex17_3_the_monitor_clamps_and_stops() {
    let env = Envelope { max_speed: 0.25, stop_distance: 0.5 };
    let (out, n) = monitor(&[0.1, 0.4, -0.6, 0.2, 0.2], &[2.0, 2.0, 1.0, 0.4, 0.8], env);
    assert_eq!(out, vec![0.1, 0.25, -0.25, 0.0, 0.2]);
    assert_eq!(n, 3);
    let (out, n) = monitor(&[0.1, 0.2], &[3.0, 3.0], env);
    assert_eq!((out, n), (vec![0.1, 0.2], 0));
}
