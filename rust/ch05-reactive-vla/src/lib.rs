//! Chapter 5 companion crate: reactive vision-language-action models in code.
//! What each action head costs per chunk, why FAST compresses chunks with a cosine transform,
//! the fast-slow split behind Helix-style dual systems, and why π0.7's metadata prompt lets a
//! model keep its failures.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: heads
/// The three ways a reactive VLA turns backbone features into an action chunk.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Head {
    /// Autoregressive action tokens, one per action dimension per step, each needing its own
    /// sequential decoder pass (RT-2, OpenVLA).
    Tokens,
    /// Every action token decoded at once in a single pass (OpenVLA-OFT's parallel decoding).
    Parallel,
    /// A flow-matching or diffusion action expert: `steps` passes of a small network that turn
    /// noise into the whole chunk at once (π0, GR00T N1).
    Denoising { steps: usize },
}

/// Illustrative costs of one pass through each part of the model, in milliseconds.
#[derive(Clone, Copy, Debug)]
pub struct PassCost {
    /// Reading the images and the instruction once (the prefill).
    pub backbone_ms: f64,
    /// One decoder pass of the language model.
    pub decoder_ms: f64,
    /// One pass of the action expert.
    pub expert_ms: f64,
}
// endregion: heads

// region: fast
/// Inverse of the orthonormal DCT-II (that is, the DCT-III). FAST turns each action dimension of
/// a chunk into cosine coefficients; smooth motion needs only the first few, so the rest round to
/// zero and the chunk becomes a short token sequence.
pub fn idct(coeffs: &[f64]) -> Vec<f64> {
    let n = coeffs.len();
    let nf = n as f64;
    (0..n)
        .map(|i| {
            coeffs
                .iter()
                .enumerate()
                .map(|(k, c)| {
                    let scale = if k == 0 { (1.0 / nf).sqrt() } else { (2.0 / nf).sqrt() };
                    scale * c * (std::f64::consts::PI * (i as f64 + 0.5) * k as f64 / nf).cos()
                })
                .sum()
        })
        .collect()
}

/// Root-mean-square difference between two equal-length signals.
pub fn rmse(a: &[f64], b: &[f64]) -> f64 {
    (a.iter().zip(b).map(|(x, y)| (x - y).powi(2)).sum::<f64>() / a.len() as f64).sqrt()
}
// endregion: fast

// region: dual_rate
/// Two cups slide back and forth on a table. The instruction names cup 0, then changes to cup 1.
pub const SWITCH_S: f64 = 1.45;
pub const DURATION_S: f64 = 3.0;
/// Fastest the hand can move, in table units per second.
pub const HAND_SPEED: f64 = 3.0;

/// Position of cup `which` (0 or 1) at time `t` in seconds.
pub fn cup(which: usize, t: f64) -> f64 {
    which as f64 + 0.25 * (std::f64::consts::TAU * 0.6 * t + 1.3 * which as f64).sin()
}

/// The cup the instruction names at time `t`.
pub fn instructed(t: f64) -> usize {
    usize::from(t >= SWITCH_S)
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Loop {
    /// One large model does everything: it looks, thinks for one period, then sends the hand to
    /// where the named cup was when it looked.
    Single { hz: f64 },
    /// A slow reasoner decides which cup; a fast controller follows that cup with fresh images.
    Dual { slow_hz: f64, fast_hz: f64 },
}

#[derive(Clone, Debug, Default)]
pub struct Trace {
    pub t: Vec<f64>,
    pub target: Vec<f64>,
    pub hand: Vec<f64>,
}

/// Simulate three seconds at 1 kHz. Each model reads its inputs at the start of a period and its
/// output arrives one period later, so a model's latency equals its period.
pub fn simulate(l: Loop) -> Trace {
    let period = |hz: f64| ((1000.0 / hz).round() as usize).max(1);
    let (slow_p, fast_p) = match l {
        Loop::Single { hz } => (period(hz), 0),
        Loop::Dual { slow_hz, fast_hz } => (period(slow_hz), period(fast_hz)),
    };
    let n = (DURATION_S * 1000.0) as usize;
    let mut hand = cup(0, 0.0);
    let mut command = hand;
    let mut belief = 0; // the cup the fast controller has been told to follow
    let (mut slow_snapshot, mut fast_snapshot): (Option<(usize, f64)>, Option<f64>) = (None, None);
    let mut tr = Trace::default();
    for k in 0..n {
        let t = k as f64 / 1000.0;
        if k % slow_p == 0 {
            if let Some((which, pos)) = slow_snapshot.take() {
                match l {
                    Loop::Single { .. } => command = pos,
                    Loop::Dual { .. } => belief = which,
                }
            }
            let which = instructed(t);
            slow_snapshot = Some((which, cup(which, t)));
        }
        if fast_p > 0 && k % fast_p == 0 {
            if let Some(pos) = fast_snapshot.take() {
                command = pos;
            }
            fast_snapshot = Some(cup(belief, t));
        }
        let step = HAND_SPEED / 1000.0;
        hand += (command - hand).clamp(-step, step);
        tr.t.push(t);
        tr.target.push(cup(instructed(t), t));
        tr.hand.push(hand);
    }
    tr
}

/// Mean distance between hand and the named cup over the window [from, to) seconds.
pub fn tracking_error(tr: &Trace, from: f64, to: f64) -> f64 {
    let (mut sum, mut n) = (0.0, 0);
    for i in 0..tr.t.len() {
        if tr.t[i] >= from && tr.t[i] < to {
            sum += (tr.hand[i] - tr.target[i]).abs();
            n += 1;
        }
    }
    sum / n.max(1) as f64
}
// endregion: dual_rate

// region: metadata
/// What a training recipe does with episodes that contain mistakes.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Recipe {
    /// Keep everything, prompt with the task only: the model imitates the mistakes too.
    LanguageOnly,
    /// Throw away every episode labelled as containing a mistake.
    FilterFailures,
    /// Keep everything, label it, and at test time prompt for "Mistake: false" (π0.7's approach).
    MetadataPrompt,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Outcome {
    /// Fraction of the collected episodes the model is trained on.
    pub data_used: f64,
    /// Chance that the behaviour the model imitates at test time is a mistake.
    pub mistake_rate: f64,
}

/// A toy model of the recipes: `failure_frac` of the episodes contain a mistake, and a human
/// labels each episode correctly with probability `label_accuracy`. A generative policy imitates
/// the episodes that match its prompt.
pub fn outcome(recipe: Recipe, failure_frac: f64, label_accuracy: f64) -> Outcome {
    let (f, a) = (failure_frac, label_accuracy);
    let labelled_clean = (1.0 - f) * a + f * (1.0 - a);
    let mistakes_among_clean = if labelled_clean > 0.0 { f * (1.0 - a) / labelled_clean } else { 0.0 };
    match recipe {
        Recipe::LanguageOnly => Outcome { data_used: 1.0, mistake_rate: f },
        Recipe::FilterFailures => Outcome { data_used: labelled_clean, mistake_rate: mistakes_among_clean },
        Recipe::MetadataPrompt => Outcome { data_used: 1.0, mistake_rate: mistakes_among_clean },
    }
}
// endregion: metadata
