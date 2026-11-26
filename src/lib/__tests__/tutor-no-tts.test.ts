/**
 * Regression test: no tutor path may ever reach device TTS (`speechSynthesis` /
 * `SpeechSynthesisUtterance`) or `cloud-tts` — tutor voice is recorded-audio only.
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIO_POLICY } from "@/content/audio-manifest";
import {
  getGretelVoiceProviderConfig,
  resetGretelVoiceProviderConfig,
  setGretelVoiceMuted,
  setGretelVoiceProviderConfig,
  speakAsGretel,
} from "@/lib/gretel-voice";
import { speakGretelPhrase } from "@/lib/gretel-tts";
import { createBrainState, reduce, type BrainEvent, type Effect } from "@/lib/tutor-brain";
import { TUTOR_LINES } from "@/lib/tutor-line-picker";
import { mountTutorVoice, speakTutorLine } from "@/lib/tutor-voice";

const REPO_ROOT = path.resolve(__dirname, "../../..");

function collectTutorSourceFiles(): string[] {
  const files: string[] = [];
  for (const relDir of ["src/routes", "src/components/tutor", "src/lib"]) {
    const absDir = path.join(REPO_ROOT, relDir);
    if (!fs.existsSync(absDir)) continue;
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      if (relDir === "src/routes" && !entry.name.startsWith("tutor")) continue;
      if (relDir === "src/lib" && !entry.name.startsWith("tutor-")) continue;
      files.push(path.join(absDir, entry.name));
    }
  }
  return files;
}

describe("tutor no-TTS / no-cloud-tts invariant", () => {
  let originalSpeechSynthesis: typeof window.speechSynthesis;
  let originalSpeechSynthesisUtterance: typeof window.SpeechSynthesisUtterance;
  let speakSpy: ReturnType<typeof vi.fn<(utterance?: unknown) => void>>;
  let utteranceSpy: ReturnType<typeof vi.fn<(text: string) => void>>;
  let playSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    resetGretelVoiceProviderConfig();
    setGretelVoiceMuted(false);

    originalSpeechSynthesis = window.speechSynthesis;
    originalSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    speakSpy = vi.fn<(utterance?: unknown) => void>();
    utteranceSpy = vi.fn<(text: string) => void>();

    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: vi.fn(),
        speak: speakSpy,
        getVoices: vi.fn(() => []),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class SpyUtterance {
        text: string;
        constructor(text: string) {
          utteranceSpy(text);
          this.text = text;
        }
      } as unknown as typeof SpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });

    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event("playing"));
      queueMicrotask(() => this.dispatchEvent(new Event("ended")));
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("keeps AUDIO_POLICY strictly recorded-only", () => {
    expect(AUDIO_POLICY.allowTts).toBe(false);
    expect(AUDIO_POLICY.allowSynthesizedVoice).toBe(false);
    expect(AUDIO_POLICY.allowAiVoiceClone).toBe(false);
  });

  it("has zero static references to speechSynthesis, cloud-tts, browser-tts, or gretel-tts in tutor modules", () => {
    const tutorFiles = collectTutorSourceFiles();
    expect(tutorFiles.length).toBeGreaterThanOrEqual(10);

    const forbiddenPatterns = [
      /\bspeechSynthesis\b/,
      /\bSpeechSynthesisUtterance\b/,
      /\bcloud-tts\b/,
      /\bbrowser-tts\b/,
      /\bgretel-tts\b/,
      /\bspeakGretelPhrase\b/,
      /\bspeakAsGretel\b/,
    ];

    const violations: string[] = [];
    for (const file of tutorFiles) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(source)) {
          violations.push(`${path.relative(REPO_ROOT, file)} matched ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("default and mounted tutor providers stay recorded-audio and never reach speechSynthesis", async () => {
    expect(getGretelVoiceProviderConfig().type).toBe("recorded-audio");

    // Even before mountTutorVoice, calling speakAsGretel / speakGretelPhrase must not touch TTS.
    await speakAsGretel("oso");
    speakGretelPhrase("Hola");
    expect(speakSpy).not.toHaveBeenCalled();
    expect(utteranceSpy).not.toHaveBeenCalled();

    const unmount = mountTutorVoice();
    expect(getGretelVoiceProviderConfig().type).toBe("recorded-audio");

    await speakAsGretel("oso");
    await speakAsGretel("[DRAFT — owner to approve] ¡Perfecto!");
    await speakAsGretel("texto desconocido");
    speakGretelPhrase("oso");

    expect(speakSpy).not.toHaveBeenCalled();
    expect(utteranceSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("blocks browser-tts, cloud-tts, and custom providers from speaking through speakTutorLine", async () => {
    const unmount = mountTutorVoice();
    const cloudSpeakFn = vi.fn(async () => {});
    const customSpeakFn = vi.fn(async () => {});

    setGretelVoiceProviderConfig({
      type: "browser-tts",
      name: "Forbidden Browser TTS",
    });
    expect(await speakTutorLine("oso")).toBe("silent");

    setGretelVoiceProviderConfig({
      type: "cloud-tts",
      name: "Forbidden Cloud TTS",
      speakFn: cloudSpeakFn,
    });
    expect(await speakTutorLine("oso")).toBe("silent");

    setGretelVoiceProviderConfig({
      type: "custom",
      name: "Forbidden Custom",
      speakFn: customSpeakFn,
    });
    expect(await speakTutorLine("oso")).toBe("silent");

    expect(cloudSpeakFn).not.toHaveBeenCalled();
    expect(customSpeakFn).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
    expect(speakSpy).not.toHaveBeenCalled();
    expect(utteranceSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("runs a full brain interaction path (greet, model, retry, commands, miss, exit) without ever touching speechSynthesis or cloud-tts", async () => {
    const lineTextById = new Map(TUTOR_LINES.map((entry) => [entry.lineId, entry.text]));
    const unmount = mountTutorVoice();
    const rng = () => 0.25;

    // Even if audio playback rejects on pending/broken clips, voice must fall back to silence, never TTS.
    playSpy.mockRejectedValue(new Error("Audio unavailable"));

    let state = createBrainState({ lesson: 1, sessionId: "no-tts-check", returning: false });
    const playedLineIds: string[] = [];

    async function step(ev: BrainEvent) {
      const out = reduce(state, ev, rng);
      state = out.state;
      for (const effect of out.effects as Effect[]) {
        if (effect.type === "playLine") {
          playedLineIds.push(effect.lineId);
          const text = lineTextById.get(effect.lineId) ?? effect.lineId;
          await speakTutorLine(text);
        }
      }
    }

    await step({ type: "START" });
    await step({ type: "LINE_DONE" }); // GREET -> MODEL
    await step({ type: "LINE_DONE" }); // MODEL -> LISTEN
    await step({ type: "MIC_TAP" });
    await step({ type: "HEARD", transcript: "repite", alternatives: [] });
    await step({ type: "LINE_DONE" });
    await step({ type: "MIC_TAP" });
    await step({ type: "HEARD", transcript: "ayuda", alternatives: [] });
    await step({ type: "LINE_DONE" });
    await step({ type: "MIC_TAP" });
    await step({ type: "HEARD", transcript: "no sé", alternatives: [] });
    await step({ type: "LINE_DONE" });
    await step({ type: "MIC_TAP" });
    await step({ type: "HEARD", transcript: "e", alternatives: [] }); // wrong vowel
    await step({ type: "LINE_DONE" });
    await step({ type: "MIC_TAP" });
    await step({ type: "HEARD", transcript: "a", alternatives: [] }); // correct retry
    await step({ type: "LINE_DONE" });
    await step({ type: "EXIT" });

    expect(playedLineIds.length).toBeGreaterThan(5);
    expect(speakSpy).not.toHaveBeenCalled();
    expect(utteranceSpy).not.toHaveBeenCalled();
    expect(getGretelVoiceProviderConfig().type).toBe("recorded-audio");
    unmount();
  });
});
