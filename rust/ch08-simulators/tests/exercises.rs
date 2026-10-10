use ch08_simulators::exercises::*;
use ch08_simulators::*;

#[test]
fn ex8_1_fit_a_line_and_find_the_edge_only_if_seen() {
    let narrow = fit_world_model(&collect(0.1, 0.4, 4));
    assert_eq!(narrow.edge_theta, None, "no fall in the data, so no edge in the model");
    // The straight line through a convex curve: right on the data, too low beyond it.
    assert!((narrow.distance(0.25) - true_distance(0.25)).abs() < 0.02);
    assert!(narrow.distance(0.9) < true_distance(0.9) - 0.2);

    let wide = fit_world_model(&collect(0.1, 1.0, 10));
    let e = wide.edge_theta.expect("the wide data includes falls");
    assert!((e - 0.75).abs() < 1e-9, "halfway between 0.7 (stayed) and 0.8 (fell): {e}");

    let exact = fit_world_model(&[(0.0, 0.1), (1.0, 0.5)]);
    assert!((exact.intercept - 0.1).abs() < 1e-12 && (exact.slope - 0.4).abs() < 1e-12);
}

#[test]
fn ex8_2_rl_in_imagination_exploits_the_model() {
    let narrow = fit_world_model(&collect(0.1, 0.4, 4));
    let path = optimize(&narrow, 0.3, 0.025, 60, None);
    assert_eq!(path[0], 0.3);
    assert_eq!(path.len(), 61);
    let th = *path.last().unwrap();
    // Inside the model the policy looks perfect ...
    assert!(narrow.reward(th) > 0.95, "imagined {}", narrow.reward(th));
    // ... and in the real world the block falls off the table.
    assert_eq!(true_reward(th), -1.0, "theta {th}");

    // Staying near the data is safe, if not optimal.
    let safe = *optimize(&narrow, 0.3, 0.025, 60, Some(0.5)).last().unwrap();
    assert!(safe <= 0.5 + 1e-12 && true_reward(safe) > 0.5);

    // More data, including falls, closes most of the gap.
    let wide = fit_world_model(&collect(0.1, 1.0, 10));
    let good = *optimize(&wide, 0.3, 0.025, 60, None).last().unwrap();
    assert!(true_reward(good) > 0.8, "theta {good}, real {}", true_reward(good));
}

#[test]
fn ex8_3_count_what_the_robot_cannot_do() {
    let (dt, vmax, amax) = (0.1, 1.2, 10.0);
    assert_eq!(violations(&rollout_feasible(), dt, vmax, amax), 0);
    // The jump: one step far too fast, and two violent changes of speed around it.
    assert_eq!(violations(&rollout_plausible_only(), dt, vmax, amax), 3);
    assert_eq!(violations(&[0.0, 0.0, 0.0], dt, vmax, amax), 0);
}
