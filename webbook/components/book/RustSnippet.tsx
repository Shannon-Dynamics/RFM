import fs from "node:fs";
import path from "node:path";
import { codeToHtml } from "shiki";
import styles from "./book.module.css";

const RUST_ROOT = path.join(process.cwd(), "..", "rust");

/** Cut `// region: name` ... `// endregion: name` out of a file and strip common indentation. */
function extract(file: string, region: string): string {
  const src = fs.readFileSync(path.join(RUST_ROOT, file), "utf8").split("\n");
  const start = src.findIndex((l) => l.trim() === `// region: ${region}`);
  const end = src.findIndex((l, i) => i > start && l.trim() === `// endregion: ${region}`);
  if (start < 0 || end < 0) throw new Error(`Region "${region}" not found in rust/${file}`);
  const lines = src.slice(start + 1, end);
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent)).join("\n").trimEnd();
}

/** Rust code shown in the book is read from the chapter crate at build time, so it always compiles. */
export async function RustSnippet({ file, region, caption }: { file: string; region: string; caption?: string }) {
  const code = extract(file, region);
  const html = await codeToHtml(code, {
    lang: "rust",
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
  });
  return (
    <figure className={styles.code} data-wide>
      <figcaption className={styles.codeCaption}>
        <span className={styles.codePath}>rust/{file}</span>
        {caption && <span>{caption}</span>}
      </figcaption>
      <div className={styles.codeBody} dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
