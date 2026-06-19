# Handoff Report — Reviewer 2

## 1. Observation

- **Setup & Config files**:
  - `vite.config.ts` (lines 63-67) sets:
    ```typescript
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
    }
    ```
    and imports `defineConfig` from `"vitest/config"` (line 6) rather than `"vite"` to prevent type errors.
  - `src/test/setup.ts` defines `MockSpeechRecognition` (lines 6-91), `MockAudioContext` and associated sub-mocks (`MockAudioParam`, `MockAudioNode`, `MockGainNode`, `MockOscillatorNode`, `MockBiquadFilterNode`) (lines 93-168), gesture simulation helpers (lines 170-285), and global setup hooks (lines 287-352).
- **Test File Modifications**:
  - `src/components/gretel/__tests__/useGretelAnimation.test.ts` (lines 14-35) updates the mock environment to assign `window.Image` as well as `global.Image` for robust environments.
  - Resolved microtask race condition under fake timers in the test case `"handles recovery (fallback success) and enters recovery mode but stays idle"` (lines 89-119) by executing two sequential `await act(async () => { await vi.advanceTimersByTimeAsync(100); });` steps.
- **Verification Outputs**:
  - Ran type checks (`npx tsc --noEmit`) and ESLint checks (`npx eslint ...`) which both completed successfully with exit code 0.
  - Wrote a new unit test suite at `src/hooks/__tests__/useSpeechRecognition.test.ts` to directly verify the SpeechRecognition mock async callbacks.
  - Executed tests using `npx vitest run`:
    ```
    ✓ src/components/gretel/__tests__/gretelMachine.test.ts (6 tests) 16ms
    ✓ src/test/setup-helpers.test.ts (10 tests) 73ms
    ✓ src/hooks/__tests__/useSpeechRecognition.test.ts (5 tests) 92ms
    ✓ src/components/gretel/__tests__/useGretelAnimation.test.ts (5 tests) 92ms
    ✓ src/lib/__tests__/speak.test.ts (3 tests) 233ms
    ✓ src/components/gretel/__tests__/lessons-audit.test.ts (170 tests) 87ms

    Test Files  6 passed (6)
         Tests  197 passed | 2 expected fail (199)
    ```

---

## 2. Logic Chain

- **Globals Registration**: The global variables for SpeechRecognition and AudioContext must exist on `window` and `globalThis` before components are imported, which the `beforeAll` hook inside `src/test/setup.ts` successfully implements.
- **Asymmetric Restoration**: While `beforeAll` registers both `SpeechRecognition` and `AudioContext` mocks, the `afterAll` hook only restores `AudioContext`. The global/window SpeechRecognition references are left modified, leading to global pollution.
- **Robust Mocking & EventTarget**: The Web Speech API and Web Audio API classes natively inherit from `EventTarget` (allowing `addEventListener`/`removeEventListener`). Our custom mocks do not inherit from `EventTarget` or implement these methods. Thus, any code that registers listeners using `addEventListener` instead of properties like `.onresult` will crash with a `TypeError`.
- **Timer Advancing under Fake Timers**: Speech recognition calls (`start`, `stop`, `abort`) schedule callbacks asynchronously via `setTimeout(..., 0)`. When using fake timers, tests must advance timers (e.g. `vi.advanceTimersByTimeAsync(0)`) to execute the callbacks, matching the asynchronous nature of JSDOM. We successfully validated this behavior using our new `useSpeechRecognition.test.ts` test suite.

---

## 3. Caveats

- We did not write tests for the full Web Audio graph (e.g. connection logic or node hierarchies) since the application only uses gain, oscillator, and biquad filter nodes to play note frequencies.
- Real-time performance, audio latency, or actual voice detection under fake timers were not checked due to simulated environment constraints.

---

## 4. Conclusion

### Review Verdict: REQUEST_CHANGES

We request changes on `src/test/setup.ts` to fix the global teardown leak and ensure the mocks inherit from `EventTarget` (or polyfill standard event listeners) for maximum robustness.

---

### Quality Review Report

#### Findings

##### [Major] Finding 1: Asymmetric Teardown of Global SpeechRecognition
- **What**: Global and window registrations for `SpeechRecognition` and `webkitSpeechRecognition` are not cleaned up in `afterAll`.
- **Where**: `src/test/setup.ts` lines 337-347.
- **Why**: Leaves modified properties on the global state post-test execution, violating test isolation principles.
- **Suggestion**: Store original values of `SpeechRecognition` and `webkitSpeechRecognition` and restore them in `afterAll`.

##### [Major] Finding 2: Missing EventTarget support on MockSpeechRecognition
- **What**: `MockSpeechRecognition` does not inherit from `EventTarget` or mock `addEventListener` / `removeEventListener`.
- **Where**: `src/test/setup.ts` lines 6-91.
- **Why**: Standard SpeechRecognition inherits from `EventTarget`. Any call using `recognition.addEventListener("result", ...)` will crash.
- **Suggestion**: Extend `EventTarget` in `MockSpeechRecognition` and ensure `start`/`stop`/`triggerResult`/`triggerError` dispatch native events (e.g. `this.dispatchEvent(new Event('start'))`).

##### [Minor] Finding 3: Missing EventTarget support on MockAudioContext
- **What**: `MockAudioContext` does not inherit from `EventTarget` or mock `addEventListener`.
- **Where**: `src/test/setup.ts` lines 143-168.
- **Why**: Native AudioContext inherits from `BaseAudioContext` which inherits from `EventTarget` (e.g. for `statechange` event).
- **Suggestion**: Extend `EventTarget` in `MockAudioContext`.

---

#### Verified Claims

- **Async Event Listeners** -> Verified via `src/hooks/__tests__/useSpeechRecognition.test.ts` -> **PASS**
  - Event listeners/callbacks onstart, onresult, onerror, and onend are scheduled correctly and run asynchronously under JSDOM fake timers.
- **Vite Config and Typing** -> Verified via `npx tsc --noEmit` -> **PASS**
- **Image Mock & Timer Fix** -> Verified via `npx vitest run` -> **PASS**
  - `useGretelAnimation.test.ts` passes successfully.

---

### Adversarial Challenge Report

**Overall risk assessment**: MEDIUM

#### Challenges

##### [Medium] Challenge 1: Broken Listener Registration
- **Assumption challenged**: Assumes client code will only use properties like `.onresult` to handle speech recognition events.
- **Attack scenario**: Future components or third-party audio packages register speech recognition callbacks using `recognition.addEventListener("result", callback)`.
- **Blast radius**: The application test suite fails to compile/run, throwing `TypeError: recognition.addEventListener is not a function`.
- **Mitigation**: Update `MockSpeechRecognition` to extend `EventTarget` and call both standard callbacks and `dispatchEvent`.

##### [Low] Challenge 2: Timing Asymmetries (Fake vs Real Timers)
- **Assumption challenged**: Assumes async behavior is modeled correctly via `setTimeout(..., 0)`.
- **Attack scenario**: A test case running under real timers triggers consecutive starts and stops, expecting callbacks to execute on the next microtask tick. If real timer drift happens, microtask ordering can get corrupted.
- **Blast radius**: Flaky test behavior when executing tests under high CPU load without fake timers.
- **Mitigation**: Restrict gesture/audio testing to fake timers or use robust await/wait-for utilities.

---

## 5. Verification Method

To independently verify the test suite and checks:
1. Run Vitest test suite:
   ```powershell
   npx vitest run
   ```
   *Expected output: All 6 test files pass successfully.*
2. Check TypeScript:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected output: Zero compilation errors.*
3. Run ESLint:
   ```powershell
   npx eslint src/test/setup.ts src/components/gretel/__tests__/useGretelAnimation.test.ts vite.config.ts src/hooks/__tests__/useSpeechRecognition.test.ts
   ```
   *Expected output: Zero lint violations.*
