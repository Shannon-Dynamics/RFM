//! Chapter 10 companion crate: the success-detection loop that an embodied reasoning model runs
//! above a controller. Act, observe, judge "done or not", then retry or move on.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: loop
/// One step of a task, as the reasoning model sees it.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Judge {
    /// Chance that one attempt by the controller completes the step.
    pub p_success: f64,
    /// Chance the judge says "done" when the step is not done: a hallucinated success.
    pub false_done: f64,
    /// Chance the judge says "not done" when the step is done: a wasted retry.
    pub false_retry: f64,
    /// Attempts allowed before the robot stops and asks a person for help.
    pub max_attempts: u32,
}

impl Judge {
    /// No success detection at all: try once and move on.
    pub fn blind(p_success: f64) -> Judge {
        Judge { p_success, false_done: 1.0, false_retry: 0.0, max_attempts: 1 }
    }
}

/// How a step ends.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum StepEnd {
    /// Judged done, and really done.
    Done,
    /// Judged done, but not done: the robot moves on without knowing.
    SilentFailure,
    /// Out of attempts: the robot knows it failed and asks for help.
    AskedForHelp,
}

/// What happened in one attempt, for drawing a trace.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Attempt {
    pub done_after: bool,
    pub judged_done: bool,
}

/// A small deterministic generator (SplitMix64) so traces are reproducible.
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Rng {
        Rng(seed)
    }
    pub fn next_f64(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        ((z ^ (z >> 31)) >> 11) as f64 / (1u64 << 53) as f64
    }
}

/// Run one step: attempt, judge, and retry until judged done or out of attempts. A step that is
/// already done stays done if the controller is asked to do it again.
pub fn run_step(j: &Judge, rng: &mut Rng) -> (StepEnd, Vec<Attempt>) {
    let mut done = false;
    let mut log = Vec::new();
    for _ in 0..j.max_attempts {
        if !done && rng.next_f64() < j.p_success {
            done = true;
        }
        let says_done = if done { rng.next_f64() >= j.false_retry } else { rng.next_f64() < j.false_done };
        log.push(Attempt { done_after: done, judged_done: says_done });
        if says_done {
            return (if done { StepEnd::Done } else { StepEnd::SilentFailure }, log);
        }
    }
    (StepEnd::AskedForHelp, log)
}
// endregion: loop
