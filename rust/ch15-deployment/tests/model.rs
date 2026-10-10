// Checks on the chapter's models that do not depend on the exercises.
use ch15_deployment::*;

#[test]
fn network_samples_are_mostly_near_the_base_with_rare_stalls() {
    let s = network_samples(40.0, 1000);
    let stalls = s.iter().filter(|x| **x >= 300.0).count();
    assert!(stalls > 10 && stalls < 60, "{stalls}");
    assert!(s.iter().all(|x| *x >= 32.0));
}

#[test]
fn the_cloud_is_faster_only_when_the_network_is_quick() {
    assert!(latency_ms(&in_the_cloud(20.0)) < latency_ms(&on_device()));
    assert!(latency_ms(&in_the_cloud(60.0)) > latency_ms(&on_device()));
}
