// Checks on the chapter's model that do not depend on the exercises.
use ch10_reasoning::*;

#[test]
fn rng_is_uniform_enough_and_reproducible() {
    let mut a = Rng::new(7);
    let xs: Vec<f64> = (0..10_000).map(|_| a.next_f64()).collect();
    assert!(xs.iter().all(|x| (0.0..1.0).contains(x)));
    let mean = xs.iter().sum::<f64>() / xs.len() as f64;
    assert!((mean - 0.5).abs() < 0.01);
    let mut b = Rng::new(7);
    assert_eq!(b.next_f64(), xs[0]);
}

#[test]
fn a_blind_robot_never_asks_for_help() {
    let mut rng = Rng::new(1);
    for _ in 0..1000 {
        let (end, log) = run_step(&Judge::blind(0.5), &mut rng);
        assert_ne!(end, StepEnd::AskedForHelp);
        assert_eq!(log.len(), 1);
    }
}
