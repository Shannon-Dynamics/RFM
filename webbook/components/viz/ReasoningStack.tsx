"use client";
import { useEffect, useState } from "react";
import styles from "./viz.module.css";

const SUBGOALS = ["pick up the apple", "place it in the bowl", "pick up the banana", "place it in the bowl"];
const LEVELS = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"];
const PHASE = 12; // ticks per subgoal: 0-2 message down, 3-9 progress, 10-11 judged done

const MODES = [
  { id: "separate", label: "Reasoner over controllers",
    text: "A separate reasoning model plans, sends one subgoal at a time to a controller it calls as a tool, watches the video stream, and decides when to move on. Gemini Robotics ER 2 (July 2026) works this way, calling VLAs, navigation APIs or search through the Live API.",
    crosses: "down: a subgoal in words; up: video, from which the reasoner judges progress" },
  { id: "inside", label: "Reasoning inside the VLA",
    text: "The reasoning model is the VLA's backbone, trained for physical reasoning and then fine-tuned with an action head. GR00T N1.7 uses Cosmos-Reason2-2B this way; π0.5 predicts a semantic subtask before its actions inside one model.",
    crosses: "features inside one network; no messages a person could read" },
  { id: "interleaved", label: "Think, then act",
    text: "One model alternates between reasoning in language and producing actions. Gemini Robotics 1.5 interleaves actions with a multi-level internal reasoning process; MolmoAct2 is built as an action reasoning model.",
    crosses: "a written chain of thought, then an action chunk, in one output stream" },
] as const;

/** Figure 10.1: where the reasoning sits, and what crosses between it and the motors. */
export function ReasoningStack() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("separate");
  const [t, setT] = useState(PHASE * 2 + 5);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setT((x) => (x + 1) % (PHASE * SUBGOALS.length)), 380);
    return () => window.clearInterval(id);
  }, []);
  const m = MODES.find((x) => x.id === mode)!;
  const g = Math.floor(t / PHASE), ph = t % PHASE;
  const level = ph < 3 ? -1 : Math.min(4, Math.floor((ph - 3) / 1.4));
  const judged = ph >= 10;
  const packetY = 80 + (Math.min(ph, 2) / 2) * 52;

  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Where the reasoning sits">
        {MODES.map((x) => <button key={x.id} aria-pressed={mode === x.id} onClick={() => setMode(x.id)}>{x.label}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 300" role="img" aria-label={`${m.label}. ${m.crosses}.`}>
        <defs>
          <marker id="rs-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <text x="0" y="16" fontSize="12" fontWeight="600" fill="var(--ink)">Task: put the fruit in the bowl</text>
        {SUBGOALS.map((s, i) => (
          <text key={i} x="0" y={40 + i * 20} fontSize="12" fill={i === g ? "var(--ink)" : i < g ? "var(--ink-3)" : "var(--ink-2)"} fontWeight={i === g ? 700 : 400}>
            {i < g ? "✓" : i === g ? "›" : " "} {i + 1}. {s}
          </text>
        ))}
        <rect x="0" y="236" width="860" height="44" rx="6" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="430" y="263" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)">robot: motors and cameras</text>

        {mode === "separate" && (
          <g>
            <rect x="250" y="16" width="380" height="62" rx="10" fill="var(--surface)" stroke="var(--fam-reasoning)" strokeWidth="3" />
            <text x="440" y="42" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">embodied reasoning model</text>
            <text x="440" y="62" textAnchor="middle" fontSize="12" fill="var(--ink-2)">plans, calls tools, judges progress</text>
            {[["VLA", 200], ["navigation API", 400], ["search, user functions", 600]].map(([l, x], i) => (
              <g key={l as string}>
                <rect x={(x as number) - 90} y={134} width={180} height={50} rx="8" fill={i === 0 ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
                <text x={x as number} y={164} textAnchor="middle" fontSize="13" fontWeight="600" fill={i === 0 ? "var(--surface)" : "var(--ink)"}>{l}</text>
              </g>
            ))}
            <path d="M 300 80 L 220 132" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
            <path d="M 440 80 L 410 132" stroke="var(--rule-strong)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
            <path d="M 560 80 L 590 132" stroke="var(--rule-strong)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
            <path d="M 200 186 L 200 234" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
            <text x="208" y="214" fontSize="11" fill="var(--ink-3)">action chunks</text>
            <path d="M 836 234 L 836 50 L 634 50" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#rs-head)" />
            <text x="830" y="200" textAnchor="end" fontSize="11" fill="var(--ink-3)">video</text>
            {ph < 3 && (
              <g transform={`translate(${300 - (packetY - 80) * 1.55},${packetY})`}>
                <rect x={-4} y={-11} width={Math.max(120, SUBGOALS[g].length * 6.6)} height={20} rx="10" fill="var(--fam-reasoning)" />
                <text x={6} y={3} fontSize="11.5" fontWeight="600" fill="var(--surface)">&ldquo;{SUBGOALS[g]}&rdquo;</text>
              </g>
            )}
            <text x="648" y="96" fontSize="11" fill="var(--ink-2)">progress, judged from video</text>
            {LEVELS.map((l, i) => (
              <rect key={l} x={648 + i * 24} y={104} width={20} height={12} rx="2"
                fill={i <= level ? "var(--fam-reasoning)" : "none"} stroke="var(--fam-reasoning)" />
            ))}
            <text x="772" y="114" fontSize="11" fontWeight={judged ? 700 : 400} fill="var(--ink)">{judged ? "done: next" : level >= 0 ? LEVELS[level] : ""}</text>
          </g>
        )}
        {mode === "inside" && (
          <g>
            <rect x="200" y="20" width="460" height="164" rx="12" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="430" y="42" textAnchor="middle" fontSize="13" fill="var(--ink-2)">one VLA, for example GR00T N1.7</text>
            <rect x="230" y="54" width="400" height="56" rx="8" fill="var(--surface)" stroke="var(--fam-reasoning)" strokeWidth="3" />
            <text x="430" y="78" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">reasoning backbone</text>
            <text x="430" y="97" textAnchor="middle" fontSize="12" fill="var(--ink-2)">Cosmos-Reason2-2B, trained for physical reasoning</text>
            <rect x="230" y="122" width="400" height="48" rx="8" fill="var(--ink)" />
            <text x="430" y="151" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--surface)">action head</text>
            <path d="M 430 110 L 430 120" stroke="var(--ink-2)" strokeWidth="1.5" />
            <circle cx="430" cy={112 + (t % 4) * 2} r="3" fill="var(--fam-reasoning)" />
            <path d="M 430 186 L 430 234" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
            <path d="M 700 234 L 700 82 L 634 82" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#rs-head)" />
            <text x="706" y="160" fontSize="11" fill="var(--ink-3)">images</text>
          </g>
        )}
        {mode === "interleaved" && (
          <g>
            <rect x="200" y="20" width="460" height="164" rx="12" fill="var(--surface)" stroke="var(--fam-reasoning)" strokeWidth="3" />
            <text x="430" y="42" textAnchor="middle" fontSize="13" fill="var(--ink-2)">one model, for example Gemini Robotics 1.5</text>
            <text x="222" y="72" fontSize="12.5" fill="var(--ink)" fontStyle="italic">
              {ph < 6 ? `Thought: next, ${SUBGOALS[g]}.` : "Thought: the gripper is closed on it; continue."}
            </text>
            <text x="222" y="96" fontSize="12.5" fill="var(--ink)" fontStyle="italic">
              {ph < 6 ? "It is to the left of the bowl, reach left first." : "Move above the bowl, then open."}
            </text>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={222 + i * 34} y={120} width={30} height={34} rx="3" fill={i <= (t % PHASE) ? "var(--ink-2)" : "none"} stroke="var(--ink-3)" />
            ))}
            <text x="222" y="172" fontSize="11" fill="var(--ink-3)">action chunk</text>
            <path d="M 430 186 L 430 234" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rs-head)" />
          </g>
        )}
      </svg>
      <div className={styles.card} aria-live="polite">
        <p>{m.text}</p>
        <p className={styles.cardMeta}>What crosses: {m.crosses}.</p>
      </div>
    </div>
  );
}
