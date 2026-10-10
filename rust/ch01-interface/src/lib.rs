//! Chapter 1 companion crate: what counts as a robot foundation model, and where it sits on
//! the book's family grid.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: interface
/// What the robot senses at one instant: camera frames and its own joint state.
#[derive(Clone, Debug, Default)]
pub struct Observation {
    pub frames: Vec<Vec<u8>>,
    pub proprio: Vec<f32>,
}

/// H actions to execute at a fixed control rate. One inference, many motor commands.
#[derive(Clone, Debug, PartialEq)]
pub struct ActionChunk {
    pub rate_hz: f32,
    pub actions: Vec<Vec<f32>>,
}

/// The minimum interface of a robot foundation model: observations and language in,
/// an action chunk out. Predicting the future is optional, which is exactly the line
/// between reactive models and world-action models.
pub trait RobotFoundationModel {
    fn act(&self, history: &[Observation], instruction: &str) -> ActionChunk;

    /// Imagined future observations, if the model makes them.
    fn imagine(&self, _history: &[Observation], _instruction: &str) -> Option<Vec<Observation>> {
        None
    }
}
// endregion: interface

// region: grid
/// Down the family grid: the space a model predicts in.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Space {
    PixelsOrVideoLatents,
    FeatureLatents,
    ExplicitGeometry,
    LanguageOrActionTokens,
    ContinuousNoLanguage,
}

/// Across the family grid: what a model predicts.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Predicts {
    ActionsOnly,
    ActionsPlusFutures,
    FuturesOnly,
    PlanInLanguage,
}

/// The facts about a model that decide where it goes, read off its paper or model card.
#[derive(Clone, Debug)]
pub struct ModelCard {
    pub name: &'static str,
    pub outputs_actions: bool,
    pub outputs_futures: bool,
    pub outputs_language_plan: bool,
    pub space: Space,
    /// Pretrained across many tasks, embodiments or web-scale data rather than one task.
    pub broad_pretraining: bool,
    /// Adapted to new tasks by prompting or light fine-tuning.
    pub adapts_cheaply: bool,
    /// Trained on embodied data (robot or egocentric), not only web text and images.
    pub embodied_training: bool,
}
// endregion: grid

/// Model cards for systems named in chapter 1, used by the tests and the figures.
pub fn sample_cards() -> Vec<ModelCard> {
    use Space::*;
    let card = |name, a, f, l, space, broad, cheap, emb| ModelCard {
        name, outputs_actions: a, outputs_futures: f, outputs_language_plan: l, space,
        broad_pretraining: broad, adapts_cheaply: cheap, embodied_training: emb,
    };
    vec![
        card("pi-0.5", true, false, false, PixelsOrVideoLatents, true, true, true),
        card("OpenVLA", true, false, false, LanguageOrActionTokens, true, true, true),
        card("DreamZero", true, true, false, PixelsOrVideoLatents, true, true, true),
        card("V-JEPA 2-AC", true, true, false, FeatureLatents, true, true, true),
        card("Cosmos-Predict2.5", false, true, false, PixelsOrVideoLatents, true, true, true),
        card("PointWorld", false, true, false, ExplicitGeometry, true, true, true),
        card("Gemini Robotics-ER 1.6", false, false, true, LanguageOrActionTokens, true, true, true),
        card("TRI Large Behavior Model", true, false, false, ContinuousNoLanguage, true, true, true),
        card("Segment Anything (perception only)", false, false, false, PixelsOrVideoLatents, true, true, false),
        card("LLM planner over hand-coded skills", false, false, true, LanguageOrActionTokens, true, true, false),
        card("Single-task Diffusion Policy", true, false, false, ContinuousNoLanguage, false, false, true),
    ]
}
