//! Chapter 10 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

/// Walk the attempts, carrying the probability of being done or not done and still going.
fn walk(j: &Judge) -> (f64, f64, f64, f64) {
    let (mut done, mut not_done) = (0.0, 1.0);
    let (mut ok, mut silent, mut attempts) = (0.0, 0.0, 0.0);
    for _ in 0..j.max_attempts {
        attempts += done + not_done;
        done += not_done * j.p_success;
        not_done *= 1.0 - j.p_success;
        ok += done * (1.0 - j.false_retry);
        silent += not_done * j.false_done;
        done *= j.false_retry;
        not_done *= 1.0 - j.false_done;
    }
    (ok, silent, done + not_done, attempts)
}

pub fn step_outcomes(j: &Judge) -> (f64, f64, f64) {
    let (ok, silent, help, _) = walk(j);
    (ok, silent, help)
}

pub fn task_outcomes(j: &Judge, steps: u32) -> (f64, f64, f64) {
    let (d, s, a) = step_outcomes(j);
    let all_done = d.powi(steps as i32);
    let no_help = (d + s).powi(steps as i32);
    (all_done, no_help - all_done, a * (0..steps).map(|k| (d + s).powi(k as i32)).sum::<f64>())
}

pub fn expected_attempts(j: &Judge) -> f64 {
    walk(j).3
}
