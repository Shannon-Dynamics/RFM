use ch16_applications::exercises::*;
use ch16_applications::*;

#[test]
fn ex16_1_arcs_turn_and_go_straight() {
    let s = Pose { x: 0.0, y: 0.0, heading: 0.0 };
    let straight = arc(s, 0.0, 10, 0.5);
    assert_eq!(straight.len(), 11);
    assert!((straight[10][0] - 5.0).abs() < 1e-9 && straight[10][1].abs() < 1e-9);
    // A full circle of radius 1 returns close to the start.
    let n = 2000;
    let circle = arc(s, 1.0, n, std::f64::consts::TAU / n as f64);
    assert!(dist(circle[n], [0.0, 0.0]) < 0.01);
    // Positive curvature turns left.
    assert!(arc(s, 0.3, 10, 0.2)[10][1] > 0.0);
}

#[test]
fn ex16_2_collision_uses_the_robot_radius() {
    let o = [Obstacle { c: [1.0, 0.0], r: 0.5 }];
    assert!(collides(&[[0.0, 0.0], [0.3, 0.0]], &o, 0.25));
    assert!(!collides(&[[0.0, 0.0], [0.2, 0.0]], &o, 0.25));
    assert!(!collides(&[], &o, 0.25));
    let (start, _, obs) = scene();
    assert!(collides(&arc(start, 0.0, STEPS, STEP), &obs, 0.25), "the straight line hits the first pillar");
    assert!(!collides(&arc(start, 0.2, STEPS, STEP), &obs, 0.25), "a gentle left turn threads past it");
}

#[test]
fn ex16_3_a_wrong_model_chooses_a_path_that_really_collides() {
    let (start, goal, obs) = scene();
    let real = |i: usize| arc(start, CURVATURES[i], STEPS, STEP);
    // An accurate model picks the gentle left turn, which is safe and ends near the goal.
    let i = choose(start, goal, &obs, 1.0).unwrap();
    assert_eq!(CURVATURES[i], 0.2);
    assert!(!collides(&real(i), &obs, 0.25) && dist(*real(i).last().unwrap(), goal) < 0.3);
    // Believing the robot turns more sharply than it does: the real path is straighter and clips the first pillar.
    let i = choose(start, goal, &obs, 1.25).unwrap();
    assert!(collides(&real(i), &obs, 0.25));
    // Believing it turns more gently: the real path turns too far and hits the second pillar.
    let i = choose(start, goal, &obs, 0.6).unwrap();
    assert!(collides(&real(i), &obs, 0.25));
}
