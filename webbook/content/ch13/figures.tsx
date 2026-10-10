import css from "./hours.module.css";

const CARDS = [
  { title: "Teleoperation", example: "DROID: 350 hours, 76,000 trajectories",
    rows: [["Episodes in one hour", "about 217, of about 17 seconds each"], ["Actions a robot can execute", "yes, for this robot (a Franka arm)"],
      ["Also recorded", "three RGB cameras, depth, calibration, language"], ["What an hour costs", "about $118 to collect in 2026 (industry survey)"]],
    source: "Khazatsky et al. 2024; SVRC, State of Robotics 2026" },
  { title: "Egocentric human video with hand tracking", example: "EgoDex: 829 hours, 338,000 demonstrations",
    rows: [["Episodes in one hour", "about 408, of about 9 seconds each"], ["Actions a robot can execute", "no: 3D hand and finger poses, which must be mapped to a robot"],
      ["Also recorded", "108,000 frames at 30 FPS, language, camera poses"], ["What an hour costs", "a person wearing a headset; no robot needed"]],
    source: "Hoque et al. 2025" },
  { title: "Generated trajectories", example: "NVIDIA's blueprint: 780,000 trajectories, called 6,500 hours",
    rows: [["Episodes in one hour", "about 120, of about 30 seconds each"], ["Actions a robot can execute", "yes, for the robot the model was adapted to, if the generation is faithful (chapter 8)"],
      ["Also recorded", "whatever the generator renders"], ["What an hour costs", "about 6 seconds of generation at NVIDIA's reported rate"]],
    source: "NVIDIA press release, 18 March 2025 (vendor claim)" },
  { title: "Internet video", example: "Cosmos: about 20 million raw hours, 100 million curated clips",
    rows: [["Episodes in one hour", "about 5 clips survive curation"], ["Actions a robot can execute", "none"],
      ["Also recorded", "whatever was filmed, for whatever reason"], ["What an hour costs", "storage and filtering compute"]],
    source: "NVIDIA 2025, arXiv 2501.03575" },
];

/** Figure 13.4: what one hour of each kind of data actually contains. */
export function HourCards() {
  return (
    <div className={css.grid}>
      {CARDS.map((c) => (
        <article key={c.title} className={css.card}>
          <h4>{c.title}</h4>
          <p className={css.example}>{c.example}</p>
          <dl>
            {c.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className={css.source}>{c.source}</p>
        </article>
      ))}
    </div>
  );
}
