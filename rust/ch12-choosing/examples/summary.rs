//! Prints the numbers quoted in chapter 12: `cargo run -p ch12-choosing --example summary --features solutions`.
use ch12_choosing::exercises::*;
use ch12_choosing::*;

fn main() {
    let eq = [1.0; 8];
    for f in ALL {
        println!("{f:?}: equal-weight score {:.3}", weighted_score(f, &eq));
    }
    let book: Vec<_> = ALL.iter().map(|f| (*f, scores(*f))).collect();
    println!("best {:?}; dominated {:?}", best(&eq), dominated(&book));
    for (c, name) in CRITERIA.iter().enumerate() {
        let d = flip(&eq, c);
        let w = d.map(|d| { let mut w = eq; w[c] += d; best(&w) });
        println!("raise '{name}' by {d:?} -> {w:?}");
    }
}
