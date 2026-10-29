# Project Memory — La Cartilla de Gretel

## Swarm Dispatcher Checkpoint (2026-10-29)

### Architecture Decisions
- **Staging Integration Base**: `prototype/lesson-3-a-20261027` @ commit `b30d3cc6` (PR #1206 continuation).
- **Parallel Swarm Protocol**: 3 orthogonal subagent tracks operating with strict branch isolation (`Workspace: "branch"`).
- **Zero Collision Boundaries**:
  - Track A (Vowels Rollout): `src/components/cartilla/exercises/`, `WorkbookVowels.rollout.test.tsx`, `scripts/proofs/check-vowels-curriculum.mjs`.
  - Track B (Consonants Syllables): `src/cartilla/interactions/SyllableWordCircle.tsx`, `SyllableWordCircle.rollout.test.tsx`, `scripts/proofs/check-syllables-curriculum.mjs`.
  - Track C (Viewport & A11y): `src/styles/lesson-cutoff-fixes.css`, `src/styles/native-lesson.css`, `tests/e2e/workbook-a11y.spec.ts`, `docs/proofs/viewport-a11y/`.
- **Pre-Merge Validation**: Typecheck clean (0 errors), Vitest suite passing, Playwright recording videos across 375, 768, and 1280 viewports.
- **Owner Invariants Locked**:
  - Zero artwork generation (`pnpm prepare:art` prohibited).
  - Zero voice mutation / no cloud TTS.
  - Pencil connector / Syllable pencil circle only (no rope/lasso).
  - Pages 86–87 remain `SOURCE_BLOCKED`.
  - Merge only into staging branch `prototype/lesson-3-a-20261027` via executive sign-off; zero automatic deploys.

### Swarm Execution Status (2026-10-29 04:45 UTC)
- **Track A (Vowels)**: 11/11 unit tests passed ([Task-175 Log](file:///C:/Users/EJN/.gemini/antigravity/brain/d555e7ff-ecc1-4f48-a2fb-29caa5dfb46b/.system_generated/tasks/task-175.log)). Playwright proof in progress.
- **Track B (Consonant Syllables)**: 11/11 unit tests passed ([Task-193 Log](file:///C:/Users/EJN/.gemini/antigravity/brain/d555e7ff-ecc1-4f48-a2fb-29caa5dfb46b/.system_generated/tasks/task-193.log)). 3 Playwright videos recorded (375px: 7.25MB, 768px: 8.07MB, 1280px: 8.80MB) and screenshots captured.
- **Track C (Viewport & A11y)**: Zero horizontal scroll across 375/390/768/1280px verified. Minimum touch targets $\ge 44\text{px}$ verified. Full E2E suite executing.
