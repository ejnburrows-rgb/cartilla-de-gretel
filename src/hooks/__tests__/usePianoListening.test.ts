/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePianoListening } from "../usePianoListening";

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  static availability: string | null = "available";
  static available = vi.fn(async () => FakeRecognition.availability ?? "unavailable");
  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  processLocally?: boolean;
  onstart: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();
  constructor() {
    FakeRecognition.instances.push(this);
  }
  results(list: Array<[string, boolean]>, resultIndex = 0) {
    const results = list.map(([transcript, isFinal]) =>
      Object.assign([{ transcript }], { isFinal }),
    );
    this.onresult?.({ resultIndex, results });
  }
}

const win = window as unknown as Record<string, unknown>;

describe("usePianoListening", () => {
  beforeEach(() => {
    FakeRecognition.instances = [];
    FakeRecognition.availability = "available";
    win.SpeechRecognition = FakeRecognition;
  });
  afterEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
    vi.useRealTimers();
  });

  it("opens one continuous es-MX session, on-device when available, and delivers each final once", async () => {
    const onFinal = vi.fn();
    const onInterim = vi.fn();
    const { result } = renderHook(() => usePianoListening({ onFinal, onInterim }));
    await act(async () => {});
    expect(result.current.processing).toBe("on-device");
    act(() => result.current.start());
    const rec = FakeRecognition.instances[0];
    expect(rec.lang).toBe("es-MX");
    expect(rec.continuous).toBe(true);
    expect(rec.interimResults).toBe(true);
    expect(rec.processLocally).toBe(true);
    expect(result.current.status).toBe("listening");
    act(() => rec.onspeechstart?.());
    expect(result.current.status).toBe("hearing");
    act(() => rec.results([["sa", false]]));
    expect(onInterim).toHaveBeenLastCalledWith("sa");
    act(() => rec.results([["sa", true]]));
    act(() =>
      rec.results([
        ["sa", true],
        ["po", true],
      ]),
    );
    expect(onFinal.mock.calls.map((c) => c[0])).toEqual(["sa", "po"]);
  });

  it("reports browser-service processing when no on-device language pack exists", async () => {
    FakeRecognition.availability = "downloadable";
    const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
    await act(async () => {});
    expect(result.current.processing).toBe("browser-service");
    act(() => result.current.start());
    expect(FakeRecognition.instances[0].processLocally).toBeUndefined();
  });

  it("maps permission and device errors to friendly problems", () => {
    const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
    for (const [error, problem] of [
      ["not-allowed", "denied"],
      ["audio-capture", "no-microphone"],
      ["network", "network"],
      ["no-speech", "no-speech"],
      ["weird", "failed"],
    ]) {
      act(() => result.current.start());
      const rec = FakeRecognition.instances.at(-1)!;
      act(() => rec.onerror?.({ error }));
      expect(result.current.problem).toBe(problem);
    }
  });

  it("reports unsupported browsers", () => {
    delete win.SpeechRecognition;
    const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
    expect(result.current.supported).toBe(false);
    expect(result.current.problem).toBe("unsupported");
  });

  it("cancel aborts, clears provisional text and ignores late results", () => {
    const onFinal = vi.fn();
    const onInterim = vi.fn();
    const { result } = renderHook(() => usePianoListening({ onFinal, onInterim }));
    act(() => result.current.start());
    const rec = FakeRecognition.instances[0];
    const late = rec.onresult;
    act(() => result.current.cancel());
    expect(rec.abort).toHaveBeenCalled();
    expect(onInterim).toHaveBeenLastCalledWith("");
    expect(result.current.status).toBe("idle");
    act(() =>
      late?.({
        resultIndex: 0,
        results: [Object.assign([{ transcript: "sa" }], { isFinal: true })],
      }),
    );
    expect(onFinal).not.toHaveBeenCalled();
  });

  it("releases the microphone when the page is hidden, on unmount and after the safety timeout", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      usePianoListening({ onFinal: vi.fn(), maxSessionMs: 1000 }),
    );
    act(() => result.current.start());
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(FakeRecognition.instances[0].abort).toHaveBeenCalled();
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(FakeRecognition.instances[1].stop).toHaveBeenCalled();
    expect(result.current.status).toBe("idle");

    act(() => result.current.start());
    unmount();
    expect(FakeRecognition.instances[2].abort).toHaveBeenCalled();
  });
});
