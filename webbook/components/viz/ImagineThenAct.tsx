"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as P from "@/lib/sim/puck";
import styles from "./viz.module.css";

type Mode = "reactive" | "imagine" | "distilled";

const MODES: { id: Mode; label: string; family: "reactive" | "wam" }[] = [
  { id: "reactive", label: "Reactive VLA", family: "reactive" },
  { id: "imagine", label: "Imagine, then act", family: "wam" },
  { id: "distilled", label: "Trained with imagination, acts without", family: "wam" },
];

const OUTCOME_TEXT: Record<P.Outcome, string> = {
  running: "Running",
  reached: "Reached the goal",
  collided: "Hit the obstacle",
  fell: "Slid off the table",
  timeout: "Ran out of time",
};

const MAX_STEPS = 300;
const STEPS_PER_SECOND = 12;

interface Params { samples: number; horizon: number; execute: number; dampingError: number; seed: number }

function Slider(props: { label: string; value: number; min: number; max: number; step: number; format?: (v: number) => string;
  note?: string; disabled?: boolean; onChange: (v: number) => void }) {
  const { label, value, min, max, step, format = String, note, disabled, onChange } = props;
  return (
    <label className={styles.slider} data-disabled={disabled}>
      <span className={styles.sliderHead}><span>{label}</span><span className={styles.sliderValue}>{format(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))} />
      {note && <span className={styles.sliderNote}>{note}</span>}
    </label>
  );
}

/** Figure 6.3: a reactive policy against imagine-then-act and a policy distilled from imagination. */
export function ImagineThenAct() {
  const [mode, setMode] = useState<Mode>("imagine");
  const [params, setParams] = useState<Params>({ samples: 48, horizon: 30, execute: 5, dampingError: 0, seed: 7 });
  const [playing, setPlaying] = useState(false);
  const [, setTick] = useState(0);
  const sim = useRef<{ world: P.World; s: P.State; path: P.State[]; ctrl: P.Controller; outcome: P.Outcome; steps: number; memory?: number } | null>(null);

  // The distilled student is trained once, from six imagined episodes of a perfect-model teacher.
  const student = useMemo(() => (mode === "distilled" ? P.distill(P.defaultPlanner, P.trainingStarts()) : null), [mode]);

  const reset = useCallback(() => {
    const world = P.defaultWorld();
    let ctrl: P.Controller;
    if (mode === "reactive") ctrl = P.reactive();
    else if (mode === "imagine") ctrl = P.shootingPlanner({ ...P.defaultPlanner, ...params }, params.seed);
    else ctrl = { ...student!, modelCalls: 0 };
    sim.current = { world, s: world.start, path: [world.start], ctrl, outcome: "running", steps: 0, memory: student?.memorySize };
    setTick((t) => t + 1);
  }, [mode, params, student]);

  // ?autorun (optionally =reactive|imagine|distilled) starts the simulation on load, for demos and screenshots.
  const pending = useRef<Mode | null>(null);
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("autorun");
    if (want === null) return;
    const m = MODES.some((x) => x.id === want) ? (want as Mode) : "imagine";
    pending.current = m;
    setMode(m);
  }, []);

  useEffect(() => {
    reset();
    const auto = pending.current !== null && pending.current === mode;
    if (auto) pending.current = null;
    setPlaying(auto);
  }, [reset, mode]);

  const step = useCallback(() => {
    const m = sim.current;
    if (!m || m.outcome !== "running") return false;
    const a = m.ctrl.control(m.world, m.s);
    m.s = P.realStep(m.s, a);
    m.path.push(m.s);
    m.steps += 1;
    const st = P.status(m.world, m.s);
    m.outcome = st !== "running" ? st : m.steps >= MAX_STEPS ? "timeout" : "running";
    setTick((t) => t + 1);
    return m.outcome === "running";
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      acc += (now - last) / 1000;
      last = now;
      while (acc > 1 / STEPS_PER_SECOND) {
        acc -= 1 / STEPS_PER_SECOND;
        if (!step()) { setPlaying(false); return; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, step]);

  const m = sim.current;
  const fam = MODES.find((x) => x.id === mode)!.family;
  const set = (k: keyof Params) => (v: number) => setParams((p) => ({ ...p, [k]: v }));
  const imagined = mode === "imagine" ? m?.ctrl.imagined ?? [] : [];
  const choice = m?.ctrl.choice ?? 0;
  const pts = (states: P.State[]) => states.map((s) => `${s.x.toFixed(3)},${s.y.toFixed(3)}`).join(" ");
  const [ox, oy, or] = m?.world.obstacle ?? [5, 3, 1];
  const [gx, gy] = m?.world.goal ?? [8.8, 3];
  const perStep = m && m.steps > 0 ? Math.round(m.ctrl.modelCalls / m.steps) : 0;

  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Controller">
        {MODES.map((x) => (
          <button key={x.id} aria-pressed={mode === x.id} onClick={() => setMode(x.id)}>{x.label}</button>
        ))}
      </div>

      <div className={styles.split}>
        <svg className={styles.svg} viewBox="-0.7 -0.7 11.4 7.4" role="img"
          aria-label={`Top view of the table. The puck starts on the left, the goal is near the right edge, and an obstacle sits between them. Current outcome: ${m ? OUTCOME_TEXT[m.outcome] : "not started"}.`}>
          <defs>
            <pattern id="edge-hatch" width="0.25" height="0.25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="0.25" stroke="var(--rule-strong)" strokeWidth="0.06" />
            </pattern>
          </defs>
          <rect x="-0.7" y="-0.7" width="11.4" height="7.4" fill="url(#edge-hatch)" />
          <rect x="0" y="0" width={P.TABLE_W} height={P.TABLE_H} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="0.04" />
          <text x={P.TABLE_W - 0.15} y="0.4" textAnchor="end" fontSize="0.28" fill="var(--ink-3)">table edge: sliding past it is a failure</text>
          <circle cx={ox} cy={oy} r={or} fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth="0.04" />
          <text x={ox} y={oy + 0.1} textAnchor="middle" fontSize="0.3" fill="var(--ink-2)">obstacle</text>
          <circle cx={gx} cy={gy} r={0.4} fill="none" stroke="var(--ink)" strokeWidth="0.05" strokeDasharray="0.12 0.08" />
          <text x={gx} y={gy + 0.75} textAnchor="middle" fontSize="0.3" fill="var(--ink-2)">goal</text>
          {imagined.map((f, i) => i !== choice && (
            <polyline key={i} points={pts(f)} fill="none" stroke={`var(--fam-${fam})`} strokeOpacity="0.22" strokeWidth="0.03" />
          ))}
          {imagined[choice] && (
            <polyline points={pts(imagined[choice])} fill="none" stroke={`var(--fam-${fam})`} strokeWidth="0.06" strokeDasharray="0.15 0.1" />
          )}
          {m && <polyline points={pts(m.path)} fill="none" stroke="var(--ink)" strokeWidth="0.05" strokeLinejoin="round" />}
          {m && <circle cx={m.s.x} cy={m.s.y} r="0.2" fill={`var(--fam-${fam})`} stroke="var(--surface)" strokeWidth="0.05" />}
        </svg>

        <dl className={styles.readout} aria-live="polite">
          <div><dt>Outcome</dt><dd className={styles.outcome} data-outcome={m?.outcome}>{m ? OUTCOME_TEXT[m.outcome] : ""}</dd></div>
          <div><dt>Control steps</dt><dd>{m?.steps ?? 0}<small>{((m?.steps ?? 0) * P.DT).toFixed(1)} s of robot time</small></dd></div>
          <div><dt>Imagined steps so far</dt><dd>{(m?.ctrl.modelCalls ?? 0).toLocaleString("en-GB")}<small>{perStep.toLocaleString("en-GB")} per control step</small></dd></div>
          {mode === "distilled" && <div><dt>Training memory</dt><dd>{m?.memory}<small>state-action pairs from 6 imagined episodes</small></dd></div>}
        </dl>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink)" }}><span className={styles.swatchLine} />real path</span>
        {mode === "imagine" && <>
          <span className={styles.legendItem} style={{ color: `var(--fam-${fam})` }}><span className={styles.swatchDash} />chosen imagined future</span>
          <span className={styles.legendItem} style={{ color: `var(--fam-${fam})`, opacity: 0.6 }}><span className={styles.swatchLine} />other imagined futures</span>
        </>}
        <span className={styles.legendItem} style={{ color: `var(--fam-${fam})` }}><span className={styles.swatchDot} />puck, coloured by the family driving it</span>
      </div>

      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={() => {
          if (m && m.outcome !== "running") reset();
          setPlaying((p) => !p);
        }}>{playing ? "Pause" : m && m.outcome !== "running" ? "Run again" : "Run"}</button>
        <button className={styles.button} onClick={() => { setPlaying(false); step(); }} disabled={!m || m.outcome !== "running"}>Step once</button>
        <button className={styles.button} onClick={() => { setPlaying(false); reset(); }}>Reset</button>
        <button className={styles.button} disabled={mode !== "imagine"} onClick={() => setParams((p) => ({ ...p, seed: (p.seed % 97) + 1 }))}>
          New random seed ({params.seed})
        </button>
      </div>

      <div className={styles.sliders}>
        <Slider label="Futures imagined per replan" value={params.samples} min={8} max={64} step={4} disabled={mode !== "imagine"}
          onChange={set("samples")} />
        <Slider label="Imagination horizon" value={params.horizon} min={5} max={40} step={5} format={(v) => `${v} steps`}
          disabled={mode !== "imagine"} onChange={set("horizon")} />
        <Slider label="Steps before replanning" value={params.execute} min={1} max={30} step={1}
          disabled={mode !== "imagine"} onChange={set("execute")} note="Long chunks trust imagination for longer." />
        <Slider label="Model friction error" value={params.dampingError} min={-0.1} max={0.03} step={0.01}
          format={(v) => (v === 0 ? "none" : v.toFixed(2))} disabled={mode !== "imagine"} onChange={set("dampingError")}
          note="Negative: the model imagines more friction than there is." />
      </div>
    </div>
  );
}
