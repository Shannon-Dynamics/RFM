use ch19_scenarios::exercises::*;
use ch19_scenarios::*;

#[test]
fn ex19_1_scores_move_with_what_is_observed() {
    let t = evidence_table();
    assert_eq!(tally(&t, &[false; 10]), [0, 0, 0]);
    let mut seen = [false; 10];
    seen[1] = true; // WAM robustness replicates
    seen[2] = true; // a GR00T N2-class model ships at control rates
    assert_eq!(tally(&t, &seen), [-2, 2, -2]);
    seen[6] = true; // matched compute favours latent targets
    assert_eq!(tally(&t, &seen), [-2, 1, -1]);
    // Every row moves at least one scenario.
    assert!(t.iter().all(|e| e.effects.iter().any(|x| *x != Effect::Neutral)));
}

#[test]
fn ex19_2_a_tie_is_not_a_lead() {
    assert_eq!(leading([1, 3, 2]), Some(1));
    assert_eq!(leading([2, 2, 0]), None);
    assert_eq!(leading([0, 0, 0]), None);
    assert_eq!(leading([-1, -3, -2]), Some(0));
}

#[test]
fn ex19_3_a_typical_launch_post_raises_flags() {
    let post = Release { weights_and_license_stated: true, size_and_hardware_stated: true, real_robot_evaluation: true, trials_per_condition: Some(20), ..Default::default() };
    let flags = red_flags(&post);
    assert_eq!(flags.first(), Some(&"no latency on named hardware"));
    assert!(flags.contains(&"too few trials") && flags.contains(&"no independent evaluation"));
    assert_eq!(flags.len(), 7);
    let careful = Release {
        weights_and_license_stated: true, size_and_hardware_stated: true, latency_on_named_hardware: true, real_robot_evaluation: true,
        trials_per_condition: Some(200), intervals_reported: true, independent_evaluation: true, own_numbers_flagged: true,
        baselines_matched: true, failures_reported: true,
    };
    assert!(red_flags(&careful).is_empty());
    assert_eq!(red_flags(&Release::default()).len(), 10);
}
