//! Prints the numbers quoted in chapter 7: `cargo run -p ch07-latent --example summary --features solutions`.
use ch07_latent::exercises::*;
use ch07_latent::*;

fn main() {
    for f in [0.0, 0.1, 0.2, 0.3, 0.4, 0.5] {
        let share = (0..200).map(|s| signal_share(10.0, 2.0, 1.0, f, s)).sum::<f64>() / 200.0;
        println!("flicker {f:.1}: pixel-loss share from a one-pixel action error {:.3}", share);
    }
    let m = example_robot();
    for n in [2, 4, 8, 16, 32] {
        let pairs: Vec<_> = (0..n).map(|i| {
            let a = std::f64::consts::PI * i as f64 / n as f64 + 0.3;
            let z = [a.cos(), a.sin()];
            let t = apply(&m, z);
            (z, [t[0] + 0.05 * noise(3, i), t[1] + 0.05 * noise(5, i)])
        }).collect();
        println!("{n} labelled pairs: decoder error {:.4}", decoder_error(&fit_decoder(&pairs).unwrap(), &m));
    }
}
