//! Prints the numbers quoted in chapter 13: `cargo run -p ch13-data --example summary --features solutions`.
use ch13_data::exercises::*;
use ch13_data::*;

fn main() {
    let m = example_mixture();
    let total: f64 = m.iter().map(|s| s.hours).sum();
    for a in [0.0, 0.3, 0.5, 0.7, 1.0] {
        let w = mixture_weights(&m, a);
        println!("alpha {a}: weights {:?}, max epochs at a {total:.0}-hour budget {:.1}", w.iter().map(|x| (x * 1000.0).round() / 10.0).collect::<Vec<_>>(), max_epochs(&m, a, total));
    }
    println!("alpha for at most 5 epochs at budget {total:.0}: {:?}", alpha_for(&m, total, 5.0));
    let lin = LogLinear::fit(&EGOSCALE);
    let pow = fit_power_law(&EGOSCALE);
    println!("loglinear {lin:?} rmse {:.4}; power {pow:?} rmse {:.4}", rmse(&EGOSCALE, |x| lin.predict(x)), rmse(&EGOSCALE, |x| pow.predict(x)));
    for h in [20_000.0, 50_000.0, 100_000.0, 270_000.0, 1_000_000.0] {
        println!("{h} hours: loglinear {:.3}, power {:.3}", lin.predict(h), pow.predict(h));
    }
}
