/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { AUDIO_POLICY } from "@/content/audio-manifest";
import { speak, speakVowel } from "../speak";

describe("shared speech stays silent while device TTS is disabled", () => {
  afterEach(() => vi.restoreAllMocks());

  it("keeps normal and vowel lesson lines silent and resolves so the session continues", async () => {
    const nativeSpeak = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak: nativeSpeak, cancel: vi.fn(), getVoices: vi.fn(() => []) },
    });

    expect(AUDIO_POLICY.allowTts).toBe(false);
    await speak("Línea de tutor sin grabación aprobada.");
    await speakVowel("a");
    const nextSessionStep = vi.fn();
    await speak("Siguiente paso de la sesión.").then(nextSessionStep);

    expect(nativeSpeak).not.toHaveBeenCalled();
    expect(nextSessionStep).toHaveBeenCalledOnce();
  });
});
