//! Prints the numbers quoted in chapter 10: `cargo run -p ch10-reasoning --example summary --features solutions`.
use ch10_reasoning::exercises::*;
use ch10_reasoning::*;

fn main() {
    let good = Judge { p_success: 0.7, false_done: 0.05, false_retry: 0.1, max_attempts: 3 };
    for (label, j) in [("blind", Judge::blind(0.7)), ("good judge", good), ("optimistic judge", Judge { false_done: 0.3, ..good }), ("cautious judge", Judge { false_retry: 0.4, ..good })] {
        let (d, s, a) = step_outcomes(&j);
        let (td, ts, ta) = task_outcomes(&j, 10);
        println!("{label}: step {d:.3}/{s:.3}/{a:.3}; 10-step task done {td:.3}, silent {ts:.3}, help {ta:.3}; attempts {:.2}", expected_attempts(&j));
    }
}
