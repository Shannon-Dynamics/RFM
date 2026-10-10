"use client";
import { useState } from "react";
import styles from "./viz.module.css";

const PEG = 6; // peg width, mm
const S = 34; // drawing scale, SVG units per mm

/** Figure 9.2: the camera and the contact disagree below a pixel. */
export function WhatRgbMisses() {
  const [offset, setOffset] = useState(1.2);
  const [px, setPx] = useState(2);
  const [clear, setClear] = useState(1);

  const edgePixel = Math.floor(offset / px);
  const seen = edgePixel * px; // the offset the camera can report (lower edge of its pixel)
  const jams = Math.abs(offset) > clear / 2;
  const overlap = Math.max(0, Math.abs(offset) - clear / 2);
  const hole = PEG + clear;

  // Both panels: x in mm from -6 to +6 around the hole centre.
  const panel = (x0: number, title: string, body: React.ReactNode) => (
    <g transform={`translate(${x0},0)`}>
      <text x={0} y={16} fontSize="13" fontWeight="600" fill="var(--ink)">{title}</text>
      {body}
    </g>
  );
  const mx = (mm: number) => 204 + mm * S;
  const holeTop = 206;

  const camera = (() => {
    const cells = [];
    const n = Math.ceil(12 / px);
    for (let i = 0; i < n; i++) for (let j = 0; j < Math.ceil(5 / px); j++) {
      const x = -6 + i * px, y = j * px; // y in mm above the hole top, downward from 5
      const cx = x + px / 2, cyMm = 5 - (y + px / 2);
      const pegHere = cx > -PEG / 2 + seen && cx < PEG / 2 + seen && cyMm > (jams ? 0 : -1);
      const blockHere = cyMm < 0 && (cx < -hole / 2 || cx > hole / 2);
      cells.push(<rect key={`${i},${j}`} x={mx(x)} y={holeTop - 5 * S + y * S} width={px * S - 1} height={px * S - 1}
        fill={pegHere ? "var(--ink-2)" : blockHere ? "var(--ink-3)" : "var(--surface-2)"} />);
    }
    return <g>
      {cells}
      <rect x={mx(-6)} y={holeTop} width={(6 - hole / 2) * S} height={60} fill="var(--ink-3)" />
      <rect x={mx(hole / 2)} y={holeTop} width={(6 - hole / 2) * S} height={60} fill="var(--ink-3)" />
      <text x={mx(-6)} y={holeTop + 80} fontSize="12" fill="var(--ink-2)">each square is one camera pixel: {px} mm</text>
    </g>;
  })();

  const contact = (() => {
    const pegX = mx(-PEG / 2 + offset), pegBottom = jams ? holeTop : holeTop + 40;
    const rimX = offset > 0 ? mx(hole / 2) : mx(-hole / 2);
    return <g>
      <rect x={mx(-6)} y={holeTop} width={(6 - hole / 2) * S} height={60} fill="var(--ink-3)" />
      <rect x={mx(hole / 2)} y={holeTop} width={(6 - hole / 2) * S} height={60} fill="var(--ink-3)" />
      <rect x={pegX} y={pegBottom - 150} width={PEG * S} height={150} fill="var(--ink-2)" />
      <line x1={mx(0)} x2={mx(0)} y1={holeTop - 160} y2={holeTop + 60} stroke="var(--ink)" strokeDasharray="3 3" />
      <line x1={mx(offset)} x2={mx(offset)} y1={holeTop - 160} y2={holeTop - 130} stroke="var(--surface)" strokeWidth="2" />
      {jams && (
        <g>
          <circle cx={rimX} cy={holeTop} r="7" fill="var(--fam-geometry)" />
          <line x1={rimX} y1={holeTop} x2={rimX} y2={holeTop - 46} stroke="var(--fam-geometry)" strokeWidth="4" />
          <path d={`M ${rimX - 7} ${holeTop - 40} L ${rimX} ${holeTop - 52} L ${rimX + 7} ${holeTop - 40} z`} fill="var(--fam-geometry)" />
          <text x={rimX + (offset > 0 ? 12 : -12)} y={holeTop - 32} textAnchor={offset > 0 ? "start" : "end"} fontSize="12" fontWeight="600" fill="var(--ink)" style={{ paintOrder: "stroke" }} stroke="var(--surface)" strokeWidth="4">
            <tspan x={rimX + (offset > 0 ? 12 : -12)}>contact:</tspan>
            <tspan x={rimX + (offset > 0 ? 12 : -12)} dy="15">jammed</tspan>
          </text>
        </g>
      )}
      <text x={mx(-6)} y={holeTop + 80} fontSize="12" fill="var(--ink-2)">{jams ? `peg rests on the rim, overlapping it by ${overlap.toFixed(1)} mm` : "peg slides into the hole"}</text>
    </g>;
  })();

  return (
    <div className={styles.stack}>
      <svg className={styles.svg} viewBox="0 0 860 306" role="img"
        aria-label={`Peg ${offset.toFixed(1)} mm off-centre, hole clearance ${clear} mm, camera pixel ${px} mm. The camera reports an offset between ${seen.toFixed(1)} and ${(seen + px).toFixed(1)} mm; the peg ${jams ? "jams on the rim" : "goes in"}.`}>
        {panel(0, "What the camera sees", camera)}
        {panel(440, "What geometry and touch see", contact)}
      </svg>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Peg offset</span><span className={styles.sliderValue}>{offset.toFixed(1)} mm</span></span>
            <input type="range" min={0} max={3} step={0.1} value={offset} onChange={(e) => setOffset(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Camera pixel size</span><span className={styles.sliderValue}>{px} mm</span></span>
            <input type="range" min={0.25} max={3} step={0.25} value={px} onChange={(e) => setPx(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Hole clearance</span><span className={styles.sliderValue}>{clear} mm</span></span>
            <input type="range" min={0.25} max={2} step={0.25} value={clear} onChange={(e) => setClear(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Camera&rsquo;s estimate of the offset</dt><dd>{seen.toFixed(1)} to {(seen + px).toFixed(1)} mm<small>{edgePixel === 0 ? "indistinguishable from a perfect alignment" : `pixel ${edgePixel} from centre`}</small></dd></div>
          <div><dt>Outcome</dt><dd>{jams ? "jams" : "goes in"}<small>{jams && edgePixel === 0 ? "a jam the camera cannot see" : "the camera's view is consistent with the outcome"}</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
