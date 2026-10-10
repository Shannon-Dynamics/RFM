//! Chapter 7 companion crate: latent prediction and latent actions in code.
//! Why a pixel loss hears mostly noise, how a latent action is read off two frames, and the small
//! per-robot decoder that turns latent actions into real commands.

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

// region: strip
/// A one-dimensional camera image of `WIDTH` pixels: a bright block of `BLOCK` pixels that the
/// robot pushes, over a background that flickers unpredictably (lighting, shadows, a screen).
pub const WIDTH: usize = 48;
pub const BLOCK: f64 = 6.0;

/// Deterministic noise in [-1, 1] for pixel `i` of frame `seed`.
pub fn noise(seed: u64, i: usize) -> f64 {
    let mut x = seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) ^ (i as u64).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    x ^= x >> 31;
    x = x.wrapping_mul(0x94D0_49BB_1331_11EB);
    x ^= x >> 29;
    (x % 20_001) as f64 / 10_000.0 - 1.0
}

/// Render the strip with the block's left edge at `pos` (sub-pixel positions blend edge pixels).
pub fn render(pos: f64, flicker: f64, seed: u64) -> Vec<f64> {
    (0..WIDTH)
        .map(|i| {
            let (l, r) = (i as f64, i as f64 + 1.0);
            let cover = (r.min(pos + BLOCK) - l.max(pos)).clamp(0.0, 1.0);
            cover + (1.0 - cover) * flicker * noise(seed, i)
        })
        .collect()
}

/// The best a pixel predictor can do: move the block, and predict the background's average (zero),
/// because the flicker in the next frame cannot be known in advance.
pub fn predict_pixels(pos: f64, action: f64) -> Vec<f64> {
    render(pos + action, 0.0, 0)
}

/// An idealised feature encoder: where the block is. A JEPA-style encoder trained on footage like
/// this learns something close to it, because the flicker cannot be predicted and so is not worth
/// encoding. Here it is a matched filter: the window of `BLOCK` pixels with the most brightness.
pub fn encode(frame: &[f64]) -> f64 {
    let w = BLOCK as usize;
    (0..=WIDTH - w)
        .map(|s| (s, frame[s..s + w].iter().sum::<f64>()))
        .fold((0, f64::MIN), |best, cur| if cur.1 > best.1 { cur } else { best })
        .0 as f64
}

/// Mean squared error between two frames.
pub fn pixel_loss(pred: &[f64], actual: &[f64]) -> f64 {
    pred.iter().zip(actual).map(|(p, a)| (p - a).powi(2)).sum::<f64>() / pred.len() as f64
}
// endregion: strip

// region: latent_action
/// A codebook of latent actions, as in a VQ-VAE latent action model: a handful of vectors, each
/// standing for one kind of change between two frames. Here: "stay", plus `k` directions.
#[derive(Clone, Debug)]
pub struct Codebook {
    pub codes: Vec<[f64; 2]>,
}

impl Codebook {
    pub fn ring(k: usize, step: f64) -> Codebook {
        let mut codes = vec![[0.0, 0.0]];
        codes.extend((0..k).map(|j| {
            let a = std::f64::consts::TAU * j as f64 / k as f64;
            [step * a.cos(), step * a.sin()]
        }));
        Codebook { codes }
    }
}

/// The idealised latent-action encoder: how far the tracked hand or gripper moved between two
/// frames. A learned latent action model has to discover this from pixels alone.
pub fn displacement(before: [f64; 2], after: [f64; 2]) -> [f64; 2] {
    [after[0] - before[0], after[1] - before[1]]
}
// endregion: latent_action

// region: decoder
/// A robot turns a latent action into its own command through a map the model has never seen:
/// here a rotation and scale between the camera's view and the robot's action frame.
pub type Mat2 = [[f64; 2]; 2];

pub fn apply(m: &Mat2, z: [f64; 2]) -> [f64; 2] {
    [m[0][0] * z[0] + m[0][1] * z[1], m[1][0] * z[0] + m[1][1] * z[1]]
}

/// An example embodiment: actions in a frame rotated by 30 degrees, in units 0.4 times as large.
pub fn example_robot() -> Mat2 {
    let (s, c) = (30f64.to_radians().sin(), 30f64.to_radians().cos());
    [[0.4 * c, -0.4 * s], [0.4 * s, 0.4 * c]]
}

/// Frobenius distance between two maps: how wrong a fitted decoder is.
pub fn decoder_error(a: &Mat2, b: &Mat2) -> f64 {
    (0..2).flat_map(|i| (0..2).map(move |j| (a[i][j] - b[i][j]).powi(2))).sum::<f64>().sqrt()
}
// endregion: decoder
