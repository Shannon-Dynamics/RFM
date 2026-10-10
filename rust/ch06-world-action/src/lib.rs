//! Chapter 6 companion crate: a toy world-action model.
//!
//! A puck slides on a low-friction table. The goal sits near the table's edge and an obstacle
//! blocks the straight line to it. A reactive policy that only looks at the current state
//! crashes into the obstacle or overshoots off the edge; a policy that imagines the
//! consequences of candidate action chunks before acting does not.
//!
//! The same constants drive the simulation in the web book, so what you see there is what
//! this code computes.

pub mod world;

#[cfg(not(feature = "solutions"))]
pub mod exercises;
#[cfg(feature = "solutions")]
#[path = "solutions.rs"]
pub mod exercises;

pub use world::*;

// region: components
/// The four components the 2026 surveys use to compare world-action models.
/// `Obs` is what the robot sees, `Act` what it sends to the motors, `Instr` the task.
pub trait Policy<Obs, Act, Instr> {
    /// p(a_{t:t+H} | o_{<t}, l): actions straight from observations (a reactive VLA).
    fn act(&self, history: &[Obs], instruction: &Instr) -> Vec<Act>;
}

pub trait ForwardDynamics<Obs, Act> {
    /// p(o_{t:t+H} | o_{<t}, a_{t:t+H}): what happens if I do this?
    fn imagine(&self, history: &[Obs], actions: &[Act]) -> Vec<Obs>;
}

pub trait InverseDynamics<Obs, Act> {
    /// p(a_{t:t+H} | o_{<t}, o_{t:t+H}): which actions produce this future?
    fn infer(&self, history: &[Obs], future: &[Obs]) -> Vec<Act>;
}

pub trait VisualPlanner<Obs, Instr> {
    /// p(o_{t:t+H} | o_{<t}, l): what should the future look like?
    fn plan(&self, history: &[Obs], instruction: &Instr) -> Vec<Obs>;
}
// endregion: components

// region: plan_then_act
/// Plan-then-act (the inverse-dynamics paradigm): imagine a good future, then recover the
/// actions that produce it. Any planner and inverse model that fit the traits will do.
pub fn plan_then_act<O: Clone, A, I>(
    planner: &impl VisualPlanner<O, I>,
    idm: &impl InverseDynamics<O, A>,
    history: &[O],
    instruction: &I,
) -> Vec<A> {
    let imagined_future = planner.plan(history, instruction); // costly: video generation
    idm.infer(history, &imagined_future) // cheap: a small action head
}
// endregion: plan_then_act

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reactive_policy_fails_where_imagination_succeeds() {
        let reactive = run_episode(&mut ReactiveController::default(), &World::default(), 200);
        assert_ne!(reactive.outcome, Outcome::Reached, "reactive policy should not reach the goal");

        let model = ForwardModel::perfect();
        let mut wam = ShootingPlanner::new(model, PlannerConfig::default(), 7);
        let planned = run_episode(&mut wam, &World::default(), 200);
        assert_eq!(planned.outcome, Outcome::Reached, "imagine-then-act should reach the goal");
        assert!(planned.model_calls > 0);
    }

    #[test]
    fn distilled_policy_acts_without_imagination() {
        let teacher = ShootingPlanner::new(ForwardModel::perfect(), PlannerConfig::default(), 11);
        let student = distill(teacher, &training_starts(), 200);
        let mut student = student;
        let episode = run_episode(&mut student, &World::default(), 200);
        assert_eq!(episode.model_calls, 0, "a distilled policy never calls the world model at test time");
        assert_eq!(episode.outcome, Outcome::Reached);
    }

    #[test]
    fn biased_model_misleads_a_long_horizon_planner() {
        // A model that underestimates friction imagines the puck stopping sooner than it does.
        let biased = ForwardModel { damping_error: -0.03 };
        let err_short = compounding_error_curve(&biased, &World::default(), 5);
        let err_long = compounding_error_curve(&biased, &World::default(), 40);
        assert!(err_long.last().unwrap() > err_short.last().unwrap());
    }
}
