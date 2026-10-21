/**
 * Tutor voice guard tests (spec §6):
 *  - speechSynthesis.speak is NEVER called on any tutor path (spy)
 *  - the provider guard blocks misconfigured providers
 *  - mute is honored
 *  - pending / unknown lines resolve to gentle silence
 *  - approved lines play through an HTMLAudioElement with a viseme-timeline callback
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getGretelVoiceProviderConfig,
  resetGretelVoiceProviderConfig,
  setGretelVoiceProviderConfig,
  setGretelVoiceMuted,
} from "../gretel-voice";
import {
  findTutorLineByText,
  mountTutorVoice,
  speakTutorLine,
  TUTOR_VOICE_PROVIDER_NAME,
  tutorLines,
} from "../tutor-voice";

const APPROVED_WORD = "oso"; // l1-model-oso → /audio/voz/vocabulario/oso.mp3
const APPROVED_SRC = "/audio/voz/vocabulario/oso.mp3";
const PENDING_TEXT = "[DRAFT — owner to approve] ¡Perfecto!";

describe("tutor voice (recorded line bank, no TTS path)", () => {
  let originalSpeechSynthesis: typeof window.speechSynthesis;
  let originalSpeechSynthesisUtterance: typeof window.SpeechSynthesisUtterance;
  let speakSpy: ReturnType<typeof vi.fn>;
  let playSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    resetGretelVoiceProviderConfig();
    setGretelVoiceMuted(false);

    // Global speechSynthesis spy: every assertion in this file checks it stays at 0.
    originalSpeechSynthesis = window.speechSynthesis;
    speakSpy = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      value: { cancel: vi.fn(), speak: speakSpy, getVoices: vi.fn().mockReturnValue([]) },
      writable: true,
      configurable: true,
    });
    originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class MockUtterance {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
      writable: true,
      configurable: true,
    });

    // jsdom does not implement HTMLMediaElement.play; any call is recorded and
    // immediately "ends" playback so promises resolve deterministically.
    playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("ended"));
      return Promise.resolve();
    });
  });

  afterEach(() => {
    playSpy.mockRestore();
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
    resetGretelVoiceProviderConfig();
    setGretelVoiceMuted(false);
  });

  it("mounts the recorded-audio provider and restores the previous config on unmount", () => {
    const before = getGretelVoiceProviderConfig();
    expect(before.type).toBe("browser-tts");

    const unmount = mountTutorVoice();
    const mounted = getGretelVoiceProviderConfig();
    expect(mounted.type).toBe("recorded-audio");
    expect(mounted.name).toBe(TUTOR_VOICE_PROVIDER_NAME);
    expect(typeof mounted.speakFn).toBe("function");

    unmount();
    const restored = getGretelVoiceProviderConfig();
    expect(restored.type).toBe(before.type);
    expect(restored.name).toBe(before.name);
    expect(restored.speakFn).toBeUndefined();
  });

  it("plays an approved line through an HTMLAudioElement and emits the viseme timeline", async () => {
    const onVisemeTimeline = vi.fn();
    const onSilentLine = vi.fn();
    const unmount = mountTutorVoice({ onVisemeTimeline, onSilentLine });
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const result = await speakTutorLine(APPROVED_WORD, { onStart, onEnd });

    expect(result).toBe("spoken");
    expect(playSpy).toHaveBeenCalledTimes(1);
    const audio = playSpy.mock.instances[0] as unknown as HTMLAudioElement;
    expect(audio.src.endsWith(APPROVED_SRC)).toBe(true);
    expect(onVisemeTimeline).toHaveBeenCalledTimes(1);
    expect(onVisemeTimeline).toHaveBeenCalledWith([], "l1-model-oso");
    expect(onSilentLine).not.toHaveBeenCalled();
    expect(onStart).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
    expect(speakSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("resolves pending, reused, and unknown lines to gentle silence with no error", async () => {
    const onSilentLine = vi.fn();
    const unmount = mountTutorVoice({ onSilentLine });
    const reusedText = "¡Muy bien! (reuse: buildSuccessLine)";

    const pending = await speakTutorLine(PENDING_TEXT);
    const reused = await speakTutorLine(reusedText);
    const unknown = await speakTutorLine("palabra que no está en el banco");

    expect(pending).toBe("silent");
    expect(reused).toBe("silent");
    expect(unknown).toBe("silent");
    expect(onSilentLine).toHaveBeenCalledTimes(3);
    expect(playSpy).not.toHaveBeenCalled();
    expect(speakSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("honors the Gretel mute flag on every tutor path", async () => {
    const unmount = mountTutorVoice();
    setGretelVoiceMuted(true);

    const approved = await speakTutorLine(APPROVED_WORD);
    const pending = await speakTutorLine(PENDING_TEXT);

    expect(approved).toBe("silent");
    expect(pending).toBe("silent");
    expect(playSpy).not.toHaveBeenCalled();
    expect(speakSpy).not.toHaveBeenCalled();

    setGretelVoiceMuted(false);
    const unmuted = await speakTutorLine(APPROVED_WORD);
    expect(unmuted).toBe("spoken");
    expect(playSpy).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("never calls speechSynthesis.speak on any tutor path", async () => {
    const unmount = mountTutorVoice();
    for (const text of [APPROVED_WORD, PENDING_TEXT, "¡Muy bien! (reuse: buildSuccessLine)", "no existe"]) {
      await speakTutorLine(text);
    }
    expect(speakSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("the provider guard refuses to speak when the provider is misconfigured", async () => {
    // Default browser-tts provider: guard must not let speakAsGretel reach TTS.
    resetGretelVoiceProviderConfig();
    const viaBrowserTts = await speakTutorLine(APPROVED_WORD);
    expect(viaBrowserTts).toBe("silent");
    expect(speakSpy).not.toHaveBeenCalled();

    // Any other provider with its own speakFn: guard must refuse to call it too.
    const foreignSpeakFn = vi.fn();
    setGretelVoiceProviderConfig({ type: "custom", name: "Foreign", speakFn: foreignSpeakFn });
    const viaCustom = await speakTutorLine(APPROVED_WORD);
    expect(viaCustom).toBe("silent");
    expect(foreignSpeakFn).not.toHaveBeenCalled();
    expect(speakSpy).not.toHaveBeenCalled();
  });

  it("builds the text → line map from the manifest, including reuse-wording cleanup", () => {
    const approvedEntry = findTutorLineByText(APPROVED_WORD);
    expect(approvedEntry?.lineId).toBe("l1-model-oso");
    expect(approvedEntry?.src).toBe(APPROVED_SRC);

    // Reused-but-unrecorded wording resolves by its exact text or clean wording.
    const withNote = findTutorLineByText("¡Muy bien! (reuse: buildSuccessLine)");
    const clean = findTutorLineByText("¡Muy bien!");
    expect(withNote?.lineId).toBe("l0-praise-01");
    expect(clean?.lineId).toBe("l0-praise-01");

    expect(tutorLines.approved.length).toBe(43);
    expect(tutorLines.pending.length).toBeGreaterThan(0);
  });
});
