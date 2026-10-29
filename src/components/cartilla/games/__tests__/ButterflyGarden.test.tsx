import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ButterflyGarden } from "../ButterflyGarden";
import { recordEvent } from "@/lib/student-session";
import { BUTTERFLIES, WORDS } from "@/lib/games/butterflyGarden";

vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

async function tap(id: string) {
  await act(async () => {
    fireEvent.click(screen.getByTestId(id));
    await vi.runAllTimersAsync();
  });
}

async function solveRound() {
  for (const word of WORDS) {
    for (const syllable of word.syllables) {
      const butterfly = BUTTERFLIES.find((b) => b.syllable.toLowerCase() === syllable.toLowerCase())!;
      await tap(`bf-${butterfly.id}`);
    }
    await tap("check");
    if (word !== WORDS.at(-1)) await tap("can");
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16)));
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1280);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(720);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 60, width: 100, height: 60,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Butterfly Garden review regressions", () => {
  it("records one result only after all six words, and allows a fresh round", async () => {
    render(<ButterflyGarden />);
    await tap("check");
    expect(recordEvent).not.toHaveBeenCalled();
    await solveRound();
    expect(recordEvent).toHaveBeenCalledExactlyOnceWith({
      lessonId: "game:mariposas-p", kind: "exercise", score: 6, total: 6,
      meta: { exercise: "mariposas", completed: true, gameId: "mariposas-p" },
    });
    await tap("check");
    expect(recordEvent).toHaveBeenCalledTimes(1);
    await tap("can");
    await solveRound();
    expect(recordEvent).toHaveBeenCalledTimes(2);
  });

  it("honors reduced motion during delivery and wrong-answer retrieval", async () => {
    render(<ButterflyGarden />);
    await tap("bf-pa");
    expect(screen.getByTestId("slot-0").textContent).toBe("pa");
    await tap("check");
    expect(screen.getByTestId("slot-0").textContent).not.toBe("pa");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("retains the landscape watering-can element and keyboard focus after advancing", async () => {
    render(<ButterflyGarden />);
    const can = screen.getByTestId("can");
    can.focus();
    await tap("can");
    expect(screen.getByTestId("word").textContent).toBe("pomo");
    expect(screen.getByTestId("can")).toBe(can);
    expect(document.activeElement).toBe(can);
    expect(recordEvent).not.toHaveBeenCalled();
  });
});
