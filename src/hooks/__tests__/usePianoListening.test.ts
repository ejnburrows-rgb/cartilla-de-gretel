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
  onsoundstart: (() => void) | null = null;
  onsoundend: (() => void) | null = null;
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
    FakeRecognition.available.mockClear();
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

  describe("never falls back to an online recognizer", () => {
    const expectMicOff = (current: ReturnType<typeof usePianoListening>) => {
      expect(current.supported).toBe(false);
      expect(current.processing).toBe("unavailable");
      expect(current.problem).toBe("no-local");
      expect(current.status).toBe("idle");
      act(() => current.start());
      // No recognizer object is ever created, so nothing can start online.
      expect(FakeRecognition.instances).toHaveLength(0);
    };

    for (const availability of ["downloadable", "downloading", "unavailable", "", "weird"]) {
      it(`does not create a recognizer when on-device availability is "${availability}"`, async () => {
        FakeRecognition.availability = availability;
        const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
        await act(async () => {});
        expect(FakeRecognition.available).toHaveBeenLastCalledWith({
          langs: ["es-MX"],
          processLocally: true,
        });
        expectMicOff(result.current);
      });
    }

    it("does not create a recognizer when the browser cannot report on-device availability", async () => {
      class NoAvailability extends FakeRecognition {}
      Object.defineProperty(NoAvailability, "available", { value: undefined });
      win.SpeechRecognition = NoAvailability;
      const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      expectMicOff(result.current);
    });

    it("does not use the prefixed webkit recognizer without on-device confirmation", async () => {
      delete win.SpeechRecognition;
      class WebkitOnly extends FakeRecognition {}
      Object.defineProperty(WebkitOnly, "available", { value: undefined });
      win.webkitSpeechRecognition = WebkitOnly;
      const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      expectMicOff(result.current);
    });

    it("does not create a recognizer when the availability check rejects or throws", async () => {
      FakeRecognition.available.mockRejectedValueOnce(new Error("no"));
      const rejected = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      expectMicOff(rejected.result.current);
      rejected.unmount();

      FakeRecognition.available.mockImplementationOnce(() => {
        throw new Error("boom");
      });
      const thrown = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      expectMicOff(thrown.result.current);
    });

    it("keeps the microphone off while the on-device answer is still pending", async () => {
      let resolve: (value: string) => void = () => {};
      FakeRecognition.available.mockImplementationOnce(
        () => new Promise<string>((r) => (resolve = r)),
      );
      const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      expect(result.current.processing).toBe("checking");
      expect(result.current.supported).toBe(false);
      act(() => result.current.start());
      expect(FakeRecognition.instances).toHaveLength(0);
      await act(async () => resolve("available"));
      expect(result.current.processing).toBe("on-device");
      act(() => result.current.start());
      expect(FakeRecognition.instances).toHaveLength(1);
      expect(FakeRecognition.instances[0].processLocally).toBe(true);
    });

    it("refuses to start if processLocally cannot be set on the recognizer", async () => {
      class Ignores extends FakeRecognition {
        constructor() {
          super();
          // A recognizer that silently ignores processLocally.
          Object.defineProperty(this, "processLocally", { get: () => undefined, set: () => {} });
        }
      }
      win.SpeechRecognition = Ignores;
      const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      act(() => result.current.start());
      expect(FakeRecognition.instances).toHaveLength(1);
      expect(FakeRecognition.instances[0].start).not.toHaveBeenCalled();
      expect(result.current.supported).toBe(false);
      expect(result.current.problem).toBe("no-local");
    });

    for (const error of ["language-not-supported", "service-not-allowed"]) {
      it(`turns the microphone off for good after "${error}" instead of retrying online`, async () => {
        const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
        await act(async () => {});
        act(() => result.current.start());
        const rec = FakeRecognition.instances[0];
        expect(rec.processLocally).toBe(true);
        act(() => rec.onerror?.({ error }));
        expect(rec.abort).toHaveBeenCalled();
        expect(result.current.problem).toBe("no-local");
        expect(result.current.supported).toBe(false);
        act(() => result.current.start());
        expect(FakeRecognition.instances).toHaveLength(1);
      });
    }

    it("every recognizer it starts has processLocally = true", async () => {
      const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
      await act(async () => {});
      for (let i = 0; i < 3; i++) act(() => result.current.start());
      expect(FakeRecognition.instances).toHaveLength(3);
      for (const rec of FakeRecognition.instances) {
        expect(rec.processLocally).toBe(true);
        expect(rec.start).toHaveBeenCalledTimes(1);
      }
    });
  });

  it("reports the first sound early (provisional only) and clears it when the session ends", async () => {
    const onFinal = vi.fn();
    const onSound = vi.fn();
    const { result } = renderHook(() => usePianoListening({ onFinal, onSound }));
    await act(async () => {});
    act(() => result.current.start());
    const rec = FakeRecognition.instances[0];
    act(() => rec.onsoundstart?.());
    expect(onSound).toHaveBeenLastCalledWith(true);
    expect(result.current.status).toBe("listening");
    act(() => rec.onspeechstart?.());
    expect(result.current.status).toBe("hearing");
    act(() => rec.onsoundend?.());
    expect(onSound).toHaveBeenLastCalledWith(false);
    act(() => rec.onsoundstart?.());
    act(() => result.current.stop());
    expect(onSound).toHaveBeenLastCalledWith(false);
    expect(onFinal).not.toHaveBeenCalled();
  });

  it("maps permission and device errors to friendly problems", async () => {
    const { result } = renderHook(() => usePianoListening({ onFinal: vi.fn() }));
    await act(async () => {});
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

  it("cancel aborts, clears provisional text and ignores late results", async () => {
    const onFinal = vi.fn();
    const onInterim = vi.fn();
    const { result } = renderHook(() => usePianoListening({ onFinal, onInterim }));
    await act(async () => {});
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

  it("releases the microphone when the page is hidden, on unmount and after the safety timeout", async () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      usePianoListening({ onFinal: vi.fn(), maxSessionMs: 1000 }),
    );
    await act(async () => {});
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
