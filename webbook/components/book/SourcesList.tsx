"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./sources.module.css";

export interface SourceItem {
  key: string; title: string; authors: string; date: string; year: string; kind: "paper" | "web";
  link: string; label: string; chapters: { n: number; slug: string }[];
}

const GROUPS = ["2026", "2025", "2024", "2023", "Before 2023"];
const groupOf = (y: string) => (Number(y) >= 2023 ? y : "Before 2023");

/** The full reference list, searchable, grouped by year of first version. */
export function SourcesList({ items }: { items: SourceItem[] }) {
  const [q, setQ] = useState("");
  const [onlyCited, setOnlyCited] = useState(false);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => (!onlyCited || i.chapters.length) && (!t || `${i.title} ${i.authors} ${i.label} ${i.key}`.toLowerCase().includes(t)));
  }, [items, q, onlyCited]);
  return (
    <div className={styles.wrap} data-toc>
      <div className={styles.tools}>
        <label className={styles.search}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input type="search" placeholder="Filter by title, author or arXiv number" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter sources" />
        </label>
        <label className={styles.check}><input type="checkbox" checked={onlyCited} onChange={(e) => setOnlyCited(e.target.checked)} /> Cited in a chapter</label>
        <span className={styles.count}>{shown.length} of {items.length}</span>
      </div>
      {GROUPS.map((g) => {
        const list = shown.filter((i) => groupOf(i.year) === g);
        if (!list.length) return null;
        return (
          <section key={g}>
            <h2 id={`y-${g.toLowerCase().replace(/\s+/g, "-")}`} data-toc-label={g}>{g} <span className={styles.n}>{list.length}</span></h2>
            <ol className={styles.list}>
              {list.map((i) => (
                <li key={i.key} id={`src-${i.key}`}>
                  <p className={styles.title}><a href={i.link}>{i.title}</a></p>
                  <p className={styles.meta}>{i.authors} · {i.date} · <a href={i.link}>{i.label}</a></p>
                  {i.chapters.length > 0 && (
                    <p className={styles.chips}>
                      {i.chapters.map((c) => <Link key={c.n} href={`/chapters/${c.slug}/`} className={styles.chip}>CH.{String(c.n).padStart(2, "0")}</Link>)}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
