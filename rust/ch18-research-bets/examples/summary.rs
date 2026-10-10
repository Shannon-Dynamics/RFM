//! Prints the numbers quoted in chapter 18: `cargo run -p ch18-research-bets --example summary --features solutions`.
use ch18_research_bets::exercises::*;
use ch18_research_bets::*;

fn main() {
    let s = Setup { p_good: 0.5, verifier: Verifier { accept_good: 0.9, accept_bad: 0.2 } };
    for n in [1, 2, 4, 8, 16] {
        println!("n={n}: success {:.3}, latency {:.0} ms", success(&s, n), expected_latency_ms(&s, n, 100.0, 50.0));
    }
    println!("ceiling {:.3}; n for 0.8 {:?}", ceiling(&s), n_for(&s, 0.8));
    let better = Setup { verifier: Verifier { accept_good: 0.9, accept_bad: 0.05 }, ..s };
    println!("better verifier: ceiling {:.3}, n=8 {:.3}", ceiling(&better), success(&better, 8));
}
