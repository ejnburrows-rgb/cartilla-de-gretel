/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { speak, speakVowel } from "../speak";

describe("Speak API - Voice Caching and Offline Support", () => {
  let originalSpeechSynthesis: typeof window.speechSynthesis;
  let originalSpeechSynthesisUtterance: typeof window.SpeechSynthesisUtterance;
  let originalNavigator: typeof navigator;

  let mockVoices: any[] = [];
  let spokenUtterance: any = null;
  let onlineState = true;

  beforeEach(() => {
    // Mock navigator.onLine
    originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: {
        get onLine() {
          return onlineState;
        },
      },
      writable: true,
      configurable: true,
    });

    // Mock SpeechSynthesis
    originalSpeechSynthesis = window.speechSynthesis;
    const mockSpeechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn().mockImplementation((utterance) => {
        spokenUtterance = utterance;
        // Simulate speech end asynchronously
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onend) utterance.onend();
          }, 10);
        }, 10);
      }),
      getVoices: vi.fn().mockImplementation(() => mockVoices),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });

    // Mock SpeechSynthesisUtterance
    originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    class MockSpeechSynthesisUtterance {
      text: string;
      voice: any = null;
      lang = "";
      rate = 1.0;
      pitch = 1.0;
      volume = 1.0;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });

    // Reset mocks and state
    spokenUtterance = null;
    onlineState = true;

    // Define two voices: Google español (online preferred) and Microsoft Sabina (local service)
    mockVoices = [
      {
        name: "Google español",
        lang: "es-ES",
        localService: false,
      },
      {
        name: "Microsoft Sabina",
        lang: "es-ES",
        localService: true,
      },
    ];
  });

  afterEach(() => {
    // Restore globals
    Object.defineProperty(window, "speechSynthesis", {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: originalSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should select the online-preferred voice when online and cache it", async () => {
    onlineState = true;
    await speak("Hola, ¿cómo estás?");

    expect(spokenUtterance).not.toBeNull();
    expect(spokenUtterance.voice?.name).toBe("Google español");

    // Clear spokenUtterance, modify mockVoices list to show that getVoices is bypassed due to caching
    spokenUtterance = null;
    mockVoices = [];

    await speak("Segunda frase");
    expect(spokenUtterance).not.toBeNull();
    // Should still use cached "Google español" voice
    expect(spokenUtterance.voice?.name).toBe("Google español");
  });

  it("should invalidate the voice cache and select the local voice when transition to offline occurs", async () => {
    // First call online to populate cache
    onlineState = true;
    await speak("Hola online");
    expect(spokenUtterance.voice?.name).toBe("Google español");

    // Transition offline
    onlineState = false;
    spokenUtterance = null;

    await speak("Hola offline");
    expect(spokenUtterance).not.toBeNull();
    // Cache must have been invalidated and updated to prioritize the local voice
    expect(spokenUtterance.voice?.name).toBe("Microsoft Sabina");
  });

  it("should invalidate the voice cache and select the online voice when transition back to online occurs", async () => {
    // First call offline to populate cache with Microsoft Sabina
    onlineState = false;
    await speak("Hola offline");
    expect(spokenUtterance.voice?.name).toBe("Microsoft Sabina");

    // Transition online
    onlineState = true;
    spokenUtterance = null;

    await speak("Hola online de nuevo");
    expect(spokenUtterance).not.toBeNull();
    // Cache must have been invalidated and updated to prioritize the online voice again
    expect(spokenUtterance.voice?.name).toBe("Google español");
  });
});

// Separate describe block: the "never a silent fallback" guarantee. Uses
// vi.resetModules() + a dynamic import per test so each test gets a FRESH
// copy of speak.ts's module-level `loggedFallback`/`cachedVoice` state —
// the real module only warns once ever, so proving "warns once" and "does
// not warn twice" both need an isolated module instance per test, not the
// shared import the tests above use.
describe("Speak API - no-voice / wrong-dialect fallback is never silent", () => {
  let originalSpeechSynthesis: typeof window.speechSynthesis;
  let originalSpeechSynthesisUtterance: typeof window.SpeechSynthesisUtterance;
  let originalNavigator: typeof navigator;
  let mockVoices: any[] = [];
  let spokenUtterance: any = null;

  function installMocks() {
    originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: { get onLine() { return true; } },
      writable: true,
      configurable: true,
    });

    originalSpeechSynthesis = window.speechSynthesis;
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: vi.fn(),
        speak: vi.fn().mockImplementation((utterance) => {
          spokenUtterance = utterance;
          setTimeout(() => {
            if (utterance.onstart) utterance.onstart();
            setTimeout(() => {
              if (utterance.onend) utterance.onend();
            }, 5);
          }, 5);
        }),
        getVoices: vi.fn().mockImplementation(() => mockVoices),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    class MockSpeechSynthesisUtterance {
      text: string;
      voice: any = null;
      lang = "";
      rate = 1.0;
      pitch = 1.0;
      volume = 1.0;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
  }

  function restoreMocks() {
    Object.defineProperty(window, "speechSynthesis", {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: originalSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  }

  beforeEach(() => {
    spokenUtterance = null;
    mockVoices = [];
    installMocks();
  });

  afterEach(() => {
    restoreMocks();
    vi.restoreAllMocks();
  });

  it("warns once and still speaks with the best available voice when every installed voice is a non-neutral Spanish dialect (es-ES)", async () => {
    vi.resetModules();
    mockVoices = [
      { name: "Google español", lang: "es-ES", localService: false },
      { name: "Microsoft Sabina", lang: "es-ES", localService: true },
    ];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { speak: freshSpeak } = await import("../speak");

    await freshSpeak("Hola, ¿cómo estás?");

    expect(spokenUtterance).not.toBeNull();
    expect(spokenUtterance.voice?.name).toBe("Google español");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(
      /No neutral Latin American Spanish voice.*Falling back to "Google español" \(es-ES\)/,
    );
  });

  it("does not repeat the fallback warning on a second call within the same session (logged once, not spammed)", async () => {
    vi.resetModules();
    mockVoices = [{ name: "Google español", lang: "es-ES", localService: false }];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { speak: freshSpeak } = await import("../speak");

    await freshSpeak("Primera frase");
    await freshSpeak("Segunda frase");

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("logs a distinct warning and falls back to an es-MX lang hint with NO voice object when the device has zero Spanish voices installed", async () => {
    vi.resetModules();
    mockVoices = [
      { name: "Samantha", lang: "en-US", localService: true },
      { name: "Daniel", lang: "en-GB", localService: false },
    ];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { speak: freshSpeak } = await import("../speak");

    await freshSpeak("Hola sin voz en español");

    expect(spokenUtterance).not.toBeNull();
    expect(spokenUtterance.voice).toBeNull();
    expect(spokenUtterance.lang).toBe("es-MX");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(
      /No Spanish voice available on this device at all.*es-MX as a lang hint/,
    );
  });

  it("speakVowel also falls back to an es-MX lang hint (no voice object) when the device has zero Spanish voices", async () => {
    vi.resetModules();
    mockVoices = [{ name: "Samantha", lang: "en-US", localService: true }];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { speakVowel: freshSpeakVowel } = await import("../speak");

    await freshSpeakVowel("a");

    expect(spokenUtterance).not.toBeNull();
    expect(spokenUtterance.voice).toBeNull();
    expect(spokenUtterance.lang).toBe("es-MX");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
