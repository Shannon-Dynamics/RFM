//! `cargo run -p ch06-world-action --example seeds`: success over 20 seeds as the world model gets
//! worse and as more of each imagined chunk is executed before replanning.
use ch06_world_action::*;

fn main() {
    let world = World::default();
    println!("{:>8} {:>12} {:>8} {:>5} {:>9}", "execute", "model error", "reached", "fell", "collided");
    for execute in [5usize, 15, 30] {
        for err in [0.0f32, -0.05, -0.10] {
            let (mut ok, mut fell, mut hit) = (0, 0, 0);
            for seed in 1..=20u64 {
                let cfg = PlannerConfig { execute, ..PlannerConfig::default() };
                let mut p = ShootingPlanner::new(ForwardModel { damping_error: err }, cfg, seed);
                match run_episode(&mut p, &world, 300).outcome {
                    Outcome::Reached => ok += 1,
                    Outcome::FellOff => fell += 1,
                    Outcome::Collided => hit += 1,
                    _ => {}
                }
            }
            println!("{execute:>8} {err:>12.2} {ok:>8} {fell:>5} {hit:>9}");
        }
    }
}
