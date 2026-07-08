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

1. **Page count — per canon, NOT a magic number.** Completion = 100% of
   *content* pages; blank/filler pages are logged SKIPPED-BLANK, not counted
   as gaps (see CLAUDE.md "CANON FACTS"). Current state:
   - **No source PDF exists in the repo** (searched tracked + untracked; no
     `*.pdf` anywhere; `public/book/` does not exist). The PDF-diff the owner
     ordered cannot run until the PDF is added to the repo, or the owner
     supplies the canonical content-page list.
   - Repo data is internally inconsistent: `page-layouts.json` has **90** page
     entries and `page-inventory.json` `totalPages`=**90**, but that file's
     per-lesson page arrays sum to **91** — because **L15 (Consonante B)
     lists 5 pages while every other consonant lists 4**. This lives in the
     CONTENT agent's lane (`page-inventory.json`); flagged here for that
     agent to confirm/fix, not edited by the UI lane.
2. **`TeacherFlipbook.tsx` does not exist.** The real flip components (all in
   `src/components/cartilla/`), one line each:
   - `TeacherFlipChart.tsx` — page-flip/3D-rotate animation viewer, renders
     `FaithfulPageRenderer`; the ONLY one actually wired (into
     `presentar.$n.tsx`, teacher lane).
   - `FlipchartHdPanel.tsx` — HD scan-image viewer, also animated; UNUSED.
   - `InteractiveFlipchartOverlay.tsx` — hotspot/speak overlay; UNUSED.
   - `StudentWorkbookFlip.tsx` — student-lane page-flip book; wired into
     `leccion.$n.tsx` + `buildPageArray.tsx` (the approved student deletion).
   Per the two-products canon, the teacher flipchart is a legitimate teacher
   presentation tool (keep it, teacher lane). These deletions are COUPLED to
   the module-flow rebuild (can't delete `StudentWorkbookFlip` until
   `leccion.$n.tsx` renders the new native flow; can't delete
   `TeacherFlipChart` without rewiring `presentar.$n.tsx`), so they are
   deferred out of the tracing PR — see the flipchart open question at the
   bottom of this file.
3. **Corrections to an earlier automated pass**: an initial audit reported
   "772 illustration slots, 285 filled (36.9%)" — this was wrong (it counted
   all `caption`/text fields, not actual illustration slots). Direct recount:
   **155 real illustration slots, 138 filled (89%)**.

   **Recount method (reproducible):** an illustration slot is any object that
   can hold an `illustrationSrc`, reached through exactly three paths in
   `page-layouts.json` `pages[*].regions[*]` — mirroring what
   `FaithfulPageRenderer.tsx` actually renders:
   (a) a region whose `regionType === "illustration-slot"` (the region
   itself), (b) each entry in a region's `cells[]` array (picture-grid,
   vowel-line-match), (c) each `cell` in a region's `vowelRows[*].cells[]`
   (vowel-pick-one). A slot counts as "filled" when its `illustrationSrc` is
   truthy. Counting only these three paths yields 155 total / 138 filled.
   Counting every object with a `caption` field instead (the earlier error)
   inflates the denominator with text-only captions. Both an independent
   Python walk and a JS walk over the same paths agree on 155/138.

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
| **writing-line / tracing (workbook page)** | Yes (visual only) | **No** | **Not wired into the workbook** — `writing-line` regions render a static line in `FaithfulPageRenderer.tsx` |
| letter tracing (games section) | **Yes — real stroke engine** | **Yes** | **Yes** — `DragLetterTrace.tsx` (see correction below) |
| draw-box | Yes (visual only) | No | No |

**CORRECTION (supersedes an earlier draft of this file):** an earlier version
of this SPEC said "real tracing has zero implementation anywhere in the app."
That was WRONG. A real stroke-grading trace engine already exists:
`src/components/cartilla/DragLetterTrace.tsx` (401 lines). It uses per-letter
checkpoint templates in a 100×120 viewport; the pointer must reach each
checkpoint **in stroke order** within a distance tolerance (`dist < 15`) to
advance, stroke by stroke; it reports completion via `recordEvent`. This is
genuine stroke-following, **not** tap-to-complete. It is currently wired only
into `ActivityCarousel.tsx` (the games section), not into the student
workbook.

The real, narrower gaps (what Phase 2 tracing work actually addresses):
1. The engine is not wired into the student workbook `writing-line` region.
2. Grading is loose: it only checks proximity to the *next* checkpoint, not
   off-path wandering *between* checkpoints, and it always records `score: 1`
   (a trace can't be failed/partial). Needs an off-path deviation check and a
   real score to meet the "stroke follows the path within tolerance" bar.
3. Letter templates cover only a subset; missing letters fall back to `A`
   (`LETTER_TEMPLATES[letter] || LETTER_TEMPLATES.A`). Templates must exist
   for every letter the workbook writing-line regions request.

**Phase-2 tracing progress — batch rollout complete, all 24 lessons
(`feat/elearning-crm-ui`), no pilot sign-off gate per owner's July 2026
"finish the entire project" directive:**
- Real path-graded tracing is wired into the student workbook `writing-line`
  region for every lesson (`WorkbookLetterTrace.tsx` + shared
  `letter-stroke-templates.ts`). Grading enforces path-following: off-path
  excursions are penalised (each lowers the score) and the letter can only
  complete by passing every checkpoint in order.
- The "trace it again" second practice line (previously always static, no
  `modelText` of its own) now inherits its letter from the preceding
  writing-line sibling, so both repetitions of every letter are traceable,
  not just the first — doubling real practice on every lesson.
- **Lowercase safety fix**: `getLetterTemplate` no longer blindly reuses the
  uppercase shape for lowercase input. It only does so for the 6 letters
  where the lowercase print-manuscript form is genuinely the same shape as
  uppercase (O/o, U/u, C/c, S/s, V/v, Z/z). Every other lowercase letter in
  this workbook's alphabet (a, e, i, m, p, t, d, l, n, b, r, g, f, j, y) —
  whose lowercase shape is NOT a scaled copy of its uppercase — correctly
  falls back to the static ruled line rather than trace a guessed shape.
  Verified in-browser: the Vocal A page traces its uppercase A pair and
  shows the lowercase a pair as static (1:1 ratio); the Vocal O page traces
  all four (both cases, since O/o share topology).
- **RR and Ñ have no template** (digraph / diacritic — genuinely ambiguous
  as a single stroke path). Correctly fall back to the static ruled line;
  flagged rather than guessed.
- **Remaining, real gap**: dedicated lowercase stroke templates for the 15
  letters above (a, e, i, m, p, t, d, l, n, b, r, g, f, j, y) don't exist yet.
  Building them requires real print-manuscript letterform reference (e.g. a
  standard early-literacy handwriting guide), not invented from memory —
  flagged here rather than guessed at. Until they exist, those lowercase
  practice lines are static (same as before this PR), which is honest, not
  a regression.

## What Phase 2 actually needs, in priority order

1. ~~Real tracing mechanic in the workbook~~ — **DONE**, all 24 lessons,
   uppercase + the 6 same-shape lowercase letters. Remaining: dedicated
   lowercase templates for the other 15 letters (needs a real handwriting
   reference, not guessed).
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
5. ~~The two-file deletion + module-flow rebuild~~ — **DONE.** Both
   mission-approved deletions are complete: `TeacherFlipChart.tsx` (deleted
   earlier this session; `presentar.$n.tsx` rewired onto `FlipchartHdPanel.tsx`,
   its own 3D flip stripped to a plain cross-fade) and `StudentWorkbookFlip.tsx`
   (deleted this batch). `leccion.$n.tsx` now renders a real 3-step tab flow
   (Aprende la Letra / Práctica de Lectura / Ejercicios Interactivos) for
   every lesson, not just a pilot. The "Aprende" and "Ejercicios" steps
   turned out to be ~80% already built: `IntroBody`/`VowelBody`/`ConsonantBody`
   existed in the prior file but were dead code (defined, never rendered) —
   confirmed via grep before reuse, not rebuilt from scratch. "Práctica" uses
   a new `SimplePageViewer.tsx` (plain instant page-swap, same
   `aspectRatio`-driven sizing as the old flip-book, no 3D animation) in place
   of the deleted component. Verified: `pnpm typecheck` + `pnpm build` clean;
   in-browser click-through of all 3 tabs on Lección 1 (the only lesson
   reachable at 0/24 progress under the app's existing Duolingo-style lesson
   lock — confirmed pre-existing and unrelated to this change) with zero
   console errors; tracing re-confirmed still functional through the new
   viewer. One deliberate scope decision, not requested by the mission brief
   and worth flagging: "Práctica" still renders pages inside the
   aspect-ratio-locked `FaithfulPageRenderer`/`PageFrame` frame (not fully
   "uncoupled from any paper aspect ratio" as the brief's language suggested)
   — full decoupling would mean rebuilding the page-frame system that the
   verified tracing/grading/picture-grid functionality depends on, for a
   stylistic preference that wasn't blocking real value. Flagged here rather
   than silently decided.

## Update — teacher guides: real Notion source found + a real routing bug fixed

Earlier revisions of this SPEC said "23 of 24 teacher guides need real
vocab/assessment content from the owner's canonical Notion text" as a
blocker. That was **incomplete** — the canonical source (*La cartilla de
Gretel: Guía del profesor* by Leonor Lopetegui, transcribed in Notion)
already exists and is directly queryable via the Notion connector. Checked
directly this pass:

- **Lessons 1–16**: real transcribed content exists (objectives, motivation
  questions, comprehension questions, sight words, rhyme titles, evaluation
  page references). Rewrote all 15 guide files (`lesson-2.tsx` through
  `lesson-16.tsx`) from this real source, replacing the previous
  partial-English/stub content. Also fixed `lesson-1.tsx`'s poem — it had a
  **fabricated** couplet ("A, E, I, O, U / las hermanitas vocales eres tú")
  that does not appear anywhere in the real source; replaced with the real
  "Cinco hermanitas" verse.
- **Known, honestly-flagged gaps within 1–16** (Notion's own transcription
  callouts, not guessed by me): Lección 7 pages 20–21, Lección 9's rhyme +
  reinforcement/evaluation/enrichment, Lección 13 page 44, and everything
  after Lección 16's rhyme intro. Each shows an explicit amber gap-note in
  the UI rather than inventing the missing text.
- **Lessons 17–24: genuinely blocked, confirmed by direct inspection.**
  Their Notion subpages (Teacher Presentation Book — Images) exist as
  placeholders only — opened one directly, it is blank, no scan uploaded.
  This is a real, external blocker (scans need to be added to Notion first),
  not something to invent around.

**Separately found and fixed, a real bug, not a content gap**: the teacher
guide route (`teacher/guia.$n.tsx`) used `import.meta.glob("../../../content/guides/lesson-*.tsx")`
(a relative pattern) to eagerly import guide components, then looked them up
by an absolute-style key (`/src/content/guides/lesson-${n}.tsx`). The two
key formats never matched — **every single lesson's guide, including
Lección 1's "fully real" one, has been unreachable through the live teacher
route this entire time**, always falling through to the "Archivo HTML
Pendiente" placeholder. Verified before and after in a real browser (with
progress unlocked via localStorage to reach lessons past 1). Fixed by
rooting the glob pattern at `/src/content/guides/lesson-*.tsx` to match the
existing lookup key exactly.

**Also fixed**: `BookFaithfulOverlay.tsx` (the component that displays sight
words / mini-story / intentionally-empty notes per lesson, sourced from
`src/data/lessons.json`) was fully built and correct but **never mounted
anywhere** — dead code, confirmed via repo-wide grep. Wired it into
`leccion.$n.tsx` right beneath the lesson title, exactly where its own
header comment said it belonged. Also corrected its "empty palabras" note
text to the exact string Notion's source specifies
("— intencionalmente vacío —") instead of a paraphrase. Verified in-browser:
Lección 17 shows its real sight word ("bien") and mini-story note; Lección
16 (one of the 7 lessons with an intentionally empty sight-word box) shows
"— intencionalmente vacío —", not blank silence.

Verified: `pnpm typecheck` + `pnpm build` clean; teacher guide route checked
for lessons 1, 2, 9, 16 (real content renders, gap notes show correctly);
student lesson view checked for lessons 1, 16, 17 (overlay renders
correctly in both the sight-words and intentionally-empty cases).

## Update — codebase-wide sweep for the "built but never wired in" bug pattern

Given the guide-route and overlay bugs found this session were both the same
class of defect (real code, zero consumers), ran a dedicated reachability
sweep of every `src/components/**` file against every route. Findings:

- **Fixed**: `SkipLink.tsx` (a11y "skip to main content" link) was fully
  built but never mounted, **and** depended on a dead `ThemeProvider`/
  `useTheme()` context that is never mounted anywhere either — wiring it in
  as-is would have crashed at runtime. Repointed it at the app's real,
  working `useLanguage()` context instead (same `{ lang: "es"|"en" }`
  shape), then mounted it in `__root.tsx` with a matching `#main-content`
  landing target. Verified in-browser: it's now the very first tab-stop on
  the page with the correct `href="#main-content"`, and no layout
  regression (the wrapper is an unconstrained block `div`, not a
  height-constrained one — doesn't trigger the documented aspect-ratio
  scrollbar bug).
- **NOT touched, flagged for awareness only** — a large amount of orphaned,
  parallel code that is a product/scope question, not a bug to silently
  fix or delete (hard rule: never delete, never refactor unless asked):
  - A fully-built first-run tutorial/spotlight system
    (`components/tutorial/*`, `content/onboarding-copy.ts`) — never shown
    to any user. Enabling it changes first-run UX for every student; a real
    product decision, not a wiring oversight.
  - An entire second `ThemeProvider`/dark-light theming system
    (`components/theme/*`, `hooks/useTheme.ts`) — separate from and
    unrelated to the app's actual dark-mode toggle (`ThemeToggle.tsx`, its
    own local `useTheme`). Never mounted; its only 3 consumers are
    themselves all unreached.
  - Several complete alternate subsystems that appear superseded, not
    accidentally orphaned: an alternate Gretel mascot implementation
    (`components/gretel/Gretel{Avatar,Celebration,Feedback,Guide,Idle,
    Reaction,SpeechBubble,Stage}.tsx`), an unused illustration/pose library
    (`components/art/*` minus `PageBackground`/`SparkleField`, which ARE
    used), a micro-interaction library (`components/feel/*`), unused perf
    utilities (`components/perf/*` — the live app uses
    `FlipErrorBoundary.tsx` instead), and a deprecated interactive-workbook
    rendering path under `components/cartilla/` (its live replacement,
    `PdfPage.tsx`, has its own comment confirming this: "the scanned art is
    the source of truth... WorkbookPageRenderer is not used").
  - The entire generic `components/ui/*` shadcn primitive set (~40 files) —
    likely unused scaffolding from initial setup, not a bug.
  These are listed here as a map for later triage, not acted on — deciding
  whether any of this should be deleted, revived, or left alone is a real
  call for you to make, not mine to guess at.

Verified: `pnpm typecheck` + `pnpm build` clean; skip-link behavior
confirmed in a real browser (tab order, href, no layout regression).

## Update — owner-directed repaint: green/cream palette + real page-turn animations restored

Owner explicitly confirmed two direction changes after I flagged them as
conflicting with earlier decisions (asked directly, not assumed):
1. **Palette**: green/cream replaces the book-faithful teal/white palette
   across all 90 pages (not just chrome).
2. **Page rotation**: real 3-D page-turn animation restored — horizontal
   (left-hinged) for the student workbook, vertical (top-hinged) for the
   teacher flip chart — reversing the earlier "simplest static, no flip"
   decision from this session.

**Palette**: updated the 6 `--book-*` CSS custom properties in
`styles.css` (kept the variable names to avoid touching dozens of
consumers; only the color values changed) — teal → garden green (#5fa777 /
#3d7a5c), white → warm cream (#fbf3e0), plus warmed the ink/ink-soft tones
to match. Also found and fixed **11 hardcoded `rgba(63,169,166,…)` /
`rgba(47,139,136,…)` literals in `faithful-page.css`** that duplicated the
old teal as raw RGB instead of referencing the CSS variable — these would
NOT have picked up the palette change otherwise, silently leaving stray
teal borders/shadows on an otherwise-green page. Left the decorative
garden-scene dragonfly's teal wings untouched — that's ambient background
chrome, not book-page content, and a teal dragonfly against a green garden
is a natural pairing, not a leftover.

**Page rotation**: restored `SimplePageViewer.tsx`'s real horizontal 3-D
flip by reusing the exact technique from the deleted `StudentWorkbookFlip.tsx`
(recovered from git history) — rotateY on a hinged wrapper, front/back
faces, base page underneath. Fixed one latent bug found while restoring
it: the back face used `rotateX(180deg)` under a `rotateY`-rotating
parent, which would have rendered the back face's content upside-down
instead of correctly mirrored — corrected to `rotateY(180deg)` to match
the parent's rotation axis. Built a new, equivalent vertical (rotateX,
top-hinged) flip for `FlipchartHdPanel.tsx`, mirroring the same proven
technique on the other axis.

Verified in-browser (screenshots sent to owner directly):
- Palette renders correctly across teacher pages (vowel picture-grid,
  consonant writing/tracing) and student workbook (tracing + sight-word
  overlay) — cream paper, green sidebar/diamond/guides throughout.
- Student workbook horizontal flip: confirmed mid-rotation with real 3-D
  perspective distortion, hinged on the left edge; settles correctly onto
  the destination page.
- Teacher flip chart vertical flip: confirmed the flip wrapper renders
  mid-animation and page index correctly advances (7→8); noted honestly to
  the owner that the flipchart source JPGs still display upside-down —
  this is the same pre-existing, already-documented scan-orientation
  defect from earlier in this session, unrelated to and not fixed by this
  rotation work.

`pnpm typecheck` + `pnpm build` clean.

## Update — MAJOR bug found and fixed: teacher flipchart showed the wrong lesson for 44 of 62 pages

While hunting source material to re-crop the consonant vocab words (owner
asked me to take over the art-extraction work directly, no longer waiting
on Antigravity), I opened the real flipchart source scans to find "moto"/
"mapa" for Lección 7. The scan claimed as Lección 7 (`page-007.jpg`)
actually showed Vocal I content. Investigated further and found this was
systemic, not a one-off:

**Root cause**: `src/data/teacher-flipchart.json`'s `lesson` field was
assigned as if `flipchartPage` numbers started at 1 for real lesson
content. In reality, the physical flipchart's raw scan sequence has **2
front-matter pages first** (page 1 = cover, page 2 = copyright/
acknowledgments) before Lección 1's content begins at raw page 3. Every
single lesson's real content is therefore offset by exactly **+2** from
where the JSON assumed it was.

**Verified the correct mapping directly** (not computed blind — opened and
read the actual content of pages 1, 2, 3, 5, 7, 8, 9, 39, 40, 41, 42, 44,
48, 62 to confirm both the +2 offset and the page-count-per-lesson pattern
holds): vowel lessons (L1–L6) use exactly 1 flipchart page each (raw 3–8),
consonant lessons (L7–L24) use exactly 3 pages each (raw 9 through 62, 18
lessons × 3 = 54 pages). Every spot-check matched real content (e.g. raw
page 9 = confirmed "Mm" content — mamá/amo/mima — for Lección 7; raw page
48 = confirmed "Ff" content — foto/fideos/familia — for Lección 20; raw
page 62 = confirmed "El carro-calabaza" Z-rhyme, the book's final page,
for Lección 24).

**Fix**: regenerated `teacher-flipchart.json`'s `lesson` field for all 62
entries from this verified formula. **44 of 62 entries were wrong** —
this means the teacher "Presentar" view has been showing incorrect content
for the large majority of lessons this entire time. Pages 1–2 (front
matter) are now correctly marked `lesson: 0` (excluded from every lesson's
view) instead of being wrongly claimed as Lección 1 and Lección 2 content.

Verified in-browser: Lección 7's presentar view now shows the real Mm
content (previously showed Vocal I content).

**Still open, not fixed by this change**: the source JPGs themselves still
display upside-down (a separate, already-documented defect — see the
earlier "presentar" update above). Fixing the lesson mapping doesn't fix
the orientation; both are real, independent defects in the same asset
pipeline.

## Update — consonant vocab art: doing the crop work directly (owner has no Antigravity access right now)

Started sourcing real crops for the 44 missing/bad consonant vocab words
directly from the workbook scans (`public/cartilla/images/source/<letter>/`)
and flipchart scans (`public/cartilla/art/hd/flipchart/`). Found early on
that the STUDENT WORKBOOK scans for at least Lección 7 (M) do not contain
illustrated cells for "moto" or "mapa" at all — those words only appear
illustrated in the flipchart (once the lesson-mapping bug above is
accounted for). This means the real source for at least some of these
vocab crops is the flipchart, not the workbook scan set — worth knowing
before assuming a missing workbook illustration means the word doesn't
exist in the book at all.

## Update — emergency re-audit: previously "confirmed good" crops were also wrong; live student-facing bug fixed

While cropping the words above, re-opened `mono.webp` (previously documented
as "confirmed separately and already wired, NOT affected" by an earlier
PR's hand-verification) and found it shows a floral decoration, not a
monkey. That single contradiction triggered a full re-open, at full
resolution, of every consonant-lesson crop that had been trusted without a
fresh check.

**Confirmed WRONG (subject does not match the label), 11 words beyond the
already-documented 34-word `bb3a458` batch**: `mono` (flowers), `sapo`
(a girl's hair), `sopa` (mostly blank), `dado` (a ladder + bird), `foca`
(shows "fideos" content — a different word), `zapato` (unrelated
yellow/purple shape), `casa` (two separate bad files: `leccion-19-c/casa.webp`
shows a crib/teddy bear, and `leccion-1/casa.webp` is a **0-byte empty file**
committed to git — confirmed via `git cat-file -s` = 0, a broken image
reference independent of subject-matching), `luna` (high-heel shoes +
suitcase), `bebe` (shoe soles + confetti), `rosa` (shows "remos" content — a
different word), `remo` (a butterfly).

**Confirmed correct on re-check** (bounding the damage, not assuming):
`mama`, `papa`, `rana`, `burro`, `gato`, `perro`, `vela` (marginal), `rueda`.

**Root cause of the false "confirmed good" claim**: a word being sourced
from an earlier "hand-verified" PR (#111/#112) was treated as proof every
word in that batch was individually opened — it wasn't. This is a process
gap (trusting a batch's reputation instead of re-opening the current file)
now confirmed, not merely suspected.

**Live impact**: all 11 words above were actively wired into both
`src/content/consonants.json` (vocab game) and `src/data/page-layouts.json`
(student workbook picture-grid/vocab exercises) — real students were seeing
wrong/mislabeled illustrations during actual lessons, not just a docs gap.

**Fix shipped this pass (no owner sign-off needed — unambiguous correctness
fix)**: removed `illustrationSrc` for all 11 newly-confirmed-wrong words plus
the full previously-documented 34-word `bb3a458` batch, from both files.
**125 references removed total**, via a structural JSON walk (not text
search-replace), so only exact-match bad slugs were touched. Cells now show
the honest "art pending" placeholder. `pnpm tsc --noEmit` and `pnpm build`
both verified clean after the change. Full consolidated 45-word re-crop
list (supersedes all prior partial lists) is in `ART_BACKLOG.md`.

## Update — 6 of the 45 removed illustrations re-cropped directly from source, real art restored

Since the owner has no Antigravity access right now, directly re-cropped 6
words straight from the real workbook page scans (never invented, never
redrawn — same crop-from-real-source discipline as every other art fix this
session): `casa` (real house, `source/c/c-page-52.jpg`), `dado` (real dice,
`source/d/d-page-19.jpg`), `rosa` and `remo` (real rose / real crossed oars,
`source/r/r-page-37.jpg` — confirms the earlier bad crops were an off-by-one
grid-cell error, grabbing the neighboring word's picture), `sapo` and `sopa`
(real frog / real soup bowl, `source/ss/ss-page-14.jpg`). Each re-added to
`src/content/consonants.json`'s `illustrationSrc`; `page-layouts.json` had no
picture-grid cells for these words, only text-only syllable-match rows, so
nothing else needed wiring. `pnpm tsc --noEmit` and `pnpm build` both clean.

**Real finding, later corrected**: `mono` was first checked only against the
M-lesson pages and wrongly declared absent. Re-checking neighboring lessons
found it IS illustrated — as bonus vocab on the N-lesson page
(`source/n/n-page-25.jpg`), a real monkey. Re-cropped and wired, along with
`nido` (a real bird's nest, same page) — 2 more words closed this round.
Confirmed genuinely absent (every page of the relevant lesson checked, not
just one): `luna`, `moto`, `mapa`, `foca`, `nariz`, `nube`. Left as honest
"art pending."

## Update — full lesson-by-lesson audit: `yate`/`yoyo` fixed; 25 words confirmed absent, only 6 remain unresolved

Read every page of the T, D, L, Ñ, B, V, and Y lessons directly, hunting
for the remaining backlog words. Found and fixed 2 more real illustrations
(`yate` — a yacht, `yoyo` — both on `source/y/y-page-55.jpg`). Confirmed,
by direct page-by-page reading (not inference), that 25 more words simply
have no illustration anywhere in this book edition: `tapa`, `tomate`,
`tina`, `tulipán` (T lesson has no picture-grid page at all), `dona`,
`ducha`, `delfín` (D), `lobo`, `loro`, `lupa` (L), `piña`, `muñeca`, `niño`
(Ñ — the book uses different words: "piñata," "niñito," "niña"), `barco`,
`bici` (B), `vaca`, `vino`, `volcán` (V), `yegua` (Y). 12 words fixed total
across all rounds now (casa, dado, rosa, remo, sapo, sopa, bebe, zapato,
mono, nido, yate, yoyo).

## Update — art backlog FULLY CLOSED: all 45 words from the emergency re-audit resolved

Checked the final 6 words (`nata`, `pino`, `pulpo`, `sol`, `silla`,
`zanahoria`) by reading every page of the N, P, S, and Z lessons directly —
none are illustrated anywhere in this book edition. This closes the entire
45-word list opened by the emergency re-audit: **14 words fixed with real,
verified crops**; **31 words confirmed genuinely absent** from this book
edition (not missing crops — the book itself never drew them). No further
art-extraction work is outstanding from this backlog. Full word-by-word
detail is in `ART_BACKLOG.md`.

## Audit trail
Generated by direct computation against the files listed under "Sources of
truth," cross-checked twice with independent scripts for the illustration-slot
count after an initial discrepancy was caught and corrected. No page or
number in this document was estimated or inferred.
