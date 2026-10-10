"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SiteNav.module.css";

const LINKS = [
  { href: "/", label: "Overview", match: (p: string) => p === "/" },
  { href: "/chapters/", label: "Chapters", match: (p: string) => p.startsWith("/chapters") },
  { href: "/sources/", label: "Sources", match: (p: string) => p.startsWith("/sources") },
];

/** The Shannon Dynamics bar: logo left, pill navigation centred. Transparent over the
 *  overview's banner until the reader scrolls; solid graphite everywhere else. */
export function SiteNav() {
  const path = usePathname() || "/";
  const overHero = path === "/";
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);
  const solid = !overHero || stuck;
  return (
    <>
      <header className={styles.nav} data-solid={solid}>
        <div className={styles.inner}>
          <div className={styles.start}>
            <a className={styles.logo} href="https://shannon.id/" aria-label="Shannon Dynamics">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shannon/logo-horizontal-white.png" alt="Shannon Dynamics" width={100} height={28} />
            </a>
          </div>
          <nav className={styles.links} data-solid={solid} aria-label="Site">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link} aria-current={l.match(path) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className={styles.end} />
        </div>
      </header>
      {!overHero && <div className={styles.spacer} aria-hidden="true" />}
    </>
  );
}
