// Checks on the chapter's models that do not depend on the exercises.
use ch08_simulators::*;

#[test]
fn the_true_task_has_an_interior_optimum_and_a_cliff() {
    let best = (0..=1000).map(|i| i as f64 / 1000.0).fold(0.0, |b, t| if true_reward(t) > true_reward(b) { t } else { b });
    assert!((true_distance(best) - TARGET).abs() < 0.01, "best push {best}");
    assert_eq!(true_reward(0.9), -1.0);
    assert!(true_reward(0.6) > 0.8);
}

#[test]
fn rollouts_have_matching_endpoints() {
    let (a, b) = (rollout_feasible(), rollout_plausible_only());
    assert_eq!(a.len(), b.len());
    assert!((a[0] - b[0]).abs() < 1e-9 && (a[9] - b[9]).abs() < 1e-9);
}
