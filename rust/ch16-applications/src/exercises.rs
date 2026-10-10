//! Chapter 16 exercises. Replace each `todo!()`, then run `cargo test -p ch16-applications --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 16.1: roll a path out.
/// Starting from `start`, take `steps` steps of length `step`: each step first turns the heading
/// by `curvature * step`, then moves forward by `step`. Return every position, start included.
pub fn arc(start: Pose, curvature: f64, steps: usize, step: f64) -> Vec<P> {
    todo!("Exercise 16.1")
}

/// Exercise 16.2: does the path hit anything?
/// True if any point of `path` is closer than `robot_radius` to the edge of any obstacle.
pub fn collides(path: &[P], obstacles: &[Obstacle], robot_radius: f64) -> bool {
    todo!("Exercise 16.2")
}

/// Exercise 16.3: choose by imagining.
/// The world model believes the robot turns `turn_bias` times as sharply as it really does. For
/// each curvature in CURVATURES, imagine the path with curvature * turn_bias, discard it if the
/// imagined path collides (robot radius 0.25), and return the index of the curvature whose
/// imagined end is closest to the goal. None if every imagined path collides.
pub fn choose(start: Pose, goal: P, obstacles: &[Obstacle], turn_bias: f64) -> Option<usize> {
    todo!("Exercise 16.3")
}
