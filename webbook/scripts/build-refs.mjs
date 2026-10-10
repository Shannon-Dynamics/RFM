// Build lib/generated/refs.json from the reference collection (../reference/references.csv).
// Every <Cite k="..."/> in the book resolves against this file; unknown keys fail the build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.resolve(here, "../../reference/references.csv");
const outPath = path.resolve(here, "../lib/generated/refs.json");

/** RFC 4180 CSV: quoted fields may contain commas, quotes ("") and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

const [header, ...body] = parseCsv(fs.readFileSync(csvPath, "utf8"));
const refs = {};
for (const cells of body) {
  const r = Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
  const authors = r.authors ? r.authors.split("; ") : [];
  refs[r.key] = {
    key: r.key,
    title: r.title || r.book_name,
    bookName: r.book_name,
    authors,
    firstAuthor: r.first_author,
    date: r.date,
    year: (r.date || "").slice(0, 4),
    arxiv: r.arxiv || null,
    version: r.arxiv_version || null,
    venue: r.journal_ref || null,
    url: r.url,
    kind: r.arxiv ? "paper" : "web",
  };
}
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(refs, null, 1));
console.log(`refs: ${Object.keys(refs).length} references -> ${path.relative(process.cwd(), outPath)}`);
