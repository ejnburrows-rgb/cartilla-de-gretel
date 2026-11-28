# Mounted Chano completion repair, 28 November 2026

Before: final-word navigation emitted completed=true even at 0/5 correct. Four added regression tests fail on the original scene. The older PayasoChano component was already protected; the actual mounted ChanoScene was not.

After: a round finishes only when every word is solved. The final Next returns to the first unfinished word, and replay resets earned answers. No artwork, audio, layout, educational wording or juggling mechanism changed.

Proof: 19 focused tests pass; full suite has 2,338 passing tests / 2 expected failures in 247 files. Typecheck, scoped lint, verify:worker and policy pass. Full repository lint fails (8,073 errors / 59 warnings), not waived or classified as wholly baseline.

Five actual browser tests pass: four complete rounds with wrong answer, retry, skip guard and replay at simulated phone portrait 390x844, landscape 844x390, desktop 1366x768 and projector 1920x1080; plus the existing touch-drag/next-tap regression. Screenshots and playable WebM files are attached alongside raw JSON. Installed-browser/version failures were corrected before the successful run.

Source identity is in tested-source.json. Independent review, assembled-candidate acceptance, actual-device behavior and audible/mic evidence remain NOT TESTED. Owner decisions on repeated syllables and landscape artwork remain unchanged. No merge or deployment.
