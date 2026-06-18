# Handoff Report — Explorer 2

## Observation
We observed the instantiation and usage of `AudioContext` and tone matching logic in the codebase:
- **`src/lib/piano-audio.ts` (lines 3-12)**:
  ```typescript
  function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }
  ```
- **Oscillator-based audio synthesis in `src/lib/piano-audio.ts` (lines 14-48, 63-88)**:
  - Nodes created: `ctx.createGain()`, `ctx.createOscillator()`, `ctx.createBiquadFilter()`
  - Node properties modified: `osc.type = "sine"`, `osc.frequency.setValueAtTime(...)`, `filter.type = "lowpass"`
  - Scheduling / AudioParams: `setValueAtTime`, `linearRampToValueAtTime`, `exponentialRampToValueAtTime` (all chainable API methods).
  - Timings / Destinations: `ctx.currentTime`, `ctx.destination`
  - Lifecycle: `osc.start(time)`, `osc.stop(time)`
- **`AudioContext` usage in other components**:
  - `src/components/LessonTimer.tsx` (lines 17-39): Instantiates context `new Ctx()`, directly assigns `osc.frequency.value = 880`, and calls `ctx.close()`.
  - `src/components/cartilla/SessionTimer.tsx` (lines 27-56): Instantiates context `new AudioCtx()`.
  - `src/components/cartilla/DragBuildWord.tsx` (lines 31-52): Instantiates context `new AudioContext()`, assigns `osc.frequency.value = freq`, and calls `ctx.close()`.
- **SpeechRecognition tone matching in `src/components/cartilla/PianoPronunciation.tsx` (lines 55-123)**:
  - Takes raw mic transcript, converts to lowercase, trims, and strips punctuation.
  - Compares the cleaned transcript with individual syllables: `cleanTranscript.includes(pianoKeys[i].syllable.toLowerCase())`.
  - If a match is found, plays corresponding piano note frequency via `playNote()`, highlights the key as green (`"correct"`), adds it to `completedSet`, and triggers Gretel celebration / progress log.
  - If no match, plays low buzzer buzz via `playWrongBuzz()`, highlights non-completed keys as red (`"incorrect"`).
  - If all syllables are done, plays C Major arpeggio/chord via `playCorrectChord()` and calls `onComplete()`.

## Logic Chain
- A headless `jsdom` testing environment used by Vitest does not implement the browser's Web Audio API. Thus, any tests executing components that use `AudioContext` will crash with a `ReferenceError: AudioContext is not defined`.
- A mock must mock the `AudioContext` class and its dependencies (`GainNode`, `OscillatorNode`, `BiquadFilterNode`, `AudioParam`, etc.) and register them on both `globalThis` and `window` scope before test execution.
- The mock nodes must support:
  1. Setting types (`type = 'sine'`).
  2. Directly setting `.value` on AudioParams (e.g. `osc.frequency.value = 880`).
  3. Method chaining on AudioParams (e.g. `gain.gain.setValueAtTime(...).linearRampToValueAtTime(...)`).
  4. Method calls like `connect`, `disconnect`, `start`, `stop`, `resume`, and `close`.
- The mock should utilize `vi.fn()` (Vitest mock tracker) to verify node creation and method invocations in unit/integration tests.

## Caveats
- The mock is purely structural; it does not process audio signals or change time dynamically unless the mock's `currentTime` property is manually advanced in tests.
- Assumes the test framework is Vitest when importing and using `vi` from `"vitest"`.

## Conclusion
We designed a complete `AudioContext` mock that satisfies all usage cases found in the project. The proposed code structure below can be added directly to Vitest setup files.

### Proposed AudioContext Mock for `src/test/setup.ts`

```typescript
import { vi, beforeAll, afterAll } from 'vitest';

export class MockAudioParam {
  private _value = 0;

  get value() {
    return this._value;
  }

  set value(v: number) {
    this._value = v;
    this.setValueAtTime(v, 0);
  }

  setValueAtTime = vi.fn().mockImplementation((val: number) => {
    this._value = val;
    return this;
  });

  linearRampToValueAtTime = vi.fn().mockImplementation((val: number) => {
    this._value = val;
    return this;
  });

  exponentialRampToValueAtTime = vi.fn().mockImplementation((val: number) => {
    this._value = val;
    return this;
  });
}

export class MockAudioNode {
  connect = vi.fn().mockImplementation((destination) => destination);
  disconnect = vi.fn();
}

export class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

export class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = new MockAudioParam();
  start = vi.fn();
  stop = vi.fn();
}

export class MockBiquadFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = new MockAudioParam();
}

export class MockAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'running';
  currentTime = 0;
  destination = new MockAudioNode();

  createGain() {
    return new MockGainNode();
  }

  createOscillator() {
    return new MockOscillatorNode();
  }

  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }

  resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  close = vi.fn().mockImplementation(async () => {
    this.state = 'closed';
  });
}

// Function to install the mock in Vitest hooks
export function installAudioContextMock() {
  const originalAudioContext = globalThis.AudioContext;
  const originalWebkitAudioContext = (globalThis as any).webkitAudioContext;

  beforeAll(() => {
    globalThis.AudioContext = MockAudioContext as any;
    (globalThis as any).webkitAudioContext = MockAudioContext as any;

    if (globalThis.window) {
      globalThis.window.AudioContext = MockAudioContext as any;
      (globalThis.window as any).webkitAudioContext = MockAudioContext as any;
    }
  });

  afterAll(() => {
    globalThis.AudioContext = originalAudioContext;
    (globalThis as any).webkitAudioContext = originalWebkitAudioContext;

    if (globalThis.window) {
      globalThis.window.AudioContext = originalAudioContext;
      (globalThis.window as any).webkitAudioContext = originalWebkitAudioContext;
    }
  });
}
