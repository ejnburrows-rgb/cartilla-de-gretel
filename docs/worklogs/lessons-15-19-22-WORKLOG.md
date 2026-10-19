# Lessons 15 (Bb), 19 (Gg), 22 (Cc) — quality bar of Lessons 16/17/21

Date: 2026-10-18
Branch: `lessons/15-19-22` (from current main 99f378f)
Scope: Lessons 15 pages 51–54, 19 pages 67–70, 22 pages 79–82 only.
Supersedes the earlier per-lesson drafts #936/#935/#932 for this batch:
their wide-screen work is carried forward here and brought up to the
audit-fix phone quality bar of #937 (L16), #938 (L17) and #927 (L21).

## What was built / fixed

Wide-screen + phone design (carried from the drafts, all lesson-scoped):
- Owner-approved Lesson 3 design language: cream paper, slimmer teal spine,
  teal page marker, teal glow on boxed work surfaces, garden-palette
  instruction letters (Lesson15/19/22GardenText), shared teal accent
  (#167A72) instead of catalog accents, teal next button.
- Empty sight-word box skipped on source pages 69 and 81 (verified empty
  `sentence-line` text in page-layouts.json; page 53 has a real sight word).

Phone + audit fixes (new — the quality bar from 16/17/21, verified live
in the running app at 390x844 and 844x390):
1. Page-number diamond: z-index 3 above the wavy page edge (L21 fix) and
   z-index 30 with pointer-events none at <=600px above the page-turn
   corner peel (L17 fix).
2. 76px bottom reserve when a tall page scrolls (data-lc-fit-overflow is
   true on pages 51/67/79 at 390px) so the fixed bottom nav never covers
   the page's corner furniture (L17 fix).
3. Reading-sentences selector strengthened with .fp-native-letter-page so
   the intended dark ink beats the shared maroon rule (L21 fix; probes
   showed rgb(112,38,59) before, rgb(37,49,58) after).
4. Teal hover for the next button instead of the shared red hover (L21 fix).
5. Runtime-verified no-op fix: lessons 19/22 syllable pages render the
   interactive `.native-syllable` component, so their draft CSS that only
   targeted `.fp-syllable-match__*` never applied; added the same card +
   teal-glow word treatment `.lc-lesson-15` already had (probe: word
   border rgb(22,122,114), background rgb(255,250,240) after).

Shared pencil mechanics untouched (`SyllableWordCircle`, `PencilConnector`,
`WorkbookPencilMark` used as-is; no rope/lasso). Owner artwork untouched
(no art files changed). No audio/TTS anywhere (voice stays "pendiente").

## Verification

- `tsc --noEmit`: pass.
- Focused vitest (`src/components/cartilla`, `src/data/__tests__`):
  27 files / 255 tests pass (same scope as the reference lanes).
- Real browser (local dev server, system Chromium via Playwright):
  every changed page captured at portrait 390x844 AND landscape 844x390 —
  24 page screenshots, all pages reached and fit, no clipping. See
  `docs/proofs/lessons-15-19-22-2026-10-18/README.md` and the capture
  script; screenshots shown to the owner in chat (PNGs are not committed
  because the text channel corrupts binary pushes — same lesson as the
  L21 lane's corrupted-binary test upload).
- Pencil interaction proof per lesson: tap a syllable word on pages
  52/68/80 at phone portrait → wooden pencil flies in, draws the green
  circle, circle stays (`...-pencil-drawing/-pencil-done.png`, shown to
  the owner in chat).
- Completion gating still works: the capture used the documented
  localStorage progress bypass; the Next control is locked on unfinished
  pages before the bypass.

## Teacher-file gap (listed, not invented)

`public/teacher/` does not exist on `main`; the only teacher files in the
repo live on the unmerged `teacher/metodos-lectura-20261018` branch and
cover Lesson 13 (Mm) materials plus the general methods PDF — nothing for
Bb/Gg/Cc. Missing for these lessons (per the Mm template): one teacher
activity .docx per lesson (game, fonética completar palabras, lectura por
minuto, lectura de la rima, dibujos). The transcribed teacher scripts in
`src/content/guia/lesson-15/19/22.json` were used as the in-repo teacher
source. Nothing was invented to fill the gap.

## Not done / out of scope

- Flip Chart: untouched (separate experience; reference lanes 16/17/21
  did not change it either).
- Voice/audio, Supabase, artwork changes: out of scope per repo gates.
