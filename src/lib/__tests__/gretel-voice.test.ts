import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildLessonIntroLines,
  cancelGretelSpeech,
  isGretelVoiceMuted,
  setGretelVoiceMuted,
} from "../gretel-voice";

describe("buildLessonIntroLines", () => {
  it("uses real L1 intro title/subtitle data only", () => {
    const lines = buildLessonIntroLines({
      n: 1,
      kind: "intro",
      title: "Introducción de las vocales",
      subtitle: "Las cinco vocales: a, e, i, o, u",
    });
    expect(lines[0]).toMatch(/vocales/i);
    expect(lines.join(" ")).toContain("a, e, i, o, u");
    expect(lines.join(" ").length).toBeLessThan(120);
  });

  it("uses real L7 consonant letter", () => {
    const lines = buildLessonIntroLines({
      n: 7,
      kind: "consonant",
      title: "Letra M m",
      letter: "M",
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("¡Hola! Vamos a la lección de la letra M.");
  });

  it("uses real vowel letter for vowel lessons", () => {
    const lines = buildLessonIntroLines({
      n: 2,
      kind: "vowel",
      title: "Vocal O o",
      vowel: "o",
    });
    expect(lines[0]).toContain("vocal O");
  });
});

describe("provider config seam & speech abstraction", () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    const { resetGretelVoiceProviderConfig, setGretelVoiceMuted } = await import("../gretel-voice");
    resetGretelVoiceProviderConfig();
    setGretelVoiceMuted(false);
  });

  it("allows setting and getting provider config, and resetting to default", async () => {
    const {
      getGretelVoiceProviderConfig,
      setGretelVoiceProviderConfig,
      resetGretelVoiceProviderConfig,
    } = await import("../gretel-voice");

    const initial = getGretelVoiceProviderConfig();
    expect(initial.type).toBe("browser-tts");

    setGretelVoiceProviderConfig({
      type: "cloud-tts",
      name: "ElevenLabs Gretel Premium",
      primaryVoiceName: "GretelChild",
    });

    const updated = getGretelVoiceProviderConfig();
    expect(updated.type).toBe("cloud-tts");
    expect(updated.name).toBe("ElevenLabs Gretel Premium");

    resetGretelVoiceProviderConfig();
    const reset = getGretelVoiceProviderConfig();
    expect(reset.type).toBe("browser-tts");
  });

  it("executes custom speakFn provider and fires start/stop handlers & events", async () => {
    const {
      speakAsGretel,
      setGretelVoiceProviderConfig,
      getSelectedGretelVoiceName,
    } = await import("../gretel-voice");

    let speakFnCalledWith = "";
    const startListener = vi.fn();
    const stopListener = vi.fn();

    window.addEventListener("gretel:speak_start", startListener);
    window.addEventListener("gretel:speak_stop", stopListener);

    const mockSpeakFn = vi.fn(async (text: string, handlers: { onStart?: () => void; onEnd?: () => void }) => {
      speakFnCalledWith = text;
      handlers.onStart?.();
      handlers.onEnd?.();
    });

    setGretelVoiceProviderConfig({
      type: "custom",
      name: "Mock Recorded Gretel Voice",
      speakFn: mockSpeakFn,
    });

    const onStart = vi.fn();
    const onEnd = vi.fn();

    await speakAsGretel("Hola, amiguitos", { onStart, onEnd });

    expect(mockSpeakFn).toHaveBeenCalledTimes(1);
    expect(speakFnCalledWith).toBe("Hola, amiguitos");
    expect(onStart).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
    expect(getSelectedGretelVoiceName()).toContain("Mock Recorded Gretel Voice");
    expect(startListener).toHaveBeenCalled();
    expect(stopListener).toHaveBeenCalled();

    window.removeEventListener("gretel:speak_start", startListener);
    window.removeEventListener("gretel:speak_stop", stopListener);
  });

  it("respects mute state and skips speaking", async () => {
    const { speakAsGretel, setGretelVoiceMuted, setGretelVoiceProviderConfig } = await import(
      "../gretel-voice"
    );

    const mockSpeakFn = vi.fn();
    setGretelVoiceProviderConfig({
      type: "cloud-tts",
      name: "Mock Cloud TTS",
      speakFn: mockSpeakFn,
    });

    setGretelVoiceMuted(true);
    const onEnd = vi.fn();

    await speakAsGretel("Texto muted", { onEnd });

    expect(mockSpeakFn).not.toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
  });
});

describe("gretel voice mute + cancel", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it("stores mute flag", () => {
    setGretelVoiceMuted(true);
    expect(isGretelVoiceMuted()).toBe(true);
    setGretelVoiceMuted(false);
    expect(isGretelVoiceMuted()).toBe(false);
  });

  it("cancel is safe without speechSynthesis throwing", () => {
    expect(() => cancelGretelSpeech()).not.toThrow();
  });
});

describe("Spanish text helpers", () => {
  it("generates home greeting", async () => {
    const { buildHomeIntroLines, HOME_GREETING } = await import("../gretel-voice");
    const lines = buildHomeIntroLines();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(HOME_GREETING);
  });

  it("generates success and miss feedback lines", async () => {
    const { buildSuccessLine, buildMissLine } = await import("../gretel-voice");
    const success = buildSuccessLine();
    const miss = buildMissLine();

    expect(typeof success).toBe("string");
    expect(success.length).toBeGreaterThan(0);
    expect(typeof miss).toBe("string");
    expect(miss.length).toBeGreaterThan(0);
  });
});

describe("reduced-motion policy (presence CSS companion)", () => {
  it("prefersReducedMotion helper remains available for presence", async () => {
    const { prefersReducedMotion } = await import("../living-motion");
    expect(typeof prefersReducedMotion()).toBe("boolean");
  });
});
