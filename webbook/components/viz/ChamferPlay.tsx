"use client";
import { useMemo, useState } from "react";
import { chamfer, dist, iou, mug, nearest, transform, voxelize, type P2 } from "@/lib/sim/geometry";
import styles from "./viz.module.css";

const TARGET = mug(16);
const K = 2.1, OX = 300, OY = 250;
const sx = (p: P2) => OX + p[0] * K, sy = (p: P2) => OY - p[1] * K;

/** Figure 9.4: scoring a predicted point cloud. Points have no order, so the loss must not assume one. */
export function ChamferPlay() {
  const [dx, setDx] = useState(6);
  const [rot, setRot] = useState(0);
  const [noHandle, setNoHandle] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const pred = useMemo(() => {
    let p = transform(TARGET, rot, dx, 0);
    if (noHandle) p = p.slice(0, 48);
    if (shuffle) p = p.map((_, i) => p[(i * 17) % p.length]);
    return p;
  }, [dx, rot, noHandle, shuffle]);
  const ch = chamfer(pred, TARGET);
  const vox = iou(voxelize(pred, 10), voxelize(TARGET, 10));
  const indexwise = pred.reduce((s, p, i) => s + dist(p, TARGET[i]), 0) / pred.length;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <label className={styles.legendItem}><input type="checkbox" checked={noHandle} onChange={(e) => setNoHandle(e.target.checked)} /> Prediction misses the handle</label>
        <label className={styles.legendItem}><input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} /> Shuffle the prediction&rsquo;s point order</label>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 280" role="img"
        aria-label={`Predicted mug shifted ${dx} mm and rotated ${rot} degrees. Chamfer distance ${ch.toFixed(1)} mm; voxel IoU ${vox.toFixed(2)}.`}>
        {pred.map((p, i) => {
          const q = nearest(p, TARGET);
          return <line key={`l${i}`} x1={sx(p)} y1={sy(p)} x2={sx(q)} y2={sy(q)} stroke="var(--ink-3)" strokeWidth="1" />;
        })}
        {TARGET.map((p, i) => <circle key={`t${i}`} cx={sx(p)} cy={sy(p)} r="3.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />)}
        {pred.map((p, i) => <circle key={`p${i}`} cx={sx(p)} cy={sy(p)} r="3.5" fill="var(--fam-geometry)" />)}
        <text x={40} y={60} fontSize="12" fill="var(--ink-2)">hollow: the real mug</text>
        <text x={40} y={80} fontSize="12" fill="var(--ink-2)">filled: the model&rsquo;s prediction</text>
        <text x={40} y={100} fontSize="12" fill="var(--ink-2)">grey lines: each predicted point</text>
        <text x={40} y={116} fontSize="12" fill="var(--ink-2)">to its nearest real point</text>
      </svg>
      <div className={styles.split}>
        <div className={styles.sliders}>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Prediction shifted</span><span className={styles.sliderValue}>{dx} mm</span></span>
            <input type="range" min={0} max={30} step={1} value={dx} onChange={(e) => setDx(Number(e.target.value))} />
          </label>
          <label className={styles.slider}>
            <span className={styles.sliderHead}><span>Prediction rotated</span><span className={styles.sliderValue}>{rot}°</span></span>
            <input type="range" min={-20} max={20} step={1} value={rot} onChange={(e) => setRot(Number(e.target.value))} />
          </label>
        </div>
        <dl className={styles.readout}>
          <div><dt>Chamfer distance</dt><dd>{ch.toFixed(1)} mm<small>order-free; unchanged by shuffling</small></dd></div>
          <div><dt>Voxel IoU, 10 mm cells</dt><dd>{vox.toFixed(2)}</dd></div>
          <div><dt>Point-by-point error, assuming an order</dt><dd>{indexwise.toFixed(1)} mm<small>meaningless once the order is shuffled</small></dd></div>
        </dl>
      </div>
    </div>
  );
}
