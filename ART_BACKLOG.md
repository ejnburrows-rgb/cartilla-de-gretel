# Art backlog — current, authoritative

This is the real, current list of illustration art still needed. It is kept
in git (not chat) specifically so it never goes stale the moment `main`
moves — read this file fresh every time, don't rely on an earlier chat
message. Last verified: July 2026, against `src/data/page-layouts.json` and
`public/cartilla/art/faithful/manifest.json` on `main`.

## Update — first 6 confirmed done
`aguja`, `anillo`, `manzana`, `pera`, `taza`, `uniforme` were delivered on
`art/final-6-words` and checked directly (not just taken on report) — all
6 are genuinely clean, tight crops with no neighbor bleed. These are done;
don't redo them.

## Update — the last word is closed out
`uña` was delivered and verified directly (a genuine, tight fingernail
crop) — merged. `urna` was first delivered as a duplicate of the `uña`
file mislabeled — rejected, not merged. Antigravity then reported `urna`
doesn't actually appear anywhere in the book (a hallucinated word, same
category as arco/pez/traje/águila below) and removed it. That claim is
**not independently verified against the physical scan** — taken on
report, same caveat as the other "doesn't exist" words. If it later turns
up in a real page, add it back here.

**Vocabulary games note**: the student-facing games (word matching, etc.)
still use emoji pictures for their 18 other words even though real crops
for those already exist in the manifest — that's an app-side wiring task
(Claude's side), not an art-extraction task. Nothing further needed from
Antigravity on vocabulary art right now.

**Crop rule**: crop tight to just the illustration itself. If a neighboring
cell's label or drawing is bleeding into the frame, the crop boundary is
wrong — move it in, don't just accept the bleed. When in doubt, crop
tighter rather than looser.

## Confirmed NOT to exist in the source material — do not attempt
arco, pez, traje, águila, urna — these words appear in the app's content
but have no corresponding illustration anywhere in the physical book's
scans (per Antigravity's own report — not independently re-verified by
Claude against the physical pages). Leave their cells showing "art
pending" — that's correct, not a gap to fill.

## Current status: no open art-extraction work
Every word Claude currently needs has a real crop wired in. Don't start
new crops without a fresh entry appearing in this file first.

## Already done — do not re-deliver
Every other word currently wired in `public/cartilla/art/faithful/manifest.json`
(44 entries as of this writing) is already solved and shipped. If you're
about to crop a word, check the manifest first — if it's already there with
a real `src`, it's done.

## Where files go
`public/cartilla/art/faithful/<folder>/<slug>.webp` — reuse the existing
per-lesson/per-vowel folders already in the manifest
(`leccion-1/`, `vocal-a/`, `vocal-e/`, `vocal-i/`, `vocal-o/`, `vocal-u/`).
Do not create a new flat folder (e.g. `vocales/`) — it breaks the lookup
convention every other tool in this repo expects.

Add a manifest entry for each new/fixed file:
```json
{ "slug": "aguja", "word": "aguja", "lessonNumber": null, "pageNumber": null,
  "src": "/cartilla/art/faithful/vocal-a/aguja.webp",
  "sourceFlipchartPage": null, "cropBox": null }
```

## How to submit
Push to a fresh branch off current `main`, open a PR against this repo.
Do not touch `src/data/page-layouts.json` — that's owned by Claude, who
wires `illustrationSrc` in once your PR lands.
