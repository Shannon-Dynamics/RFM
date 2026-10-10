//! Chapter 19 companion crate: keeping score as the future arrives.
//! An evidence table for three scenarios, and a checklist for reading a model release.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: evidence
/// The three scenarios of chapter 19, in order.
pub const SCENARIOS: [&str; 3] = [
    "Consolidation around reactive VLAs",
    "Convergence on world-action models",
    "Resurgence of latent and geometric prediction",
];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Effect {
    Supports,
    Undercuts,
    Neutral,
}

/// An observable result, and what it would mean for each scenario.
#[derive(Clone, Copy, Debug)]
pub struct Evidence {
    pub result: &'static str,
    pub effects: [Effect; 3],
}

pub fn evidence_table() -> Vec<Evidence> {
    use Effect::*;
    vec![
        Evidence { result: "Independent real-robot study finds no robustness gap between VLAs and WAMs at matched data", effects: [Supports, Undercuts, Neutral] },
        Evidence { result: "WAMs' robustness advantage replicates outside the labs that reported it", effects: [Undercuts, Supports, Undercuts] },
        Evidence { result: "A GR00T N2-class world-action model ships at control rates on robot hardware", effects: [Undercuts, Supports, Undercuts] },
        Evidence { result: "VLA inference stays cheap while video-generating WAMs do not get cheaper", effects: [Supports, Undercuts, Neutral] },
        Evidence { result: "Steerability, memory and RL post-training close the long-horizon gap in VLAs", effects: [Supports, Undercuts, Neutral] },
        Evidence { result: "Training with video and acting without it becomes the default in new releases", effects: [Neutral, Supports, Neutral] },
        Evidence { result: "A matched-compute comparison favours latent targets over pixel prediction", effects: [Neutral, Undercuts, Supports] },
        Evidence { result: "A shared benchmark for geometry-first models appears", effects: [Neutral, Neutral, Supports] },
        Evidence { result: "Latent-action pretraining on human video beats teleoperation-only pretraining, independently", effects: [Undercuts, Neutral, Supports] },
        Evidence { result: "Pixel world models end up used mainly as simulators, not as policies", effects: [Neutral, Undercuts, Supports] },
    ]
}
// endregion: evidence

// region: release
/// What a launch post or paper says about a new model, answered yes or no by the reader.
#[derive(Clone, Copy, Debug, Default)]
pub struct Release {
    pub weights_and_license_stated: bool,
    pub size_and_hardware_stated: bool,
    pub latency_on_named_hardware: bool,
    pub real_robot_evaluation: bool,
    pub trials_per_condition: Option<u32>,
    pub intervals_reported: bool,
    pub independent_evaluation: bool,
    pub own_numbers_flagged: bool,
    pub baselines_matched: bool,
    pub failures_reported: bool,
}
// endregion: release
