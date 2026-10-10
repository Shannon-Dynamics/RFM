"use client";
import { useEffect, useMemo, useState } from "react";
import { blind, rng, runStep, stepOutcomes, taskOutcomes, type Judge, type StepEnd } from "@/lib/sim/reasoning";
import styles from "./viz.module.css";

type Node = "act" | "observe" | "judge" | "retry" | "next" | "help";
interface Ev { node: Node; step: number; ends: StepEnd[] }

const NODES: Record<Exclude<Node, "retry">, { x: number; y: number; title: string; sub: string }> = {
  act: { x: 30, y: 74, title: "Act", sub: "controller tries the step" },
  observe: { x: 250, y: 74, title: "Observe", sub: "cameras over time" },
  judge: { x: 470, y: 74, title: "Judge", sub: "reasoning model: done?" },
  next: { x: 700, y: 14, title: "Next step", sub: "judged done" },
  help: { x: 700, y: 134, title: "Ask for help", sub: "out of attempts" },
};
const W = 150, H = 54;
const centre = (n: Node) => n === "retry" ? [260, 176] : [NODES[n].x + W / 2, NODES[n].y + H / 2];

function trace(j: Judge, steps: number, seed: number): Ev[] {
  const rand = rng(seed);
  const ev: Ev[] = [];
  const ends: StepEnd[] = [];
  for (let s = 0; s < steps; s++) {
    const { end, log } = runStep(j, rand);
    log.forEach((a, k) => {
      ev.push({ node: "act", step: s, ends: [...ends] }, { node: "observe", step: s, ends: [...ends] }, { node: "judge", step: s, ends: [...ends] });
      if (!a.judgedDone && k < log.length - 1) ev.push({ node: "retry", step: s, ends: [...ends] });
    });
    ends.push(end);
    ev.push({ node: end === "help" ? "help" : "next", step: s, ends: [...ends] });
    if (end === "help") break;
  }
  return ev;
}

function Bar({ y, label, o }: { y: number; label: string; o: { done: number; silent: number; help: number } }) {
  const X0 = 170, BW = 640;
  const segs = [
    { v: o.done, fill: "var(--ink-2)", text: "completed" },
    { v: o.silent, fill: "var(--fam-reasoning)", text: "failed without knowing" },
    { v: o.help, fill: "var(--surface-2)", text: "asked for help" },
  ];
  let x = X0;
  return (
    <g>
      <text x={X0 - 10} y={y + 17} textAnchor="end" fontSize="13" fill="var(--ink)">{label}</text>
      {segs.map((s) => {
        const w = s.v * BW, x0 = x;
        x += w;
        return (
          <g key={s.text}>
            <rect x={x0} y={y} width={Math.max(0, w)} height={26} fill={s.fill} stroke={s.fill === "var(--surface-2)" ? "var(--rule-strong)" : "none"} />
            {w > 44 && <text x={x0 + 6} y={y + 17} fontSize="12" fontWeight="600" fill={s.fill === "var(--surface-2)" ? "var(--ink)" : "var(--surface)"}>{Math.round(s.v * 100)}%</text>}
          </g>
        );
      })}
    </g>
  );
}

/** Figure 10.2: the success-detection loop, and what an imperfect judge does to a long task. */
export function SuccessLoop() {
  const [p, setP] = useState(0.7);
  const [fd, setFd] = useState(0.05);
  const [fr, setFr] = useState(0.1);
  const [att, setAtt] = useState(3);
  const [steps, setSteps] = useState(10);
  const [seed, setSeed] = useState(3);
  const [k, setK] = useState(Infinity);

  const j: Judge = { pSuccess: p, falseDone: fd, falseRetry: fr, maxAttempts: att };
  const ev = useMemo(() => trace(j, steps, seed), [p, fd, fr, att, steps, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = ev[Math.min(k, ev.length - 1)];
  const playing = k < ev.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setK((x) => x + 1), 260);
    return () => window.clearTimeout(id);
  }, [k, playing]);

  const run = () => {
    setSeed((s) => s + 1);
    setK(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Infinity : 0);
  };
  const one = stepOutcomes(j), task = taskOutcomes(j, steps), none = taskOutcomes(blind(p), steps);
  const [tx, ty] = centre(cur.node);
  const cellW = Math.min(36, 640 / steps);

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} data-primary="true" onClick={run}>Run a task</button>
        <span className={styles.note}>One sampled run of {steps} steps; the bars below are exact probabilities.</span>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 262" role="img"
        aria-label={`State machine: act, observe, judge, then next step, retry, or ask for help. Current run: ${cur.ends.filter((e) => e === "done").length} steps done, ${cur.ends.filter((e) => e === "silent").length} silent failures${cur.ends.includes("help") ? ", stopped to ask for help" : ""}.`}>
        <defs>
          <marker id="sl10-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <path d="M 180 101 L 248 101" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sl10-head)" />
        <path d="M 400 101 L 468 101" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sl10-head)" />
        <path d="M 620 92 C 660 92, 660 41, 698 41" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sl10-head)" />
        <path d="M 620 110 C 660 110, 660 161, 698 161" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#sl10-head)" />
        <path d="M 545 128 C 545 186, 105 186, 105 130" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#sl10-head)" />
        <text x="325" y="200" textAnchor="middle" fontSize="12" fill="var(--ink-2)">judged not done, attempts left: retry</text>
        {(Object.keys(NODES) as (keyof typeof NODES)[]).map((n) => {
          const nd = NODES[n], on = cur.node === n;
          return (
            <g key={n}>
              <rect x={nd.x} y={nd.y} width={W} height={H} rx="8" fill={on ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink-2)" />
              <text x={nd.x + W / 2} y={nd.y + 23} textAnchor="middle" fontSize="15" fontWeight="600" fill={on ? "var(--surface)" : "var(--ink)"}>{nd.title}</text>
              <text x={nd.x + W / 2} y={nd.y + 41} textAnchor="middle" fontSize="11.5" fill={on ? "var(--surface)" : "var(--ink-2)"}>{nd.sub}</text>
            </g>
          );
        })}
        <circle cx={tx} cy={cur.node === "retry" ? ty : ty - 34} r="7" fill="var(--fam-reasoning)" stroke="var(--surface)" strokeWidth="2"
          style={{ transition: "cx 200ms, cy 200ms" }} />
        <text x="0" y="232" fontSize="12" fill="var(--ink-2)">steps</text>
        {Array.from({ length: steps }, (_, s) => {
          const e = cur.ends[s], x = 44 + s * cellW;
          const fill = e === "done" ? "var(--ink-2)" : e === "silent" ? "var(--fam-reasoning)" : "none";
          return (
            <g key={s}>
              <rect x={x} y={218} width={cellW - 4} height={24} rx="3" fill={fill}
                stroke={e ? (e === "help" ? "var(--ink)" : "none") : "var(--rule-strong)"} strokeWidth={e === "help" ? 2 : 1}
                strokeDasharray={e ? undefined : "3 2"} />
              {e === "help" && <text x={x + (cellW - 4) / 2} y={235} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">?</text>}
              {s === cur.step && playing && <rect x={x - 2} y={216} width={cellW} height={28} rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />}
            </g>
          );
        })}
      </svg>

      <svg className={styles.svg} viewBox="0 0 860 92" role="img"
        aria-label={`A ${steps}-step task. Without a judge: completed ${Math.round(none.done * 100)} percent, failed without knowing ${Math.round(none.silent * 100)} percent. With this judge: completed ${Math.round(task.done * 100)} percent, failed without knowing ${Math.round(task.silent * 100)} percent, asked for help ${Math.round(task.help * 100)} percent.`}>
        <Bar y={4} label="no judge, one try" o={none} />
        <Bar y={40} label="this judge" o={task} />
        <text x="170" y="86" fontSize="12" fill="var(--ink-3)">exact probabilities for the whole {steps}-step task</text>
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span style={{ width: 14, height: 12, background: "var(--ink-2)" }} />completed</span>
        <span className={styles.legendItem}><span style={{ width: 14, height: 12, background: "var(--fam-reasoning)" }} />failed without knowing</span>
        <span className={styles.legendItem}><span style={{ width: 14, height: 12, background: "var(--surface-2)", border: "1px solid var(--rule-strong)" }} />stopped and asked for help</span>
      </div>

      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Controller success per attempt</span><span className={styles.sliderValue}>{Math.round(p * 100)}%</span></span>
            <input type="range" min={0.3} max={0.95} step={0.05} value={p} onChange={(e) => setP(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Judge says done when it is not</span><span className={styles.sliderValue}>{Math.round(fd * 100)}%</span></span>
            <input type="range" min={0} max={0.5} step={0.05} value={fd} onChange={(e) => setFd(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Judge says not done when it is</span><span className={styles.sliderValue}>{Math.round(fr * 100)}%</span></span>
            <input type="range" min={0} max={0.5} step={0.05} value={fr} onChange={(e) => setFr(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Attempts allowed per step</span><span className={styles.sliderValue}>{att}</span></span>
            <input type="range" min={1} max={5} step={1} value={att} onChange={(e) => setAtt(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Steps in the task</span><span className={styles.sliderValue}>{steps}</span></span>
            <input type="range" min={1} max={20} step={1} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>One step: completed</dt><dd>{(one.done * 100).toFixed(1)}%</dd></div>
          <div><dt>One step: failed without knowing</dt><dd>{(one.silent * 100).toFixed(1)}%</dd></div>
          <div><dt>Attempts per step, on average</dt><dd>{one.attempts.toFixed(2)}<small>what checking costs in time</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
