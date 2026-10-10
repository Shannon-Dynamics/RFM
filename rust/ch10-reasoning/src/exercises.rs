//! Chapter 10 exercises. Replace each `todo!()`, then run `cargo test -p ch10-reasoning --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 10.1: one step, exactly.
/// The probabilities that a step ends Done, SilentFailure or AskedForHelp, in that order, computed
/// exactly (no sampling). Track the chance of being done or not done before each judgement.
pub fn step_outcomes(j: &Judge) -> (f64, f64, f64) {
    todo!("Exercise 10.1")
}

/// Exercise 10.2: a whole task.
/// A task is `steps` steps in a row. The robot stops at the first step where it asks for help.
/// Return the probabilities that the task ends (all done, silently failed somewhere, asked for help).
pub fn task_outcomes(j: &Judge, steps: u32) -> (f64, f64, f64) {
    todo!("Exercise 10.2")
}

/// Exercise 10.3: what checking costs.
/// The expected number of attempts per step.
pub fn expected_attempts(j: &Judge) -> f64 {
    todo!("Exercise 10.3")
}
