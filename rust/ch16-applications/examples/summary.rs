//! Prints the numbers quoted in chapter 16: `cargo run -p ch16-applications --example summary --features solutions`.
use ch16_applications::exercises::*;
use ch16_applications::*;

fn main() {
    let (start, goal, obs) = scene();
    for bias in [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 2.0] {
        let c = choose(start, goal, &obs, bias);
        let real = c.map(|i| { let p = arc(start, CURVATURES[i], STEPS, STEP); (CURVATURES[i], collides(&p, &obs, 0.25), (dist(*p.last().unwrap(), goal) * 100.0).round() / 100.0) });
        println!("bias {bias}: (curvature, really collides, real distance to goal) {real:?}");
    }
}
