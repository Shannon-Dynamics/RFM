//! Prints the numbers quoted in chapter 8: `cargo run -p ch08-simulators --example summary --features solutions`.
use ch08_simulators::exercises::*;
use ch08_simulators::*;

fn main() {
    for (label, lo, hi, n, trust) in [("narrow", 0.1, 0.4, 4, None), ("narrow, stay near data", 0.1, 0.4, 4, Some(0.5)), ("wide", 0.1, 1.0, 10, None)] {
        let m = fit_world_model(&collect(lo, hi, n));
        let th = *optimize(&m, 0.3, 0.025, 60, trust).last().unwrap();
        println!("{label}: theta {th:.3}, imagined {:.3}, real {:.3}, model {m:?}", m.reward(th), true_reward(th));
    }
    println!("violations: feasible {}, plausible-only {}", violations(&rollout_feasible(), 0.1, 1.2, 10.0), violations(&rollout_plausible_only(), 0.1, 1.2, 10.0));
}
