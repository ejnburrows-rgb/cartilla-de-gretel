# Proof: Student Workbook Activities, Uppercase-A Tracing, Matching & Persistence

## Context & Objectives
Continuation of Lesson 3 Student Workbook lane (#877 Stage 2 item 3, PR #1206):
- Certified remaining activity matching, retry feedback, uppercase-A letter tracing in tap and multi-stroke drag modes, production-route navigation, reload persistence, learner switching (A -> B -> A), and completion revoking upon reset.
- Preserved approved wooden pencil / pink eraser designs, `DrawBoxCanvas`, and `WorkbookPageRenderer`.

## Scope & Changes
1. **`src/lib/activity-events.tsx`**:
   - Fixed `useActivityState` parsing when `initial === null` (such as `userModeOverride: "drag" | "tap" | null`). Previously, `typeof null === "object"` caused parsed string values to be rejected and discarded upon reload.
2. **`src/components/cartilla/WorkbookLetterTrace.tsx`**:
   - Set `status = "idle"` upon finishing each intermediate stroke in multi-stroke letters (like uppercase `A`), preventing subsequent pointer movement from being falsely penalised against the next stroke before the user lifts their finger.
   - Fixed `shownStatus` in drag mode so intermediate progress (`completed.length > 0 || current.length > 0`) maintains `"tracing"` status, keeping the reset button `↺` available between strokes.
   - Prevented lingering active checkpoint indicator circles from rendering after reload on completed traces (`shownStatus !== "done"`).
3. **Tests & Scripts**:
   - `src/components/cartilla/__tests__/WorkbookLetterTrace.interaction.test.tsx`: 3 unit tests covering tap mode sequential completion + reset, multi-stroke drag mode without penalty between strokes + reset, and mode override persistence.
   - `scripts/proofs/check-lesson-three-workbook.mjs`: Playwright browser test exercising production route `/cartilla/leccion/3` on pages 8 and 9 across 375px, 768px, and 1280px viewports.

## Automated Verification Results
- **Vitest**: 14 suites, 149 tests passed cleanly (`pnpm exec vitest run`).
- **Typecheck**: `pnpm typecheck` passed cleanly (exit code 0).
- **Playwright Production Browser Journeys**:
  - `375x900` (phone): 0 page errors, video: `375-workbook.webm`
  - `768x900` (tablet): 0 page errors, video: `768-workbook.webm`
  - `1280x900` (desktop): 0 page errors, video: `1280-workbook.webm`

## Artifacts Produced
- `results.json`: structured test results and checks across viewports.
- Videos:
  - `375-workbook.webm`
  - `768-workbook.webm`
  - `1280-workbook.webm`
- Screenshots:
  - `*-page-8-connected.png`: Page 8 line matching with approved pencil lines
  - `*-trace-a-completed.png`: Page 9 uppercase-A trace completion
  - `*-trace-a-reloaded.png`: Page 9 trace reload persistence
  - `*-trace-learner-b-empty.png`: Learner B clean separation
  - `*-trace-reset-idle.png`: Trace reset revoking completion back to idle
