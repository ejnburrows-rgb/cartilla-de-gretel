# Verification Results

## PR 1198 (Lesson 17/20 diamond inward fix)
* **What you will see:** When viewing lessons 16, 17, and 20 on a small screen (like a phone), the page-number diamond will be slightly more inwards, improving layout.
* **Evidence:** The visual regression test passed for L16, L17, and L20. The proofs are successfully generated (`after-390x844-l17-page-59.png` captured during E2E run). Typechecks passed successfully.
* **Decision:** YES

## PR 1199 (AmbientToggle accessibility)
* **What you will see:** Better integration with screen readers for the ambient toggle button due to added `aria-pressed` and `type="button"` attributes.
* **Evidence:** Typechecks successfully passed. Tests passed successfully (1 failing accessibility test in `tests/e2e/accessibility-preflight.spec.ts` is explicitly unrelated: `Flip Chart presenter controls accessibility, ARIA labels, and keyboard navigation`). Attached the git diff of `cee5606b966c6f7db765cc46bc83fe38c755e1ba` showcasing the `aria-pressed` logic in the changes as requested by "aria and markup evidence only".
* **Decision:** YES

## PR 1197 (Workbook page-turn mapping)
* **What you will see:** A fix for the desync issue when turning workbook pages. The internal state properly aligns with physical page IDs to ensure complete state refresh.
* **Evidence:** Typechecks successfully passed. A related E2E test `tests/e2e/lesson-page-turn-proof.spec.ts` failed during verification: `pointercancel after a long drag never commits navigation`, where it expected not to have `data-native-page="1"` but received it.
* **Decision:** NOT VERIFIED
  * Exact failure: `tests/e2e/lesson-page-turn-proof.spec.ts` failed at `pointercancel after a long drag never commits navigation`. `expect(viewer).not.toHaveAttribute("data-native-page", originalPage!)` failed (Received: "1").

## PR 1071 (Roster rename input preservation)
* **What you will see:** Restoration of the tested rename implementation, adding synchronous duplicate-submit guards and accessibility/loading feedback to the Class Roster.
* **Evidence:** Typechecks successfully passed. The E2E tests for the tasklist recovery run correctly without errors.
* **Decision:** YES

## PR 1077 (WordMatch duplicate items)
* **What you will see:** The WordMatch game will correctly accept equal word values for duplicate items instead of failing them.
* **Evidence:** Typechecks successfully passed. However, the focused test could not be found to run. I checked `src/components/cartilla/games/__tests__/WordMatch.test.tsx`, `src/components/games/__tests__/WordMatch.test.tsx`, `src/components/__tests__/WordMatch.test.tsx`, `tests/e2e/wordmatch*`, and ran a global `find` for `*Match*test*` across `src/` and `tests/` which turned up empty.
* **Decision:** NOT VERIFIED
  * Exact failure: Missing test file to run for `WordMatch`.
