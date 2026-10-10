# Web book: design

Date: 26 September 2026. Status: approved ("okay do it"), pilot in progress.

## Goal

Turn the Book.md structure (19 chapters in four parts, plus appendices) into an interactive web book in a
"dashboard and simulation" style. Each chapter has: an overview, a verbatim sourced quote from a leading
robotics researcher, Rust code snippets, coding exercises, intuitive diagrams, and at least one animation or
simulation for its hardest idea. Chapters are written from the papers in `reference/`, updated to September
2026, and cite them inline by arXiv ID (the Book.md convention) with a reference list per chapter.

## Decisions

| Topic | Decision |
|---|---|
| Book structure | Book.md section 4 (chapter briefs, figure register, conventions in section 6) |
| Sequencing | Build the site and one pilot chapter first; the other 18 follow the approved template |
| Pilot chapter | Chapter 6, World-action models |
| Quotes | Verbatim only, with source link and date; checked against the source text; never invented or paraphrased |
| Framework | Next.js 15 App Router + MDX, hand-built book chrome, static export (Node 18.19 rules out Next 16) |
| Charts | Nivo for charts; simulations and animations hand-written as SVG React client components (requestAnimationFrame, CSS transitions) |
| Rust | Cargo workspace in `rust/`; every snippet shown in the book is read from a file that compiles; exercises have tests |
| Styling | CSS Modules + CSS custom-property tokens; light and dark; honours `prefers-reduced-motion` |
| Figure numbers | In order of appearance within each chapter (Book.md's figure register is the planning list, not the final numbering) |
| Family colours | Seven categorical slots validated for CVD separation in both themes; colour means family and nothing else |

## Layout

```
webbook/                       Next.js app
  content/chapters/NN-*.mdx    chapter text with embedded components
  content/book.ts              table of contents, parts, chapter briefs, family colours
  components/                  BookShell, ChapterDashboard, Quote, RustSnippet, Exercise, Figure, Callout, Cite, sims/*, charts/*
  scripts/build-refs.mjs       reference/references.csv + references-extra.json -> generated JSON
rust/                          Cargo workspace, one crate per chapter (ch06-world-action, ...)
  chNN-*/src/lib.rs            snippet source; regions marked `// region: name` ... `// endregion`
  chNN-*/src/exercises.rs      stubs the reader fills in
  chNN-*/src/solutions.rs      reference solutions (feature `solutions`)
  chNN-*/tests/                exercise tests
```

## Conventions carried over from Book.md section 6

- Inline citations by arXiv ID; unknown citation keys fail the build.
- Vendor numbers carry a "vendor claim" tag; industry-survey numbers an "industry survey" tag.
- Every figure: one-sentence takeaway caption, factual caption, source and date for any number shown.
- Schematic (not measured) charts and toy simulations say so in their caption.
- Every chapter ends with "What we are not sure about"; every chapter shows its last-checked date.
- No em-dashes in book text.

## Checks before a chapter counts as done

1. `npm run build` (static export) succeeds with no type errors.
2. Every `<Cite>` key resolves; every quote has a source URL and date, and its text matches the source.
3. `cargo test --features solutions` passes for the chapter crate; the plain `cargo test` fails only on the unsolved exercise stubs.
4. Headless-Chrome screenshots of the chapter page (light and dark) are reviewed for layout.
