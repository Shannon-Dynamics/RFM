use ch09_geometry::exercises::*;
use ch09_geometry::*;

#[test]
fn ex9_1_a_two_millimetre_pixel_hides_a_jam() {
    // 1 mm of clearance seen through 2 mm pixels: offsets above 0.5 mm jam, and the camera
    // cannot tell anything below 2 mm from a perfect alignment.
    let hidden = invisible_jams(1.0, 2.0, 0.1, 3.0);
    assert!(!hidden.is_empty());
    assert!((hidden[0] - 0.6).abs() < 1e-9, "first hidden jam {}", hidden[0]);
    assert!((hidden.last().unwrap() - 1.9).abs() < 1e-9, "last hidden jam {}", hidden.last().unwrap());
    // A camera fine enough to resolve the clearance sees every jam.
    assert!(invisible_jams(1.0, 0.4, 0.1, 3.0).is_empty());
}

#[test]
fn ex9_2_chamfer_ignores_order_and_grows_with_error() {
    let m = mug(12);
    assert!(chamfer(&m, &m).abs() < 1e-12);
    let mut shuffled = m.clone();
    shuffled.reverse();
    assert!(chamfer(&m, &shuffled).abs() < 1e-12, "point order must not matter");
    let shifted = transform(&m, 0.0, 5.0, 0.0);
    let further = transform(&m, 0.0, 15.0, 0.0);
    let (c5, c15) = (chamfer(&m, &shifted), chamfer(&m, &further));
    assert!(c5 > 0.0 && c15 > c5, "{c5} then {c15}");
    // Symmetric by construction.
    assert!((chamfer(&m, &shifted) - chamfer(&shifted, &m)).abs() < 1e-9);
    // A single far-away stray point is penalised in one direction only.
    let mut stray = m.clone();
    stray.push([500.0, 500.0]);
    assert!(chamfer(&m, &stray) > 5.0);
}

#[test]
fn ex9_3_voxels_and_iou() {
    let pts = [[0.5, 0.5], [0.9, 0.1], [1.5, 0.5], [-0.5, 2.2]];
    let v = voxelize(&pts, 1.0);
    assert_eq!(v.len(), 3);
    assert!(v.contains(&(-1, 2)), "floor division puts -0.5 in cell -1");
    let m = mug(20);
    let a = voxelize(&m, 10.0);
    assert!((iou(&a, &a) - 1.0).abs() < 1e-12);
    let b = voxelize(&transform(&m, 0.0, 10.0, 0.0), 10.0);
    let c = voxelize(&transform(&m, 0.0, 40.0, 0.0), 10.0);
    assert!(iou(&a, &b) > iou(&a, &c));
    assert_eq!(iou(&Default::default(), &Default::default()), 1.0);
}
