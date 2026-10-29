# Project Memory — La Cartilla de Gretel

## Swarm Dispatcher Checkpoint (2026-10-29)

### Architecture Decisions
- **Staging Integration Base**: `prototype/lesson-3-a-20261027` @ commit `b30d3cc6` (PR #1206 continuation).
- **Parallel Swarm Protocol**: 3 orthogonal subagent tracks operating with strict branch isolation (`Workspace: "branch"`).
- **Zero Collision Boundaries**:
  - Track A (Vowels Rollout): `src/components/cartilla/__tests__/WorkbookVowels.rollout.test.tsx`, `scripts/proofs/check-vowels-curriculum.mjs`, `docs/proofs/vowels-curriculum/`.
  - Track B (Consonants Syllables): `src/cartilla/interactions/SyllableWordCircle.tsx`, `src/cartilla/interactions/__tests__/SyllableWordCircle.rollout.test.tsx`, `scripts/proofs/check-syllables-curriculum.mjs`, `docs/proofs/syllables-curriculum/`.
  - Track C (Viewport & A11y): `src/styles/lesson-cutoff-fixes.css`, `src/styles/native-lesson.css`, `tests/e2e/workbook-a11y.spec.ts`, `docs/proofs/viewport-a11y/`.
- **Pre-Merge Validation**: Typecheck clean (0 errors), Vitest suite passing (39 files, 365 tests passed), Playwright recording videos across 375, 768, and 1280 viewports (14/14 tests passed).
- **Owner Invariants Locked**:
  - Zero artwork generation (`pnpm prepare:art` prohibited).
  - Zero voice mutation / no cloud TTS (master `Gretel_558674_Original.m4a` locked).
  - Pencil connector / Syllable pencil circle only (zero rope/lasso).
  - Pages 86–87 remain `SOURCE_BLOCKED`.
  - Merge only into staging branch `prototype/lesson-3-a-20261027` via executive sign-off; zero automatic deploys.

### Completed Swarm Integration Outcomes (2026-10-29 05:08 UTC)
- **Track A (Vowels Rollout)**:
  - Branch: `swarm/wb-vowels-curriculum` (Commit `739176b1`).
  - Unit tests: 11/11 passed (`WorkbookVowels.rollout.test.tsx`).
  - E2E Playwright proofs: 3 videos recorded (`375-vowels-curriculum.webm`, `768-vowels-curriculum.webm`, `1280-vowels-curriculum.webm`) and 24 screenshots across all viewports.
  - Merged into base via commit `fbe0359e`.
- **Track B (Consonant Syllables)**:
  - Branch: `swarm/wb-syllable-recognition` (Commit `658671e4`).
  - Unit tests: 11/11 passed (`SyllableWordCircle.rollout.test.tsx`).
  - E2E Playwright proofs: 3 videos recorded (`375-syllables-curriculum.webm`, `768-syllables-curriculum.webm`, `1280-syllables-curriculum.webm`) and 21 screenshots.
  - Merged into base via commit `8caf1fd5`.
- **Track C (Viewport Ergonomics & A11y)**:
  - Branch: `swarm/wb-viewport-a11y` (Commit `0282529d`).
  - E2E tests: 14/14 passed (`tests/e2e/workbook-a11y.spec.ts`).
  - E2E Playwright proofs: 3 videos recorded (`viewport-375px.webm`, `viewport-768px.webm`, `viewport-1280px.webm`) and 13 screenshots.
  - Merged into base via commit `df40e1dd`.
- **Surgical Type Harmonization**:
  - `SyllableWordCircle.tsx`: Added `useMemo` for `initialStarts` passed to `useActivityState`, achieving a completely clean `pnpm typecheck` (0 errors) via commit `706a2dd4`.
- **Final Regression Suite**:
  - `pnpm exec vitest run src/components/cartilla/__tests__ src/cartilla/interactions/__tests__`: 39/39 test files passed, 365/365 tests passed (64.99s).
  - `pnpm exec playwright test tests/e2e/workbook-a11y.spec.ts`: 14/14 tests passed (3.3m).
  - Pushed milestone commit `28033983` to `origin/prototype/lesson-3-a-20261027`.
  - Cleaned and pruned isolated worktrees.
