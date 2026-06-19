# Handoff Report — Gretel Mascot and Speech Utilities Analysis

## 1. Observation

### A. Speaking Animations Framework
1. **Event Dispatching** (`src/lib/speak.ts` lines 89-92):
   ```typescript
   // Dispatch events for Gretel Mascot
   u.onstart = () => window.dispatchEvent(new CustomEvent("gretel:speak_start"));
   u.onend = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };
   u.onerror = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };
   ```
2. **Event Listening** (`src/components/gretel/useGretelAnimation.ts` lines 57-69):
   ```typescript
   useEffect(() => {
     if (typeof window === "undefined") return;
     const handleSpeakStart = () => send({ type: "SPEAK_START" });
     const handleSpeakStop = () => send({ type: "SPEAK_STOP" });

     window.addEventListener("gretel:speak_start", handleSpeakStart);
     window.addEventListener("gretel:speak_stop", handleSpeakStop);

     return () => {
       window.removeEventListener("gretel:speak_start", handleSpeakStart);
       window.removeEventListener("gretel:speak_stop", handleSpeakStop);
     };
   }, [send]);
   ```
3. **State Transitions** (`src/components/gretel/gretelMachine.ts` lines 65 and 78):
   - In `idle` state, `SPEAK_START` transitions to `talking`.
   - In `talking` state, `SPEAK_STOP` transitions to `idle`.
4. **Talking Frame Alternation Loop** (`src/components/gretel/useGretelAnimation.ts` lines 148-154, 171-176):
   ```typescript
   const runTalkingCycle = () => {
     timerRef.current = setTimeout(() => {
       if (isCancelled) return;
       const next = currentPoseKey === "talk-open" ? "talk-closed" : "talk-open";
       applyPose(next);
     }, 220);
   };
   ...
   case "talking":
     if (stateChanged) {
       applyPose("talk-open");
     }
     runTalkingCycle();
     break;
   ```
   *Note*: The alternation loop toggles `currentPoseKey` between `"talk-open"` and `"talk-closed"` every 220ms. Because `currentPoseKey` is in the hook's `useEffect` dependency array, updating it schedules the next toggle, maintaining a continuous mouth movement while in the `talking` state.

---

### B. Celebration Overlay Framework
1. **Overlay Activation** (`src/components/gretel/GretelCelebration.tsx` lines 13-24):
   - The component listens to the `"gretel:celebrate"` window event:
     ```typescript
     window.addEventListener("gretel:celebrate", handleCelebrate);
     ```
   - Triggers `active = true` and saves optional custom text.
2. **Confetti Generation** (`src/components/gretel/GretelCelebration.tsx` lines 44-91):
   - An array of 40 confetti particle definitions is generated with randomized positions, colors, sizes, delays, and durations.
   - Framer-motion `motion.div` elements animate each particle from the top (`top: "-5%"`) to the bottom (`top: "105%"`) of the viewport, with a 360-degree rotation.
3. **Mascot Speech & Sparkles** (`src/components/gretel/GretelCelebration.tsx` lines 26-42, `src/components/gretel/GretelLiveAvatar.tsx` lines 60-66, 98-116):
   - Once the overlay is active, it invokes the ref method `avatarRef.current?.celebrate(celebrationText)`:
     ```typescript
     const celebrate = async (customText?: string) => {
       const text = customText || CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)];
       send({ type: "CHEER" });
       generateSparkles();
       await speakMessage(text);
       send({ type: "IDLE" });
     };
     ```
   - Sends `"CHEER"` event to the FSM.
   - Spawns yellow sparkle elements that expand, rotate, and fade out around the avatar using `motion.div`.
   - Invokes `speakMessage(text)`, which displays a speech bubble (`bubbleText`) and triggers SpeechSynthesis (`await speak(text)`).
   - Once speaking completes, resolves the promise, clears the speech bubble, and returns to `"IDLE"`.

---

### C. Voice Selection and Caching
1. **Offline Score Adjustments** (`src/lib/speak.ts` lines 35-46):
   ```typescript
   // Boost local voices when offline to ensure SpeechSynthesis functions without network calls
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
2. **Utterance Setup** (`src/lib/speak.ts` lines 94-100):
   ```typescript
   const voice = cachedVoice ?? pickBestVoice();
   if (voice) {
     u.voice = voice;
     u.lang = voice.lang;
   } else {
     u.lang = "es-ES";
   }
   ```
3. **Cache Synchronization Bug**:
   - `cachedVoice` is stored as a global module-level variable (`let cachedVoice: SpeechSynthesisVoice | null = null;`) and populated once in `ensureVoices()` during bootstrap.
   - If the application initializes while online, `cachedVoice` is populated with a high-quality online-only voice.
   - When the browser goes offline, `cachedVoice` is NOT cleared or re-evaluated, bypassing `pickBestVoice`'s offline scoring logic and attempting to use the now-inaccessible online voice, resulting in silent failures or speech errors.

---

### D. Vitest Execution & Test Failure
1. **Test Command Output**:
   Running `npx vitest run` produces the following failure in `useGretelAnimation.test.ts`:
   ```
   ❯ src/components/gretel/__tests__/useGretelAnimation.test.ts (5 tests | 1 failed) 43ms
     ...
     × handles recovery (fallback success) and enters recovery mode but stays idle 9ms
   
   AssertionError: expected false to be true
   
      92|     expect(result.current.isRecovering).toBe(true);
   ```
2. **Analysis of the Test Failure**:
   - The test defines a mock `Image` that fails (`onerror`) if the image URL contains `"/poses/"` (representing the primary poses directory), and succeeds (`onload`) otherwise.
   - `gretelPoses.ts` defines `GRETEL_POSES` as:
     ```typescript
     export const GRETEL_POSES: Record<GretelPoseState, string> = {
       "idle-1": "/cartilla/images/gretel/sitting.jpg",
       ...
     };
     ```
   - Since the configured URLs in `GRETEL_POSES` do *not* contain `"/poses/"` (they reside directly in `/cartilla/images/gretel/`), the mock `Image` resolves successfully.
   - Consequently, the preloader never throws an error, recovery mode is never activated, and `isRecovering` remains `false`, causing the test assertion to fail.

---

## 2. Logic Chain

1. **Alternate Mouth Frame Logic**:
   - A call to `speak()` sets up a `SpeechSynthesisUtterance`.
   - Event listener triggers custom window event `gretel:speak_start` on utterance launch.
   - `useGretelAnimation` translates this event to `SPEAK_START`, switching state machine to `"talking"`.
   - In `"talking"`, `runTalkingCycle` starts a recurring `setTimeout` loop that toggles between `"talk-open"` and `"talk-closed"` every 220ms.
   - Once speech ends, `gretel:speak_stop` switches the state back to `"idle"`, clearing active timers and halting frame alternation.

2. **Celebration Overlay Logic**:
   - Window event `"gretel:celebrate"` triggers state change `active = true` in `GretelCelebration`.
   - Renders 40 absolute falling confetti divs utilizing `framer-motion`.
   - Renders a ref-controlled `GretelLiveAvatar` inside a styled overlay.
   - Overlay mounts, calling `.celebrate()` on the avatar.
   - The avatar changes FSM pose to `"CHEER"`, triggers expansion sparkles, shows a congratulatory speech bubble, and calls the `speak()` utility.
   - After speech concludes, the bubble is hidden, pose returns to `"IDLE"`, and the overlay fades out after 4000ms.

3. **Offline Local Voice Priority Logic**:
   - During offline usage (`navigator.onLine === false`), `scoreVoice()` heavily boosts local voices (`+5000` points if `v.localService` is true) and penalizes online voices (`-2000` points).
   - This causes `pickBestVoice()` to rank offline-capable voices highest.
   - However, since `speak.ts` caches the voice in `cachedVoice` during initialization (`ensureVoices`), changing online status subsequently has no effect because `speak` and `speakVowel` directly use `cachedVoice` if defined without calling `pickBestVoice()`.

4. **Test Failure Logic**:
   - `useGretelAnimation.test.ts` expects `GRETEL_POSES` to contain `/poses/` in their paths.
   - `src/components/gretel/gretelPoses.ts` defines `GRETEL_POSES` with paths like `"/cartilla/images/gretel/sitting.jpg"`, which lack `/poses/`.
   - When loading the primary pose, the test's mock `Image` successfully fires `onload()` instead of throwing `onerror()`.
   - No asset recovery occurs, so `isRecovering` remains `false`, failing the assertion `expect(result.current.isRecovering).toBe(true)`.

---

## 3. Caveats

- **Network Events**: We assumed that the browser's `navigator.onLine` accurately reflects offline status. In practice, some browsers might report `onLine` even when there is no internet connection, or vice-versa.
- **Voice Cache Invalidation**: While this analysis proposes a stateful check of `navigator.onLine` to clear `cachedVoice`, if the browser's voice synthesis engine itself changes available voices (firing `voiceschanged`), `ensureVoices` handles it during bootstrap, but a dynamic status change might benefit from listening to `voiceschanged` again.
- **Asset Directory Location**: We verified that `public/cartilla/images/gretel/poses/` contains the target WebP files (e.g. `idle-1.webp`, `blink.webp`). We assume these are intended to replace the top-level files in `GRETEL_POSES`.

---

## 4. Conclusion

1. **Speaking Animations**: The mouth alternation logic operates correctly via custom events dispatched from the `speak` utility and caught by the state hook, which maintains a 220ms toggling loop in the `"talking"` state.
2. **Celebration Overlay**: Fully functional, combining Framer Motion for falling confetti, custom sparkles, speech bubbles, and integration with SpeechSynthesis via the avatar ref.
3. **Offline Voice Prioritization**: To make the offline prioritization robust, the cache mechanism in `speak.ts` must be modified to re-evaluate the best voice when the online/offline status changes. We proposed a new `getVoice()` helper that invalidates `cachedVoice` on `navigator.onLine` change.
4. **Test Suitability**: The test failure in `useGretelAnimation.test.ts` is caused by a path mismatch in `gretelPoses.ts`. The primary poses should point to `/cartilla/images/gretel/poses/` instead of `/cartilla/images/gretel/`.

A machine-applicable patch file has been saved to:
`C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\explorer_mascot\proposals.patch`

---

## 5. Verification Method

### A. Run Vitest Tests
Run the project's test suite to verify current state:
```bash
npx vitest run
```
Applying the changes in `proposals.patch` will resolve the failing test in `useGretelAnimation.test.ts` and verify that recovery transitions work properly.

### B. Manual Voice Verification (Offline test)
1. Open the app in a browser.
2. Open DevTools, go to the Network tab, and set throttling to "Offline".
3. Trigger a speech event (e.g., clicking on a letter, vowel, or completing an activity).
4. Verify that the TTS engine speaks using a local/offline Spanish voice, and that no network requests or speech errors are thrown in the console.
