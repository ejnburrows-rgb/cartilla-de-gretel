# Student completion recovery, 28 November 2026

Source before repair: `4605cdaa95b774b2e7ff2c0b04b0320e1b621464` (#1325).

- Reproduced two failures before repair: a normal learner could finish from review with unfinished required pages; opening a locked lesson overwrote Continue.
- The award boundary now checks every printed page for every learner, without treating the lesson-level completed bit as proof of individual work. Unfinished normal learners return to the book; Demo browsing may proceed without completion events.
- Resume persistence waits for the access decision and requires an unlocked, existing lesson.
- Selectively recovered #1207's silent rejected-playback lifecycle behavior. Missing-recording and muted notices remain, no voice or approval gate changed.
- Three failing regressions became passing. Final targeted suite: 21 tests (plus the existing 10 picture-audio tests passed in the broader targeted run).
- Full Vitest before final assertion/format-only changes: 247 files, 2,339 passing tests and 2 expected failures. Typecheck, verify:worker and verify:policy pass.
- Full lint fails: 8,067 errors / 59 warnings; no clean-repository claim. Scoped semantic lint with formatting disabled passes. Baseline-versus-candidate lint classification still pending.

NOT TESTED: assembled candidate, browser behavior of these exact changes, physical devices/microphone, hosted/offline recovery and independent final-head review. Unit tests are not full acceptance. No merge/deployment/Tutor/shared-file edits.
