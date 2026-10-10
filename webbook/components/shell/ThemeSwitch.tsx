"use client";
import { useEffect, useState } from "react";
import styles from "./Docs.module.css";

type Theme = "light" | "dark";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The two-button light/dark pill at the foot of the sidebar. */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme(current()), []);
  const set = (t: Theme) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("rfm-theme", t); } catch {}
    setTheme(t);
    window.dispatchEvent(new Event("rfm-theme"));
  };
  return (
    <div className={styles.themePill} role="group" aria-label="Colour theme">
      <button aria-pressed={theme === "light"} onClick={() => set("light")} aria-label="Light theme" title="Light">
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
          <circle cx="10" cy="10" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M10 2.2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${a} 10 10)`} />
          ))}
        </svg>
      </button>
      <button aria-pressed={theme === "dark"} onClick={() => set("dark")} aria-label="Dark theme" title="Dark">
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
          <path d="M15.5 12.3A6 6 0 0 1 7.7 4.5a6 6 0 1 0 7.8 7.8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
