"use client";
import { useState } from "react";
import { family } from "@/content/book";
import { CRITERIA, MATRIX } from "@/content/ch12/data";
import css from "./ComparisonMatrix.module.css";
import styles from "./viz.module.css";

/** Figure 12.1: eight criteria (rows) against seven families (columns), with the reason for every cell and weights
 *  you can change. Families run across so the matrix fits the docs column. */
export function ComparisonMatrix() {
  const [w, setW] = useState<number[]>(CRITERIA.map(() => 1));
  const [sel, setSel] = useState<[number, number]>([0, 3]);
  const total = w.reduce((a, b) => a + b, 0);
  const score = (s: number[]) => (total ? s.reduce((a, v, i) => a + v * w[i], 0) / total : 0);
  const ranked = [...MATRIX].map((r) => ({ r, s: score(r.scores) })).sort((a, b) => b.s - a.s);
  const best = ranked[0];
  const [ri, ci] = sel;
  const row = MATRIX[ri];

  return (
    <div className={css.wrap}>
      <div className={css.scroll}>
        <table className={css.table}>
          <colgroup><col className={css.critCol} />{MATRIX.map((r) => <col key={r.family} />)}</colgroup>
          <thead>
            <tr>
              <th scope="col" className={css.corner}>Criterion</th>
              {MATRIX.map((r) => {
                const f = family(r.family);
                return (
                  <th key={r.family} scope="col" style={{ "--fam": `var(--fam-${r.family})` } as React.CSSProperties}>
                    <span className={css.fam} aria-hidden="true" />
                    <span className={css.famName}>{f.short}</span>
                    <span className={css.famCh}>ch. {f.chapter}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, j) => (
              <tr key={c} style={{ opacity: w[j] === 0 ? 0.4 : 1 }}>
                <th scope="row">{c}</th>
                {MATRIX.map((r, i) => {
                  const v = r.scores[j];
                  return (
                    <td key={r.family}>
                      <button className={css.cell} aria-pressed={ri === i && ci === j} onClick={() => setSel([i, j])}
                        aria-label={`${family(r.family).short}, ${c}: ${["low", "medium", "high"][v - 1]}. ${r.why[j]}`}>
                        {[1, 2, 3].map((k) => <span key={k} className={css.pip} data-on={k <= v} />)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Weighted score</th>
              {MATRIX.map((r) => {
                const sc = score(r.scores);
                return (
                  <td key={r.family} className={css.score} data-best={r === best.r} style={{ "--fam": `var(--fam-${r.family})` } as React.CSSProperties}>
                    {sc.toFixed(2)}
                    <span className={css.bar} aria-hidden="true"><span style={{ width: `${(sc / 3) * 100}%` }} /></span>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className={styles.card} aria-live="polite">
        <h4>{family(row.family).short}: {CRITERIA[ci].toLowerCase()} ({["low", "medium", "high"][row.scores[ci] - 1]})</h4>
        <p>{row.why[ci]}</p>
      </div>
      <p className={styles.note}>
        Weights: how much each criterion matters for your job. With these weights the top family is <strong>{family(best.r.family).short}</strong> ({best.s.toFixed(2)}), then {family(ranked[1].r.family).short} ({ranked[1].s.toFixed(2)}).
      </p>
      <div className={css.weights}>
        {CRITERIA.map((c, i) => (
          <label key={c} className={styles.slider}>
            <span className={styles.sliderHead}><span>{c}</span><span className={styles.sliderValue}>{w[i]}</span></span>
            <input type="range" min={0} max={3} step={0.5} value={w[i]} onChange={(e) => setW(w.map((x, j) => (j === i ? Number(e.target.value) : x)))} />
          </label>
        ))}
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setW(CRITERIA.map(() => 1))}>Equal weights</button>
        <button className={styles.button} onClick={() => setW([3, 1, 0.5, 0.5, 0, 3, 1, 2])}>Factory cell</button>
        <button className={styles.button} onClick={() => setW([0.5, 2, 3, 3, 1, 1, 1, 1])}>Home humanoid</button>
        <button className={styles.button} onClick={() => setW([1, 3, 1, 1, 3, 0.5, 2, 0.5])}>Research lab, many robots</button>
      </div>
    </div>
  );
}
