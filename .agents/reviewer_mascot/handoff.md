# Handoff Report — Mascot Upgrades Review

## 1. Observations

- **Test Suite Results**: Running `npx vitest run` passed successfully.
  ```
  RUN  v4.1.8 C:/Users/EJN/Desktop/La Cartilla/cartilla-de-gretel

   ✓ src/components/gretel/__tests__/gretelMachine.test.ts (6 tests) 14ms
   ✓ src/lib/__tests__/speak.test.ts (3 tests) 206ms
   ✓ src/components/gretel/__tests__/useGretelAnimation.test.ts (5 tests) 85ms
   ✓ src/components/gretel/__tests__/lessons-audit.test.ts (170 tests) 73ms

   Test Files  4 passed (4)
        Tests  184 passed (184)
  ```
- **Build & Typecheck Results**: Running `npx pnpm build` and `npx tsc --noEmit` built client environment for production successfully with zero errors.
- **Mouth Alternation Implementation**:
  - In `src/components/gretel/useGretelAnimation.ts`, `runTalkingCycle()` schedules a toggle:
    ```typescript
    const runTalkingCycle = () => {
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        const next = currentPoseKey === "talk-open" ? "talk-closed" : "talk-open";
        applyPose(next);
      }, 220);
    };
    ```
    This alternates poses between `"talk-open"` and `"talk-closed"` every 220ms during the `"talking"` state.
- **Speech API & Offline Mode**:
  - In `src/lib/speak.ts`, `scoreVoice` checks `navigator.onLine` and adjusts scores:
    ```typescript
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    if (isOffline) {
      if (v.localService) {
        score += 5000;
      } else {
        score -= 2000; // Penalize online-only voices when offline
      }
    } else {
      if (v.localService) score += 5;
    }
    ```
  - In `getVoice()`, cache invalidation is handled by detecting connectivity transitions:
    ```typescript
    const currentOnLine = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (lastOnLine !== currentOnLine) {
      cachedVoice = null;
      lastOnLine = currentOnLine;
    }
    ```
- **Celebration & Confetti**:
  - In `src/components/gretel/GretelCelebration.tsx`, listening to `"gretel:celebrate"` triggers `avatarRef.current?.celebrate(celebrationText)` and spawns confetti with custom random velocities, sizes, and delays via Framer Motion.
  - In `src/components/gretel/GretelLiveAvatar.tsx`, calling `celebrate` generates yellow sparkles, switches state to `"CHEER"` (which scales and rotates the mascot), and triggers TTS speech.

---

## 2. Logic Chain

1. **Compilation & Correctness**: The code successfully compiles and executes. The Jest-dom testing suite exercises transitions, offline fallback mechanisms, caching invalidation, and timeout cleaning.
2. **Alternation Integrity**: Since the animation state machine transitions to `"talking"` on `"gretel:speak_start"`, the React hook triggers `runTalkingCycle()` which swaps the pose key and schedules the next alternation. The reactive dependency array ensures this cycle continues until `"gretel:speak_stop"` forces state transition back to `"idle"`.
3. **Offline Strategy**: Local voice boosting ensures that when offline, `pickBestVoice` prioritizes offline-capable voices, preventing silent failures or browser freezes. Comparing `lastOnLine !== currentOnLine` ensures that when network status flips, cached voices are immediately invalidated and refetched.
4. **Celebration Logic**: Confetti particles render via Framer Motion and run their transition loops, and the live avatar plays its cheer animation (y offset, scaling, rotation) while TTS runs.

---

## 3. Caveats

- **Web Speech API Environment Dependency**: The actual selection of voices depends heavily on local OS speech synthesizers. If the client device has no Spanish TTS voices installed, the browser falls back to the default language or silent output.
- **Confetti Rerender State**: Confetti particles generate random values inside the component render body without `useMemo`. Although this means they randomize again if the component is forced to re-render, the parent `GretelCelebration` has no state updates during the active celebration, so the visual impact is negligible.

---

## 4. Conclusion

- The implementation of the mascot animation system, offline speech synthesis, voice caching, and celebration overlay is **correct, robust, and highly optimized**.
- **Verdict**: **APPROVE**

---

## 5. Verification Method

To independently verify these results:
1. Run `npx vitest run` in the root folder.
2. Run `npx pnpm build` in the root folder.
3. Check the code of `src/components/gretel/useGretelAnimation.ts` and `src/lib/speak.ts`.

---

# Quality Review Report

## Review Summary

**Verdict**: APPROVE

## Findings

### Minor Finding 1: Confetti Generation Stability
- **What**: Confetti particles generate random sizes, speeds, and offsets on every render call.
- **Where**: `src/components/gretel/GretelCelebration.tsx`, line 45-54.
- **Why**: If any external prop or parent re-render occurs while celebration is active, the confetti particles will jump to new random positions mid-flight.
- **Suggestion**: Wrap `particles` in a `useMemo` with an empty dependency array (or dependent on the `active` trigger changing from `false` to `true`).

## Verified Claims
- Mouth alternation runs at 220ms cycle → verified via `useGretelAnimation.ts` source code and Vitest timers → PASS
- Voice caching invalidates on network changes → verified via `speak.ts` source code and `speak.test.ts` ("should invalidate the voice cache and select the local voice when transition to offline occurs") → PASS
- Offline voices prioritized when offline → verified via `speak.ts` scoring formula boosting local services and penalizing online-only voices → PASS
- Full project builds without errors → verified via running `npx pnpm build` and `tsc --noEmit` → PASS

---

# Adversarial Review Report

## Challenge Summary

**Overall risk assessment**: LOW

## Challenges

### Low Challenge 1: Offline TTS Empty Voice List
- **Assumption challenged**: Browser has at least one local Spanish voice.
- **Attack scenario**: Device goes offline, and the client device does not have any Spanish offline voices (common on some basic Windows/Linux setups).
- **Blast radius**: The engine will fall back to using no voice setting (which might use the default OS voice, e.g., English, resulting in mispronouncing Spanish text) or fail to speak.
- **Mitigation**: If no Spanish voice is matched, log a warning and fallback gracefully to `es-ES` language string. The current implementation correctly handles this by falling back to `u.lang = "es-ES"`.
