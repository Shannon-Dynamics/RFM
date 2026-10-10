//! Chapter 16 reference solutions. Compiled in place of `exercises.rs` with `--features solutions`.

use crate::*;

pub fn arc(start: Pose, curvature: f64, steps: usize, step: f64) -> Vec<P> {
    let (mut x, mut y, mut h) = (start.x, start.y, start.heading);
    let mut out = vec![[x, y]];
    for _ in 0..steps {
        h += curvature * step;
        x += step * h.cos();
        y += step * h.sin();
        out.push([x, y]);
    }
    out
}

pub fn collides(path: &[P], obstacles: &[Obstacle], robot_radius: f64) -> bool {
    path.iter().any(|p| obstacles.iter().any(|o| dist(*p, o.c) < o.r + robot_radius))
}

pub fn choose(start: Pose, goal: P, obstacles: &[Obstacle], turn_bias: f64) -> Option<usize> {
    let mut best: Option<(usize, f64)> = None;
    for (i, k) in CURVATURES.iter().enumerate() {
        let path = arc(start, k * turn_bias, STEPS, STEP);
        if collides(&path, obstacles, 0.25) {
            continue;
        }
        let d = dist(*path.last().unwrap(), goal);
        if best.is_none_or(|(_, bd)| d < bd) {
            best = Some((i, d));
        }
    }
    best.map(|(i, _)| i)
}
