import styles from "./book.module.css";

interface FigureProps {
  id: string;
  takeaway: string;
  caption: string;
  source?: string;
  schematic?: boolean;
  toy?: boolean;
  children: React.ReactNode;
}

/** Book.md figure convention: takeaway, factual caption, then the source for any number shown. */
export function Figure({ id, takeaway, caption, source, schematic, toy, children }: FigureProps) {
  return (
    <figure className={styles.figure} id={`fig-${id.replace(".", "-")}`} data-wide>
      <div className={styles.figureBody}>{children}</div>
      <figcaption className={styles.figcaption}>
        <span className={`kicker kicker-accent ${styles.figId}`}>Figure {id}</span>
        <span className={styles.takeaway}>{takeaway}</span> {caption}
        {schematic && <span className={styles.tag}>schematic, not measured</span>}
        {toy && <span className={styles.tag}>toy simulation</span>}
        {source && <span className={styles.figSource}> Source: {source}</span>}
      </figcaption>
    </figure>
  );
}
