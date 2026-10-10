use ch05_reactive_vla::exercises::*;
use ch05_reactive_vla::*;

#[test]
fn ex5_1_token_heads_pay_per_token_denoising_heads_per_step() {
    // OpenVLA predicts one step of a 7-dimensional action: 7 tokens, 7 decoder passes.
    assert_eq!(sequential_passes(Head::Tokens, 1, 7), 7);
    // A 25-step chunk the same way would need 175 passes; parallel decoding needs one.
    assert_eq!(sequential_passes(Head::Tokens, 25, 7), 175);
    assert_eq!(sequential_passes(Head::Parallel, 25, 7), 1);
    // A denoising expert's cost does not grow with the chunk at all.
    assert_eq!(sequential_passes(Head::Denoising { steps: 10 }, 50, 14), 10);
    assert_eq!(sequential_passes(Head::Denoising { steps: 10 }, 5, 7), 10);

    let cost = PassCost { backbone_ms: 40.0, decoder_ms: 6.0, expert_ms: 3.0 };
    assert!((chunk_latency_ms(Head::Tokens, 1, 7, &cost) - 82.0).abs() < 1e-9);
    assert!((chunk_latency_ms(Head::Parallel, 25, 7, &cost) - 46.0).abs() < 1e-9);
    assert!((chunk_latency_ms(Head::Denoising { steps: 10 }, 50, 14, &cost) - 70.0).abs() < 1e-9);
}

fn smooth_chunk() -> Vec<f64> {
    // 50 steps of a reach: a slow ease-in, ease-out motion plus a gentle wobble.
    (0..50).map(|i| {
        let s = i as f64 / 49.0;
        0.6 * (3.0 * s * s - 2.0 * s * s * s) + 0.05 * (std::f64::consts::TAU * s).sin()
    }).collect()
}

#[test]
fn ex5_2_dct_round_trips_and_compacts_smooth_motion() {
    let x = smooth_chunk();
    let c = dct(&x);
    assert_eq!(c.len(), 50);
    assert!(rmse(&idct(&c), &x) < 1e-9, "dct then idct must return the input");
    // Orthonormal: energy is preserved.
    let e = |v: &[f64]| v.iter().map(|a| a * a).sum::<f64>();
    assert!((e(&c) - e(&x)).abs() < 1e-9);
    // Smooth motion lives in the first few coefficients.
    assert!(rmse(&compress(&x, 6), &x) < 0.01, "six coefficients should describe a smooth reach");
    // Jittery motion does not compress.
    let jitter: Vec<f64> = (0..50).map(|i| if i % 2 == 0 { 0.1 } else { -0.1 }).collect();
    assert!(rmse(&compress(&jitter, 6), &jitter) > 0.09);
    // Keeping everything is lossless.
    assert!(rmse(&compress(&x, 50), &x) < 1e-9);
}

#[test]
fn ex5_3_reaction_time_is_set_by_the_slow_system() {
    let fast = simulate(Loop::Dual { slow_hz: 8.0, fast_hz: 200.0 });
    let slow = simulate(Loop::Dual { slow_hz: 2.0, fast_hz: 200.0 });
    let r_fast = reaction_time(&fast, 0.05).expect("8 Hz reasoner should settle");
    let r_slow = reaction_time(&slow, 0.05).expect("2 Hz reasoner should settle");
    // The hand needs about a third of a second to cross between cups at 3 units per second ...
    assert!(r_fast > 0.3 && r_fast < 0.75, "8 Hz: {r_fast}");
    // ... and a slower reasoner adds its waiting time on top.
    assert!(r_slow > r_fast + 0.15, "2 Hz: {r_slow}, 8 Hz: {r_fast}");
    // A trace that never settles has no reaction time.
    let mut never = fast.clone();
    for h in never.hand.iter_mut() { *h = -5.0; }
    assert_eq!(reaction_time(&never, 0.05), None);
}
