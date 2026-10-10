// Checks on the chapter's models that do not depend on the exercises.
use ch09_geometry::*;

#[test]
fn camera_and_contact_disagree_below_a_pixel() {
    let p = PegInHole { offset_mm: 1.2, clearance_mm: 1.0, px_mm: 2.0 };
    assert_eq!(p.edge_pixel(), 0);
    assert!(p.jams());
    assert!((p.overlap_mm() - 0.7).abs() < 1e-9);
    assert_eq!(PegInHole { offset_mm: 0.3, ..p }.overlap_mm(), 0.0);
}

#[test]
fn transform_preserves_shape() {
    let m = mug(8);
    let t = transform(&m, 90.0, 0.0, 0.0);
    for (a, b) in m.iter().zip(&t) {
        assert!((dist(*a, [0.0, 0.0]) - dist(*b, [0.0, 0.0])).abs() < 1e-9);
    }
}
