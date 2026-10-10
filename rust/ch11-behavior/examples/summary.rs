//! Prints the numbers quoted in chapter 11: `cargo run -p ch11-behavior --example summary --features solutions`.
use ch11_behavior::exercises::*;
use ch11_behavior::*;

fn main() {
    let p = Policy { horizon: 20, offset: 0.05, drift: 0.004, seed: 9 };
    let n = 300;
    for (label, a) in [("open loop", run_open_loop(&p, n)), ("latest", run_latest(&p, n)), ("ensemble m=0.1", run_ensemble(&p, n, 0.1)), ("ensemble m=0", run_ensemble(&p, n, 0.0)), ("ensemble m=0.5", run_ensemble(&p, n, 0.5))] {
        println!("{label}: error {:.4}, jerk {:.4}, reaction {:?}", tracking_error(&a), jerk(&a), reaction_steps(&a, 0.06));
    }
    for (pa, pb) in [(0.6, 0.7), (0.5, 0.6), (0.8, 0.9), (0.4, 0.6)] {
        let need = (5..=600).step_by(5).find(|&n| power(pa, pb, n, 1.645) >= 0.8);
        println!("{pa} vs {pb}: trials per policy for 80% power {need:?}; power at 20 {:.2}, at 50 {:.2}", power(pa, pb, 20, 1.645), power(pa, pb, 50, 1.645));
    }
    println!("wilson 8/10 {:?}, 16/20 {:?}, 80/100 {:?}", wilson(8, 10, 1.96), wilson(16, 20, 1.96), wilson(80, 100, 1.96));
}
