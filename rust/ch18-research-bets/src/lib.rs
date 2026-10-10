//! Chapter 18 companion crate: one research bet worked through.
//! Spend compute at test time: generate several candidate plans and let a verifier, a world model
//! or a reasoning model, pick one. The verifier decides how much this can ever buy.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: verifier
/// A verifier that checks candidate plans before one is executed.
#[derive(Clone, Copy, Debug)]
pub struct Verifier {
    /// Chance it accepts a plan that would succeed.
    pub accept_good: f64,
    /// Chance it accepts a plan that would fail.
    pub accept_bad: f64,
}

/// The policy's chance that any one sampled plan succeeds, and the verifier that screens them.
/// Candidates are checked one at a time; the first accepted plan is executed. If none of `n` is
/// accepted, the last one is executed anyway.
#[derive(Clone, Copy, Debug)]
pub struct Setup {
    pub p_good: f64,
    pub verifier: Verifier,
}

impl Setup {
    /// Chance that a single candidate is accepted.
    pub fn accept_rate(&self) -> f64 {
        self.p_good * self.verifier.accept_good + (1.0 - self.p_good) * self.verifier.accept_bad
    }
}

/// A small deterministic generator, so simulated runs can be compared with the exact answers.
pub struct Rng(u64);
impl Rng {
    pub fn new(seed: u64) -> Rng {
        Rng(seed)
    }
    pub fn next_f64(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        ((z ^ (z >> 31)) >> 11) as f64 / (1u64 << 53) as f64
    }
}

/// Run the procedure once: returns (success, candidates examined).
pub fn run_once(s: &Setup, n: usize, rng: &mut Rng) -> (bool, usize) {
    for k in 1..=n {
        let good = rng.next_f64() < s.p_good;
        let accept = rng.next_f64() < if good { s.verifier.accept_good } else { s.verifier.accept_bad };
        if accept || k == n {
            return (good, k);
        }
    }
    unreachable!("n must be at least 1")
}
// endregion: verifier
