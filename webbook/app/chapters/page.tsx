import type { Metadata } from "next";
import Link from "next/link";
import { CHAPTERS, FAMILIES } from "@/content/book";
import { FamilyGrid } from "@/components/viz/FamilyGrid";
import { DataPyramid } from "@/content/ch02/figures";
import { Claim } from "@/components/book/Callout";
import styles from "@/components/chapter/chapter.module.css";
import own from "./read.module.css";

export const metadata: Metadata = {
  title: "How to Read This Book",
  description: "The organising idea, the reading paths, how evidence is marked, and the Rust lab.",
  alternates: { canonical: "/chapters/" },
};

const PATHS = [
  { title: "The executive path", body: <>Chapter openers and all Part II figures, then <Link href={`/chapters/${CHAPTERS[11].slug}/`}>chapter 12</Link>, <Link href={`/chapters/${CHAPTERS[16].slug}/`}>chapter 17</Link> and <Link href={`/chapters/${CHAPTERS[18].slug}/`}>chapter 19</Link>. About 25 pages.</> },
  { title: "The engineer path", body: <>Everything, in order. The Rust exercises assume this path, and each chapter&rsquo;s crate builds on the toolkit of <Link href={`/chapters/${CHAPTERS[3].slug}/`}>chapter 4</Link>.</> },
  { title: "The researcher path", body: <>Chapter 4, all of Part II, Part IV and the <Link href="/sources/">sources</Link>. About 90 pages.</> },
];

export default function HowToRead() {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <p className={`kicker ${styles.crumb}`}><span className="kicker-accent">Start here</span></p>
        <h1 className={styles.h1}>How to Read This Book</h1>
        <p className={styles.purpose}>The organising idea, the reading paths, how evidence is marked, and what you need to run the Rust lab.</p>
      </header>
      <div className={styles.body}>
        <p>
          This book is organised so that you can read it three different ways, and all three are legitimate. Every chapter has
          the same shape, so once you know where things are in one chapter you know where they are in all nineteen.
        </p>

        <h2 id="the-organising-idea">The organising idea</h2>
        <p>
          The book sorts robot foundation models by two questions. What does the model predict: actions only, actions and
          futures, futures only, or a plan in language? And in what space does it predict: pixels, learned features, explicit
          geometry or tokens? The answers place every model on one grid, and the seven filled regions are the seven families
          of Part II. One colour per family, fixed across the book; colour in a figure means family and nothing else.
        </p>
        <div data-wide className={own.wide}><FamilyGrid /></div>
        <ul className={own.famList}>
          {FAMILIES.map((f) => (
            <li key={f.id} style={{ "--fam": `var(--fam-${f.id})` } as React.CSSProperties}>
              <span className={own.dot} aria-hidden="true" />
              <Link href={`/chapters/${CHAPTERS.find((c) => c.n === f.chapter)!.slug}/`}>{f.name}</Link>
              <span className={own.predicts}>{f.predicts}</span>
            </li>
          ))}
        </ul>

        <h2 id="reading-paths">Reading paths</h2>
        <ul>
          {PATHS.map((p) => <li key={p.title}><strong>{p.title}</strong>: {p.body}</li>)}
        </ul>

        <h2 id="what-every-chapter-contains">What every chapter contains</h2>
        <div className={own.split}>
          <div>
            <p className="kicker">In every chapter</p>
            <ol className={own.steps}>
              <li><strong>An opening figure</strong> that summarises the chapter before the text begins.</li>
              <li><strong>Why it exists</strong>, and three things you will be able to do afterwards.</li>
              <li><strong>A verbatim quote</strong> from a named person, linked to its source and dated.</li>
              <li><strong>The body</strong>, with an interactive figure or simulation for each main idea.</li>
              <li><strong>What we are not sure about</strong>: the honest concession, in every chapter without exception.</li>
              <li><strong>Exercises</strong> in Rust, and further reading.</li>
            </ol>
          </div>
          <div>
            <p className="kicker">Math levels</p>
            <ul className={own.levels}>
              <li><code>L0</code> No equations at all: intuition, diagrams and simulations.</li>
              <li><code>L1</code> One boxed equation per idea, always explained in words and drawn.</li>
              <li><code>L2</code> Equations with a term-by-term walkthrough. Chapters 4, 6 and 7 only.</li>
            </ul>
          </div>
        </div>

        <h2 id="how-evidence-is-marked">How evidence is marked</h2>
        <p>
          Every claim is cited inline with its arXiv number or source, and each chapter ends with its full reference list. Numbers
          that do not come from independent measurement are tagged where they appear:
        </p>
        <ul>
          <li>A number a company reports about its own model or data <Claim />.</li>
          <li>A number from a market or practitioner survey <Claim kind="survey" />.</li>
          <li>A position on a public leaderboard <Claim kind="leaderboard" />.</li>
        </ul>
        <p>
          Figures carry a one-sentence takeaway, a factual caption and a source. Figures that are not measured data say so:
          a <em>schematic</em> is the authors&rsquo; drawing of an idea, and a <em>toy simulation</em> is a small model built to show a
          mechanism, not to estimate a real number. Every chapter carries a &ldquo;last checked&rdquo; date, because the field moves
          monthly.
        </p>

        <h2 id="the-data-pyramid">The data pyramid</h2>
        <p>
          The second idea that recurs through the book: most of what separates the families is which layer of data they can learn
          from. Robot trajectories are the smallest and most expensive layer, internet video the largest and least specific.
        </p>
        <figure data-wide className={own.wide}><DataPyramid /></figure>

        <h2 id="the-rust-lab">The Rust lab</h2>
        <p>
          Each chapter has a crate in <code>rust/chNN-…</code> with three exercises. Stubs are in <code>src/exercises.rs</code>; the tests in
          <code> tests/exercises.rs</code> fail until you implement them. Code shown on a page is read from the crate at build time, so
          what you read is what compiles. To check one exercise:
        </p>
        <pre className={own.cmd}><code>cargo test -p ch05-reactive-vla --test exercises ex5_1</code></pre>
        <p>
          To run every chapter against the reference solutions, enable each crate&rsquo;s <code>solutions</code> feature. You do not need
          to know Rust before starting; the exercises are small, and each comes with hints.
        </p>
        <p>
          Ready? <Link href={`/chapters/${CHAPTERS[0].slug}/`}>Start with chapter 1: {CHAPTERS[0].title}</Link>.
        </p>
      </div>
    </article>
  );
}
