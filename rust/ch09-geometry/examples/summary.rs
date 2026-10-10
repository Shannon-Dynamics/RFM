//! Prints the numbers quoted in chapter 9: `cargo run -p ch09-geometry --example summary --features solutions`.
use ch09_geometry::exercises::*;
use ch09_geometry::*;

fn main() {
    println!("hidden jams, 1 mm clearance, 2 mm pixels: {:?}", invisible_jams(1.0, 2.0, 0.1, 3.0));
    let m = mug(16);
    for (deg, dx) in [(0.0, 2.0), (0.0, 5.0), (0.0, 10.0), (5.0, 0.0), (10.0, 0.0)] {
        let t = transform(&m, deg, dx, 0.0);
        println!("rotate {deg} deg, shift {dx} mm: chamfer {:.2} mm, voxel IoU (10 mm) {:.2}", chamfer(&m, &t), iou(&voxelize(&m, 10.0), &voxelize(&t, 10.0)));
    }
}
