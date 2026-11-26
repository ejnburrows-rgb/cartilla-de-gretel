# Curriculum provenance verification: 2026-11-26

Code base: main 5e1c8378; repair on work/curriculum / PR #1324. Current PR head is the authoritative proposed revision.

| Check | Before | After |
|---|---|---|
| Focused five source/native/book-fidelity files | 112 passed | 115 passed |
| New canonical scan / excluded image reference checks | 2 failed when introduced against unchanged code | 2 passed |
| Full Vitest | Not rerun in baseline | 244 files: 2326 passed, 2 expected failures |
| Typecheck | Passed | Passed |
| Scoped ESLint | 1 formatting error in existing test | Passed |
| Policy tests | 95 passed | 95 passed |
| Documentation policy | 461 documents / 0 errors before edits | Passed after edits; final count in PR receipt |
| verify:worker | Not rerun before patch | Passed: art audit, 588 asset checks/no errors, typecheck |
| Repository-wide ESLint | Not run in baseline | 8058 errors / 59 warnings; touched TS files clean |

Commands: pnpm exec vitest run --maxWorkers=2; pnpm typecheck; pnpm exec eslint src/lib/workbook-source.ts src/lib/__tests__/native-workbook-coverage.test.tsx; pnpm verify:worker; pnpm verify:policy; pnpm lint.

No production build or live UI acceptance. Source helper has no located mounted learner caller. Source coverage does not certify physical wording, artwork identity or browser interaction. Existing six legacy text flags unchanged. Missing/excluded content is never invented.

Reproduction: p1 originalImageRef was /cartilla/images/source/rima/rima-page-2.jpg, expected /cartilla/art/source/workbook/page-001.jpg. Excluded p87 imageRef was /cartilla/images/remastered/student-workbook/student-l24-page-87-remaster-v2.jpg, expected undefined. Both now pass across the exhaustive page/quality-mode regression loop.

## Review follow-up

Mode-aware display assertion added, plus a metadata-only fixture proving a future remaster explicitly keyed to canonical printed-page provenance works in enhanced/projection mode while source mode and original/fallback references remain canonical. Full rerun: 244 files / 2326 passed / 2 expected failures; focused: 115 passed; scoped lint, typecheck and 95 policy tests pass. Runtime implementation unchanged from 5dfd2896.

Legacy remaster review finding was investigated against remaster-inventory.json: all 121 entries have pending approval, none is keyed to the canonical Workbook scan paths. Positional legacy associations are the defect under repair. No evidence-backed canonical-to-legacy equivalence or approved remaster was found; do not revive wrong-page images to satisfy a path-only lookup. Existing candidate files are preserved for the images lane, not deleted. A future explicit canonical registration is supported and tested.
