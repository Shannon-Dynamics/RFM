//! Chapter 16 companion crate: look-ahead planning for a mobile robot.
//! A navigation world model imagines where each candidate path leads; the robot takes the path
//! whose imagined end is best. The imagination is only as good as the model.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: world
pub type P = [f64; 2];

/// A robot's pose: position and heading in radians.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Pose {
    pub x: f64,
    pub y: f64,
    pub heading: f64,
}

/// A round obstacle on the floor.
#[derive(Clone, Copy, Debug)]
pub struct Obstacle {
    pub c: P,
    pub r: f64,
}

/// A room with two pillars: one beside the straight line to the goal, one beyond the goal.
pub fn scene() -> (Pose, P, Vec<Obstacle>) {
    (
        Pose { x: 0.0, y: 0.0, heading: 0.0 },
        [4.6, 3.1],
        vec![Obstacle { c: [2.6, -0.2], r: 0.5 }, Obstacle { c: [3.6, 4.6], r: 0.5 }],
    )
}

/// Candidate paths are arcs of constant curvature, as a sampling planner or a policy would propose.
pub const CURVATURES: [f64; 13] = [-0.2, -0.15, -0.1, -0.05, 0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
pub const STEPS: usize = 30;
pub const STEP: f64 = 0.2;

pub fn dist(a: P, b: P) -> f64 {
    ((a[0] - b[0]).powi(2) + (a[1] - b[1]).powi(2)).sqrt()
}
// endregion: world
