/**
 * Controller verification for Jules session 11681475350628822871
 * [FIX #783] Words-per-minute timer: 60s wall-clock expiry.
 *
 * Defect on main: WordsPerMinuteGame's countdown effect listed `count` and
 * `content` in its deps, so every marked word cleared the pending 1s timeout
 * and rescheduled it — the 60s countdown stretched in real wall-clock time.
 *
 * Fix under test (lane changeSet): deps reduced to [running, seconds];
 * count/content read via refs at finish time; hasFinishedRef guards double
 * completion; restart resets the guard.
 *
 * NOTE: with fake timers, each advanceTimersByTime(1000) inside act() fires
 * exactly one chained tick (the next timeout is scheduled by the effect after
 * React re-renders), so wall-clock time is advanced in 1s steps.
 */
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { WordsPerMinuteGame } from "../CoreGames";
import { recordEvent } from "@/lib/student-session";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GameContent } from "@/lib/games/gameContent";

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/games/wordAudio", () => ({
  playWord: vi.fn(),
}));

const WORDS3 = ["sol", "luna", "estrella"];

function contentFor(n: number): GameContent {
  return {
    id: "test-game",
    type: "palabras-por-minuto",
    letter: "m",
    instructions: [],
    words: Array.from({ length: n }, (_, i) => ({
      word: `w${i}`,
      syllables: [`w${i}`],
    })),
  };
}

const mockContent3: GameContent = {
  id: "test-game",
  type: "palabras-por-minuto",
  letter: "m",
  instructions: [],
  words: WORDS3.map((w) => ({ word: w, syllables: [w] })),
};

function startGame(content: GameContent) {
  render(<WordsPerMinuteGame content={content} />);
  fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
  expect(screen.getByText("60s")).toBeInTheDocument();
}

/** Advance N seconds of wall-clock time, one chained tick at a time. */
function advanceSeconds(n: number) {
  for (let i = 0; i < n; i++) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
}

describe("WordsPerMinuteGame #783 timer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does NOT stretch the countdown when words are marked (defect repro)", () => {
    startGame(contentFor(60));
    // 30s of wall time, marking a word every 500ms.
    // Old code: each mark resets the pending 1s timeout -> 0 ticks -> 60s.
    // Fixed code: timeout chain is independent of marks -> 30 ticks -> 30s.
    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(500);
      });
      fireEvent.click(screen.getByRole("button", { name: `w${i}` }));
    }
    expect(screen.getByText("30s")).toBeInTheDocument();
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("finishes exactly once after 60s wall-clock despite marks", () => {
    startGame(mockContent3);
    fireEvent.click(screen.getByRole("button", { name: "sol" }));
    advanceSeconds(30);
    expect(screen.getByText("30s")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "luna" }));
    advanceSeconds(29);
    expect(screen.getByText("1s")).toBeInTheDocument();
    expect(recordEvent).not.toHaveBeenCalled();
    advanceSeconds(1);
    // Game finished: result text + exactly one completion event.
    expect(screen.getByText(/Leíste 2 palabras/)).toBeInTheDocument();
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "game:test-game",
        kind: "exercise",
        score: 2,
        total: 3,
      }),
    );
    // Extra time must not duplicate completion.
    advanceSeconds(10);
    expect(recordEvent).toHaveBeenCalledTimes(1);
  });

  it("restart allows a second clean completion (guard resets)", () => {
    startGame(mockContent3);
    advanceSeconds(60);
    expect(recordEvent).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Otra vez" }));
    expect(screen.getByText("60s")).toBeInTheDocument();
    advanceSeconds(60);
    expect(recordEvent).toHaveBeenCalledTimes(2);
  });

  it("'Terminé la lista' finishes exactly once", () => {
    startGame(mockContent3);
    for (const w of WORDS3) {
      fireEvent.click(screen.getByRole("button", { name: w }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Terminé la lista" }));
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({ score: 3, total: 3 }));
  });
});
