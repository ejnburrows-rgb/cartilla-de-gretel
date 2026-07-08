# SPEC.md — Cartilla de Gretel eLearning CRM Conversion

Status audit as of this document's creation. Every number below was computed
directly from the real JSON data files in this repo (`src/data/page-layouts.json`,
`src/content/consonants.json`, `src/content/lessons.json`,
`public/cartilla/art/faithful/manifest.json`) — not estimated, not taken from
memory. Where an earlier automated pass produced a different number, it was
re-verified by hand and corrected here (see "Corrections" below).

## Update — teacher "presentar" (present) mode was showing the wrong product

Per the memorized canon (student workbook vs teacher flipchart are never
mixed): `presentar.$n.tsx` (the teacher's classroom-presentation mode) was
rendering `TeacherFlipChart.tsx`, which pulls from `FaithfulPageRenderer` —
i.e. it was showing **reconstructed student workbook pages**, not the real
teacher flipchart. Fixed: `presentar.$n.tsx` now renders `FlipchartHdPanel`,
which sources from `teacher-flipchart.json` / `public/cartilla/art/hd/flipchart/`
— the actual flipchart scans. `TeacherFlipChart.tsx` is deleted (it had no
other consumers, confirmed by repo-wide search before deletion). Its 3-D
`rotateX`/`perspective` flip animation is also gone — `FlipchartHdPanel` now
uses a plain cross-fade, making it the genuinely "simplest static HD viewer"
for teacher presentation, matching the file's own header comment ("No...
3-D effects") which had been contradicted by its actual implementation
until now.

**New defect found while fixing this, NOT fixed (flagged only):** every
source JPG in `public/cartilla/art/hd/flipchart/` (all 62 files, verified
across lessons 1, 2, 7, 24) displays with wrong orientation — illustrations
and text both read wrong. A CSS `rotate(180deg)` was tried as a display-layer
stopgap: it visually straightened the illustrations, but the word-label text
came out with reversed letter *order* ("oibni" instead of "indio") rather
than a clean upside-down flip — meaning the real defect isn't a simple 180°
rotation, and guessing further at a transform risks a "fix" that looks
plausible on a couple of samples but is subtly wrong elsewhere. **The CSS
workaround was reverted, not shipped.** This needs someone to open the
actual source JPGs and determine the real transform needed (or re-export
them correctly) — an art-pipeline task, not a UI task.

## Flagged discrepancies — read before acting on the mission brief

1. **Page count: 90, not 92.** `src/data/page-inventory.json` tracks 90 total
   student workbook pages across 24 lessons. No 92nd/91st page exists
   anywhere in the repo's data. If you have a physical count of 92, the
   missing 2 pages need to be identified from the source scans — tell me
   which page numbers and I'll transcribe them.
2. **`TeacherFlipbook.tsx` does not exist.** No file by that name is in the
   repo. The real teacher flipchart/scan-viewing components are:
   `TeacherFlipChart.tsx`, `FlipchartHdPanel.tsx`, `InteractiveFlipchartOverlay.tsx`
   (all in `src/components/cartilla/`). Tell me which of these — or all three
   — you mean to keep as the reference-only projection viewer before I
   delete anything under that name.
3. **Corrections to an earlier automated pass**: an initial audit reported
   "772 illustration slots, 285 filled (36.9%)" — this was wrong (it appears
   to have counted all `caption`/text fields, not actual illustration
   slots). Direct recount: **155 real illustration slots, 138 filled (89%)**.
   Trust the numbers in this document; they were computed twice with two
   independently-written scripts that now agree.

## Sources of truth used for this audit
- `src/data/page-layouts.json` — per-page extracted text + region data (90/90 pages present)
- `src/data/page-inventory.json` — lesson→page mapping, workbook + flipchart
- `src/content/consonants.json` — consonant lesson vocab + `illustrationSrc`
- `src/content/lessons.json` — vowel lesson vocab + `illustrationSrc`
- `public/cartilla/art/faithful/manifest.json` — illustration crop registry (107 entries)
- `src/content/guides/lesson-*.tsx` — teacher guide content (24 files)
- `src/data/teacher-flipchart.json` + `public/cartilla/art/hd/flipchart/` — 62 real scanned flipchart pages

## STATUS COUNTS (the numbers you asked for)

### Student side (90 pages, 24 lessons)
| Metric | Count |
|---|---|
| Pages with real extracted text | **90 / 90 (100%)** |
| Illustration slots, real art | **138 / 155 (89%)** |
| Illustration slots, still pending | **17 / 155 (11%)** |
| Lessons with illustration-slot pages at all | 6 of 24 (Lección 1 + all 5 vowels — this matches the real book's structure; consonant lesson pages don't have picture-grid exercises in the printed book) |
| Consonant-lesson vocab card art (separate UI feature, not a printed-page element) | 29 / 72 (40%) |
| Vowel-lesson vocab card art | 19 / 20 (95%) |
| Manifest crop entries with full source provenance (traceable to a scan) | 58 / 107 (54%) |
| Manifest crop entries with NO recorded provenance | 49 / 107 (46%) — asset exists, but "traceable to source scan" (your Definition-of-Done requirement) is not yet true for these |

### Teacher side (24 lessons, ~62 flipchart pages)
| Metric | Count |
|---|---|
| Lessons with a fully real guide (objectives + procedure + vocab + poem + assessment) | **1 / 24** (Lección 1 only) |
| Lessons with partial guide (objectives + procedure real; vocab/poem/assessment stub) | 18 / 24 |
| Lessons with 100% stub guide (no real content at all) | 5 / 24 (V, R, rr, G, F) |
| Lessons with a real, populated vocabulary list in the guide | **0 / 24** |
| Lessons with a real assessment script in the guide | **0 / 24** |
| Flipchart scan pages (real, correctly mapped, safe to keep as reference) | 62 / 62 |
| `teacher-guide.json` (intended structured schema) | Empty, unused — dead scaffolding |

## Per-lesson table — student side

| L | Lesson | Pages | Text | Illustration slots | Vocab card art | Status |
|---|---|---|---|---|---|---|
| 1 | Introducción vocales | 1-3 | 3/3 | 33/35 (94%) | n/a | MOSTLY DONE |
| 2 | Vocal O | 4-6 | 3/3 | 22/24 (92%) | 4/4 | MOSTLY DONE |
| 3 | Vocal A | 7-9 | 3/3 | 23/24 (96%) | 4/4 | MOSTLY DONE |
| 4 | Vocal E | 10-12 | 3/3 | 22/24 (92%) | 4/4 | MOSTLY DONE |
| 5 | Vocal I | 13-15 | 3/3 | 21/24 (88%) | 4/4 | MOSTLY DONE |
| 6 | Vocal U | 16-18 | 3/3 | 17/24 (71%) | 3/4 | MOSTLY DONE |
| 7 | Consonante M | 19-22 | 4/4 | n/a (no picture-grid on these pages) | 2/4 | TEXT DONE, vocab art PARTIAL |
| 8 | Consonante P | 23-26 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 9 | Consonante S | 27-30 | 4/4 | n/a | 2/4 | TEXT DONE, vocab art PARTIAL |
| 10 | Consonante T | 31-34 | 4/4 | n/a | 0/4 | TEXT DONE, vocab art MISSING |
| 11 | Consonante D | 35-38 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 12 | Consonante L | 39-42 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 13 | Consonante N | 43-46 | 4/4 | n/a | 0/4 | TEXT DONE, vocab art MISSING |
| 14 | Consonante Ñ | 47-50 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 15 | Consonante B | 51-54 | 4/4 | n/a | 2/4 | TEXT DONE, vocab art PARTIAL |
| 16 | Consonante V | 55-58 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 17 | Consonante R | 59-62 | 4/4 | n/a | 4/4 | DONE |
| 18 | Consonante rr | 63-66 | 4/4 | n/a | 4/4 | DONE |
| 19 | Consonante G | 67-70 | 4/4 | n/a | 4/4 | DONE |
| 20 | Consonante F | 71-74 | 4/4 | n/a | 4/4 | DONE |
| 21 | Consonante J | 75-78 | 4/4 | n/a | 0/4 | TEXT DONE, vocab art MISSING |
| 22 | Consonante C | 79-82 | 4/4 | n/a | 1/4 | TEXT DONE, vocab art PARTIAL |
| 23 | Consonante Y | 83-86 | 4/4 | n/a | 0/4 | TEXT DONE, vocab art MISSING |
| 24 | Consonante Z | 87-90 | 4/4 | n/a | 0/4 | TEXT DONE, vocab art MISSING |

## Per-lesson table — teacher guide side

| L | Objectives | Procedure | Vocab/Poem | Assessment | Overall |
|---|---|---|---|---|---|
| 1 | Real | Real | Real | Real | **DONE** |
| 2-15 | Real | Real | Stub | Stub | PARTIAL |
| 16-20 (V,R,rr,G,F) | Stub | Stub | Stub | Stub | **MISSING** |
| 21-24 (J,C,Y,Z) | Real (terse) | Real (terse) | Stub | Stub | PARTIAL |

## Interaction-type coverage (against the brief's "drag-and-drop, fill-in-blank, matching, tracing" requirement)

| Interaction | Component exists | Interactive (tap/drag-to-grade) | Real tracing mechanic |
|---|---|---|---|
| picture-grid (tap to circle) | Yes | Yes | n/a |
| vowel-line-match (match/connect) | Yes | Yes | n/a |
| vowel-pick-one | Yes | Yes | n/a |
| vowel-match-all | Yes | Yes | n/a |
| syllable-match | Yes | Yes | n/a |
| fill-in-blank | Yes | Yes | n/a |
| **writing-line / tracing** | Yes (visual only) | **No** | **No — this is currently just a static line/box, no drag/stroke tracing mechanic exists anywhere in the app** |
| draw-box | Yes (visual only) | No | No |

**This is the single biggest functional gap against your brief**: real tracing
(a child dragging their finger/stylus to trace a letter) does not exist yet
anywhere in the codebase. Every other required interaction type (drag-and-drop
matching, fill-in-blank, tap-to-select) is already built and working.

## What Phase 2 actually needs, in priority order

1. **Real tracing mechanic** — the one interaction type with zero
   implementation. Needs a canvas/SVG stroke-tracking component.
2. **17 remaining vowel/intro illustration slots** + **43 remaining consonant
   vocab-card illustrations** — art-extraction work, same pipeline already
   proven this session (Antigravity crops, I verify + wire).
3. **49 manifest entries missing crop provenance** — either backfill the
   `cropBox`/`sourceFlipchartPage` metadata from the real source scans, or
   accept these as "verified by eye, provenance metadata incomplete" — your
   call, since the images themselves may be fine even without the metadata.
4. **23 of 24 teacher guides need real vocab lists + assessment scripts**
   written (only Lección 1 has them); **5 guides (V,R,rr,G,F) need
   everything** written from scratch.
5. **The two-file deletion + module-flow rebuild** (`StudentWorkbookFlip.tsx`,
   and whichever teacher flip component you confirm) — this is the biggest
   single architecture change: replacing the current page-based rendering
   with the 3-step (Learn → Practice → Exercises) native module flow for
   `leccion.$n.tsx`. Recommend piloting on Lección 1 only first, matching
   the "pilot before batch" discipline already used successfully for the
   original digitization — not attempting all 24 lessons at once.

## Audit trail
Generated by direct computation against the files listed under "Sources of
truth," cross-checked twice with independent scripts for the illustration-slot
count after an initial discrepancy was caught and corrected. No page or
number in this document was estimated or inferred.
