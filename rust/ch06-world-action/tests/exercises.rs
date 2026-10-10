use ch06_world_action::exercises::*;
use ch06_world_action::*;

#[test]
fn ex6_1_inverse_dynamics_recovers_the_action() {
    let world = World::default();
    let mut rng = Rng::new(3);
    for _ in 0..200 {
        let s = State { x: rng.uniform(1.0, 9.0), y: rng.uniform(1.0, 5.0), vx: rng.uniform(-3.0, 3.0), vy: rng.uniform(-3.0, 3.0) };
        let a = Action { ax: rng.uniform(-A_MAX, A_MAX), ay: rng.uniform(-A_MAX, A_MAX) };
        let got = inverse_dynamics(&s, &world.step(&s, &a));
        assert!((got.ax - a.ax).abs() < 1e-3 && (got.ay - a.ay).abs() < 1e-3, "{got:?} vs {a:?}");
    }
}

#[test]
fn ex6_2_a_perfect_model_never_drifts() {
    let world = World::default();
    let actions = vec![Action { ax: 2.0, ay: 0.3 }; 30];
    let (gaps, first) = drift(&world, &ForwardModel::perfect(), &world.start, &actions, 0.01);
    assert_eq!(gaps.len(), 30);
    assert!(gaps.iter().all(|g| *g < 1e-5));
    assert_eq!(first, None);
}

#[test]
fn ex6_2_a_biased_model_drifts_more_the_further_it_imagines() {
    let world = World::default();
    let actions = vec![Action { ax: 2.0, ay: 0.3 }; 40];
    let model = ForwardModel { damping_error: -0.03 };
    let (gaps, first) = drift(&world, &model, &world.start, &actions, 0.5);
    assert!(gaps.windows(2).all(|w| w[1] >= w[0] - 1e-6), "drift should not shrink: {gaps:?}");
    let expected = gaps.iter().position(|g| *g > 0.5);
    assert!(expected.is_some());
    assert_eq!(first, expected);
}

#[test]
fn ex6_3_imagination_brakes_before_the_edge() {
    let world = World { goal: (9.2, 3.0), ..World::default() };
    let start = State { x: 8.0, y: 3.0, vx: 3.0, vy: 0.0 };
    let full_throttle = vec![Action { ax: A_MAX, ay: 0.0 }; 20];
    let brake = vec![Action { ax: -A_MAX, ay: 0.0 }; 20];
    assert_eq!(choose_chunk(&world, &ForwardModel::perfect(), &start, &[full_throttle, brake]), 1);
}

#[test]
fn ex6_3_imagination_goes_around_the_obstacle() {
    let world = World::default();
    let straight = vec![Action { ax: A_MAX, ay: 0.0 }; 30];
    let mut detour = vec![Action { ax: 1.5, ay: A_MAX }; 10];
    detour.extend(vec![Action { ax: A_MAX, ay: 0.0 }; 10]);
    detour.extend(vec![Action { ax: -A_MAX, ay: -A_MAX }; 10]);
    assert_eq!(choose_chunk(&world, &ForwardModel::perfect(), &world.start, &[straight, detour]), 1);
}

#[test]
fn ex6_4_the_price_of_imagination() {
    // 48 candidates x 30 steps x 0.1 ms + 2 ms overhead = 146 ms per replan; 5 steps per replan.
    let hz = sustainable_rate_hz(48, 30, 0.1, 2.0, 5);
    assert!((hz - 5.0 * 1000.0 / 146.0).abs() < 1e-3, "{hz}");
    // Fewer, shorter imaginations buy control rate.
    assert!(sustainable_rate_hz(8, 10, 0.1, 2.0, 5) > hz);
}
