import Link from "next/link";
import { CHAPTERS, FAMILIES, GRID_CELLS, GRID_COLUMNS, GRID_ROWS, family } from "@/content/book";
import css from "./FamilyGrid.module.css";

/** Core diagram 1: what a model predicts (across) against the space it predicts in (down). */
export function FamilyGrid() {
  const slugOf = (n: number) => CHAPTERS.find((c) => c.n === n)!;
  return (
    <div className={css.wrap}>
      <div className={css.grid} role="table" aria-label="The seven families: what is predicted against where it is predicted">
        <div role="row" className={css.row}>
          <div role="columnheader" className={css.corner}>
            <span>Predicted in</span><span className={css.cornerAcross}>What is predicted</span>
          </div>
          {GRID_COLUMNS.map((c) => <div role="columnheader" key={c} className={css.colHead}>{c}</div>)}
        </div>
        {GRID_ROWS.map((r, ri) => (
          <div role="row" key={r} className={css.row}>
            <div role="rowheader" className={css.rowHead}>{r}</div>
            {GRID_COLUMNS.map((_, ci) => {
              const cell = GRID_CELLS.find((g) => g.row === ri && g.col === ci);
              if (!cell) return <div role="cell" key={ci} className={css.empty} />;
              const f = family(cell.family);
              const ch = slugOf(f.chapter);
              return (
                <div role="cell" key={ci} className={css.cell} style={{ "--fam": `var(--fam-${f.id})` } as React.CSSProperties}>
                  <Link href={`/chapters/${ch.slug}/`} className={css.cellLink}>
                    <span className={css.cellLabel}>{cell.label}</span>
                    <span className={css.cellMeta}>Chapter {ch.n}{ch.status === "written" ? "" : ", brief"}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <ul className={css.key} aria-label="Family colours">
        {FAMILIES.map((f) => (
          <li key={f.id} style={{ "--fam": `var(--fam-${f.id})` } as React.CSSProperties}>
            <span className={css.keyDot} aria-hidden="true" />{f.short}
          </li>
        ))}
      </ul>
    </div>
  );
}
