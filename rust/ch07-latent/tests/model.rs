// Checks on the chapter's models that do not depend on the exercises.
use ch07_latent::*;

#[test]
fn the_encoder_ignores_flicker_and_finds_the_block() {
    for (pos, f, seed) in [(10.0, 0.0, 1), (25.0, 0.4, 2), (3.0, 0.5, 3), (40.0, 0.5, 9)] {
        assert_eq!(encode(&render(pos, f, seed)), pos, "pos {pos}, flicker {f}");
    }
}

#[test]
fn latent_loss_is_the_action_error_alone() {
    // In feature space the unpredictable background is gone: the loss is exactly the error.
    for seed in 0..10 {
        let actual = encode(&render(12.0 + 3.0, 0.5, seed));
        let predicted = encode(&predict_pixels(12.0, 3.0 + 2.0));
        assert_eq!((predicted - actual).powi(2), 4.0);
    }
}

#[test]
fn noise_is_bounded_and_deterministic() {
    for i in 0..500 {
        let n = noise(11, i);
        assert!((-1.0..=1.0).contains(&n));
        assert_eq!(n, noise(11, i));
    }
}
