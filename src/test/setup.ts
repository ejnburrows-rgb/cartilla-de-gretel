/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, beforeAll, afterAll, afterEach } from "vitest";
import { fireEvent, act } from "@testing-library/react";

// --- SpeechRecognition Mock ---
export class MockSpeechRecognition {
  static instances: MockSpeechRecognition[] = [];

  static getLastInstance(): MockSpeechRecognition | undefined {
    return this.instances[this.instances.length - 1];
  }

  static clearInstances() {
    this.instances = [];
  }

  continuous = false;
  interimResults = false;
  lang = "es-MX"; // Primary target Spanish pronunciation

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

// --- AudioContext Mock ---
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
  type = "sine";
  frequency = new MockAudioParam();
  start = vi.fn();
  stop = vi.fn();
}

export class MockBiquadFilterNode extends MockAudioNode {
  type = "lowpass";
  frequency = new MockAudioParam();
}

export class MockAudioContext {
  state: "suspended" | "running" | "closed" = "running";
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
    this.state = "running";
  });

  close = vi.fn().mockImplementation(async () => {
    this.state = "closed";
  });
}

// --- Gesture Simulation Helpers ---
export interface SwipeOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number; // duration in ms (defaults to 100ms)
}

/**
 * Simulates Pointer-based swipe gestures (targets: BookPageFlip & StudentWorkbookFlip)
 */
export async function simulatePointerSwipe(
  element: HTMLElement,
  { startX, startY, endX, endY, duration = 100 }: SwipeOptions,
) {
  // Fire pointerdown with start coordinates
  act(() => {
    fireEvent.pointerDown(element, {
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    });
  });

  // Advance time to calculate valid speed/duration
  if (typeof vi !== "undefined" && vi.advanceTimersByTime) {
    act(() => {
      vi.advanceTimersByTime(duration);
    });
  } else {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, duration));
    });
  }

  // Fire pointerup with end coordinates
  act(() => {
    fireEvent.pointerUp(element, {
      clientX: endX,
      clientY: endY,
      button: 0,
      buttons: 0,
    });
  });
}

/**
 * Simulates Touch-based swipe gestures (targets: useSwipeNav / window)
 */
export async function simulateTouchSwipe(
  target: HTMLElement | Window | Document,
  { startX, startY, endX, endY, duration = 100 }: SwipeOptions,
) {
  const createTouch = (x: number, y: number) => ({
    identifier: Date.now(),
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
  });

  act(() => {
    fireEvent.touchStart(target, {
      touches: [createTouch(startX, startY)],
      targetTouches: [createTouch(startX, startY)],
      changedTouches: [createTouch(startX, startY)],
    });
  });

  if (typeof vi !== "undefined" && vi.advanceTimersByTime) {
    act(() => {
      vi.advanceTimersByTime(duration);
    });
  } else {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, duration));
    });
  }

  act(() => {
    fireEvent.touchEnd(target, {
      touches: [],
      targetTouches: [],
      changedTouches: [createTouch(endX, endY)],
    });
  });
}

// Component-specific wrappers
export async function simulateBookPageSwipeNext(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 200, startY: 100, endX: 50, endY: 100 });
}

export async function simulateBookPageSwipePrev(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 50, startY: 100, endX: 200, endY: 100 });
}

export async function simulateWorkbookSwipeNext(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 100, startY: 200, endX: 100, endY: 50 });
}

export async function simulateWorkbookSwipePrev(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 100, startY: 50, endX: 100, endY: 200 });
}

export async function simulateWindowSwipeNext() {
  await simulateTouchSwipe(window, { startX: 200, startY: 100, endX: 100, endY: 100 });
}

export async function simulateWindowSwipePrev() {
  await simulateTouchSwipe(window, { startX: 100, startY: 100, endX: 200, endY: 100 });
}

// --- Global Registration Hooks ---

// Polyfill PointerEvent for JSDOM if missing
if (typeof window !== "undefined" && !window.PointerEvent) {
  class MockPointerEvent extends Event {
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    pointerId: number;
    pointerType: string;

    constructor(type: string, params: any = {}) {
      super(type, params);
      this.button = params.button || 0;
      this.buttons = params.buttons || 0;
      this.clientX = params.clientX || 0;
      this.clientY = params.clientY || 0;
      this.pointerId = params.pointerId || 1;
      this.pointerType = params.pointerType || "mouse";
    }
  }
  (window as any).PointerEvent = MockPointerEvent;
  (globalThis as any).PointerEvent = MockPointerEvent;
}

// Registration of AudioContext and SpeechRecognition
const originalAudioContext = globalThis.AudioContext;
const originalWebkitAudioContext = (globalThis as any).webkitAudioContext;

beforeAll(() => {
  // SpeechRecognition globals
  (globalThis as any).SpeechRecognition = MockSpeechRecognition;
  (globalThis as any).webkitSpeechRecognition = MockSpeechRecognition;

  if (typeof window !== "undefined") {
    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;
  }

  // AudioContext globals
  globalThis.AudioContext = MockAudioContext as any;
  (globalThis as any).webkitAudioContext = MockAudioContext as any;

  if (typeof window !== "undefined") {
    (window as any).AudioContext = MockAudioContext as any;
    (window as any).webkitAudioContext = MockAudioContext as any;
  }
});

afterAll(() => {
  // Restore AudioContext globals
  globalThis.AudioContext = originalAudioContext;
  (globalThis as any).webkitAudioContext = originalWebkitAudioContext;

  if (typeof window !== "undefined") {
    (window as any).AudioContext = originalAudioContext;
    (window as any).webkitAudioContext = originalWebkitAudioContext;
  }
});

afterEach(() => {
  // Reset MockSpeechRecognition state
  MockSpeechRecognition.clearInstances();
});
