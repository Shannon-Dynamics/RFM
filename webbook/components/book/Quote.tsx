import styles from "./book.module.css";

interface QuoteProps {
  children: React.ReactNode;
  who: string;
  role: string;
  source: string;
  href: string;
  date: string;
}

/** A verbatim quote. Source, link and date are required: the book never paraphrases a person. */
export function Quote({ children, who, role, source, href, date }: QuoteProps) {
  return (
    <figure className={styles.quote}>
      <blockquote cite={href}>{children}</blockquote>
      <figcaption>
        <span className={styles.quoteWho}>{who}</span>, {role}. <a href={href}>{source}</a>, {date}.
      </figcaption>
    </figure>
  );
}
