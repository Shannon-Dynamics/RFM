import type { Metadata } from "next";
import Link from "next/link";
import { CHAPTERS, PARTS } from "@/content/book";
import { FamilyGrid } from "@/components/viz/FamilyGrid";
import { HeroLookAhead } from "@/components/viz/HeroLookAhead";
import { Halftone } from "@/components/shell/Halftone";
import { SiteFooter } from "@/components/shell/SiteFooter";
import styles from "./home.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ROMAN = ["I", "II", "III", "IV"];

const METHOD = [
  { letter: "F", title: "Figures", body: "Every chapter opens with a figure and explains each idea with an interactive diagram or a live simulation you can push until it breaks." },
  { letter: "S", title: "Sources", body: "Every claim is cited inline, every quote is verbatim and linked, and every number a vendor reports about its own model is tagged as a claim." },
  { letter: "R", title: "Rust", body: "Every chapter has a crate with three exercises, reference solutions and tests. Code shown on the page is read from the crate, so it compiles." },
];

const PATHS = [
  { title: "Executive path", length: "about 25 pages", body: "Chapter openers and all Part II figures, then chapters 12, 17 and 19." },
  { title: "Engineer path", length: "the whole book", body: "Everything, in order. The Rust exercises assume this path." },
  { title: "Researcher path", length: "about 90 pages", body: "Chapter 4, all of Part II, Part IV and the sources." },
];

export default function Home() {
  const first = CHAPTERS[0], vla = CHAPTERS.find((c) => c.n === 5)!;
  return (
    <>
      <section className={styles.banner}>
        <Halftone className={styles.tex} />
        <div className={styles.bannerShade} aria-hidden="true" />
        <div className={styles.bannerIn}>
          <p className={styles.crumb}>Robot foundation models · a field handbook</p>
          <h1 className={styles.bannerTitle}>Robot Foundation Models</h1>
          <p className={styles.bannerSub}>Seven families of models that let robots learn from the internet, from people and from their own imagination.</p>
        </div>
      </section>

      <main id="content" className={styles.shell}>
        <section className={styles.intro}>
          <div>
            <p className="kicker">Shannon Press · 2026 · {CHAPTERS.length} chapters</p>
            <h2 className={styles.introTitle}>A robot that has watched the internet still has to learn to move.</h2>
            <p className={styles.lede}>
              This handbook explains the models that let robots learn from web video, from people and from their own
              imagination: how each one works, what it is good and bad at, and what remains unsolved. It is organised by
              mechanism, not by product name, so it survives the next release cycle.
            </p>
            <p className={styles.sublede}>
              Nineteen chapters move from what a robot foundation model is, through the seven families that make up the field,
              to data, post-training, deployment and the problems still open, with every claim sourced and every idea made into
              something you can play with.
            </p>
            <div className={styles.btns}>
              <Link href={`/chapters/${first.slug}/`} className={`${styles.btn} ${styles.btnPri}`}>Start reading <span aria-hidden="true">→</span></Link>
              <Link href={`/chapters/${vla.slug}/`} className={styles.btn}>Jump to reactive VLAs</Link>
              <Link href="/chapters/" className={styles.btn}>How to read it</Link>
            </div>
          </div>
          <div>
            <HeroLookAhead />
            <p className={styles.widgetNote}>
              <strong>Look-ahead planning, running live.</strong> A navigation world model imagines thirteen paths (dashed blue is the
              one it chooses) and the robot drives it. Every few seconds the model&rsquo;s sense of turning is made wrong, and the path
              that looked best runs into a pillar. Chapter 16 builds it.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <p className="kicker kicker-accent">The method</p>
          <h2 className={styles.h2}>Three things in every chapter</h2>
          <div className={styles.cards}>
            {METHOD.map((m) => (
              <div key={m.letter} className={styles.cardCell}>
                <p className={styles.cardHead}><span className={styles.cardLetter}>{m.letter}</span>{m.title}</p>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="map">
          <p className="kicker kicker-accent">The map</p>
          <h2 id="map" className={styles.h2}>Seven families on one grid</h2>
          <p className={styles.sectionLede}>
            Every model in the book answers two questions: what does it predict, and in what space? Where it lands on this grid
            decides what data it can learn from and what it costs to run.
          </p>
          <FamilyGrid />
        </section>

        <section className={styles.section}>
          <p className="kicker kicker-accent">Reading paths</p>
          <h2 className={styles.h2}>Three ways to read it</h2>
          <div className={styles.cards}>
            {PATHS.map((p) => (
              <div key={p.title} className={styles.cardCell}>
                <p className={styles.cardHead}>{p.title}</p>
                <p className={styles.pathLength}>{p.length}</p>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="contents">
          <p className="kicker kicker-accent">Contents</p>
          <h2 id="contents" className={styles.h2}>Four parts, nineteen chapters</h2>
          <div className={styles.parts}>
            {PARTS.map((part) => (
              <div key={part.n}>
                <div className={styles.partHead}>
                  <span className="kicker kicker-accent">Part {ROMAN[part.n - 1]}</span>
                  <h3>{part.title}</h3>
                </div>
                <ul className={styles.chapterList}>
                  {CHAPTERS.filter((c) => c.part === part.n).map((c) => (
                    <li key={c.n}>
                      <Link href={`/chapters/${c.slug}/`} className={styles.row}
                        style={c.family ? ({ "--fam": `var(--fam-${c.family})` } as React.CSSProperties) : undefined}>
                        <span className={styles.no}>CH.{String(c.n).padStart(2, "0")}</span>
                        <span>
                          <span className={styles.rowTitle}>{c.family && <span className={styles.famDot} aria-hidden="true" />}{c.title}</span>
                          <span className={styles.rowSub}>{c.purpose}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
