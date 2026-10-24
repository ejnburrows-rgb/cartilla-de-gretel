// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

const synth = vi.hoisted(() => vi.fn());
const muted = vi.hoisted(() => ({ value: false }));
vi.mock("@/lib/piano-audio", () => ({ playNote: synth }));
vi.mock("@/lib/audio-engine", () => ({
  audioEngine: { isMuted: () => muted.value, getVolume: () => 0.8 },
}));

import {
  PIANO_SAMPLES,
  midiFromFrequency,
  nearestSample,
  playCorrectChord,
  playNote,
} from "./piano-sound";

afterEach(() => {
  muted.value = false;
  synth.mockClear();
  vi.unstubAllGlobals();
});

describe("Piano Hablador grand piano sound", () => {
  it("ships every sample it uses as a real MP3, with its license credit", async () => {
    const { PIANO_SAMPLE_DATA } = await import("./piano-samples");
    for (const name of Object.keys(PIANO_SAMPLES)) {
      const bytes = Buffer.from(PIANO_SAMPLE_DATA[name] ?? "", "base64");
      expect(bytes.length).toBeGreaterThan(10000);
      // MP3: an ID3 tag or an MPEG frame sync at the start.
      const id3 = bytes.subarray(0, 3).toString("latin1") === "ID3";
      const sync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
      expect(id3 || sync).toBe(true);
    }
    const credits = fs.readFileSync(
      path.join(process.cwd(), "src/components/cartilla/piano/PIANO_SAMPLES_CREDITS.md"),
      "utf8",
    );
    expect(credits).toMatch(/Salamander Grand Piano/);
    expect(credits).toMatch(/Alexander Holm/);
    expect(credits).toMatch(/Attribution 3\.0/);
  });

  it("covers the nine piano keys (do → re alto) re-pitching at most 1.5 semitones", () => {
    const keys = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
    for (const freq of keys) {
      const midi = midiFromFrequency(freq);
      const pick = nearestSample(midi, Object.values(PIANO_SAMPLES));
      expect(pick).not.toBeNull();
      expect(Math.abs(midi - pick!.midi)).toBeLessThanOrEqual(1.5);
    }
    expect(Math.round(midiFromFrequency(440))).toBe(69);
    expect(nearestSample(69, [69])!.rate).toBeCloseTo(1);
  });

  it("stays silent when the app is muted", () => {
    muted.value = true;
    playNote(261.63);
    playCorrectChord();
    expect(synth).not.toHaveBeenCalled();
  });
});
