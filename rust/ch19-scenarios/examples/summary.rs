//! Prints the evidence table: `cargo run -p ch19-scenarios --example summary --features solutions`.
use ch19_scenarios::exercises::*;
use ch19_scenarios::*;

fn main() {
    let t = evidence_table();
    for (i, e) in t.iter().enumerate() {
        println!("{i}: {:?} {}", e.effects, e.result);
    }
    let all = tally(&t, &[true; 10]);
    println!("if everything were observed: {all:?}, leading {:?}", leading(all));
}
