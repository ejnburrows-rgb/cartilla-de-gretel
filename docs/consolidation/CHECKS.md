# Curriculum provenance verification: 2026-11-26

Code base: main 5e1c8378; repair on work/curriculum / PR #1324. Current PR head is the authoritative proposed revision.

| Check | Before | After |
|---|---|---|
| Focused five source/native/book-fidelity files | 112 passed | 114 passed |
| New canonical scan / excluded image reference checks | 2 failed when introduced against unchanged code | 2 passed |
| Full Vitest | Not rerun in baseline | 244 files: 2325 passed, 2 expected failures |
| Typecheck | Passed | Passed |
| Scoped ESLint | 1 formatting error in existing test | Passed |
| Policy tests | 95 passed | 95 passed |
| Documentation policy | 461 documents / 0 errors before edits | Passed after edits; final count in PR receipt |
| verify:worker | Not rerun before patch | Passed: art audit, 588 asset checks/no errors, typecheck |
| Repository-wide ESLint | Not run in baseline | 8058 errors / 59 warnings; touched TS files clean |

Commands: pnpm exec vitest run --maxWorkers=2; pnpm typecheck; pnpm exec eslint src/lib/workbook-source.ts src/lib/__tests__/native-workbook-coverage.test.tsx; pnpm verify:worker; pnpm verify:policy; pnpm lint.

No production build or live UI acceptance. Source helper has no located mounted learner caller. Source coverage does not certify physical wording, artwork identity or browser interaction. Existing six legacy text flags unchanged. Missing/excluded content is never invented.

Reproduction: p1 originalImageRef was /cartilla/images/source/rima/rima-page-2.jpg, expected /cartilla/art/source/workbook/page-001.jpg. Excluded p87 imageRef was /cartilla/images/remastered/student-workbook/student-l24-page-87-remaster-v2.jpg, expected undefined. Both now pass across the exhaustive page/quality-mode regression loop.
