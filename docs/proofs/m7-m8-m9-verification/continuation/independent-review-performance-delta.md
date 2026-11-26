# Independent performance affected-delta review

**Exact application/test source reviewed: `649d0fd072cf50fe8580c8629376f9f6349af44a`**, against parent `2093f390`. Integration may carry the same patch under a cherry-pick commit; verify patch identity before reusing this assessment. Reviewer: Codex independent_review, isolated existing review branch.

**DONE but not live:** source delta accepted; the four previously failing performance assertions now pass with unchanged thresholds. **WAITING:** complete integrated gate and targeted startup/deferred-route runtime evidence. This is no formal GitHub approval or overall readiness statement.

## Source assessment

The reviewer inspected all thirteen changed app/test files and the built before/after measurement JSON. No material source defect or removed assertion was identified.

- The former eager `practica.tsx` exported its complete view and dependency graph from the route metadata module. It now retains only its route head metadata; `practica.lazy.tsx` loads the moved `-practica-view.tsx`, and generated route wiring uses the same lazy boundary.
- Independent comparison confirms the complete practice implementation from `type Card` onward is identical after LF normalization: **18,402 characters before and after**. Original imports are retained in the view with only route-registration imports separated. This is a loading-boundary change, not a replacement activity implementation.
- Six cloud/auth files defer an existing import into their existing async operation. Teacher/public/seed/student early-return branches and redirects are retained before cloud loading; cloud branches still await the same session/role/admin checks. `hasTeacherOrAdminRole` still awaits both role RPCs and applies the same boolean decision. The reviewer does not certify a live backend unavailable in this scope.
- Tailwind still scans production `src`; only `__tests__`, `*.test.ts(x)` and `*.spec.ts(x)` fixture sources are excluded. No shipped stylesheet rules were manually deleted or route-specific art/audio classes intentionally suppressed.
- The two practice test files change imports/component targets to the moved view only; all assertions remain. The performance test, checker and limits are unchanged. Generated metadata, artwork, recordings and protected subsystems are not modified by this source delta.

## Measurements and actual test outcome

Measurements are in bytes (raw / gzip). Budgets remain raw/gzip limits originally enforced by the checker.

| Payload | Same-environment standalone before | Split-only standalone after | Final default test environment | Unchanged limit |
|---|---:|---:|---:|---:|
| Entry JS | 1,179,045 / 268,196 | 455,640 / 113,061 | 249,309 / 58,331 | 512,000 / 128,000 |
| Entry CSS | 318,586 / 52,513 | 291,582 / 47,411 | 291,582 / 47,411 | 307,200 / 51,200 |
| First-paint JS | 1,484,518 / 365,818 | 733,851 / 201,476 | 741,358 / 207,988 | 1,003,520 / 276,480 |

The first two columns are a same-environment intermediate attribution comparison. The last column of measured results comes from the final unchanged performance test build; it also includes the deferred cloud guards and retains the test environment's larger development React vendor. Do not subtract these columns as if they were a single controlled production-only measurement. All six final raw/gzip values are below their existing limits, and the checker reports `passed:true`, zero violations. Heavy-route isolation and required lazy teacher chunks also pass.

The reviewer read raw `performance-focused.json`: **6 passed / 1 failed / 0 skipped**. Four original failing assertions (overall budgets, entry JS, CSS, first-paint total) now pass. The remaining failure is the seventh proof-file-presence assertion: the worker's sparse checkout lacked tracked `PERFORMANCE_BUDGET.md`. Both files are now directly confirmed present in `sparse-proof-restored.json`; this is a restored-file check, **not a seven-test rerun**. The integrated full gate must execute the unchanged seventh assertion normally. No false 7/7 result is claimed here.

Existing practice/auth focused checks report **15/15 passing**, zero skipped, and typecheck passed. These implementation-owner execution results are attributed and reused; this reviewer inspected the source and raw evidence rather than repeating the measured build. The dependency identity receipt checks all 88 direct installed dependency versions against the lock; no dependency upgrade or lower measurement limit was used to obtain the result.

## Required final evidence

Inspect the complete integrated gate once at frozen source identity, including all seven performance tests. Verify real built cold startup, delayed practice navigation (including query-driven family/piano selection), first interaction, approved audio/artwork and affected teacher/print/presentation branches. Existing unchanged accepted observations can be reused only with matching dependency identity; emulation does not prove physical phone/projector behavior.

Retain the four source/placement holds and NOT TESTED physical-device/full-release surfaces. Final-head independent material and formal GitHub review remain separate gates. This assessment does not authorize bypassing unresolved source requirements, tests, repository protections or manually disabled automatic deployment.
