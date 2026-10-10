use ch15_deployment::exercises::*;
use ch15_deployment::*;

#[test]
fn ex15_1_long_chunks_make_slow_reactions() {
    let dev = on_device();
    assert_eq!(latency_ms(&dev), 133.0);
    assert_eq!(worst_reaction_ms(&dev, 1000.0, false), 1133.0);
    assert_eq!(worst_reaction_ms(&dev, 1000.0, true), 266.0);
    // A two-second chunk executed synchronously means more than two seconds of blindness.
    assert!(worst_reaction_ms(&dev, 2000.0, false) > 2000.0);
    // Asynchronous reaction does not depend on the chunk at all.
    assert_eq!(worst_reaction_ms(&dev, 50.0, true), worst_reaction_ms(&dev, 5000.0, true));
}

#[test]
fn ex15_2_the_network_decides_how_often_the_cloud_is_on_time() {
    let net = network_samples(40.0, 1000);
    let compute = latency_ms(&in_the_cloud(0.0));
    let r150 = deadline_hit_rate(compute, &net, 150.0);
    assert!(r150 > 0.8 && r150 < 0.9, "{r150}");
    // Stalls are long: no reasonable deadline catches all of them.
    assert!(deadline_hit_rate(compute, &net, 300.0) < 0.99);
    assert_eq!(deadline_hit_rate(compute, &net, 10_000.0), 1.0);
    assert_eq!(deadline_hit_rate(compute, &[], 150.0), 0.0);
}

#[test]
fn ex15_3_readiness_is_limited_by_the_weakest_dimension() {
    let (i, v, n) = weakest(&TOP_RATED, 0.2);
    assert_eq!((i, v), (4, 0.0));
    assert_eq!(IMPLICATIONS[i], "Precision and accuracy");
    assert_eq!(n, 2, "only adaptability and benchmarking reach a fifth of their criteria");
    assert_eq!(weakest(&[0.5, 0.2, 0.9], 0.3), (1, 0.2, 2));
}
