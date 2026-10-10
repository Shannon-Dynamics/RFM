import { Halftone } from "./Halftone";
import styles from "./SiteFooter.module.css";

const COLS = [
  { head: "Company", links: [["Capabilities", "https://shannon.id/#capabilities"], ["Products", "https://shannon.id/#showcase"], ["Ecosystem", "https://shannon.id/#ecosystem"], ["Contact", "https://shannon.id/#contact"]] },
  { head: "Library", links: [["Books", "https://shannon.id/library-books.html"], ["Open Source", "https://shannon.id/library-open-source.html"], ["Publications", "https://shannon.id/library-publications.html"]] },
  { head: "Connect", links: [["Bohr Labs ↗", "https://bohrlabs.id"]] },
];

/** The Shannon Dynamics footer, as on the company's library sites. */
export function SiteFooter() {
  return (
    <footer className={styles.foot}>
      <Halftone className={styles.tex} intensity={0.55} />
      <div className={styles.shade} aria-hidden="true" />
      <section className={styles.sec}>
        <div className={`${styles.in} ${styles.cta}`}>
          <p className={styles.eyebrow}>Contact</p>
          <h2>Have a challenge? Let&rsquo;s build what&rsquo;s next.</h2>
          <p>
            Whether you&rsquo;re exploring an intelligent machine, developing a new digital product, or solving a complex
            engineering problem, tell us what you&rsquo;re working on.
          </p>
          <a className={styles.btn} href="https://shannon.id/#contact">Start a conversation <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <section className={styles.sec}>
        <div className={`${styles.in} ${styles.cols}`}>
          <div className={styles.brand}>
            <a href="https://shannon.id/" aria-label="Shannon Dynamics">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shannon/logo-horizontal-white.png" alt="Shannon Dynamics" width={86} height={24} />
            </a>
            <p>Simulation-first engineering for robots and autonomous software.</p>
            <a className={styles.mail} href="mailto:hello@shannon.id">hello@shannon.id</a>
          </div>
          {COLS.map((c) => (
            <div key={c.head}>
              <p className={styles.colHead}>{c.head}</p>
              <ul className={styles.colList}>
                {c.links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.sec}>
        <div className={`${styles.in} ${styles.bar}`}>
          <span>© 2026 Shannon Dynamics · A Bohr Labs Company</span>
          <span className={styles.stamp}>SIMULATION-FIRST</span>
        </div>
      </section>
    </footer>
  );
}
