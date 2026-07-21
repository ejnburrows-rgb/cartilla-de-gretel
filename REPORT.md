# REPORT — worker task log

One line per completed task from `docs/ROADMAP-TO-100.md`, newest first.

- **S3 — Scan and remove any residual English in the student-facing UI**:
  swept all 17 student routes under `src/routes/cartilla/**` (excluding
  `teacher/**`), `src/content/student-copy.ts`, and their shared components.
  `student-copy.ts` was already 100% Spanish. Found and fixed: (1)
  `ayuda.tsx` had its own live ES/EN toggle (independent of the app-wide
  `LanguageContext` that #162/#251 already neutered), reachable from the
  public splash page with no login required — removed the `en` copy branch
  and the toggle UI entirely, now Spanish-only, plus fixed an unconditional
  `"Login"` label and an `aria-label="Audience"`; (2) `pilot-faithful.$n.tsx`
  had two unconditional English column headings ("Faithful HTML (new)",
  "Original scan"); (3) `mi-progreso.tsx` and `unirse.tsx` had `"Error"` /
  `"Unknown error"` fallback strings that could render for users with a
  stale `localStorage["cartilla_lang"] = "en"` from before the app-wide
  toggle was removed; (4) `SkipLink.tsx` (mounted globally in
  `src/routes/__root.tsx`) had the same dormant English fallback. All fixed
  by hardcoding the existing Spanish copy. `src/components/theme/ThemeSwitcher.tsx`
  and `src/lib/locale.ts` still contain orphaned ES/EN-toggle machinery but
  have zero importers anywhere in `src` — noted as a follow-up cleanup, not
  touched here since nothing reachable renders them. Screenshot of the fixed
  `/cartilla/ayuda` page confirms it is now fully Spanish.
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
