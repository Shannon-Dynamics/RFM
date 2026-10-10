import "server-only";
import fs from "node:fs";
import path from "node:path";
import refsJson from "@/lib/generated/refs.json";

export interface Ref {
  key: string;
  title: string;
  bookName: string;
  authors: string[];
  firstAuthor: string;
  date: string;
  year: string;
  arxiv: string | null;
  version: string | null;
  venue: string | null;
  url: string;
  kind: "paper" | "web";
}

const REFS = refsJson as Record<string, Ref>;

/** Look up a reference; an unknown key stops the build so a broken citation never ships. */
export function getRef(key: string): Ref {
  const r = REFS[key];
  if (!r) throw new Error(`Unknown citation key "${key}". Add it to reference/ (references.csv) first.`);
  return r;
}

export const CHAPTER_DIR = path.join(process.cwd(), "content", "chapters");

/** Citation keys in order of first use in a chapter's MDX source. */
export function citedKeys(mdxFile: string): string[] {
  const src = fs.readFileSync(path.join(CHAPTER_DIR, mdxFile), "utf8");
  const keys: string[] = [];
  for (const m of src.matchAll(/<Cite\s+k="([^"]+)"/g)) {
    for (const k of m[1].split(",").map((s) => s.trim())) {
      getRef(k);
      if (!keys.includes(k)) keys.push(k);
    }
  }
  return keys;
}

export function countIn(mdxFile: string, pattern: RegExp): number {
  const src = fs.readFileSync(path.join(CHAPTER_DIR, mdxFile), "utf8");
  return [...src.matchAll(pattern)].length;
}

/** "Ye et al. 2026" or "NVIDIA Technical Blog 2026". */
export function shortCite(r: Ref): string {
  const who = r.kind === "paper" ? r.firstAuthor : r.authors[0] ?? r.firstAuthor;
  return `${who} ${r.year}`;
}
