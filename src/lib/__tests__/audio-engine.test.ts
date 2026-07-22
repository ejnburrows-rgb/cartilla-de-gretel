import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { audioEngine } from "../audio-engine";

describe("audioEngine", () => {
  let originalAudio: unknown;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    originalAudio = global.Audio;
  });

  afterEach(() => {
    global.Audio = originalAudio as typeof global.Audio;
    if (typeof window !== "undefined") {
      window.Audio = originalAudio as typeof window.Audio;
    }
    vi.restoreAllMocks();
  });

  it("getVolume returns default 0.8 when no volume is set", () => {
    expect(audioEngine.getVolume()).toBe(0.8);
  });

  it("setVolume sets volume correctly", () => {
    audioEngine.setVolume(0.5);
    expect(audioEngine.getVolume()).toBe(0.5);
  });

  it("isMuted returns false by default", () => {
    expect(audioEngine.isMuted()).toBe(false);
  });

  it("setMuted mutes correctly", () => {
    audioEngine.setMuted(true);
    expect(audioEngine.isMuted()).toBe(true);
  });

  describe("playPageTurn", () => {
    it("should swallow rejected Promise from Audio.play() on restrictive browsers", async () => {
      let playCalled = false;
      class MockAudio {
        play() {
          playCalled = true;
          return Promise.reject(new Error("DOMException: play() failed"));
        }
        pause() {}
        volume = 1;
      }

      global.Audio = MockAudio as unknown as typeof global.Audio;
      window.Audio = MockAudio as unknown as typeof window.Audio;

      audioEngine.setMuted(false);

      expect(() => {
        audioEngine.playPageTurn();
      }).not.toThrow();

      expect(playCalled).toBe(true);

      await new Promise(process.nextTick);
    });

    it("should catch synchronous errors thrown during Audio instantiation or playback", () => {
      class MockAudioThrow {
        constructor() {
          throw new Error("Sync Error");
        }
      }

      global.Audio = MockAudioThrow as unknown as typeof global.Audio;
      window.Audio = MockAudioThrow as unknown as typeof window.Audio;

      expect(() => {
        audioEngine.playPageTurn();
      }).not.toThrow();
    });
  });
});
