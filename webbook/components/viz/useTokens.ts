"use client";
import { useEffect, useState } from "react";

const NAMES = ["ink", "ink-2", "ink-3", "rule", "rule-strong", "surface", "surface-2", "page",
  "fam-reactive", "fam-wam", "fam-latent", "fam-simulator", "fam-geometry", "fam-reasoning", "fam-lbm"] as const;
export type Tokens = Record<(typeof NAMES)[number], string>;

const FALLBACK: Tokens = {
  ink: "#10181b", "ink-2": "#4f575a", "ink-3": "#6b7174", rule: "#e3e5e6", "rule-strong": "#cfd2d3",
  surface: "#ffffff", "surface-2": "#f4f7f9", page: "#ffffff",
  "fam-reactive": "#2a78d6", "fam-wam": "#eb6834", "fam-latent": "#1baf7a", "fam-simulator": "#eda100",
  "fam-geometry": "#e87ba4", "fam-reasoning": "#008300", "fam-lbm": "#4a3aa7",
};

function read(): Tokens {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(NAMES.map((n) => [n, cs.getPropertyValue(`--${n}`).trim() || FALLBACK[n]])) as Tokens;
}

/** Current colour tokens, re-read when the reader switches theme (charts need real colours, not var()). */
export function useTokens(): Tokens {
  const [t, setT] = useState<Tokens>(FALLBACK);
  useEffect(() => {
    const update = () => setT(read());
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    window.addEventListener("rfm-theme", update);
    return () => { mq.removeEventListener("change", update); window.removeEventListener("rfm-theme", update); };
  }, []);
  return t;
}

/** Nivo theme built from the book's tokens: recessive grid and axes, text in ink, UI typeface. */
export function nivoTheme(t: Tokens) {
  return {
    background: "transparent",
    text: { fontFamily: "var(--font-ui)", fontSize: 13, fill: t["ink-2"] },
    axis: {
      domain: { line: { stroke: t["rule-strong"], strokeWidth: 1 } },
      ticks: { line: { stroke: t["rule-strong"], strokeWidth: 1 }, text: { fill: t["ink-3"], fontSize: 12, fontFamily: "var(--font-ui)" } },
      legend: { text: { fill: t["ink-2"], fontSize: 13, fontFamily: "var(--font-ui)" } },
    },
    grid: { line: { stroke: t.rule, strokeWidth: 1 } },
    crosshair: { line: { stroke: t["ink-2"], strokeWidth: 1, strokeOpacity: 0.6 } },
    labels: { text: { fill: t.ink, fontFamily: "var(--font-ui)", fontSize: 12 } },
    tooltip: {
      container: { background: t.surface, color: t.ink, fontFamily: "var(--font-ui)", fontSize: 13, border: `1px solid ${t.rule}`, borderRadius: 6, boxShadow: "none" },
    },
    legends: { text: { fill: t["ink-2"], fontFamily: "var(--font-ui)", fontSize: 13 } },
  };
}
