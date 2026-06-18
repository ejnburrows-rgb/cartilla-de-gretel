# Handoff Report: Speech Recognition Investigation & Vitest Mock Design

This report outlines the usage of the Web Speech API / SpeechRecognition in the codebase and provides a Vitest-compatible mock for testing the speech recognition logic.

---

## 1. Observation

### Key Codebase Locations
1. **`src/hooks/useSpeechRecognition.ts`**:
   Exposes the `useSpeechRecognition` hook. It resolves `SpeechRecognition` or `webkitSpeechRecognition` from the `window` object and configures listeners for start, result, error, and end events.
   *Excerpt (lines 20–58):*
   ```typescript
   useEffect(() => {
     if (typeof window !== "undefined") {
       const SpeechRecognition =
         (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
       
       if (SpeechRecognition) {
         setIsSupported(true);
         const recognition = new SpeechRecognition();
         recognition.continuous = false;
         recognition.interimResults = false;
         recognition.lang = "es-MX"; // Primary target Spanish pronunciation

         recognition.onstart = () => {
           setIsListening(true);
           setError(null);
           setTranscript("");
         };

         recognition.onresult = (event: any) => {
           const result = event.results[event.results.length - 1];
           if (result && result[0]) {
             setTranscript(result[0].transcript);
           }
         };

         recognition.onerror = (event: any) => {
           console.warn("[SpeechRecognition Error]", event.error);
           setError(event.error);
           setIsListening(false);
         };

         recognition.onend = () => {
           setIsListening(false);
         };

         recognitionRef.current = recognition;
       }
     }
   }, []);
   ```

2. **`src/components/cartilla/PianoPronunciation.tsx`**:
   A React component rendering "El Piano Hablador". It uses the `useSpeechRecognition` hook to record the user's voice and checks if their transcript matches one of the target syllables.
   *Excerpt (lines 55–80):*
   ```typescript
   useEffect(() => {
     if (!transcript) return;
     const cleanTranscript = transcript.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
     
     // Find matching syllable
     let matchIdx = -1;
     for (let i = 0; i < pianoKeys.length; i++) {
       if (cleanTranscript.includes(pianoKeys[i].syllable.toLowerCase())) {
         matchIdx = i;
         break;
       }
     }

     if (matchIdx !== -1) {
       const matchSyllable = pianoKeys[matchIdx].syllable;
       // Success!
       playNote(pianoKeys[matchIdx].frequency, 1.0);
       setKeyStates((prev) => ({ ...prev, [matchIdx]: "correct" }));
       setCompletedSet((prev) => {
         const next = new Set(prev);
         next.add(matchSyllable);
         return next;
       });
       setHelperText(`¡Excelente! Dijeste: "${transcript}"`);
       // ...
   ```

---

## 2. Logic Chain

1. **Global Hook Access**: `useSpeechRecognition.ts` reads `SpeechRecognition` from `(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition`. Therefore, a Vitest/jsdom mock must stub these properties globally on `window` or `global` during test setup and clean them up afterward.
2. **Properties and Methods**:
   - The instantiated class needs `continuous`, `interimResults`, and `lang` properties to avoid runtime reference errors.
   - It needs to define `start()` and `stop()` methods.
   - To mock speech flow asynchronously (mirroring standard Web Speech behavior), the mock's `start()` should trigger `onstart()` on the next event loop tick (`setTimeout(..., 0)`). Similarly, `stop()` should trigger `onend()`.
3. **Data Event Payload**:
   - The `onresult` callback accesses the payload using `event.results[event.results.length - 1][0].transcript`.
   - The mock helper `triggerResult(transcript)` must construct a matching nested array/array-like structure:
     `results: [{ 0: { transcript }, length: 1 }]` where `results.length` matches the array size.
   - The `onerror` callback reads `event.error`. The mock helper `triggerError(error)` must pass `{ error }` to `onerror`.

---

## 3. Caveats

- **Latency Simulation**: The mock uses `setTimeout(..., 0)` to simulate browser event-loop ticks for callback invokes. While perfect for standard unit testing, tests that use fake timers (`vi.useFakeTimers()`) will need to advance timers (e.g. `await vi.advanceTimersByTimeAsync(0)` or `vi.runOnlyPendingTimers()`) for hooks to update.
- **Audio Stream Mocking**: The mock does not stub or invoke media permission prompts (`navigator.mediaDevices.getUserMedia`) as those details are managed internally by the browser's implementation of the SpeechRecognition class and are not accessed in the hook code itself.

---

## 4. Conclusion

We designed a fully Vitest-compatible mock called `MockSpeechRecognition`. It tracks active instances, models the inner structures of events, and allows mock triggers for testing speech success and failures.

### Recommended Mock Code
Create a file `src/hooks/__tests__/mockSpeechRecognition.ts` or inline it in test suites:

```typescript
import { vi } from "vitest";

export class MockSpeechRecognition {
  static instances: MockSpeechRecognition[] = [];

  static getLastInstance(): MockSpeechRecognition | undefined {
    return this.instances[this.instances.length - 1];
  }

  static clearInstances() {
    this.instances = [];
  }

  // SpeechRecognition standard properties
  continuous = false;
  interimResults = false;
  lang = "en-US";

  // Callbacks
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  private isListening = false;

  constructor() {
    MockSpeechRecognition.instances.push(this);
  }

  start = vi.fn().mockImplementation(() => {
    if (this.isListening) return;
    this.isListening = true;
    // Asynchronous trigger to mimic actual SpeechRecognition browser timing
    setTimeout(() => {
      if (this.isListening && this.onstart) {
        this.onstart();
      }
    }, 0);
  });

  stop = vi.fn().mockImplementation(() => {
    if (!this.isListening) return;
    this.isListening = false;
    setTimeout(() => {
      if (this.onend) {
        this.onend();
      }
    }, 0);
  });

  abort = vi.fn().mockImplementation(() => {
    if (!this.isListening) return;
    this.isListening = false;
    setTimeout(() => {
      if (this.onend) {
        this.onend();
      }
    }, 0);
  });

  // Test Helpers
  triggerResult(transcript: string, isFinal = true) {
    if (!this.isListening) return;
    const event = {
      resultIndex: 0,
      results: [
        {
          isFinal,
          0: {
            transcript,
            confidence: 0.99,
          },
          length: 1,
        },
      ],
    };
    (event.results as any).length = 1;

    if (this.onresult) {
      this.onresult(event);
    }
  }

  triggerError(error: string) {
    if (!this.isListening) return;
    if (this.onerror) {
      this.onerror({ error });
    }
    this.stop();
  }
}
```

### Example Hook Test (`src/hooks/__tests__/useSpeechRecognition.test.ts`)
The mock is used in tests like this:

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "../useSpeechRecognition";
import { MockSpeechRecognition } from "./mockSpeechRecognition";

describe("useSpeechRecognition hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    MockSpeechRecognition.clearInstances();
  });

  it("should report not supported when SpeechRecognition is missing", () => {
    // Ensure both globals are undefined
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);
  });

  it("should initialize correct states when supported", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe("");
    expect(result.current.error).toBeNull();
  });

  it("should handle start and stop listening", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    // Advance timer to trigger the asynchronous onstart event
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });

    // Advance timer to trigger the asynchronous onend event
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(false);
  });

  it("should receive a transcript when speech recognition returns a result", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const mockInstance = MockSpeechRecognition.getLastInstance();
    expect(mockInstance).toBeDefined();

    act(() => {
      mockInstance?.triggerResult("hola caracola");
    });

    expect(result.current.transcript).toBe("hola caracola");
  });

  it("should handle speech recognition errors", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const mockInstance = MockSpeechRecognition.getLastInstance();
    act(() => {
      mockInstance?.triggerError("not-allowed");
    });

    expect(result.current.error).toBe("not-allowed");
    expect(result.current.isListening).toBe(false);
  });
});
```

---

## 5. Verification Method

1. **Verify the environment configuration**:
   Ensure Vitest is configured to run tests. Execute:
   ```powershell
   npx vitest run
   ```
   All existing tests should continue to pass.
2. **Testing the Mock Functionality**:
   To test that the mock functions as intended, you can temporarily create `src/hooks/__tests__/useSpeechRecognition.test.ts` with the provided code and run:
   ```powershell
   npx vitest run src/hooks/__tests__/useSpeechRecognition.test.ts
   ```
   All five tests inside the new suite should pass successfully, verifying that both the mock and the hook integration behave exactly as specified.
