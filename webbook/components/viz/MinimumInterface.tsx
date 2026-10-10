"use client";
import { useState } from "react";
import styles from "./viz.module.css";

/** Figure 1.3: observations and language in, an action chunk out; predicted futures optional. */
export function MinimumInterface() {
  const [futures, setFutures] = useState(false);
  const [chunk, setChunk] = useState(8);
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Model type">
          <button aria-pressed={!futures} onClick={() => setFutures(false)}>Reactive: actions only</button>
          <button aria-pressed={futures} onClick={() => setFutures(true)}>World-action: actions and futures</button>
        </div>
        <label className={styles.slider} style={{ minWidth: "14rem" }}>
          <span className={styles.sliderHead}><span>Action chunk length H</span><span className={styles.sliderValue}>{chunk}</span></span>
          <input type="range" min={1} max={16} value={chunk} onChange={(e) => setChunk(Number(e.target.value))} />
        </label>
      </div>
      <svg className={styles.svg} viewBox="0 0 720 260" role="img"
        aria-label={`Camera frames, proprioception and a language instruction enter one model, which outputs ${chunk} actions${futures ? " and predicted future frames" : ""}.`}>
        <defs>
          <marker id="mi-head" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
          </marker>
        </defs>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={20 + i * 10} y={40 + i * 10} width="80" height="56" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
          </g>
        ))}
        <text x="70" y="140" textAnchor="middle" fontSize="13" fill="var(--ink-2)">camera history o&lt;t</text>
        <rect x="20" y="160" width="100" height="26" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="70" y="178" textAnchor="middle" fontSize="12" fill="var(--ink-2)">joint state</text>
        <rect x="20" y="200" width="180" height="40" rx="4" fill="var(--surface-2)" stroke="var(--ink-2)" />
        <text x="110" y="225" textAnchor="middle" fontSize="13" fill="var(--ink)">&ldquo;put the cup in the sink&rdquo;</text>
        <path d="M 130 90 L 268 130" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#mi-head)" />
        <path d="M 124 173 L 268 140" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#mi-head)" />
        <path d="M 202 218 L 268 150" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#mi-head)" />
        <rect x="270" y="96" width="150" height="86" rx="10" fill="var(--ink)" />
        <text x="345" y="134" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--surface)">robot foundation</text>
        <text x="345" y="154" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--surface)">model</text>
        <path d="M 422 160 L 472 190" stroke="var(--ink)" strokeWidth="1.5" fill="none" markerEnd="url(#mi-head)" />
        {Array.from({ length: chunk }, (_, i) => (
          <rect key={i} x={476 + i * (230 / 16)} y="180" width={230 / 16 - 3} height="34" rx="2" fill="var(--ink-2)"
            style={{ transition: "opacity 200ms" }} />
        ))}
        <text x="476" y="236" fontSize="13" fill="var(--ink-2)">action chunk a t:t+H, H = {chunk}</text>
        {futures && (
          <g>
            <path d="M 422 116 L 472 80" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" markerEnd="url(#mi-head)" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={476 + i * 58} y="40" width="52" height="40" rx="3" fill="none" stroke="var(--ink-2)" strokeDasharray="4 3" />
            ))}
            <text x="476" y="30" fontSize="13" fill="var(--ink-2)">predicted futures ô t:t+H (optional)</text>
          </g>
        )}
      </svg>
    </div>
  );
}
