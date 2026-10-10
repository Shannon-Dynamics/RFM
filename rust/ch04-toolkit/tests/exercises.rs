use ch04_toolkit::exercises::*;
use ch04_toolkit::*;

fn noises() -> Vec<f64> {
    // Deterministic standard-normal-ish noise via the inverse-CDF approximation on a grid.
    (1..200).map(|i| {
        let p = i as f64 / 200.0;
        let t = (-2.0 * (if p < 0.5 { p } else { 1.0 - p }).ln()).sqrt();
        let z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1.0 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
        if p < 0.5 { -z } else { z }
    }).collect()
}

#[test]
fn ex4_1_tokens_round_trip_within_half_a_bin() {
    let b = Binning { lo: -1.0, hi: 1.0, bins: 256 };
    let half = (b.hi - b.lo) / b.bins as f32 / 2.0;
    for i in 0..=1000 {
        let x = -1.0 + 2.0 * i as f32 / 1000.0;
        let t = encode(&b, x);
        assert!(t < 256);
        assert!((decode(&b, t) - x).abs() <= half + 1e-6, "x={x} token={t}");
    }
    assert_eq!(encode(&b, 5.0), 255);
    assert_eq!(encode(&b, -5.0), 0);
}

#[test]
fn ex4_2_many_steps_reach_a_mode() {
    let flow = TwoModes { mu: 1.0, sigma: 0.1 };
    assert!((sample(&flow, 0.8, 64) - 1.0).abs() < 0.3);
    assert!((sample(&flow, -0.8, 64) + 1.0).abs() < 0.3);
}

#[test]
fn ex4_3_one_step_averages_the_modes_many_steps_do_not() {
    let flow = TwoModes { mu: 1.0, sigma: 0.1 };
    let one = fraction_near_modes(&flow, &noises(), 1, 0.3);
    let many = fraction_near_modes(&flow, &noises(), 32, 0.3);
    assert!(many > 0.9, "many steps: {many}");
    assert!(one < 0.5, "one step: {one}");
}

#[test]
fn chunking_has_a_sweet_spot_when_the_robot_stops_to_think() {
    let err = |h| tracking_error(h, 5, 800, false);
    let best = (1..=40).min_by(|&a, &b| err(a).total_cmp(&err(b))).unwrap();
    assert!(best > 2 && best < 40, "best chunk {best}");
    assert!(err(1) > err(best) && err(40) > err(best));
    // Thinking while moving beats stopping to think at its own best chunk length.
    let best_async = (1..=40).map(|h| tracking_error(h, 5, 800, true)).fold(f64::INFINITY, f64::min);
    assert!(best_async < err(best));
}
