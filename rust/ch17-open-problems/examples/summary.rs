//! Prints the numbers quoted in chapter 17: `cargo run -p ch17-open-problems --example summary --features solutions`.
use ch17_open_problems::exercises::*;
use ch17_open_problems::*;

fn main() {
    let free = rollout_error(0.1, 0.01, 30, None);
    let g = rollout_error(0.1, 0.01, 30, Some(5));
    println!("error after 30: free {:.3}, regrounded every 5 {:.3}", free[29], g[29]);
    let [a, b, c] = rig();
    let obj = [2.5, 2.0];
    for deg in [0.0, 1.0, 2.0, 4.0, 8.0] {
        let (p, miss) = consistency(a, bearing(a, obj), b, bearing(b, obj) + f64::to_radians(deg), c, bearing(c, obj)).unwrap();
        println!("b off by {deg} deg: point {:?}, third view misses by {:.2} deg, position error {:.3}", p.map(|v| (v * 1000.0).round() / 1000.0), miss.to_degrees(), dist(p, obj));
    }
}
fn dist(a: P, b: P) -> f64 { ((a[0] - b[0]).powi(2) + (a[1] - b[1]).powi(2)).sqrt() }
