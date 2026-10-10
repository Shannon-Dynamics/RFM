//! Prints the numbers quoted in chapter 15: `cargo run -p ch15-deployment --example summary --features solutions`.
use ch15_deployment::exercises::*;
use ch15_deployment::*;

fn main() {
    let dev = on_device();
    println!("on-device latency {} ms", latency_ms(&dev));
    for rt in [20.0, 60.0, 120.0] {
        println!("cloud rtt {rt}: latency {} ms", latency_ms(&in_the_cloud(rt)));
    }
    for chunk in [500.0, 1000.0, 2000.0] {
        println!("chunk {chunk} ms: sync reaction {} ms, async {} ms", worst_reaction_ms(&dev, chunk, false), worst_reaction_ms(&dev, chunk, true));
    }
    let net = network_samples(40.0, 1000);
    let cloud_compute = latency_ms(&in_the_cloud(0.0));
    for deadline in [150.0, 200.0, 300.0] {
        println!("deadline {deadline}: cloud hit rate {:.3}; on-device {}", deadline_hit_rate(cloud_compute, &net, deadline), if latency_ms(&dev) <= deadline { 1.0 } else { 0.0 });
    }
    println!("weakest of top-rated: {:?}", weakest(&TOP_RATED, 0.2));
}
