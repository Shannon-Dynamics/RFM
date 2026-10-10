"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Docs.module.css";

interface Heading { id: string; text: string }

/** "On this page": the article's h2 headings, with the one being read highlighted. */
export function Toc() {
  const path = usePathname();
  const [items, setItems] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const hs = [...document.querySelectorAll<HTMLHeadingElement>("#content article h2[id], #content [data-toc] h2[id]")];
    setItems(hs.map((h) => ({ id: h.id, text: h.dataset.tocLabel ?? h.textContent ?? "" })));
    if (!hs.length) return;
    // The section being read is the last heading scrolled past the line just under the nav bar.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) + 96;
      let cur = hs[0].id;
      for (const h of hs) {
        if (h.getBoundingClientRect().top > line) break;
        cur = h.id;
      }
      setActive(cur);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [path]);

  if (!items.length) return <div className={styles.toc} />;
  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className="kicker">On this page</p>
      <ul>
        {items.map((h) => (
          <li key={h.id}><a href={`#${h.id}`} aria-current={active === h.id ? "true" : undefined}>{h.text}</a></li>
        ))}
      </ul>
    </nav>
  );
}
