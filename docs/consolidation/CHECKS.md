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

## Identifier-integrity correction

Review caught two saved identifiers accidentally altered by an overly broad test-count text substitution: a branch short head and PR953 full head. Both were reverified against live GitHub refs and restored (controller branch: 1627114b84b6f2f47dae26537c074384b3355aa9; PR953: f6c08f35894fd37ac4617d1cd1553411491128be). An independent workspace checker reproduced exactly those two mismatches before correction, then passed all271 mirrored branch heads and all25 curriculum candidate PR heads against captured CSV metadata. Source CSVs were never changed. No application code, asset, branch head or release was changed by the correction. Policy:95 pass; documentation check:0 errors. Avoid global numeric replacements in evidence documents.

### CodeRabbit mode-distinction regression proof: 2026-11-26

Review6078849732 correctly identified that enhanced/projection used the same fixture path. Added distinct remasteredPathV2 metadata and independent literal expectations for source/enhanced/projection, plus the returned V2-field assertion. No artwork file or runtime resolver change.

Mutation proof: temporarily forced projection through enhanced mode. Old fixture passed (exit0); strengthened fixture failed on the wrong image path (exit1); restored the exact resolver and the strengthened fixture passed (exit0). The deliberate mutation is not committed.

Current checks: focused file10 pass; full244 files,2326 pass plus2 expected failures; typecheck, scoped ESLint, policy95 and snapshot-integrity271 branch heads/25 curriculum PR heads pass. Full lint remains8117 findings (8058 errors/59 warnings), identical to the prior run. No unrelated cleanup applied. Independent newest-head review remains pending. No merge or deployment.

### Qodo snapshot-boundary clarification: 2026-11-26

Confirmed baseline CSV270 rows including five approved refs; corrected SNAPSHOT-NOTES wording rather than rewriting retained evidence. Captured motion head5e1c8378 and post-capture reviewed headc303ead3 are now explicitly separated. A subsequent live-ref check returned bd62f2c66be2d6866d8b93ca0d69a26c380eff1b; that newer motion delta is not accepted by the prior c303ead3 source inspection. Remaster inventory re-read at curriculum389eb9b6:121 entries, all pending, none canonical-keyed. No verified same-page mapping exists to implement the requested alias safely; candidate assets remain preserved. No runtime or test changes in this clarification.
