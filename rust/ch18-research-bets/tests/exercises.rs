use ch18_research_bets::exercises::*;
use ch18_research_bets::*;

const S: Setup = Setup { p_good: 0.5, verifier: Verifier { accept_good: 0.9, accept_bad: 0.2 } };

fn simulate(s: &Setup, n: usize) -> (f64, f64) {
    let mut rng = Rng::new(7);
    let (mut ok, mut k) = (0usize, 0usize);
    let trials = 200_000;
    for _ in 0..trials {
        let (good, examined) = run_once(s, n, &mut rng);
        ok += good as usize;
        k += examined;
    }
    (ok as f64 / trials as f64, k as f64 / trials as f64)
}

#[test]
fn ex18_1_best_of_n_matches_simulation() {
    assert!((success(&S, 1) - 0.5).abs() < 1e-12, "one candidate: just the policy");
    for n in [2, 4, 8] {
        let (sim, _) = simulate(&S, n);
        assert!((success(&S, n) - sim).abs() < 0.005, "n={n}: exact {} vs simulated {sim}", success(&S, n));
    }
    assert!(success(&S, 8) > success(&S, 2));
}

#[test]
fn ex18_2_the_verifier_sets_the_ceiling() {
    let c = ceiling(&S);
    assert!((c - 0.45 / 0.55).abs() < 1e-12, "{c}");
    assert!(success(&S, 1000) <= c + 1e-12);
    assert_eq!(n_for(&S, 0.95), None, "no number of samples beats the verifier's precision");
    let n = n_for(&S, 0.8).unwrap();
    assert!(n >= 2 && success(&S, n) >= 0.8 && success(&S, n - 1) < 0.8);
    // A perfect verifier makes the ceiling 1.
    let perfect = Setup { verifier: Verifier { accept_good: 1.0, accept_bad: 0.0 }, ..S };
    assert!((ceiling(&perfect) - 1.0).abs() < 1e-12);
}

#[test]
fn ex18_3_checking_more_candidates_costs_time() {
    let (_, k) = simulate(&S, 8);
    let ms = expected_latency_ms(&S, 8, 100.0, 50.0);
    assert!((ms / 150.0 - k).abs() < 0.02, "expected examined {} vs simulated {k}", ms / 150.0);
    assert!((expected_latency_ms(&S, 1, 100.0, 50.0) - 150.0).abs() < 1e-9);
    assert!(expected_latency_ms(&S, 16, 100.0, 50.0) > expected_latency_ms(&S, 2, 100.0, 50.0));
}
