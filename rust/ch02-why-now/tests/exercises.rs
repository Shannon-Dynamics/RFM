use ch02_why_now::exercises::*;
use ch02_why_now::*;

#[test]
fn ex2_1_chunking_buys_control_rate() {
    // 200 ms per inference at a 50 Hz controller: one action per inference gives under 5 Hz.
    assert!(sync_rate_hz(200.0, 1, 50.0) < 5.0);
    let h = min_chunk_for_rate(200.0, 50.0, 25.0).unwrap();
    assert!(sync_rate_hz(200.0, h, 50.0) >= 25.0);
    assert!(sync_rate_hz(200.0, h - 1, 50.0) < 25.0);
    assert_eq!(min_chunk_for_rate(200.0, 50.0, 60.0), None, "no chunk beats the controller's own rate");
}

#[test]
fn ex2_2_two_points_fix_the_line_and_more_points_are_averaged() {
    let fit = fit_log_linear(&EGOSCALE_POINTS);
    assert!((fit.predict(1_000.0) - 0.30).abs() < 1e-9);
    assert!((fit.predict(20_000.0) - 0.71).abs() < 1e-9);
    let noisy = [(10.0, 1.1), (100.0, 1.9), (1_000.0, 3.1), (10_000.0, 3.9)];
    let f = fit_log_linear(&noisy);
    // The points rise 0.96 per decade, so b = 0.96 / ln 10.
    assert!((f.b - 0.96 / std::f64::consts::LN_10).abs() < 1e-9, "{f:?}");
}

#[test]
fn ex2_3_extrapolation_is_refused() {
    let fit = fit_log_linear(&EGOSCALE_POINTS);
    assert!(guarded_predict(&fit, &EGOSCALE_POINTS, 10_000.0, 0.0, 1.0).is_some());
    assert_eq!(guarded_predict(&fit, &EGOSCALE_POINTS, 400_000.0, 0.0, 1.0), None, "beyond the data");
    assert_eq!(guarded_predict(&fit, &EGOSCALE_POINTS, 500.0, 0.0, 1.0), None, "below the data");
    // Taken naively, the same curve promises more than 100 percent task completion.
    assert!(fit.predict(400_000.0) > 1.0);
}
