import type { Metadata } from "next";
import refsJson from "@/lib/generated/refs.json";
import { citedKeys, type Ref } from "@/lib/refs";
import { CHAPTERS } from "@/content/book";
import { CHAPTER_CONTENT } from "@/content/chapters";
import { SourcesList, type SourceItem } from "@/components/book/SourcesList";
import styles from "@/components/chapter/chapter.module.css";

export const metadata: Metadata = {
  title: "Sources",
  description: "Every paper, report and page the book cites, with the chapters that cite it.",
  alternates: { canonical: "/sources/" },
};

function authorList(a: string[]): string {
  const names = a.map((n) => {
    const [last, first] = n.split(", ");
    return first ? `${first.split(" ").map((p) => p[0] + ".").join(" ")} ${last}` : last;
  });
  return names.length > 4 ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} others` : names.join(", ");
}

export default function Sources() {
  const refs = Object.values(refsJson as Record<string, Ref>);
  const citedBy = new Map<string, number[]>();
  for (const c of CHAPTERS) {
    const entry = CHAPTER_CONTENT[c.slug];
    if (!entry) continue;
    for (const k of citedKeys(entry.file)) citedBy.set(k, [...(citedBy.get(k) ?? []), c.n]);
  }
  const items: SourceItem[] = refs
    .map((r) => ({
      key: r.key, title: r.title, authors: authorList(r.authors), date: r.date, year: r.year, kind: r.kind,
      link: r.url, label: r.arxiv ? `arXiv ${r.arxiv}` : new URL(r.url.replace(/^http:\/\/web\.archive\.org\/web\/\d+\//, "")).hostname.replace(/^www\./, ""),
      chapters: (citedBy.get(r.key) ?? []).map((n) => ({ n, slug: CHAPTERS.find((c) => c.n === n)!.slug })),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
  const papers = items.filter((i) => i.kind === "paper").length;
  const cited = items.filter((i) => i.chapters.length).length;
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <p className={`kicker ${styles.crumb}`}><span className="kicker-accent">Sources</span></p>
        <h1 className={styles.h1}>Sources</h1>
        <p className={styles.purpose}>Every paper, report and page in the book&rsquo;s reference collection, newest first, with the chapters that cite it.</p>
        <dl className={styles.facts}>
          <div><dt className="kicker">In the collection</dt><dd>{items.length}</dd><p>local copies in reference/</p></div>
          <div><dt className="kicker">Papers</dt><dd>{papers}</dd><p>linked to arXiv</p></div>
          <div><dt className="kicker">Web and reports</dt><dd>{items.length - papers}</dd><p>archived pages</p></div>
          <div><dt className="kicker">Cited in chapters</dt><dd>{cited}</dd><p>the rest is background</p></div>
        </dl>
      </header>
      <SourcesList items={items} />
    </article>
  );
}
