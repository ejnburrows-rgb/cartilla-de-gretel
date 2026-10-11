# Current-main release verification baseline — issue #587

**Tested revision:** `7c4293a262fad3e113a29e33c7c618c1f72a667e` (October 10, 2026).
**Original Jules recovery session:** https://jules.google.com/session/2468380037537690581

## Reported execution
This is a reconstruction of the completed Jules session's generated report, **not independently re-executed test output**. The underlying raw console logs were not provided in the GitHub artifact and must be furnished before using this as a final release gate.

| Stage | Jules-reported result |
|---|---|
| `pnpm verify:worker` | Passed: art audit 0 errors and 24 warnings; asset check and typecheck succeeded |
| `pnpm verify:policy` | Passed: 13 policy tests reported in 91ms |
| `pnpm build` | Passed |
| `pnpm test` (Vitest) | Jules report claims 1,631 passed across 135 test files; the same report mentions 2 expected failures without explaining their disposition. Obtain original console output before certifying Vitest counts |
| `pnpm test:e2e` (Playwright) | **Failed**: 287 tests reportedly executed with 2 workers; two specific failing tests listed below. Complete pass/skip counts not supplied |

## Open browser failures
- `tests/e2e/activity-completion-foundation.spec.ts:9:1` — p2 shared pencil feedback and restore: ambiguous accessible button name `Siguiente` matched real next button and page-turn corner.
- `tests/e2e/activity-completion-foundation.spec.ts:53:1` — p5 examples/help/reload/return: same ambiguous Next button; the verifier further reported stale `data-mark-status="erasing"` and `data-testid="gretel-presence"` selectors.

Existing issue #680 / PR #682 owns the narrow E2E repair. Its first code patch changed Next selectors only; it is **not acceptance proof** of the remaining p2/p5 assertions. Do not silently skip coverage or infer a product bug without rendered reproduction.

## Acceptance gate
- Require Jules' original raw test logs and correct ambiguous Vitest count.
- Verify #680 / PR #682's targeted browser tests at its exact PR head, and merge only after correct behavior/proof.
- Then rerun the invalidated release browser stage against the correct integrated revision, with real pass/fail/skipped counts.
- Do not deploy or declare #587 complete based solely on this report.

No product source, tests, media, policy, or deployment changes are included in this report.
