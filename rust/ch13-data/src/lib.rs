//! Chapter 13 companion crate: data as an engineering problem.
//! How a training mixture weights datasets of very different sizes, how often that repeats the
//! small ones, and why a handful of points cannot fix the shape of a scaling curve.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: sources
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Kind {
    Teleoperation,
    HumanVideo,
    Synthetic,
}

/// One dataset in a training mixture, with the size its makers report.
#[derive(Clone, Copy, Debug)]
pub struct Source {
    pub name: &'static str,
    pub hours: f64,
    pub kind: Kind,
    /// Does it carry actions this robot can execute, or only something action-like?
    pub robot_actions: bool,
}

/// A mixture assembled from sizes reported in this book's sources. Hours are self-reported and
/// not comparable across kinds; that is the point of the chapter.
pub fn example_mixture() -> Vec<Source> {
    vec![
        Source { name: "DROID", hours: 350.0, kind: Kind::Teleoperation, robot_actions: true },
        Source { name: "TRI-Ramen", hours: 545.0, kind: Kind::Teleoperation, robot_actions: true },
        Source { name: "EgoDex", hours: 829.0, kind: Kind::HumanVideo, robot_actions: false },
        Source { name: "Synthetic (blueprint)", hours: 6_500.0, kind: Kind::Synthetic, robot_actions: true },
        Source { name: "EgoScale", hours: 20_854.0, kind: Kind::HumanVideo, robot_actions: false },
    ]
}
// endregion: sources

// region: curves
/// EgoScale's average task completion after post-training, against hours of human pretraining
/// data (figure 5, right, of arXiv 2602.16710). A vendor claim, measured on the makers' robots.
pub const EGOSCALE: [(f64, f64); 5] = [(1_000.0, 0.30), (2_000.0, 0.45), (4_000.0, 0.48), (10_000.0, 0.57), (20_000.0, 0.71)];

/// y = a + b ln(x): the shape EgoScale reports for its validation loss.
#[derive(Clone, Copy, Debug)]
pub struct LogLinear {
    pub a: f64,
    pub b: f64,
}

impl LogLinear {
    pub fn fit(points: &[(f64, f64)]) -> LogLinear {
        let xs: Vec<f64> = points.iter().map(|p| p.0.ln()).collect();
        let n = points.len() as f64;
        let mx = xs.iter().sum::<f64>() / n;
        let my = points.iter().map(|p| p.1).sum::<f64>() / n;
        let sxy: f64 = xs.iter().zip(points).map(|(x, p)| (x - mx) * (p.1 - my)).sum();
        let sxx: f64 = xs.iter().map(|x| (x - mx).powi(2)).sum();
        let b = sxy / sxx;
        LogLinear { a: my - b * mx, b }
    }
    pub fn predict(&self, x: f64) -> f64 {
        self.a + self.b * x.ln()
    }
}

/// y = c x^k: the other common shape for a scaling curve.
#[derive(Clone, Copy, Debug)]
pub struct PowerLaw {
    pub c: f64,
    pub k: f64,
}

impl PowerLaw {
    pub fn predict(&self, x: f64) -> f64 {
        self.c * x.powf(self.k)
    }
}

/// Root-mean-square error of a model on points.
pub fn rmse(points: &[(f64, f64)], f: impl Fn(f64) -> f64) -> f64 {
    (points.iter().map(|p| (f(p.0) - p.1).powi(2)).sum::<f64>() / points.len() as f64).sqrt()
}
// endregion: curves
