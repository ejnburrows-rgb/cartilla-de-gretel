import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { playLesson3Audio } from "../Lesson3Audio";
import { audioEngine } from "@/lib/audio-engine";
import { setGretelVoiceMuted } from "@/lib/gretel-voice";
import { claimSpeech, stopSpeech } from "@/lib/speech-playback";
class Media {
  static all: Media[] = [];
  volume = 1; onended: (() => void) | null = null; onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve()); pause = vi.fn(); removeAttribute = vi.fn();
  constructor(public src: string) { Media.all.push(this); }
}
beforeEach(() => { localStorage.clear(); vi.stubGlobal("Audio", Media); Media.all = []; audioEngine.setMuted(false); setGretelVoiceMuted(false); });
afterEach(() => { stopSpeech(); audioEngine.setMuted(false); setGretelVoiceMuted(false); vi.unstubAllGlobals(); });
it("limits playback to the five Lesson 3 assets", () => {
  playLesson3Audio("p10-instr"); playLesson3Audio("../vocabulario/oso"); expect(Media.all).toHaveLength(0);
  playLesson3Audio("muy-bien"); expect(Media.all[0].src).toBe("/audio/lesson-3-tts/muy-bien.mp3"); expect(Media.all[0].play).toHaveBeenCalledOnce();
});
it("honors both mute controls and stops a playing instruction on mute", () => {
  audioEngine.setMuted(true); playLesson3Audio("p7-instr"); expect(Media.all).toHaveLength(0);
  audioEngine.setMuted(false); setGretelVoiceMuted(true); playLesson3Audio("p7-instr"); expect(Media.all).toHaveLength(0);
  setGretelVoiceMuted(false); playLesson3Audio("p7-instr"); audioEngine.setMuted(true); expect(Media.all[0].pause).toHaveBeenCalled();
});
it("yields to picture audio, replaces instructions and stops on page hide", () => {
  playLesson3Audio("p7-instr"); claimSpeech("picture"); expect(Media.all[0].pause).toHaveBeenCalled();
  playLesson3Audio("p9-instr1"); playLesson3Audio("p9-instr2"); expect(Media.all[1].pause).toHaveBeenCalled();
  window.dispatchEvent(new Event("pagehide")); expect(Media.all[2].pause).toHaveBeenCalled();
});
