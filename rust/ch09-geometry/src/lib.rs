//! Chapter 9 companion crate: geometry-first world models in code.
//! What a camera cannot see at a contact, and the two basic tools for comparing geometric
//! predictions: chamfer distance between point clouds, and occupancy on a voxel grid.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: contact
/// A peg above a hole, seen by a camera whose pixels each cover `px_mm` of the scene. The peg is
/// `offset_mm` to the side of the hole's centre; the hole is `clearance_mm` wider than the peg.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct PegInHole {
    pub offset_mm: f64,
    pub clearance_mm: f64,
    pub px_mm: f64,
}

impl PegInHole {
    /// The pixel column the peg's edge falls in: all a camera can report about the offset.
    pub fn edge_pixel(&self) -> i64 {
        (self.offset_mm / self.px_mm).floor() as i64
    }
    /// The peg jams on the rim when it is off-centre by more than half the clearance.
    pub fn jams(&self) -> bool {
        self.offset_mm.abs() > self.clearance_mm / 2.0
    }
    /// How far the peg overlaps the rim, which is what a contact or force sensor would feel.
    pub fn overlap_mm(&self) -> f64 {
        (self.offset_mm.abs() - self.clearance_mm / 2.0).max(0.0)
    }
}
// endregion: contact

// region: points
/// A point in a 2D cross-section of the scene, in millimetres.
pub type P2 = [f64; 2];

pub fn dist(a: P2, b: P2) -> f64 {
    ((a[0] - b[0]).powi(2) + (a[1] - b[1]).powi(2)).sqrt()
}

/// Points evenly spaced along the outline of a mug in cross-section: walls, base and a handle.
pub fn mug(n_per_side: usize) -> Vec<P2> {
    let line = |a: P2, b: P2| {
        (0..n_per_side).map(move |i| {
            let s = i as f64 / n_per_side as f64;
            [a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])]
        })
    };
    let mut pts: Vec<P2> = Vec::new();
    pts.extend(line([0.0, 100.0], [0.0, 0.0]));
    pts.extend(line([0.0, 0.0], [80.0, 0.0]));
    pts.extend(line([80.0, 0.0], [80.0, 100.0]));
    pts.extend((0..n_per_side).map(|i| {
        let a = -std::f64::consts::FRAC_PI_2 + std::f64::consts::PI * i as f64 / n_per_side as f64;
        [80.0 + 22.0 * a.cos(), 55.0 + 25.0 * a.sin()]
    }));
    pts
}

/// Move a point cloud: rotate by `deg` about the origin, then shift.
pub fn transform(pts: &[P2], deg: f64, dx: f64, dy: f64) -> Vec<P2> {
    let (s, c) = deg.to_radians().sin_cos();
    pts.iter().map(|p| [c * p[0] - s * p[1] + dx, s * p[0] + c * p[1] + dy]).collect()
}
// endregion: points
