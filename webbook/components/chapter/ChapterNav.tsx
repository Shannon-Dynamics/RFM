import Link from "next/link";
import { CHAPTERS, type Chapter } from "@/content/book";
import styles from "./chapter.module.css";

export function ChapterNav({ chapter }: { chapter: Chapter }) {
  const prev = CHAPTERS.find((c) => c.n === chapter.n - 1);
  const next = CHAPTERS.find((c) => c.n === chapter.n + 1);
  return (
    <nav className={styles.chapterNav} aria-label="Chapter navigation">
      {prev ? <Link href={`/chapters/${prev.slug}/`} rel="prev"><span>← Previous</span>{prev.n}. {prev.title}</Link> : <span />}
      {next ? <Link href={`/chapters/${next.slug}/`} rel="next" className={styles.next}><span>Next →</span>{next.n}. {next.title}</Link> : <span />}
    </nav>
  );
}
