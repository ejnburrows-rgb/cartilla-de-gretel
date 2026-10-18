# Lesson 11 (Dd) wide-screen design — worklog (2026-10-18)

Lane: Batch A new build (L11). Branch `muse/lesson-11-wide-20261018` from main `99f378ff`.

## Pre-check
- No open PR and no branch for lesson 11 existed (checked GraphQL: 59 open PRs
  cover lessons 1,2,4,5,6,7,8,9,10,14–24 — not 11/12/13). No duplicate build.

## Implementation (pattern: PR #927 Lesson 21)
Lesson 11 = letter "d", printed pages 35–38, no picture-grid pages (writing,
syllable circling, letter/reading, complete-the-word + sentence writing —
same family as Lesson 21).

1. `src/components/cartilla/lesson11/Lesson11Text.tsx` (new) — garden-palette
   per-letter instruction text (mirrors Lesson21Text).
2. `src/routes/cartilla/-leccion-view.tsx` — `lc-lesson-11` on the lesson
   shell when `n === 11` (1 line).
3. `src/components/cartilla/FaithfulPageRenderer.tsx` — `Lesson11GardenText`
   for lesson-11 instructions; teal accent `#167A72` override for lesson 11
   (replaces purple catalog accent).
4. `src/styles/lesson-fit.css` — scoped `.lc-lesson-11` block: cream `#faf2df`,
   4.5% teal spine, teal glow boxes, garden letters, `#0d9488` instruction
   underline, ambient float on illustrations from page load. Dd title needed
   the 4-class selector (`.fp-native-letter-page` included) to beat the base
   blush rule's red at equal specificity — same as #927.
5. `docs/proofs/lesson-11-2026-10-18/` — capture script, README, PNGs.

No art touched, no voice/music, no generated content. Lesson 3 untouched.
`tsc --noEmit --skipLibCheck` clean (plain tsc OOMs on this VM).

## Proof
- lesson-11-390x844.png, lesson-11-844x390.png, lesson-11-1366x900.png —
  all VERIFIED by eye (page 35).
- lesson-11-page-35/36/37.png — VERIFIED by eye.
- Page 38: NOT DONE (headless shell OOM crashes on this VM; same components
  as verified pages).

## Status
Draft PR only. Nothing merged, nothing deployed, nothing pushed to main.
