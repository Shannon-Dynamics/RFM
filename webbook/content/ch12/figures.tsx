import { family, type FamilyId } from "@/content/book";
import css from "./scenarios.module.css";

const SCENARIOS: { title: string; robot: string; task: string; answers: string; chosen: { f: FamilyId; text: string }[]; failure: string; measure: string }[] = [
  { title: "A warehouse pick-and-place cell", robot: "A fixed arm with a suction or parallel gripper over a conveyor.",
    task: "Pick known products from totes and place them in boxes, for eight hours a day.",
    answers: "Short horizon, in-distribution objects: yes.",
    chosen: [{ f: "reactive", text: "A reactive VLA fine-tuned on a few hundred demonstrations of this cell (chapter 5)." }],
    failure: "New packaging: transparent, reflective or deformable items the demonstrations never covered.",
    measure: "Success with confidence intervals over enough trials to see a few-point drop (chapter 11), re-measured whenever the product range changes." },
  { title: "A humanoid tidying a home", robot: "A two-armed humanoid with head and wrist cameras.",
    task: "Put away groceries and tidy a living room, from spoken instructions, in homes it has not seen.",
    answers: "Short horizon: no. Occlusion and delayed effects (cupboards, stacked items): yes.",
    chosen: [{ f: "wam", text: "A world-action or latent-prediction model as the controller (chapters 6 and 7)." },
             { f: "reasoning", text: "An embodied reasoning model above it to plan and to judge each step (chapter 10)." }],
    failure: "A failed step judged done, so the robot moves on and the task silently fails (figure 10.2).",
    measure: "False successes per task, not only completion rate; and behaviour after a nudge or a dropped object." },
  { title: "A mobile inspection robot", robot: "A quadruped with a manipulator arm and a navigation stack.",
    task: "Walk an industrial facility, read gauges and sight glasses, and report anomalies.",
    answers: "Short horizon: no. Contact-rich: no. Robot action data: yes, through its own APIs. Edge only: no, the site has a network.",
    chosen: [{ f: "reasoning", text: "A reasoning model orchestrating the robot's navigation and arm APIs, and reading the instruments (chapter 10)." }],
    failure: "Misread instruments in poor light or at oblique angles, and stalls when the network drops.",
    measure: "Reading error against a human inspector's readings, and behaviour with the network cut." },
];

/** Figure 12.3: three scenarios walked through the decision flow. */
export function ScenarioCards() {
  return (
    <div className={css.grid}>
      {SCENARIOS.map((s) => (
        <article key={s.title} className={css.card}>
          <h4>{s.title}</h4>
          <p className={css.meta}>{s.robot}</p>
          <p><strong>Task.</strong> {s.task}</p>
          <p className={css.meta}>{s.answers}</p>
          <ul className={css.chosen}>
            {s.chosen.map((c) => (
              <li key={c.f} style={{ "--fam": `var(--fam-${c.f})` } as React.CSSProperties}>
                <span className={css.dot} aria-hidden="true" /><span><strong>{family(c.f).short}.</strong> {c.text}</span>
              </li>
            ))}
          </ul>
          <p><strong>First failure to expect.</strong> {s.failure}</p>
          <p><strong>What to measure.</strong> {s.measure}</p>
        </article>
      ))}
    </div>
  );
}
