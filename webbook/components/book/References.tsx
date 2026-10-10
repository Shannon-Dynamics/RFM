import { citedKeys, getRef } from "@/lib/refs";
import styles from "./book.module.css";

function authorList(a: string[]): string {
  const names = a.map((n) => {
    const [last, first] = n.split(", ");
    return first ? `${first.split(" ").map((p) => p[0] + ".").join(" ")} ${last}` : last;
  });
  return names.length > 4 ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} others` : names.join(", ");
}

/** The chapter's reference list, built from the citations its MDX source actually uses. */
export function References({ source }: { source: string }) {
  const keys = citedKeys(source);
  return (
    <section className={styles.references} aria-labelledby="references">
      <h2 id="references">References</h2>
      <p className={styles.refNote}>
        {keys.length} sources, in order of first citation. Local copies are in <code>reference/</code>; arXiv entries link to the
        abstract page, and the version given is the one read for this chapter.
      </p>
      <ol>
        {keys.map((k) => {
          const r = getRef(k);
          return (
            <li key={k} id={`ref-${k}`}>
              <span className={styles.refAuthors}>{authorList(r.authors)}</span>{" "}
              <span className={styles.refTitle}>{r.title}</span>.{" "}
              {r.venue ? `${r.venue}. ` : ""}
              {r.arxiv ? (
                <a href={r.url}>arXiv {r.arxiv}{r.version ? ` ${r.version}` : ""}</a>
              ) : (
                <a href={r.url}>{new URL(r.url.replace(/^http:\/\/web\.archive\.org\/web\/\d+\//, "")).hostname.replace(/^www\./, "")}</a>
              )}
              , {r.date}.
            </li>
          );
        })}
      </ol>
    </section>
  );
}
