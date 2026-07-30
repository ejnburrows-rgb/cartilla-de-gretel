# Ilustraciones que faltan

The single list of every illustration the app expects and does not have. This
replaces `docs/MISSING_ASSETS.md` and `docs/ART_BACKLOG.md` as the thing to work
from — both are kept as history, and neither should be used as a to-do list
again (why, at the bottom).

Derived from the code on 2026-07-29, not copied from either document: every
region in `src/data/page-layouts.json` was walked, checked against the files
actually present under `public/cartilla/art/faithful/`, and cross-referenced
with `qa-results.json`. Anyone can re-run that check and get the same list.

**The whole gap is 6 words across 16 cells.** All 24 lessons are otherwise fully
illustrated, and **no illustration path in the app points at a missing file** —
there are zero broken image references.

---

## The list

Every one of these six already has a file on disk at the path shown, and every
one of those files **failed visual QA** for the reason given. The files were
deliberately unwired from `page-layouts.json` so the app shows its honest
"ilustración pendiente" placeholder instead of bad art. So the work is: put a
crop that passes QA at that exact path, then wire it into the cells listed.

| Word | Cells | Lessons | Exact file path expected | Why it is not usable today |
|---|---|---|---|---|
| **abeja** | 7 | 1, 3, 4, 5, 6 | `public/cartilla/art/faithful/vocal-a/abeja.webp` | Monochrome gold/ochre tint, no real multi-color paint (should be a yellow/black bee) |
| **aguja** | 3 | 3, 4 | `public/cartilla/art/faithful/vocal-a/aguja.webp` | Near-blank; essentially uncolored line art, no fill |
| **abrigo** | 2 | 1, 4 | `public/cartilla/art/faithful/leccion-1/abrigo.webp` | Unrecognizable abstract color smear, wrong/no content |
| **remolino** | 2 | 1, 3 | `public/cartilla/art/faithful/leccion-1/remolino.webp` | Incomplete crop: swirl cut off at the edge, plus a stray unrelated green fragment |
| **globo** | 1 | 1 | `public/cartilla/art/faithful/leccion-1/globo.webp` | Paint bleed: a stray red line runs edge-to-edge across the top, not part of the balloon |
| **oruga** | 1 | 3 | `public/cartilla/art/faithful/vocal-o/oruga.webp` | Monochrome sage/gray tone, undercolored |

A second, rejected `abeja` file also exists at
`public/cartilla/art/faithful/leccion-1/abeja_wb.webp` (blank white image, no
content). It is not wired anywhere and is not a second slot to fill — `abeja`
needs one crop, at the `vocal-a` path above.

### Where each cell is

Each row below is one placeholder a child sees today. Page numbers are the
book's own page numbers, as keyed in `src/data/page-layouts.json`.

**abeja** — 7 cells
- Lección 1 — Introducción de las vocales · page 1 · `p1-grid` (picture-grid)
- Lección 3 — Vocal A a · page 7 · `p7-grid` (picture-grid)
- Lección 3 — Vocal A a · page 8 · `p8-match` (vowel-line-match)
- Lección 4 — Vocal E e · page 10 · `p10-grid` (picture-grid)
- Lección 4 — Vocal E e · page 11 · `p11-match` (vowel-line-match)
- Lección 5 — Vocal I i · page 14 · `p14-match` (vowel-line-match)
- Lección 6 — Vocal U u · page 16 · `p16-grid` (picture-grid)

**aguja** — 3 cells
- Lección 3 — Vocal A a · page 7 · `p7-grid` (picture-grid)
- Lección 3 — Vocal A a · page 8 · `p8-match` (vowel-line-match)
- Lección 4 — Vocal E e · page 10 · `p10-grid` (picture-grid)

**abrigo** — 2 cells
- Lección 1 — Introducción de las vocales · page 1 · `p1-grid` (picture-grid)
- Lección 4 — Vocal E e · page 11 · `p11-match` (vowel-line-match)

**remolino** — 2 cells
- Lección 1 — Introducción de las vocales · page 1 · `p1-grid` (picture-grid)
- Lección 3 — Vocal A a · page 8 · `p8-match` (vowel-line-match)

**globo** — 1 cell
- Lección 1 — Introducción de las vocales · page 2 · `p2-rows` (vowel-pick-one)

**oruga** — 1 cell
- Lección 3 — Vocal A a · page 7 · `p7-grid` (picture-grid)

### One thing to know before starting

`docs/ART_BACKLOG.md` records (2026-07-25) that all 62 pages of the teacher
flipchart were searched and **none of these six words appears as a labeled vocab
cell on any of them**. The vowel vocab pages carry a different word set. So a
faithful crop for these six may not exist in the scanned sources at all, and
that is the owner's call to make — not something to solve by drawing something
new. Recorded here so nobody re-runs that search believing it was never done.

---

## Separately: one illustration that is wired and is failing QA

Not a missing image, but the same kind of problem and it is live right now:

- `public/cartilla/art/faithful/vocal-i/iglu.webp` — QA verdict **FAIL**
  ("essentially uncolored/grayscale line art, minimal color saturation"), and it
  **is** wired into `page-layouts.json`, rendering on pages 4, 5, 8, 10, 13 and
  14 (lessons 2, 3, 4 and 5).

This is not stale QA: the file was last changed 2026‑07‑20 and the QA run is
dated 2026‑07‑25, so the current file is what was judged. Its manifest entry is
marked `FIXED-2026-WRONG-PAGE` — the re-crop fixed the *wrong source page* but
the result still did not pass on color. Flagged, not changed.

Across the whole set, QA stands at **122 PASS / 59 FAIL of 181**. The other 58
failures are already unwired and show the placeholder, which is why they are not
in the list above — the list is what the app expects and lacks, not every file
that ever failed.

---

## Why the two old documents disagreed

Both are kept as history. Neither is a reliable to-do list, for different
reasons:

- **`docs/MISSING_ASSETS.md` is an incident log, not a backlog.** It records
  what was wrong and what was fixed on given dates. Every item in it is closed.
  Read as a to-do list it is misleading, because its longest sections describe
  problems that no longer exist.

- **`docs/ART_BACKLOG.md` (869 lines) is a stack of dated corrections, newest
  first, where later entries reverse earlier ones.** It contains sections titled
  "FULL AUDIT COMPLETE" and "fully closed out" that later sections explicitly
  retract. Its most recent entry is the accurate one; the 800 lines beneath it
  are superseded but are not marked as such at the point of reading.

Two concrete contradictions this reconciliation settles:

1. **"18 cells across 7 distinct words" (ART_BACKLOG, 2026-07-25) is 2 cells
   too high.** That count includes `escoba` (2 cells) — and the same entry
   reports `escoba` as FIXED, re-cropped and wired. It is on disk, QA PASS, and
   wired today. The correct figure is **16 cells across 6 words**.

2. **The reason given for discounting ~480 cells is wrong, though the
   conclusion is right.** ART_BACKLOG says the `syllable-match` cells can be
   ignored because "their schema has no `illustrationSrc` field at all". The
   field does exist and is populated on some of them — for example `mamá` on
   page 20 carries `/cartilla/art/faithful/leccion-7-m/mama.webp`. The real
   reason they are not a gap is the renderer: `SyllableMatch`
   (`src/components/cartilla/FaithfulPageRenderer.tsx:162`) draws only
   `entry.word` as text, and the interactive variant falls back to the word as
   text when there is no image (`src/cartilla/interactions/LassoConnect.tsx:681`).
   Neither ever shows an "ilustración pendiente" placeholder. `fill-in-blank`
   behaves the same way. So those cells are text exercises and need no art —
   which is what the old document concluded, by the wrong route.

A naive count of every caption in `page-layouts.json` gives 396 "missing"
cells. Restricting it to the region types whose renderer actually draws an
image — `picture-grid`, `vowel-line-match`, `vowel-pick-one`, `vowel-match-all`,
`illustration-slot`, `paint-box` — gives the real 16.
