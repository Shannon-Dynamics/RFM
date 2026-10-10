//! Chapter 19 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn tally(table: &[Evidence], observed: &[bool]) -> [i32; 3] {
    let mut s = [0; 3];
    for (e, _) in table.iter().zip(observed).filter(|(_, o)| **o) {
        for (k, eff) in e.effects.iter().enumerate() {
            s[k] += match eff {
                Effect::Supports => 1,
                Effect::Undercuts => -1,
                Effect::Neutral => 0,
            };
        }
    }
    s
}

pub fn leading(scores: [i32; 3]) -> Option<usize> {
    let top = *scores.iter().max().unwrap();
    let mut at = scores.iter().enumerate().filter(|(_, s)| **s == top);
    let first = at.next().map(|(i, _)| i);
    if at.next().is_some() { None } else { first }
}

pub fn red_flags(r: &Release) -> Vec<&'static str> {
    let checks = [
        (!r.weights_and_license_stated, "no weights or licence"),
        (!r.size_and_hardware_stated, "no size or hardware"),
        (!r.latency_on_named_hardware, "no latency on named hardware"),
        (!r.real_robot_evaluation, "simulation only"),
        (r.trials_per_condition.is_none_or(|n| n < 50), "too few trials"),
        (!r.intervals_reported, "no intervals"),
        (!r.independent_evaluation, "no independent evaluation"),
        (!r.own_numbers_flagged, "own numbers not flagged"),
        (!r.baselines_matched, "baselines not matched"),
        (!r.failures_reported, "no failures reported"),
    ];
    checks.iter().filter(|(bad, _)| *bad).map(|(_, s)| *s).collect()
}
