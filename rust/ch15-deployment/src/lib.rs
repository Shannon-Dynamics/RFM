//! Chapter 15 companion crate: deployment arithmetic.
//! Where the milliseconds go between an event and the robot reacting to it, what a network does
//! to a deadline, and why a readiness profile is only as strong as its weakest dimension.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: budget
/// One stage of the pipeline from camera to motor, with its time in milliseconds.
#[derive(Clone, Copy, Debug)]
pub struct Stage {
    pub name: &'static str,
    pub ms: f64,
}

/// An illustrative on-robot pipeline for a VLA with a flow-matching action expert.
pub fn on_device() -> Vec<Stage> {
    vec![
        Stage { name: "camera frame", ms: 33.0 },
        Stage { name: "preprocess and transfer", ms: 8.0 },
        Stage { name: "VLM backbone", ms: 60.0 },
        Stage { name: "action expert, 10 steps", ms: 30.0 },
        Stage { name: "send to controller", ms: 2.0 },
    ]
}

/// The same pipeline with the model in a data centre: a faster GPU, plus the network both ways.
pub fn in_the_cloud(round_trip_ms: f64) -> Vec<Stage> {
    vec![
        Stage { name: "camera frame", ms: 33.0 },
        Stage { name: "preprocess and transfer", ms: 8.0 },
        Stage { name: "network round trip", ms: round_trip_ms },
        Stage { name: "VLM backbone", ms: 25.0 },
        Stage { name: "action expert, 10 steps", ms: 12.0 },
        Stage { name: "send to controller", ms: 2.0 },
    ]
}

/// Total time from a frame being captured to its actions reaching the controller.
pub fn latency_ms(stages: &[Stage]) -> f64 {
    stages.iter().map(|s| s.ms).sum()
}

/// Round-trip times in milliseconds for a run of control cycles over a shared network:
/// mostly near `base`, with occasional long stalls. Deterministic, so runs can be compared.
pub fn network_samples(base: f64, n: usize) -> Vec<f64> {
    (0..n)
        .map(|i| {
            let x = ((i as u64).wrapping_mul(0x9E37_79B9_7F4A_7C15) >> 40) as f64 / (1u64 << 24) as f64;
            if x > 0.97 { base * 8.0 } else if x > 0.85 { base * 2.5 } else { base * (0.8 + 0.4 * x) }
        })
        .collect()
}
// endregion: budget

// region: readiness
/// The eleven implications of the 2026 industrial readiness survey (arXiv 2603.06749).
pub const IMPLICATIONS: [&str; 11] = [
    "Adaptability and flexibility",
    "Safety and compliance",
    "Human-robot interaction and collaboration",
    "Robustness and reliability",
    "Precision and accuracy",
    "Real-time performance",
    "Cost-effectiveness and integration",
    "Explainability and trust",
    "Sensor fusion and perception",
    "Standardised benchmarking and evaluation",
    "Data requirements and usage",
];

/// Fraction of each implication's criteria the survey rates as fulfilled, for its highest-rated
/// model (Gemini Robotics 1.5, table 11 of the survey).
pub const TOP_RATED: [f64; 11] = [0.44, 0.06, 0.07, 0.07, 0.00, 0.00, 0.00, 0.07, 0.14, 0.23, 0.09];
// endregion: readiness
