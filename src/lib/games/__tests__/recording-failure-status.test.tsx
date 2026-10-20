import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimSpeech, registerSpeechCleanup, stopSpeech } from "@/lib/speech-playback";
import { playWord, stopGameAudio } from "../wordAudio";
import { RecordedGameFrame } from "@/components/cartilla/games/RecordedGameFrame";
import { MARIPOSAS_P } from "@/content/games/core-games";
const instances: Array<{
  src: string;
  volume: number;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  onerror?: () => void;
  onended?: () => void;
}> = [];
let rejectPlayback = false;
beforeEach(() => {
  localStorage.clear();
  instances.length = 0;
  rejectPlayback = false;
  vi.stubGlobal(
    "Audio",
    class {
      src: string;
      volume = 1;
      pause = vi.fn();
      onerror?: () => void;
      onended?: () => void;
      play = vi.fn(() =>
        rejectPlayback ? Promise.reject(new Error("media unavailable")) : Promise.resolve(),
      );
      constructor(src: string) {
        this.src = src;
        instances.push(this);
      }
    },
  );
});
afterEach(() => {
  cleanup();
  stopGameAudio();
  stopSpeech();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("recording failure feedback", () => {
  it("shows an actual decoder/404 error from a supplied URL, not a silent play button", async () => {
    render(
      <RecordedGameFrame content={MARIPOSAS_P}>
        <p>Actividad</p>
      </RecordedGameFrame>,
    );
    await act(async () => playWord("/broken.mp3", "papi"));
    act(() => instances[0].onerror?.());
    expect(screen.getByRole("status").textContent).toContain(
      "No se pudo reproducir el audio para «papi»",
    );
    expect(instances[0].pause).toHaveBeenCalled();
  });
  it("shows rejected playback and does not invoke speech synthesis", async () => {
    rejectPlayback = true;
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak });
    render(
      <RecordedGameFrame content={MARIPOSAS_P}>
        <p>Actividad</p>
      </RecordedGameFrame>,
    );
    await act(async () => playWord("/existing-but-rejected.mp3", "papi"));
    expect(screen.getByRole("status").textContent).toContain("No se pudo reproducir");
    expect(speak).not.toHaveBeenCalled();
  });
  it("does not throw or play when settings storage is denied", () => {
    render(
      <RecordedGameFrame content={MARIPOSAS_P}>
        <p>Actividad</p>
      </RecordedGameFrame>,
    );
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    act(() => {
      expect(() => playWord("/existing.mp3", "papi")).not.toThrow();
    });
    expect(instances).toHaveLength(0);
    expect(screen.getByRole("status").textContent).toContain("No se pudo reproducir");
  });
  it("stops active game speech immediately when global mute changes", async () => {
    render(
      <RecordedGameFrame content={MARIPOSAS_P}>
        <p>Actividad</p>
      </RecordedGameFrame>,
    );
    await act(async () => playWord("/existing.mp3", "papi"));
    act(() => {
      localStorage.setItem("cartilla:audio:muted", "true");
      window.dispatchEvent(new Event("cartilla:audio-settings"));
    });
    expect(instances[0].pause).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toContain("Audio silenciado");
  });
  it("stops prior shared voice even when the requested game recording is missing or muted", () => {
    for (const muted of [false, true]) {
      const priorCleanup = vi.fn();
      const token = claimSpeech("picture");
      registerSpeechCleanup(token, priorCleanup);
      localStorage.setItem("cartilla:audio:muted", String(muted));
      playWord(muted ? "/existing.mp3" : undefined, "missing-word-not-in-content");
      expect(priorCleanup).toHaveBeenCalledOnce();
    }
    expect(instances).toHaveLength(0);
  });
  it("cancels a prior shared recording before game playback starts", async () => {
    const priorCleanup = vi.fn();
    const token = claimSpeech("picture");
    registerSpeechCleanup(token, priorCleanup);
    await act(async () => playWord("/existing.mp3", "papi"));
    expect(priorCleanup).toHaveBeenCalledOnce();
    expect(instances[0].play).toHaveBeenCalledOnce();
  });
  it("cancels game recording on a new global claim and on global stop", async () => {
    await act(async () => playWord("/first.mp3", "papi"));
    claimSpeech("gretel");
    expect(instances[0].pause).toHaveBeenCalledOnce();
    await act(async () => playWord("/second.mp3", "papá"));
    stopSpeech();
    expect(instances[1].pause).toHaveBeenCalledOnce();
  });
  it("keeps Chano's excluded frame presentation unchanged on an audio failure", () => {
    render(
      <RecordedGameFrame content={{ ...MARIPOSAS_P, type: "payaso-chano", id: "payaso-chano-ss" }}>
        <p>Chano</p>
      </RecordedGameFrame>,
    );
    act(() =>
      window.dispatchEvent(
        new CustomEvent("cartilla:recorded-speech-status", {
          detail: { status: "failed", key: "mami", source: "game" },
        }),
      ),
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.querySelector("[data-recorded-game]")?.className).toBe(
      "flex min-h-0 flex-1 flex-col gap-2",
    );
  });
});
