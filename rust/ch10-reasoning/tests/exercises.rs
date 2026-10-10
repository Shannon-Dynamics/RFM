use ch10_reasoning::exercises::*;
use ch10_reasoning::*;

const GOOD: Judge = Judge { p_success: 0.7, false_done: 0.05, false_retry: 0.1, max_attempts: 3 };

fn close(a: f64, b: f64, tol: f64) -> bool {
    (a - b).abs() < tol
}

fn sampled(j: &Judge, n: u32) -> (f64, f64, f64, f64) {
    let mut rng = Rng::new(42);
    let (mut c, mut tries) = ([0u32; 3], 0usize);
    for _ in 0..n {
        let (end, log) = run_step(j, &mut rng);
        tries += log.len();
        c[match end { StepEnd::Done => 0, StepEnd::SilentFailure => 1, StepEnd::AskedForHelp => 2 }] += 1;
    }
    let f = |k: usize| c[k] as f64 / n as f64;
    (f(0), f(1), f(2), tries as f64 / n as f64)
}

#[test]
fn ex10_1_exact_step_outcomes_match_sampling() {
    let (d, s, a) = step_outcomes(&GOOD);
    assert!(close(d + s + a, 1.0, 1e-12));
    let (sd, ss, sa, _) = sampled(&GOOD, 200_000);
    assert!(close(d, sd, 0.005) && close(s, ss, 0.003) && close(a, sa, 0.003), "exact {d} {s} {a}, sampled {sd} {ss} {sa}");
    // Without a judge the robot always moves on: every failed attempt becomes a silent failure.
    let (bd, bs, ba) = step_outcomes(&Judge::blind(0.7));
    assert!(close(bd, 0.7, 1e-12) && close(bs, 0.3, 1e-12) && ba == 0.0);
    // A perfect judge never fails silently.
    let perfect = Judge { false_done: 0.0, false_retry: 0.0, ..GOOD };
    assert_eq!(step_outcomes(&perfect).1, 0.0);
}

#[test]
fn ex10_2_small_optimism_compounds_over_a_task() {
    let (d, s, a) = task_outcomes(&GOOD, 10);
    assert!(close(d + s + a, 1.0, 1e-12));
    let (bd, bs, _) = task_outcomes(&Judge::blind(0.7), 10);
    assert!(d > 10.0 * bd, "judged {d}, blind {bd}");
    assert!(bs > 0.97);
    // An optimistic judge turns retries into silent failures.
    let optimistic = Judge { false_done: 0.3, ..GOOD };
    assert!(task_outcomes(&optimistic, 10).1 > 2.0 * s);
    assert_eq!(task_outcomes(&GOOD, 0), (1.0, 0.0, 0.0));
}

#[test]
fn ex10_3_checking_costs_attempts() {
    let e = expected_attempts(&GOOD);
    let (_, _, _, sampled_e) = sampled(&GOOD, 200_000);
    assert!(close(e, sampled_e, 0.01), "exact {e}, sampled {sampled_e}");
    assert!(e > 1.0 && e < 3.0);
    assert_eq!(expected_attempts(&Judge::blind(0.7)), 1.0);
    // A judge that wrongly retries finished steps wastes attempts.
    assert!(expected_attempts(&Judge { false_retry: 0.5, ..GOOD }) > e);
}
