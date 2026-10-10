use ch07_latent::exercises::*;
use ch07_latent::*;

#[test]
fn ex7_1_quantize_to_the_nearest_code_and_detect_collapse() {
    let cb = Codebook::ring(8, 1.0);
    assert_eq!(cb.codes.len(), 9);
    assert_eq!(quantize(&cb, [0.05, -0.02]), 0, "a tiny motion is 'stay'");
    assert_eq!(quantize(&cb, [0.9, 0.1]), 1, "rightwards");
    assert_eq!(quantize(&cb, [0.0, 1.2]), 3, "upwards");
    assert_eq!(quantize(&cb, [-0.7, -0.75]), 6, "down and left");

    // A human hand and a robot gripper making the same motion get the same latent action.
    let hand = displacement([0.20, 0.50], [1.10, 0.55]);
    let gripper = displacement([3.0, 1.0], [3.95, 0.92]);
    assert_eq!(quantize(&cb, hand), quantize(&cb, gripper));

    let varied: Vec<[f64; 2]> = (0..16).map(|j| {
        let a = std::f64::consts::TAU * j as f64 / 16.0;
        [a.cos(), a.sin()]
    }).chain(std::iter::once([0.0, 0.0])).collect();
    assert!((usage(&cb, &varied) - 1.0).abs() < 1e-12, "every code is used");
    let collapsed = vec![[0.6, 0.0]; 20];
    assert!((usage(&cb, &collapsed) - 1.0 / 9.0).abs() < 1e-12, "one code for everything");
}

#[test]
fn ex7_2_the_pixel_loss_hears_mostly_flicker() {
    // No flicker: the whole loss is the action error.
    assert!((signal_share(10.0, 2.0, 1.0, 0.0, 7) - 1.0).abs() < 1e-9);
    // Some flicker: the share of the loss that is about the action falls ...
    let mean = |f: f64| (0..40).map(|s| signal_share(10.0, 2.0, 1.0, f, s)).sum::<f64>() / 40.0;
    let (low, high) = (mean(0.2), mean(0.6));
    assert!(low < 0.9 && high < low, "low flicker {low}, high flicker {high}");
    // ... until most of what the loss reports is noise the model can never predict.
    assert!(high < 0.4, "{high}");
    // Getting the action right never makes the share negative on average.
    assert!(mean(0.6) > 0.0);
}

#[test]
fn ex7_3_a_few_labelled_pairs_recover_the_decoder() {
    let m = example_robot();
    let zs = [[1.0, 0.0], [0.0, 1.0], [-1.0, 0.3], [0.5, -0.8], [0.7, 0.7], [-0.4, -0.9], [0.2, 0.6], [-0.9, -0.1]];
    let exact: Vec<_> = zs.iter().map(|z| (*z, apply(&m, *z))).collect();
    let fit = fit_decoder(&exact[..2]).expect("two independent pairs determine M");
    assert!(decoder_error(&fit, &m) < 1e-9);

    let noisy: Vec<_> = zs.iter().enumerate().map(|(i, z)| {
        let a = apply(&m, *z);
        (*z, [a[0] + 0.02 * noise(3, i), a[1] + 0.02 * noise(5, i)])
    }).collect();
    let fit = fit_decoder(&noisy).unwrap();
    assert!(decoder_error(&fit, &m) < 0.05, "{}", decoder_error(&fit, &m));

    assert!(fit_decoder(&exact[..1]).is_none(), "one pair is not enough");
    let collinear = vec![([1.0, 1.0], [0.1, 0.2]), ([2.0, 2.0], [0.2, 0.4]), ([-1.0, -1.0], [-0.1, -0.2])];
    assert!(fit_decoder(&collinear).is_none(), "pairs along one direction cannot fix M");
}
