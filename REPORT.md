# REPORT — worker task log

One line per completed task from `docs/ROADMAP-TO-100.md`, newest first.

- **S2 — Assert grading across all 24 lessons**: added
  `src/lib/__tests__/lesson-grading.test.ts`, which walks every lesson's pages
  via `getWorkbookPagesForLesson`/`getPageLayout` and, for each gradable
  region (`picture-grid`, `vowel-pick-one`, `vowel-match-all`,
  `vowel-line-match`, `syllable-match`, `fill-in-blank`), asserts the answer
  key is structurally valid and that a correct answer grades correct while a
  wrong one grades wrong — 385 assertions across all 24 lessons. Verified the
  test actually catches a broken answer key: flipped a `correct: true` cell to
  `false` in `page-layouts.json` (lesson 1's vowel-pick-one), reran, saw it
  fail, then reverted before committing. `pnpm test`: 937 passed / 2 expected
  fail (56 files).

- **S1 — Teacher demo reports show real numbers instead of "—" / "0 mins"**:
  `getSeedClassProgress()` in `src/lib/seed-data.ts` now aggregates score/total/time
  from seed events (mirroring the live `getClassProgress()` in
  `teacher.functions.ts`) instead of hardcoding `accuracy: null`,
  `timeSeconds: 0`, `perStudentExercise: {}`. Verified in the browser: demo
  class report now shows real percentages (90%/60%/90%/30%/—) and minutes
  (126/70/14/7/0), and the exercise-type table shows real hit/attempt counts.
