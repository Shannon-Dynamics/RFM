"use client";
import { useState } from "react";
import { bearing, CAMS, consistency, type P } from "@/lib/sim/problems";
import styles from "./viz.module.css";

const OBJ: P = [2.5, 2];
const S = 90, OX = 250, OY = 220;
const sx = (x: number) => OX + x * S, sy = (y: number) => OY - y * S;
const NAMES = ["head camera A", "wrist camera B", "wrist camera C"];

/** Figure 17.3: three generated views of one future; checking whether they agree. */
export function ConsistencyViews() {
  const [off, setOff] = useState(4);
  const bs = [bearing(CAMS[0], OBJ), bearing(CAMS[1], OBJ) + (off * Math.PI) / 180, bearing(CAMS[2], OBJ)];
  const res = consistency(CAMS[0], bs[0], CAMS[1], bs[1], CAMS[2], bs[2])!;
  const missDeg = (res.miss * 180) / Math.PI;
  const ray = (c: P, b: number, len = 4.5) => `M ${sx(c[0])} ${sy(c[1])} L ${sx(c[0] + len * Math.cos(b))} ${sy(c[1] + len * Math.sin(b))}`;
  const flagged = missDeg > 1;
  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 400" role="img"
        aria-label={`Camera B's generated view is off by ${off} degrees. Cameras A and B place the object ${Math.hypot(res.p[0] - OBJ[0], res.p[1] - OBJ[1]).toFixed(2)} metres from where it is, and camera C's view misses that point by ${missDeg.toFixed(1)} degrees.`}>
        <clipPath id="cv-clip"><rect x="0" y="0" width="860" height="380" /></clipPath>
        <g clipPath="url(#cv-clip)">
          {[0, 1, 2].map((i) => <path key={i} d={ray(CAMS[i], bs[i])} stroke={i === 1 && off !== 0 ? "var(--fam-wam)" : "var(--ink-3)"} strokeWidth="2" strokeDasharray={i === 2 ? "6 4" : undefined} />)}
        </g>
        <circle cx={sx(OBJ[0])} cy={sy(OBJ[1])} r="10" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={sx(OBJ[0]) + 14} y={sy(OBJ[1]) - 10} fontSize="12" fill="var(--ink)">where the object will really be</text>
        <circle cx={sx(res.p[0])} cy={sy(res.p[1])} r="6" fill="var(--fam-wam)" />
        <text x={sx(res.p[0]) - 12} y={sy(res.p[1]) + 22} textAnchor="end" fontSize="12" fill="var(--ink-2)">where views A and B put it</text>
        {CAMS.map((c, i) => (
          <g key={i}>
            <rect x={sx(c[0]) - 14} y={sy(c[1]) - 10} width="28" height="20" rx="3" fill="var(--ink)" />
            <text x={sx(c[0])} y={sy(c[1]) + 28} textAnchor="middle" fontSize="12" fill="var(--ink-2)">{NAMES[i]}</text>
          </g>
        ))}
      </svg>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem} style={{ color: "var(--ink-3)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>bearing to the object in each generated view</span></span>
        <span className={styles.legendItem} style={{ color: "var(--fam-wam)" }}><span className={styles.swatchLine} /><span style={{ color: "var(--ink-2)" }}>camera B&rsquo;s view, generated with an error</span></span>
      </div>
      <div className={styles.split}>
        <label className={styles.slider}>
          <span className={styles.sliderHead}><span>Error in camera B&rsquo;s generated view</span><span className={styles.sliderValue}>{off}°</span></span>
          <input type="range" min={0} max={10} step={0.5} value={off} onChange={(e) => setOff(Number(e.target.value))} />
          <span className={styles.sliderNote}>Each frame can look perfectly plausible on its own; only comparing views exposes the error.</span>
        </label>
        <dl className={styles.readout}>
          <div><dt>Position error from views A and B</dt><dd>{(Math.hypot(res.p[0] - OBJ[0], res.p[1] - OBJ[1]) * 100).toFixed(0)} cm</dd></div>
          <div><dt>Camera C disagrees by</dt><dd>{missDeg.toFixed(1)}°<small>{flagged ? "a check with a 1° tolerance would flag this future" : "within a 1° tolerance"}</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
