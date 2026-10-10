"use client";
import { useState } from "react";
import { EVIDENCE, SHORT } from "@/content/ch19/data";
import styles from "./viz.module.css";

const MARK: Record<string, string> = { S: "supports", U: "undercuts", "-": "" };

/** Figure 19.2: observable results that would tell the scenarios apart. Tick what you have seen. */
export function EvidenceTable() {
  const [seen, setSeen] = useState<boolean[]>(EVIDENCE.map(() => false));
  const score = [0, 1, 2].map((k) => EVIDENCE.reduce((s, e, i) => s + (seen[i] ? (e.effects[k] === "S" ? 1 : e.effects[k] === "U" ? -1 : 0) : 0), 0));
  const top = Math.max(...score), leaders = score.filter((s) => s === top).length;
  return (
    <div className={styles.stack}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "40rem", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ color: "var(--ink-2)", textAlign: "left" }}>
              <th style={{ padding: "0.35rem", width: "2.2rem" }}>Seen</th><th>Observable result</th>
              {SHORT.map((s) => <th key={s} style={{ textAlign: "center", width: "7.5rem", fontSize: "0.82rem" }}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {EVIDENCE.map((e, i) => (
              <tr key={e.result} style={{ borderTop: "1px solid var(--rule)", background: seen[i] ? "var(--surface-2)" : "transparent" }}>
                <td style={{ padding: "0.35rem", textAlign: "center" }}>
                  <input type="checkbox" checked={seen[i]} aria-label={`Seen: ${e.result}`} onChange={() => setSeen(seen.map((v, j) => (j === i ? !v : v)))} />
                </td>
                <td style={{ padding: "0.35rem 0.4rem" }}>{e.result}</td>
                {e.effects.map((f, k) => (
                  <td key={k} style={{ textAlign: "center", fontWeight: 600, color: f === "S" ? "var(--ink)" : "var(--ink-3)" }}>
                    {f === "S" ? "▲" : f === "U" ? "▼" : "·"} <span style={{ fontWeight: 400, fontSize: "0.8rem" }}>{MARK[f]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <svg className={styles.svg} viewBox="0 0 860 110" role="img" aria-label={`Scores: ${SHORT.map((s, k) => `${s} ${score[k]}`).join(", ")}.`}>
        <line x1={430} x2={430} y1={4} y2={104} stroke="var(--rule-strong)" />
        {SHORT.map((s, k) => {
          const y = 8 + k * 34, w = score[k] * 60;
          return (
            <g key={s}>
              <text x={250} y={y + 17} textAnchor="end" fontSize="13" fill="var(--ink)">{s}</text>
              <rect x={w >= 0 ? 430 : 430 + w} y={y} width={Math.abs(w)} height={24} rx="3" fill={w >= 0 ? "var(--ink-2)" : "var(--surface-2)"} stroke="var(--ink-2)" />
              <text x={w >= 0 ? 436 + w : 424 + w} y={y + 17} textAnchor={w >= 0 ? "start" : "end"} fontSize="13" fontWeight="700" fill="var(--ink)">{score[k] > 0 ? `+${score[k]}` : score[k]}</text>
            </g>
          );
        })}
      </svg>
      <p className={styles.note}>
        {seen.every((v) => !v) ? "Tick the results you have seen reported, by someone other than the model's maker." :
          leaders > 1 ? "No scenario is ahead: the evidence so far does not separate them." : `Ahead on this evidence: ${SHORT[score.indexOf(top)]}. One result can still reverse it.`}
      </p>
    </div>
  );
}
