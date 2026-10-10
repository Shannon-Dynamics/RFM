// Checks on the chapter's models that do not depend on the exercises.
use ch17_open_problems::*;

#[test]
fn angle_diff_wraps_around() {
    assert!((angle_diff(0.1, std::f64::consts::TAU - 0.1) - 0.2).abs() < 1e-12);
    assert!(angle_diff(1.0, 1.0).abs() < 1e-12);
}

#[test]
fn bearings_point_at_the_object() {
    let [a, b, _] = rig();
    assert!((bearing(a, [1.0, 1.0]) - std::f64::consts::FRAC_PI_4).abs() < 1e-12);
    assert!((bearing(b, [4.0, 2.0]) - std::f64::consts::FRAC_PI_2).abs() < 1e-12);
}
