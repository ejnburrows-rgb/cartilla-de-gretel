import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playGretelRecordingQueue } from "../gretel-recorded-playback";
import { stopSpeech } from "../speech-playback";

class FakeAudio {
  static instances: FakeAudio[] = [];
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = false;
  cleared = false;
  readonly src: string;
  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
  play(): Promise<void> { return Promise.resolve(); }
  pause(): void { this.paused = true; }
  removeAttribute(attribute: string): void {
    if (attribute === "src") this.cleared = true;
  }
  end(): void { this.onended?.(); }
}

describe("real recorded phrase stitching", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
  });
  afterEach(() => {
    stopSpeech();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("adds a 160ms pause between genuine complete MP3 phrases", async () => {
    const done = playGretelRecordingQueue(["/audio/gretel/clips/rec_gretel_11.mp3", "/audio/gretel/clips/rec_gretel_12.mp3"]);
    expect(FakeAudio.instances).toHaveLength(1);
    FakeAudio.instances[0]!.end();
    await vi.advanceTimersByTimeAsync(159);
    expect(FakeAudio.instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeAudio.instances).toHaveLength(2);
    FakeAudio.instances[1]!.end();
    await done;
    expect(FakeAudio.instances[1]!.cleared).toBe(true);
  });

  it("cancels the future stitched phrase when the student navigates away", async () => {
    const done = playGretelRecordingQueue(["/audio/gretel/clips/rec_gretel_23.mp3", "/audio/gretel/clips/rec_gretel_24.mp3"]);
    FakeAudio.instances[0]!.end();
    stopSpeech("gretel");
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    expect(FakeAudio.instances).toHaveLength(1);
  });

  it("plays the requested first clip without unnecessary delay", async () => {
    const done = playGretelRecordingQueue(["/audio/gretel/clips/rec_gretel_29.mp3"]);
    expect(FakeAudio.instances).toHaveLength(1);
    FakeAudio.instances[0]!.end();
    await done;
  });
});
