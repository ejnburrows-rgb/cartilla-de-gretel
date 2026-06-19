# Plan: E2E Testing Track Implementation

This plan decomposes the execution of E2E testing milestones defined in `SCOPE.md`.

## Milestone 1: Test Setup and Mocks
- **Goal**: Configure Vitest to use `jsdom` globally, create a global setup file `./src/test/setup.ts` to mock Web APIs: `SpeechRecognition`, `AudioContext`, and helper functions for touch/swipe gestures.
- **Verification**: Run existing tests (`pnpm test`) to ensure they still pass, and verify setup loads correctly.

## Milestone 2: Tier 1 - Feature Coverage (>=25 test cases)
- **Goal**: Write tests checking the happy-path behavior of:
  - Mascot Speech & Confetti (`GretelMascot`, `GretelFeedback`, etc.)
  - Voice Piano synth and tone matching (`PianoPronunciation`)
  - Page Flips (`StudentWorkbookFlip`)
  - Teacher 4-Squares Guide (`TeacherGuidePanel`)
  - Drag-and-drop games (`DragBuildWord`)
- **Verification**: Ensure all Tier 1 tests run and pass.

## Milestone 3: Tier 3 - Cross-Feature Combinations (>=5 test cases)
- **Goal**: Test interactions between different features (e.g., mascot reacting to voice piano completions, page navigation syncing).
- **Verification**: Run and pass all tests.

## Milestone 4: Tier 2 - Boundary & Corner Cases (>=25 test cases)
- **Goal**: Test boundary and edge behaviors (e.g. offline modes, invalid page bounds, touch swipe limits, empty states).
- **Verification**: Run and pass all tests.

## Milestone 5: Tier 4 - Real-World Workflows (>=5 integration test cases)
- **Goal**: Test full student journeys (reading a lesson, completing piano matching, playing drag-and-drop, page turns) and teacher journeys (reviewing roster, adjusting guides).
- **Verification**: Run and pass all tests.

## Milestone 6: Publish Acceptance
- **Goal**: Create and publish `TEST_READY.md` at project root documenting test runner commands, metrics, and coverage.
- **Verification**: Confirm `TEST_READY.md` matches required format.
