import { citedKeys, countIn, getRef } from "@/lib/refs";
import { family, PARTS, type Chapter } from "@/content/book";
import { CitedTimeline } from "@/components/viz/CitedTimeline";
import styles from "./chapter.module.css";

const LEVEL = { L0: "No equations", L1: "One boxed equation per idea", L2: "Equations with a walkthrough" };

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** The chapter's dashboard: what it covers and how much evidence stands behind it, counted from the source. */
export function ChapterHeader({ chapter, source }: { chapter: Chapter; source: string }) {
  const keys = citedKeys(source);
  const papers = keys.map(getRef).filter((r) => r.kind === "paper");
  const figures = countIn(source, /<Figure\s/g);
  const exercises = countIn(source, /<Exercise\s/g);
  const fam = chapter.family ? family(chapter.family) : null;
  const part = PARTS.find((p) => p.n === chapter.part)!;
  // Cited papers per half-year of first arXiv version: how recent the evidence is.
  const buckets = new Map<string, number>();
  for (const r of papers) {
    const [y, m] = r.date.split("-").map(Number);
    const label = `${y} H${m <= 6 ? 1 : 2}`;
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  const timeline = [...buckets.entries()].sort().map(([period, count]) => ({ period, count }));
  const recent = papers.filter((r) => r.date >= "2026-01-01").length;

  const ROMAN = ["I", "II", "III", "IV"];
  return (
    <header className={styles.header} style={fam ? ({ "--fam": `var(--fam-${fam.id})` } as React.CSSProperties) : undefined}>
      <p className={`kicker ${styles.crumb}`}>
        <span className="kicker-accent">Ch.{String(chapter.n).padStart(2, "0")}</span>
        <span aria-hidden="true">·</span>
        <span>Part {ROMAN[part.n - 1]} · {part.title}</span>
        {fam && <span className={styles.famChip}><span className={styles.famDot} aria-hidden="true" />{fam.short}</span>}
      </p>
      <h1 className={styles.h1}>{chapter.title}</h1>
      <p className={styles.purpose}>{chapter.purpose}</p>
      <dl className={styles.facts}>
        <div><dt className="kicker">Math</dt><dd>{chapter.level}</dd><p>{LEVEL[chapter.level]}</p></div>
        <div><dt className="kicker">Sources</dt><dd>{keys.length}</dd><p>{recent} papers from 2026</p></div>
        <div><dt className="kicker">Figures</dt><dd>{figures}</dd><p>Most are interactive</p></div>
        <div><dt className="kicker">Exercises</dt><dd>{exercises}</dd><p>Rust, with tests</p></div>
        {chapter.lastChecked && <div><dt className="kicker">Last checked</dt><dd className={styles.ddSmall}>{fmtDate(chapter.lastChecked)}</dd><p>The field moves monthly</p></div>}
      </dl>
      <div className={styles.timeline}>
        <p className="kicker">Papers cited, by half-year of first arXiv version</p>
        <CitedTimeline data={timeline} />
      </div>
    </header>
  );
}
