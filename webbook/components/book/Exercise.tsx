import styles from "./book.module.css";

interface ExerciseProps {
  n: string;
  title: string;
  crate: string;
  test: string;
  hints?: string[];
  children: React.ReactNode;
}

/** A coding task backed by tests in the chapter's Rust crate. */
export function Exercise({ n, title, crate, test, hints = [], children }: ExerciseProps) {
  const cmd = `cargo test -p ${crate} --test exercises ${test}`;
  return (
    <section className={styles.exercise} aria-labelledby={`ex-${n}`}>
      <p className="kicker kicker-accent">Exercise {n}</p>
      <h3 id={`ex-${n}`}>{title}</h3>
      <div className={styles.exerciseTask}>{children}</div>
      <p className={styles.exerciseRun}>Check your answer from the <code>rust/</code> folder:</p>
      <pre className={styles.command}><code>{cmd}</code></pre>
      {hints.map((h, i) => (
        <details key={i} className={styles.hint}>
          <summary>Hint {hints.length > 1 ? i + 1 : ""}</summary>
          <p>{h}</p>
        </details>
      ))}
    </section>
  );
}
