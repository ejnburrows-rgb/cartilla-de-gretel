# Handoff Report — Piano Pronunciation Analysis

## 1. Observation
We conducted a read-only code analysis of the files related to the piano pronunciation activity:
1. **`src/components/cartilla/PianoPronunciation.tsx`** (266 lines)
2. **`src/hooks/useSpeechRecognition.ts`** (87 lines)
3. **`src/lib/piano-audio.ts`** (101 lines)
4. **`src/lib/speak.ts`** (155 lines)

We observed the following code sections and behaviors:

### Speech Recognition & Spanish Locales
In `src/hooks/useSpeechRecognition.ts`:
- Line 30: `recognition.lang = "es-MX"; // Primary target Spanish pronunciation`
- The `useSpeechRecognition` hook does not accept any language parameter, hardcoding the locale to `es-MX`.
- There is no cleanup returning function from the initialization `useEffect` to call `recognitionRef.current.abort()`. If the component unmounts while the browser is recording, the microphone permission indicator stays active.

### AudioContext Piano Synthesis
In `src/lib/piano-audio.ts`:
- Lines 14-48: The function `playNote` uses a master gain node with an exponential decay, combined with two oscillators:
  - `osc1`: type `"sine"` at the fundamental frequency `freq` (lines 30-35).
  - `osc2`: type `"triangle"` at the second harmonic `freq * 2` (lines 38-47), with a fast decay.
- There is no code disconnecting the nodes (`osc1`, `osc2`, `gain2`, `masterGain`) after they finish playing, which could cause a buildup of active AudioNodes in the browser's context.

### Feedback State Management & Key Rendering
In `src/components/cartilla/PianoPronunciation.tsx`:
- Lines 98-111 (Incorrect feedback handling):
  ```typescript
  } else {
    // No match, flash keys red
    playWrongBuzz();
    setHelperText(`Escuché: "${transcript}". ¡Intenta otra vez!`);
    // Shake all non-completed keys briefly
    const updatedStates: Record<number, "idle" | "correct" | "incorrect"> = {};
    pianoKeys.forEach((_, idx) => {
      updatedStates[idx] = "incorrect";
    });
    setKeyStates(updatedStates);
    
    setTimeout(() => {
      setKeyStates({});
    }, 1000);
  }
  ```
  This marks all keys as `"incorrect"`, regardless of whether they have already been completed (`completedSet`).
- Lines 174-181 (Key container styling):
  ```typescript
  className={cn(
    "absolute inset-0 bg-white border border-stone-200 rounded-b-xl shadow-md transition-all duration-150 flex flex-col justify-end items-center pb-4",
    "group-active:pt-2 group-active:pb-2 group-active:shadow-sm",
    isActive && "bg-amber-100 scale-y-[0.98]",
    state === "correct" && "bg-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] text-white",
    state === "incorrect" && "bg-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] text-white"
  )}
  ```
- Line 187 (Syllable text styling):
  ```typescript
  <span className="text-xl font-black font-display text-stone-800 group-hover:scale-110 transition-transform">
    {key.syllable}
  </span>
  ```
  The hardcoded `text-stone-800` overrides the parent container's dynamic `text-white` class when correct/incorrect, resulting in low contrast (dark gray text on green or red background).
- Lines 125-130 (Key listening action):
  ```typescript
  const listenToSyllable = async (syllable: string, index: number) => {
    setActiveKeyIdx(index);
    playNote(pianoKeys[index].frequency, 0.6);
    await speak(syllable);
    setActiveKeyIdx(null);
  };
  ```
  If speech recognition is active when `listenToSyllable` is called, the synthesized Spanish speaker audio (TTS) is played through the device's speakers, which is immediately picked up by the microphone. This causes the speech recognizer to transcribe its own audio and automatically mark the key as correct.

---

## 2. Logic Chain
1. **Locale Limitation**: Because `recognition.lang` is hardcoded to `"es-MX"` in `useSpeechRecognition.ts:30` and cannot be customized via parameters, the app cannot easily be configured for classrooms using Castilian Spanish (`es-ES`) or other regional variants. Adding a parameter allows the caller to control this dynamic.
2. **Resource Leak**: Lacking a cleanup return function in `useSpeechRecognition.ts`'s mount effect means the browser's Web Speech API recognition service continues running in the background when the user navigates away, leading to microphone leak issues.
3. **Clinical Timbre**: The synthesis model in `playNote` relies on only two oscillators (fundamental sine + second harmonic triangle). While this is simple, it lacks the characteristic overtone presence of a real piano string (which has multiple harmonics, e.g., 3rd and 4th).
4. **Node Accumulation**: Web Audio API nodes that are not explicitly disconnected can result in a memory leak and high CPU load in certain browsers (especially Safari).
5. **Feedback Rendering Bugs**:
   - Marking all keys as `"incorrect"` on failure contradicts the code comment ("Shake all non-completed keys briefly") and causes completed keys to flash red, which ruins the sense of accomplishment.
   - The text span color `text-stone-800` takes precedence over the parent container's `text-white`. Consequently, when keys turn green/red, the text contrast is poor.
   - The audio feedback loop lets the microphone hear the TTS voice pronouncing the syllable. This can be resolved by turning off SpeechRecognition temporarily during synthesis.

---

## 3. Caveats
- Browser-specific behavior: Web Speech API (`SpeechRecognition`) is only fully supported in Google Chrome, Edge, and Safari. Other browsers will show the unsupported message, which is correctly handled by `isSupported`.
- Offline SpeechSynthesis: Offline mode can lead to fallback voices being picked. The scoring logic in `speak.ts` properly prioritizes local voices, but synthesis latency or voice quality might change.

---

## 4. Conclusion
The current implementation of the Talking Piano activity is functional but contains several key bugs and architectural deficiencies:
1. **SpeechRecognition** does not support dynamic Spanish dialects (hardcoded `es-MX`) and lacks clean-up logic.
2. **AudioContext** oscillator sound is overly simplistic and lacks node cleanup, creating a leak risk.
3. **Feedback and Styling** contains major visual contrast bugs, causes completed keys to shake red upon error, and suffers from a self-recognition audio feedback loop.

We recommend applying the changes captured in `piano_improvements.patch` to resolve these issues.

---

## 5. Verification Method
1. **Check Code Integration**: Apply `piano_improvements.patch` using `git apply piano_improvements.patch`.
2. **Inspect Cleanups**: Open Chrome DevTools, navigate to the Talking Piano page, and start/stop the microphone. Verify in the Console that no errors occur. Unmount the component and verify the recording indicator goes away.
3. **Test Contrast**: Trigger incorrect pronunciation. Check that completed keys do not turn red/shake, and that the text color of the syllables changes to white on correct (green) and incorrect (red) keys.
4. **Test Feedback Loop**: Enable the microphone, click the "Listen" button on a key. Confirm the speech recognizer is paused during TTS playback and does not automatically complete the key.
5. **Listen to Piano Notes**: Play the keys and confirm a richer, more warm/harmonic piano sound is synthesized.
