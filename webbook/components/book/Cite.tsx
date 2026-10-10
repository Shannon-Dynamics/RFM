import { getRef, shortCite } from "@/lib/refs";
import styles from "./book.module.css";

/** Inline citation in the Book.md convention: author, year and arXiv ID in parentheses. */
export function Cite({ k }: { k: string }) {
  const refs = k.split(",").map((s) => getRef(s.trim()));
  return (
    <span className={styles.cite}>
      (
      {refs.map((r, i) => (
        <span key={r.key}>
          {i > 0 && "; "}
          <a href={`#ref-${r.key}`} title={r.title}>
            {shortCite(r)}
            {r.arxiv ? `, arXiv ${r.arxiv}` : ""}
          </a>
        </span>
      ))}
      )
    </span>
  );
}
