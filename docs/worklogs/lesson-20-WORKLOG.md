# Lesson 20 (Ff) — wide-screen design worklog

Swarm lane: back-to-front, Lesson 20 only. Branch `swarm/lesson-20-wide-20261018`, base `main` @ c99ab4e.
Date: 2026-10-18. Worker: Notion agent session.

## Scope confirmed before touching anything
- Lesson 20 = "La consonante Ff", syllables fa fe fi fo fu, printed pages **71–74** (`src/content/lesson-meta.ts` entry n:20 `pages: [71, 74]`; lesson 19 ends at 70, lesson 21 starts at 75; `src/data/page-layouts.json` pages 71–74).
- Page types: p71 writing/tracing + draw box (archetype 5); p72 syllable circle `syllable-match` ×5 (archetype 6); p73 letter/reading page (title Ff, two syllable strips, 15-word vocab grid, sight word "hay", 6 sentences — archetype 7); p74 completa `fill-in-blank` (6 items, 3 columns) + sentence writing (archetype 8).
- Lesson 20 has **no picture pages** (no `picture-grid` / connect / circle-pictures regions in pages 71–74), so the picture-box, 4×2-circle and connect-layout rules have no target here. No artwork touched, added, or remapped.

## What changed (all Lesson-20-scoped, additive)
1. `src/routes/cartilla/-leccion-view.tsx` — adds `lc-lesson-20` class next to the shared `lc-lesson-shell--fit` when `n === 20`. The shared fit system (and phone behavior) stays in force.
2. `src/components/cartilla/lesson20/Lesson20GardenText.tsx` (new) — renders instruction text with per-letter garden-palette colors; wording unchanged; screen readers get the plain sentence via a visually-hidden span.
3. `src/components/cartilla/FaithfulPageRenderer.tsx` — lesson-20-only: instruction regions render through `Lesson20GardenText`; syllable-bubble spans get `data-syl` attributes. Page-17 Uu path preserved.
4. `src/cartilla/interactions/SyllableWordCircle.tsx` — lesson-20-only `data-syl` on the group anchor (`h2`). Mechanics untouched.
5. `src/components/cartilla/InteractivePageExercises.tsx` — inert `data-syl` attribute on fill choices (used only by `.lc-lesson-20` CSS).
6. `src/styles/lesson-fit.css` — appended one `.lc-lesson-20` section: slimmer teal spine (3.4%), stronger teal glow on every boxed surface, garden colors per teaching syllable (fa green, fe marigold, fi violet, fo blue, fu pink) on anchors/strips/choices, Ff title card in garden green with raised treatment, letter page sheds the old blush skin for cream + teal. No mechanics, no other lesson affected.

## Verification (all local, real browser — Chromium via Playwright, dev server)
- `pnpm typecheck` — pass.
- Focused tests: SyllableWordCircle, FaithfulPageRenderer.mechanics, faithful-mechanic-routing, owner-approved-pencil-only, WorkbookArchetypeSurface, workbook-archetypes, letter-stroke-templates, book-fidelity-lessons-08-24 — **148 tests passed, 0 failed**.
- Screenshots: every page 71–74 at 1366×900 (desktop) and 1280×800 (horizontal tablet) + 390×844 phone sanity. No clipping, no scroll-trap; `data-lc-fit-overflow` unset on all pages at both wide viewports.
- Interactions: p71 trace dots respond (18 dots, draw canvas, 18 swatches present); p72 tap on "fama" draws the green pencil circle around "fa" (aria-pressed + pencil mark node, screenshot); p74 tap on "fa" places it into the blank ("fa ma" → status "Bien. Sigue con la siguiente palabra.").
- Phone (390×844): page 71 grows-and-scrolls with `data-lc-fit-overflow="true"` — **identical on unmodified main** (1683px baseline vs 1639px with this change); designed #717 fallback, not a regression.
- Zero console/page errors on all four pages at all three viewports.

## Proof index (docs/proofs/lesson-20-2026-10-18/)
- `desktop-1366x900-p{71,72,73,74}-*.png`, `tablet-1280x800-p{71,72,73,74}-*.png`, `phone-390x844-p{71,72,73,74}-*.png`
- `interaction-p71-trace-dot.png`, `interaction-p72-pencil-circle.png`, `interaction-p74-tap-to-place.png`

## Not done / not claimed
- No owner visual acceptance requested or implied; PR stays DRAFT.
- No audio work (other lanes own it).
- Vertical-phone redesign is explicitly a later job; phone verified only as "not broken".
- No deploy, no merge.
