#!/usr/bin/env python3
"""Maintain the reference collection in reference/.

  python3 tools/refs.py search "query words"            candidate arXiv papers (Hugging Face papers index)
  python3 tools/refs.py show 2604.15483 [...]           arXiv metadata and abstract, without adding anything
  python3 tools/refs.py add KEY ARXIV_ID FOLDER CITED   verify on arxiv.org, download the PDF, append to
                                                        references.csv / references.bib / README.md
  python3 tools/refs.py add-web KEY URL FOLDER CITED --title T --org O --date YYYY-MM-DD
                                                        archive a web page (PDF print + text) and append it
  python3 tools/refs.py check                           every listed file exists; every PDF opens

arXiv is contacted at most once every 3 seconds. Nothing is added unless the arXiv page exists and the PDF opens.
"""
import csv
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, "reference")
CSV = os.path.join(REF, "references.csv")
BIB = os.path.join(REF, "references.bib")
README = os.path.join(REF, "README.md")
UA = "Mozilla/5.0 (X11; Linux x86_64) reference-collector/1.0"
_last = [0.0]


def fetch(url, binary=False, gap=3.0):
    if "arxiv.org" in url:
        wait = gap - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def meta(page, name):
    return [html.unescape(m) for m in re.findall(r'<meta name="%s" content="(.*?)"\s*/?>' % re.escape(name), page, re.S)]


def arxiv_meta(aid):
    page = fetch(f"https://arxiv.org/abs/{aid}")
    title = re.sub(r"\s+", " ", (meta(page, "citation_title") or [""])[0]).strip()
    if not title:
        raise SystemExit(f"arXiv {aid}: no such paper")
    hist = re.search(r'<div class="submission-history">(.*?)</div>', page, re.S)
    versions = re.findall(r"\[(v\d+)\]\s*(\w{3}, \d+ \w{3} \d{4})", re.sub(r"<.*?>", "", hist.group(1)) if hist else "")
    jref = re.search(r'<td class="tablecell jref">(.*?)</td>', page, re.S)
    prim = re.search(r'<span class="primary-subject">(.*?)</span>', page, re.S)
    return {
        "title": title,
        "authors": meta(page, "citation_author"),
        "date": (meta(page, "citation_date") or [""])[0].replace("/", "-"),
        "version": versions[-1][0] if versions else "",
        "journal_ref": html.unescape(re.sub(r"<.*?>", "", jref.group(1))).strip() if jref else "",
        "primary": html.unescape(prim.group(1)).strip() if prim else "",
        "abstract": re.sub(r"\s+", " ", (meta(page, "citation_abstract") or [""])[0]).strip(),
    }


def clean_authors(authors):
    fix = {"Intelligence, Physical": "Physical Intelligence", "Wan, Team": "Team Wan"}
    a = [fix.get(x, x) for x in authors if x.strip() != ":"]
    out, i = [], 0
    while i < len(a):
        if (i + 1 < len(a) and "," not in a[i] and "," not in a[i + 1] and " " not in a[i] and " " not in a[i + 1]
                and not any(w in a[i] + a[i + 1] for w in ("Team", "NVIDIA", "Collaboration"))):
            out.append(f"{a[i + 1]}, {a[i]}")
            i += 2
        else:
            out.append(a[i])
            i += 1
    return out


def plain(t):
    for x, y in [("${\\pi}_{0.7}$", "π0.7"), ("$\\pi_{0.5}$", "π0.5"), ("$\\pi^{*}_{0.6}$", "π*0.6"), ("$\\pi_0$", "π0")]:
        t = t.replace(x, y)
    return t


def pdf_pages(path):
    out = subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout
    m = re.search(r"Pages:\s+(\d+)", out)
    return int(m.group(1)) if m else 0


def rows():
    with open(CSV, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def append_row(row):
    existing = rows()
    if any(r["key"] == row["key"] for r in existing):
        raise SystemExit(f"key {row['key']} already in references.csv")
    if row.get("arxiv") and any(r["arxiv"] == row["arxiv"] for r in existing):
        raise SystemExit(f"arXiv {row['arxiv']} already listed as {next(r['key'] for r in existing if r['arxiv'] == row['arxiv'])}")
    with open(CSV, newline="", encoding="utf-8") as f:
        header = next(csv.reader(f))
    with open(CSV, "a", newline="", encoding="utf-8") as f:
        csv.DictWriter(f, fieldnames=header, extrasaction="ignore").writerow(row)


def tex(s):
    return re.sub(r"(?<!\\)([&%#])", r"\\\1", s)


def append_bib(entry):
    with open(BIB, "a", encoding="utf-8") as f:
        f.write("\n" + entry + "\n")


def append_readme(line):
    s = open(README, encoding="utf-8").read()
    head = "## Added while writing the web book"
    if head not in s:
        s = s.rstrip() + f"\n\n{head}\n\nVerified on arxiv.org or archived from the web when first cited by a web-book chapter.\n\n| Reference | Source | Date | Cited in | Files |\n|---|---|---|---|---|\n"
    s = s.rstrip() + "\n" + line + "\n"
    open(README, "w", encoding="utf-8").write(s)


def cmd_search(q):
    url = "https://huggingface.co/api/papers/search?q=" + urllib.parse.quote(q)
    for it in json.loads(fetch(url))[:8]:
        p = it.get("paper", {})
        print(f"{p.get('id')}  {(p.get('publishedAt') or '')[:10]}  {p.get('title', '').strip()}")


def cmd_show(ids):
    for aid in ids:
        m = arxiv_meta(aid)
        a = clean_authors(m["authors"])
        print(f"## {aid} {m['version']} | {plain(m['title'])} | {a[0] if a else ''}{' et al.' if len(a) > 1 else ''} | {m['date']} | {m['journal_ref']}")
        print(m["abstract"])
        print()


def cmd_add(key, aid, folder, cited, note=""):
    m = arxiv_meta(aid)
    authors = clean_authors(m["authors"])
    d = os.path.join(REF, folder)
    os.makedirs(d, exist_ok=True)
    rel = f"{folder}/{key}_{aid}.pdf"
    path = os.path.join(REF, rel)
    if not os.path.exists(path):
        data = fetch(f"https://arxiv.org/pdf/{aid}", binary=True)
        if not data.startswith(b"%PDF"):
            raise SystemExit(f"arXiv {aid}: download is not a PDF")
        open(path, "wb").write(data)
    pages = pdf_pages(path)
    if not pages:
        os.remove(path)
        raise SystemExit(f"arXiv {aid}: PDF does not open")
    first = authors[0].split(",")[0] + (" et al." if len(authors) > 1 else "") if authors else ""
    append_row({"key": key, "folder": folder, "book_name": plain(m["title"]), "title": plain(m["title"]),
                "first_author": first, "authors": "; ".join(authors), "date": m["date"], "arxiv": aid,
                "arxiv_version": m["version"], "journal_ref": m["journal_ref"], "url": f"https://arxiv.org/abs/{aid}",
                "files": rel, "pages": pages, "cited_in": cited, "book_tag": "added: web book",
                "id_source": "resolved in this pass", "notes": note})
    pc = re.search(r"\((cs\.\w+|eess\.\w+|stat\.\w+)\)", m["primary"])
    bib = [f"@misc{{{key},", f"  title         = {{{{{tex(m['title'])}}}}},",
           f"  author        = {{{' and '.join(a if ',' in a else '{' + a + '}' for a in authors)}}},",
           f"  year          = {{{m['date'][:4]}}},", f"  eprint        = {{{aid}}},", "  archivePrefix = {arXiv},"]
    if pc:
        bib.append(f"  primaryClass  = {{{pc.group(1)}}},")
    bib.append(f"  url           = {{https://arxiv.org/abs/{aid}}}")
    append_bib("\n".join(bib) + "\n}")
    append_readme(f"| **{plain(m['title'])}** | [arXiv {aid}](https://arxiv.org/abs/{aid}) {m['version']} | {m['date']} | {cited} | [paper (pdf)]({rel}) |")
    print(f"added {key}: {plain(m['title'])} ({m['date']}, {pages} pages)")


def _chrome(args, timeout=120):
    prof = tempfile.mkdtemp(prefix="chrome-")
    try:
        return subprocess.run(["google-chrome", "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={prof}",
                               "--autoplay-policy=user-gesture-required", "--virtual-time-budget=15000",
                               f"--user-agent={UA.replace('reference-collector/1.0', 'Chrome/140.0')}"] + args,
                              capture_output=True, timeout=timeout)
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def html_text(dom):
    dom = re.sub(r"(?is)<(script|style|noscript|svg|nav|footer|header)\b.*?</\1>", " ", dom)
    dom = re.sub(r"(?i)<br\s*/?>|</(p|div|h\d|li|tr|section|article)>", "\n", dom)
    txt = html.unescape(re.sub(r"<[^>]+>", " ", dom))
    lines = [re.sub(r"[ \t]+", " ", l).strip() for l in txt.split("\n")]
    return "\n\n".join(l for l in lines if len(l) > 1)


def cmd_add_web(key, url, folder, cited, title, org, date, note=""):
    d = os.path.join(REF, folder)
    os.makedirs(d, exist_ok=True)
    base = os.path.join(d, key)
    dom = _chrome(["--dump-dom", url]).stdout.decode("utf-8", "replace")
    text = html_text(dom)
    if len(text.split()) < 80:
        raise SystemExit(f"{url}: page text too short ({len(text.split())} words), not archived")
    open(base + ".md", "w", encoding="utf-8").write(
        f"# {title}\n\n- Source: {url}\n- Publisher: {org}\n- Published: {date}\n- Archived: {time.strftime('%Y-%m-%d')} (text extracted from the rendered page)\n\n---\n\n{text}\n")
    _chrome(["--no-pdf-header-footer", f"--print-to-pdf={base}.pdf", url], timeout=180)
    files = [f"{folder}/{key}.md"] + ([f"{folder}/{key}.pdf"] if os.path.exists(base + ".pdf") and pdf_pages(base + ".pdf") else [])
    append_row({"key": key, "folder": folder, "book_name": title, "title": title, "first_author": org, "authors": org,
                "date": date, "url": url, "web_links": url, "files": " | ".join(files), "cited_in": cited,
                "book_tag": "added: web book", "id_source": "web source", "notes": note})
    append_bib(f"@misc{{{key},\n  title        = {{{{{tex(title)}}}}},\n  author       = {{{{{tex(org)}}}}},\n  year         = {{{date[:4]}}},\n  howpublished = {{\\url{{{url}}}}},\n  note         = {{Accessed {time.strftime('%Y-%m-%d')}}}\n}}")
    host = urllib.parse.urlparse(url).netloc.replace("www.", "")
    append_readme(f"| **{title}** | [{host}]({url}) | {date} | {cited} | " + "<br>".join(f"[{os.path.basename(f).rsplit('.', 1)[1]}]({f})" for f in files) + " |")
    print(f"added {key}: {title} ({len(text.split())} words)")


def cmd_check():
    bad = 0
    for r in rows():
        for f in [x for x in r["files"].split(" | ") if x]:
            p = os.path.join(REF, f)
            if not os.path.exists(p) or (p.endswith(".pdf") and not pdf_pages(p)):
                print("MISSING/BROKEN", r["key"], f)
                bad += 1
    print(f"{len(rows())} references, {bad} problems")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
    elif a[0] == "search":
        cmd_search(" ".join(a[1:]))
    elif a[0] == "show":
        cmd_show(a[1:])
    elif a[0] == "add":
        cmd_add(a[1], a[2], a[3], a[4], *(a[5:6]))
    elif a[0] == "add-web":
        opts = dict(zip(a[5::2], a[6::2]))
        cmd_add_web(a[1], a[2], a[3], a[4], opts["--title"], opts["--org"], opts["--date"], opts.get("--note", ""))
    elif a[0] == "check":
        cmd_check()
    else:
        print(__doc__)
