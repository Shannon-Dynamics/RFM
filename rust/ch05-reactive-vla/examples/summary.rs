//! Prints the numbers quoted in chapter 5: `cargo run -p ch05-reactive-vla --example summary --features solutions`.
use ch05_reactive_vla::exercises::reaction_time;
use ch05_reactive_vla::*;

fn main() {
    for l in [
        Loop::Single { hz: 8.0 },
        Loop::Dual { slow_hz: 8.0, fast_hz: 200.0 },
        Loop::Dual { slow_hz: 2.0, fast_hz: 30.0 },
        Loop::Dual { slow_hz: 2.0, fast_hz: 200.0 },
    ] {
        let tr = simulate(l);
        println!("{l:?}: tracking {:.3}, reaction {:?} {:?}", tracking_error(&tr, 0.3, SWITCH_S), reaction_time(&tr, 0.05), reaction_time(&tr, 0.1));
    }
    for r in [Recipe::LanguageOnly, Recipe::FilterFailures, Recipe::MetadataPrompt] {
        println!("{r:?}: {:?}", outcome(r, 0.3, 0.9));
    }
}
