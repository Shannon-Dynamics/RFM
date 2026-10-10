"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHAPTERS, PARTS } from "@/content/book";
import { ThemeSwitch } from "./ThemeSwitch";
import { PanelIcon } from "./icons";
import styles from "./Docs.module.css";

const ROMAN = ["I", "II", "III", "IV"];

export function Sidebar({ onCollapse, onNavigate }: { onCollapse: () => void; onNavigate: () => void }) {
  const path = usePathname() || "";
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // Ctrl+K or Cmd+K focuses the search, as in the Shannon library.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.current?.focus(); }
      if (e.key === "Escape" && document.activeElement === input.current) { setQ(""); input.current?.blur(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const match = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    return new Set(CHAPTERS.filter((c) => `${c.n} ${c.title} ${c.purpose}`.toLowerCase().includes(t)).map((c) => c.n));
  }, [q]);
  const isOn = (href: string) => path === href || path === href.slice(0, -1);

  return (
    <aside className={styles.sidebar} aria-label="Book contents">
      <div className={styles.sideHead}>
        <Link href="/chapters/" className={styles.bookTitle} onClick={onNavigate}>Robot Foundation Models</Link>
        <button className={styles.iconBtn} onClick={onCollapse} aria-label="Hide sidebar" title="Hide sidebar"><PanelIcon /></button>
      </div>
      <label className={styles.search}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <input ref={input} type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search chapters" />
        <kbd>Ctrl</kbd><kbd>K</kbd>
      </label>
      <nav className={styles.sideNav}>
        {!match && (
          <Link href="/chapters/" className={styles.item} aria-current={isOn("/chapters/") ? "page" : undefined} onClick={onNavigate}>How to Read This Book</Link>
        )}
        {PARTS.map((p) => {
          const chapters = CHAPTERS.filter((c) => c.part === p.n && (!match || match.has(c.n)));
          if (!chapters.length) return null;
          return (
            <div key={p.n} className={styles.group}>
              <p className={styles.groupTitle}>Part {ROMAN[p.n - 1]} · {p.title}</p>
              {chapters.map((c) => {
                const href = `/chapters/${c.slug}/`;
                return (
                  <Link key={c.n} href={href} className={styles.item} aria-current={isOn(href) ? "page" : undefined} onClick={onNavigate}
                    style={c.family ? ({ "--fam": `var(--fam-${c.family})` } as React.CSSProperties) : undefined}>
                    <span className={styles.itemNo}>{String(c.n).padStart(2, "0")}</span>
                    <span>{c.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
        {match && match.size === 0 && <p className={styles.noMatch}>No chapter matches &ldquo;{q}&rdquo;.</p>}
      </nav>
      <div className={styles.sideFoot}><ThemeSwitch /></div>
    </aside>
  );
}
