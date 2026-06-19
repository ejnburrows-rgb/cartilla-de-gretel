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
