# Robot Foundation Models: A Field Handbook (web book)

Next.js 15 + MDX, statically exported. Chapter text lives in `content/chapters/*.mdx`; the table of contents
and chapter metadata in `content/book.ts`; interactive figures in `components/viz/`.

```bash
npm install
npm run dev        # http://localhost:3000 (regenerates lib/generated/refs.json first)
npm run build      # static site in out/; fails on type errors, lint errors or an unknown citation key
```

Node 18.19 is enough (Next 16 would need Node 20).

## Layout and brand

The site follows the Shannon Dynamics library (prvr.shannon.id/chapters):

- `components/shell/SiteNav.tsx`: the fixed graphite bar with the Shannon logo (`public/shannon/`, linking to
  shannon.id) and the Overview, Chapters and Sources pills. On the overview it stays transparent over the banner
  until you scroll.
- `components/shell/DocsShell.tsx`, the layout for `/chapters/` and `/sources/`, has three parts:
  - `Sidebar.tsx`: the book title, a chapter search focused with Ctrl/Cmd+K, chapters grouped by part, and the theme switch;
  - the article column;
  - `Toc.tsx`: the "On this page" list.

  The sidebar collapses, and below 1024px it becomes a drawer. The TOC shows from 1360px; below that, its width goes to the figures.
- `app/page.tsx` is the overview: a halftone banner (`Halftone.tsx`), a live look-ahead planner, the method
  cards, the family grid and the contents, then the Shannon footer (`SiteFooter.tsx`).
- Tokens are in `app/globals.css`. They cover the Shannon graphite and blue accent, Inter and JetBrains Mono, and light and dark values (`data-theme` on `<html>`, stored as `rfm-theme`). Figures read colours only through these tokens. The family colours are unchanged, and colour in a figure still means family only.
- Figures are drawn for an article column of about 640 to 860px. SVG label widths use `textWidth()` in
  `lib/layout.ts`, which is tuned to Inter. Markdown tables scroll inside their own box on narrow screens.

## How a chapter is put together

- `<Cite k="key" />` resolves against `../reference/references.csv`. Add a source to the reference
  collection before citing it; an unknown key stops the build.
- `<RustSnippet file="chNN-.../src/x.rs" region="name" />` reads code between `// region: name` and
  `// endregion: name` from `../rust`, so every snippet shown is code that compiles and is tested.
- `<Exercise>` points at tests in the chapter crate: `cargo test -p <crate> --test exercises <name>`.
- `<Quote>` needs `who`, `role`, `source`, `href` and `date`; quotes are verbatim only.
- `<Figure>` takes a takeaway, a factual caption and a source; mark `schematic` or `toy` where it applies.
- To add a chapter: write `content/chapters/NN-slug.mdx`, register it in `content/chapters/index.ts`,
  and set its `status` to `"written"` in `content/book.ts`.

## Status

All nineteen chapters of Book.md section 4 are written (October 2026). Each has an opening figure, a verbatim
sourced quote, two to five interactive figures, inline citations, a "What we are not sure about" section and a
Rust crate in `../rust/chNN-*` with three exercises. Run every crate's tests against the reference solutions with:

```bash
cd ../rust
cargo test --workspace --features "$(ls -d ch*/ | tr -d / | sed 's/$/\/solutions/' | paste -sd, -)"
```

Without the features the exercise tests fail on `todo!()` by design; the model tests still pass.

Simulations: `?autorun` (or `?autorun=reactive|imagine|distilled`) on the Chapter 6 page starts figure 6.3 on load.
