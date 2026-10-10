//! `cargo run -p ch06-world-action --example summary`: the three controllers side by side.
use ch06_world_action::*;

fn main() {
    let world = World::default();
    let reactive = run_episode(&mut ReactiveController::default(), &world, 300);
    let mut wam = ShootingPlanner::new(ForwardModel::perfect(), PlannerConfig::default(), 7);
    let planned = run_episode(&mut wam, &world, 300);
    let teacher = ShootingPlanner::new(ForwardModel::perfect(), PlannerConfig::default(), 11);
    let mut student = distill(teacher, &training_starts(), 300);
    let fast = run_episode(&mut student, &world, 300);
    for (name, e) in [("reactive", &reactive), ("imagine-then-act", &planned), ("distilled (no imagination)", &fast)] {
        println!("{name:>28}: {:?} after {} steps, {} imagined steps", e.outcome, e.steps, e.model_calls);
    }
    for (label, err) in [("-0.03", -0.03f32), ("-0.01", -0.01)] {
        let curve = compounding_error_curve(&ForwardModel { damping_error: err }, &world, 40);
        println!("drift with damping error {label}: step 5 {:.3}, step 20 {:.3}, step 40 {:.3}", curve[4], curve[19], curve[39]);
    }
    // Biased planner: imagines too much friction.
    for err in [0.0f32, -0.02, -0.05] {
        let mut biased = ShootingPlanner::new(ForwardModel { damping_error: err }, PlannerConfig::default(), 7);
        let e = run_episode(&mut biased, &world, 300);
        println!("planner with damping error {err:+.2}: {:?} after {} steps", e.outcome, e.steps);
    }
    for h in [5usize, 10, 20, 30, 40] {
        let mut p = ShootingPlanner::new(ForwardModel::perfect(), PlannerConfig { horizon: h, ..PlannerConfig::default() }, 7);
        let e = run_episode(&mut p, &world, 300);
        println!("horizon {h:>2}: {:?} after {} steps, {} imagined steps", e.outcome, e.steps, e.model_calls);
    }
}
