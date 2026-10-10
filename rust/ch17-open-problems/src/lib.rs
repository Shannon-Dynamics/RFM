//! Chapter 17 companion crate: three open problems small enough to compute.
//! Errors that compound in an imagined rollout, generated camera views that disagree about where
//! an object is, and a monitor that keeps a learned policy inside a safety envelope.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: views
pub type P = [f64; 2];

/// A camera on the floor plan: where it is. It reports only the bearing, in radians, from its
/// position to an object, which is what a generated image pins down well.
#[derive(Clone, Copy, Debug)]
pub struct Camera {
    pub at: P,
}

pub fn bearing(cam: Camera, p: P) -> f64 {
    (p[1] - cam.at[1]).atan2(p[0] - cam.at[0])
}

/// Three cameras watching a workspace, as on a bimanual rig with a head and two wrist views.
pub fn rig() -> [Camera; 3] {
    [Camera { at: [0.0, 0.0] }, Camera { at: [4.0, 0.0] }, Camera { at: [2.0, -1.5] }]
}

/// Smallest difference between two angles, in radians.
pub fn angle_diff(a: f64, b: f64) -> f64 {
    let d = (a - b).rem_euclid(std::f64::consts::TAU);
    d.min(std::f64::consts::TAU - d)
}
// endregion: views

// region: monitor
/// A safety envelope of the kind a certified monitor enforces: a speed limit, and a stop when a
/// person comes within the protective distance.
#[derive(Clone, Copy, Debug)]
pub struct Envelope {
    pub max_speed: f64,
    pub stop_distance: f64,
}
// endregion: monitor
