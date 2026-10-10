//! Prints the numbers quoted in chapter 14: `cargo run -p ch14-post-training --example summary --features solutions`.
use ch14_post_training::exercises::*;
use ch14_post_training::*;

fn main() {
    let b = backbone();
    for r in [4, 8, 16, 64] {
        let (full, lora) = trainable(&b, r);
        println!("rank {r}: full {full}, lora {lora} ({:.2}% of full, {:.0}x fewer)", 100.0 * lora as f64 / full as f64, full as f64 / lora as f64);
    }
    for anchor in [0.0, 0.1, 0.3] {
        let path = refine(30, 16, 0.15, 0.3, anchor);
        println!("anchor {anchor}: aim after 5 {:.3}, after 30 {:.3}, reward {:.3}", path[5], path[30], reward(path[30]));
    }
    let ev = grilled_cheese();
    for now in [250.0, 500.0, 850.0] {
        let (s, l) = recall(&ev, now, 30.0);
        println!("t={now}: short {s:?}; long {} facts", l.len());
    }
}
