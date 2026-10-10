import styles from "./book.module.css";

const TITLES = { "key-paper": "Key paper", "in-practice": "In practice", caveat: "Caveat" } as const;

export function Callout({ kind, title, children }: { kind: keyof typeof TITLES; title?: string; children: React.ReactNode }) {
  return (
    <aside className={styles.callout} data-kind={kind}>
      <p className={styles.calloutTitle}><span className="kicker kicker-accent">{TITLES[kind]}</span>{title && <span className={styles.calloutName}>{title}</span>}</p>
      {children}
    </aside>
  );
}

/** Book.md: every chapter ends with an honest concession. */
export function NotSure({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.notSure} aria-labelledby="not-sure">
      <h2 id="not-sure">What we are not sure about</h2>
      {children}
    </section>
  );
}

export function Claim({ kind = "vendor" }: { kind?: "vendor" | "survey" | "leaderboard" }) {
  const label = { vendor: "vendor claim", survey: "industry survey", leaderboard: "leaderboard claim" }[kind];
  return <span className={styles.claim}>{label}</span>;
}
