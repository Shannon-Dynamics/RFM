//! Chapter 2 companion crate: the arithmetic behind "why now".
//! Control rates under inference latency, the cost of demonstrations, and fitting a scaling curve.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: control_rate
/// Synchronous execution: the robot stops while the model thinks, then runs the whole chunk.
/// Returns motor commands per second actually delivered.
pub fn sync_rate_hz(latency_ms: f32, chunk_len: usize, control_hz: f32) -> f32 {
    let execute_ms = chunk_len as f32 * 1000.0 / control_hz;
    chunk_len as f32 * 1000.0 / (latency_ms + execute_ms)
}

/// Asynchronous execution: the next chunk is computed while the current one runs. The robot never
/// stops as long as inference finishes before the steps it is executing run out.
pub fn async_keeps_up(latency_ms: f32, execute_steps: usize, control_hz: f32) -> bool {
    latency_ms <= execute_steps as f32 * 1000.0 / control_hz
}
// endregion: control_rate

// region: scaling
/// A log-linear scaling curve, y = a + b ln(x), the form EgoScale reports for human-video hours.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LogLinear {
    pub a: f64,
    pub b: f64,
}

impl LogLinear {
    pub fn predict(&self, x: f64) -> f64 {
        self.a + self.b * x.ln()
    }
}

/// EgoScale reports average task completion of 0.30 after 1k hours of egocentric pretraining
/// and 0.71 after 20k hours (Zheng et al. 2026, arXiv 2602.16710, section 5).
pub const EGOSCALE_POINTS: [(f64, f64); 2] = [(1_000.0, 0.30), (20_000.0, 0.71)];
// endregion: scaling

/// Reported cost of one hour of teleoperation data, in US dollars (SVRC, State of Robotics 2026).
pub const TELEOP_COST_PER_HOUR: [(&str, f64); 3] = [("early 2024", 340.0), ("Q4 2025", 136.0), ("March 2026", 118.0)];
