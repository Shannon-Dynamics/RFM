//! Chapter 3 companion crate: the lineage of robot foundation models as a small graph.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

/// The book's five phases. Boundaries are editorial and overlap in practice.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Phase {
    ModularPipelines,
    LearningInTheLab,
    LanguageAndVisionEnter,
    GeneralistPoliciesAsProducts,
    WorldActionTurn,
}

// region: graph
/// A model, dated by its first public release (year, month).
#[derive(Clone, Debug)]
pub struct Model {
    pub name: &'static str,
    pub released: (u16, u8),
    pub phase: Phase,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Link {
    /// The same team's next version.
    Successor,
    /// Uses the earlier work as its backbone, its recipe or its central idea.
    BuildsOn,
}

#[derive(Clone, Debug)]
pub struct Edge {
    pub from: &'static str,
    pub to: &'static str,
    pub link: Link,
}

#[derive(Clone, Debug)]
pub struct Lineage {
    pub models: Vec<Model>,
    pub edges: Vec<Edge>,
}
// endregion: graph

impl Lineage {
    pub fn model(&self, name: &str) -> Option<&Model> {
        self.models.iter().find(|m| m.name == name)
    }
}

/// The lineage drawn in figure 3.3. Dates are first arXiv versions or announcement dates.
pub fn book_lineage() -> Lineage {
    use Phase::*;
    let m = |name, y, mo, phase| Model { name, released: (y, mo), phase };
    let models = vec![
        m("PlaNet", 2018, 11, LearningInTheLab),
        m("Dreamer", 2019, 12, LearningInTheLab),
        m("TD-MPC", 2022, 3, LearningInTheLab),
        m("DreamerV3", 2023, 1, LearningInTheLab),
        m("Diffusion Policy", 2023, 3, LearningInTheLab),
        m("ACT", 2023, 4, LearningInTheLab),
        m("RT-1", 2022, 12, LanguageAndVisionEnter),
        m("RT-2", 2023, 7, LanguageAndVisionEnter),
        m("RoboFlamingo", 2023, 11, LanguageAndVisionEnter),
        m("Octo", 2024, 5, LanguageAndVisionEnter),
        m("OpenVLA", 2024, 6, LanguageAndVisionEnter),
        m("Covariant RFM-1", 2024, 3, GeneralistPoliciesAsProducts),
        m("pi-0", 2024, 10, GeneralistPoliciesAsProducts),
        m("Cosmos", 2025, 1, GeneralistPoliciesAsProducts),
        m("OpenVLA-OFT", 2025, 2, GeneralistPoliciesAsProducts),
        m("Helix", 2025, 2, GeneralistPoliciesAsProducts),
        m("GR00T N1", 2025, 3, GeneralistPoliciesAsProducts),
        m("Gemini Robotics", 2025, 3, GeneralistPoliciesAsProducts),
        m("Wan", 2025, 3, GeneralistPoliciesAsProducts),
        m("pi-0.5", 2025, 4, GeneralistPoliciesAsProducts),
        m("pi*0.6", 2025, 11, GeneralistPoliciesAsProducts),
        m("Cosmos Policy", 2026, 1, WorldActionTurn),
        m("LingBot-VA", 2026, 1, WorldActionTurn),
        m("DreamZero", 2026, 2, WorldActionTurn),
        m("GR00T N2 (preview)", 2026, 3, WorldActionTurn),
        m("Fast-WAM", 2026, 3, WorldActionTurn),
        m("pi-0.7", 2026, 4, WorldActionTurn),
        m("GR00T N1.7", 2026, 4, WorldActionTurn),
    ];
    let e = |from, to, link| Edge { from, to, link };
    use Link::*;
    let edges = vec![
        e("PlaNet", "Dreamer", Successor),
        e("Dreamer", "DreamerV3", Successor),
        e("RT-1", "RT-2", Successor),
        e("RT-2", "OpenVLA", BuildsOn),
        e("OpenVLA", "OpenVLA-OFT", Successor),
        e("Diffusion Policy", "Octo", BuildsOn),
        e("ACT", "pi-0", BuildsOn),
        e("Diffusion Policy", "pi-0", BuildsOn),
        e("pi-0", "pi-0.5", Successor),
        e("pi-0.5", "pi*0.6", Successor),
        e("pi*0.6", "pi-0.7", Successor),
        e("RT-2", "Gemini Robotics", BuildsOn),
        e("GR00T N1", "GR00T N1.7", Successor),
        // N2 was previewed (March 2026) a month before N1.7 shipped (April 2026): both follow N1.
        e("GR00T N1", "GR00T N2 (preview)", Successor),
        e("Cosmos", "Cosmos Policy", BuildsOn),
        e("Wan", "DreamZero", BuildsOn),
        e("Wan", "LingBot-VA", BuildsOn),
        e("Wan", "Fast-WAM", BuildsOn),
        e("DreamerV3", "DreamZero", BuildsOn),
        e("DreamZero", "GR00T N2 (preview)", BuildsOn),
    ];
    Lineage { models, edges }
}
