# P1 actual-syllable grading repair — October 29, 2026

## WORKS

- Material repair 45208d4eecff72d100fd661aa0e7023672bda2d4 addresses independent review of f276153: touching mi in mami must not receive ma credit. Pointer selection now uses each rendered letter's actual rectangle, ignoring button padding; the one-occurrence answer fallback is removed. Existing keyboard activation, repeated occurrences, saved work, learner separation and erasure/completion rules remain covered.
- The two new wrong-selection/padding regressions fail on the prior implementation. After repair, all 41 directly affected checks across five suites pass; TypeScript and production Vite build pass. Baseline and intermediate raw failures are preserved. Old fixtures that tapped ma in masa while expecting sa credit now target the actual sa; letter rectangle fixtures replace button-width guesses. Wrong-retry fake timers flush the scheduled erasure as the existing canonical test does.
- The same built app at port 5179 passed real touch input at 375, 768 and 1280 widths: button padding earns no mark, tapping the actual mi triggers retry and returns to zero credit, and tapping the actual target syllables in five consonant groups succeeds. Valid marks survive reload and learner A→B→A remains isolated. See runtime/results.json, wrong-mi-no-credit screenshots and the three continuous recordings. The reused proof helper now touches the correct printed letter rather than the center of a word button.
- Source art, original voice files and curriculum text are unchanged. No prior visual approval or source requirement was waived.

## DOES NOT WORK

- The independently reported P1 existed at f276153, even though earlier broad positive journeys passed. Those old journeys did not establish wrong-syllable grading; this targeted negative proof supersedes that coverage. The baseline two failures and first-fix fixture failures are retained, not labelled passes.

## NOT VERIFIED

- Fresh independent review of material repair 45208d4 was requested and remains necessary before integration. No merge or deployment of this student candidate is claimed.
- This proof does not establish physical devices/Safari, all 24 lessons, original voice alignment, missing artwork or full Cartilla release.
