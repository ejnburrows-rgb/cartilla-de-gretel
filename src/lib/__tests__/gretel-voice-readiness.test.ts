import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  speakAsGretel,
  cancelGretelSpeech,
  isGretelVoiceMuted,
  setGretelVoiceMuted,
  getGretelVoiceProviderConfig,
  setGretelVoiceProviderConfig,
  resetGretelVoiceProviderConfig,
  getSelectedGretelVoiceName,
  getAvailableGretelVoices,
  scoreVoice,
} from "../gretel-voice";
import { speakGretelPhrase } from "../gretel-tts";
import { claimSpeech, speechIsCurrent } from "../speech-playback";

describe("Gretel Voice Readiness Architecture", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    setGretelVoiceMuted(false);
    resetGretelVoiceProviderConfig();
  });

  afterEach(() => {
    resetGretelVoiceProviderConfig();
    vi.restoreAllMocks();
  });

  it("proves provider configuration centralized defaults and custom swapping", () => {
    const defaultConfig = getGretelVoiceProviderConfig();
    expect(defaultConfig.type).toBe("browser-tts");
    expect(defaultConfig.primaryVoiceName).toBe("Leda");

    setGretelVoiceProviderConfig({
      type: "recorded-audio",
      name: "Recorded Clips Provider",
      primaryVoiceName: "Studio Recording - Gretel",
    });

    const updatedConfig = getGretelVoiceProviderConfig();
    expect(updatedConfig.type).toBe("recorded-audio");
    expect(updatedConfig.primaryVoiceName).toBe("Studio Recording - Gretel");

    resetGretelVoiceProviderConfig();
    expect(getGretelVoiceProviderConfig().type).toBe("browser-tts");
  });

  it("treats punctuation in browser voice labels as literal text", () => {
    setGretelVoiceProviderConfig({
      type: "browser-tts",
      name: "Literal OS voice label test",
      primaryVoiceName: "Español (México)",
      fallbackVoiceName: "Voz [1]",
    });
    const voice = (name: string) => ({ name, lang: "es-MX", localService: true } as SpeechSynthesisVoice);
    expect(scoreVoice(voice("Español (México)"))).toBeGreaterThan(scoreVoice(voice("Voz [1]")));
    expect(scoreVoice(voice("Voz [1]"))).toBeGreaterThan(scoreVoice(voice("Voz 1")));
  });

  it("proves single-owner speech claiming cancels prior playback token", () => {
    const token1 = claimSpeech("gretel");
    expect(speechIsCurrent(token1)).toBe(true);

    const token2 = claimSpeech("gretel");
    expect(speechIsCurrent(token1)).toBe(false);
    expect(speechIsCurrent(token2)).toBe(true);

    const token3 = claimSpeech("picture");
    expect(speechIsCurrent(token2)).toBe(false);
    expect(speechIsCurrent(token3)).toBe(true);
  });

  it("proves mute and cancel cleanup behavior", () => {
    setGretelVoiceMuted(true);
    expect(isGretelVoiceMuted()).toBe(true);

    const onEnd = vi.fn();
    void speakAsGretel("Test while muted", { onEnd });

    expect(onEnd).toHaveBeenCalled();

    setGretelVoiceMuted(false);
    expect(isGretelVoiceMuted()).toBe(false);

    expect(() => cancelGretelSpeech()).not.toThrow();
  });

  it("proves custom voice provider delegation", async () => {
    const customSpeakFn = vi.fn().mockImplementation((text, handlers) => {
      handlers.onStart?.();
      handlers.onEnd?.();
      return Promise.resolve();
    });

    setGretelVoiceProviderConfig({
      type: "custom",
      name: "Mock Cloud Provider",
      speakFn: customSpeakFn,
    });

    const startListener = vi.fn();
    const stopListener = vi.fn();
    window.addEventListener("gretel:speak_start", startListener);
    window.addEventListener("gretel:speak_stop", stopListener);

    const onStart = vi.fn();
    const onEnd = vi.fn();

    await speakAsGretel("Hola niños", { onStart, onEnd });

    expect(customSpeakFn).toHaveBeenCalledWith("Hola niños", expect.any(Object));
    expect(onStart).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
    expect(startListener).toHaveBeenCalled();
    expect(stopListener).toHaveBeenCalled();

    window.removeEventListener("gretel:speak_start", startListener);
    window.removeEventListener("gretel:speak_stop", stopListener);
  });

  it("proves speakGretelPhrase in gretel-tts routes through speakAsGretel pipeline", async () => {
    const customSpeakFn = vi.fn().mockResolvedValue(undefined);
    setGretelVoiceProviderConfig({
      type: "custom",
      name: "Mock Feedback Provider",
      speakFn: customSpeakFn,
    });

    speakGretelPhrase("¡Muy bien!");

    expect(customSpeakFn).toHaveBeenCalledWith("¡Muy bien!", expect.any(Object));
  });

  it("handles voice filtering and scores", () => {
    const voices = getAvailableGretelVoices();
    expect(Array.isArray(voices)).toBe(true);
    expect(typeof getSelectedGretelVoiceName()).toBe("string");
  });
});
