//! Chapter 12 companion crate: choosing between the seven families.
//! The decision flow of figure 12.2 as a function, and the comparison matrix of figure 12.1 as
//! data that can be weighted, ranked and stress-tested.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: flow
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Family {
    ReactiveVla,      // chapter 5
    WorldAction,      // chapter 6
    Latent,           // chapter 7
    Simulator,        // chapter 8
    Geometry,         // chapter 9
    Reasoning,        // chapter 10
    LargeBehavior,    // chapter 11
}

/// What you know about the job before choosing.
#[derive(Clone, Copy, Debug, Default)]
pub struct Job {
    pub short_horizon_in_distribution: bool,
    pub contact_occlusion_or_delayed_effects: bool,
    pub robot_action_data_for_this_body: bool,
    pub edge_compute_only: bool,
    pub precise_contact_state_matters: bool,
}

/// The decision flow of figure 12.2: a first family to try, and what to consider next.
pub fn recommend(job: &Job) -> Vec<Family> {
    use Family::*;
    if job.short_horizon_in_distribution {
        return vec![ReactiveVla];
    }
    if job.contact_occlusion_or_delayed_effects {
        let mut v = vec![WorldAction, Latent];
        if job.precise_contact_state_matters {
            v.push(Geometry);
        }
        return v;
    }
    if !job.robot_action_data_for_this_body {
        return vec![Latent, Simulator];
    }
    if job.edge_compute_only {
        return vec![ReactiveVla, Reasoning];
    }
    vec![Reasoning, ReactiveVla, LargeBehavior]
}
// endregion: flow

// region: matrix
pub const CRITERIA: [&str; 8] = [
    "cheap inference",
    "little robot data needed",
    "language grounding",
    "reasons about consequences",
    "cross-embodiment transfer",
    "maturity",
    "open weights",
    "evidence quality",
];

/// The book's judgement as of October 2026, from 1 (low) to 3 (high); higher is always better.
/// Order follows `CRITERIA`. Figure 12.1 gives the reason for every cell.
pub fn scores(f: Family) -> [u8; 8] {
    use Family::*;
    match f {
        ReactiveVla => [2, 2, 3, 1, 2, 3, 3, 3],
        WorldAction => [1, 3, 2, 3, 3, 1, 2, 2],
        Latent => [2, 3, 2, 2, 3, 1, 2, 2],
        Simulator => [1, 3, 2, 3, 2, 2, 3, 1],
        Geometry => [2, 1, 1, 3, 2, 1, 1, 1],
        Reasoning => [1, 3, 3, 2, 3, 2, 2, 1],
        LargeBehavior => [3, 1, 1, 1, 2, 3, 3, 3],
    }
}

pub const ALL: [Family; 7] = [
    Family::ReactiveVla,
    Family::WorldAction,
    Family::Latent,
    Family::Simulator,
    Family::Geometry,
    Family::Reasoning,
    Family::LargeBehavior,
];
// endregion: matrix
