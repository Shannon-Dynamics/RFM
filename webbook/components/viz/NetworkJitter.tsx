"use client";
import { useMemo, useState } from "react";
import { inTheCloud, latencyMs, networkSamples, onDevice } from "@/lib/sim/deploy";
import styles from "./viz.module.css";

type Place = "device" | "split" | "cloud";
const N = 200;
const PLACES: Record<Place, { label: string; note: string }> = {
  device: { label: "All on the robot", note: "Every cycle takes the same time; nothing depends on a network. Gemini Robotics On-Device and GR00T on Jetson Thor take this route." },
  split: { label: "Reasoning in the cloud, control on the robot", note: "The controller never misses its deadline; only plan updates arrive late when the network stalls. Gemini Robotics' cloud backbone with an on-robot decoder is this split." },
  cloud: { label: "All in the cloud", note: "Fastest compute, but every cycle waits for the network, and a stall becomes a missed deadline." },
};

/** Figure 15.2: compute placement, and what a shared network does to each option. */
export function NetworkJitter() {
  const [place, setPlace] = useState<Place>("split");
  const [deadline, setDeadline] = useState(150);
  const net = useMemo(() => networkSamples(40, N), []);
  const dev = latencyMs(onDevice()), cloudCompute = latencyMs(inTheCloud(0));
  const control = net.map((r) => (place === "cloud" ? cloudCompute + r : dev));
  const plan = net.map((r) => cloudCompute + 400 + r * 2);
  const hit = control.filter((c) => c <= deadline).length / N;
  const cw = 840 / N;
  return (
    <div className={styles.stack}>
      <div className={styles.segmented} role="group" aria-label="Compute placement">
        {(Object.keys(PLACES) as Place[]).map((p) => <button key={p} aria-pressed={place === p} onClick={() => setPlace(p)}>{PLACES[p].label}</button>)}
      </div>
      <svg className={styles.svg} viewBox="0 0 860 120" role="img"
        aria-label={`${PLACES[place].label}: ${Math.round(hit * 100)} percent of ${N} control cycles meet a ${deadline} millisecond deadline.`}>
        <text x="0" y="14" fontSize="12.5" fontWeight="600" fill="var(--ink)">Control cycles: on time or late, {N} in a row</text>
        {control.map((c, i) => (
          <rect key={i} x={10 + i * cw} y={22} width={cw - 1} height={30} fill={c <= deadline ? "var(--ink-2)" : "var(--fam-reactive)"} />
        ))}
        {place === "split" && (
          <g>
            <text x="0" y="78" fontSize="12.5" fontWeight="600" fill="var(--ink)">Plan updates from the cloud reasoner, about once a second</text>
            {plan.filter((_, i) => i % 10 === 0).map((p, k) => (
              <rect key={k} x={10 + k * 10 * cw} y={86} width={10 * cw - 2} height={14} fill={p <= 600 ? "var(--surface-2)" : "var(--fam-reactive)"} stroke="var(--rule-strong)" />
            ))}
          </g>
        )}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}><span style={{ width: 12, height: 12, background: "var(--ink-2)" }} />on time</span>
        <span className={styles.legendItem}><span style={{ width: 12, height: 12, background: "var(--fam-reactive)" }} />late, after a network stall</span>
      </div>
      <div className={styles.split}>
        <div className={styles.stack}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Control deadline</span><span className={styles.sliderValue}>{deadline} ms</span></span>
            <input type="range" min={100} max={400} step={10} value={deadline} onChange={(e) => setDeadline(Number(e.target.value))} />
          </label>
          <p className={styles.note}>{PLACES[place].note}</p>
        </div>
        <dl className={styles.readout}>
          <div><dt>Control cycles on time</dt><dd>{Math.round(hit * 100)}%</dd></div>
          <div><dt>Depends on the network for</dt><dd style={{ fontSize: "1rem", fontWeight: 500 }}>{place === "device" ? "nothing" : place === "split" ? "plans, not motion" : "every motion"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
