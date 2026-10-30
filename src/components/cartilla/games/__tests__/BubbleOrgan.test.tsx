import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BubbleOrgan } from "../BubbleOrgan";
import { BUBBLE_ORGAN_M } from "@/content/games/bubble-organ-m";
import { recordEvent } from "@/lib/student-session";

vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

describe("Bubble Organ", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
  afterEach(() => { cleanup(); vi.runOnlyPendingTimers(); vi.useRealTimers(); });

  const tap = (s: string) => fireEvent.click(screen.getByRole("button", { name: `Tubo ${s}` }));

  it("forms mamá from two ma taps, records one completion and keeps the result visible", () => {
    render(<BubbleOrgan content={BUBBLE_ORGAN_M} />);
    tap("ma"); tap("ma");
    act(() => vi.advanceTimersByTime(950));
    expect(screen.getByText("¡Formaste mamá!")).toBeDefined();
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      lessonId: "leccion-7", meta: expect.objectContaining({ word: "mamá", completed: true }),
    }));
    expect(screen.getByRole("button", { name: "Tubo ma" }).hasAttribute("disabled")).toBe(true);
  });

  it("pops a bubble without claiming a word was completed", () => {
    render(<BubbleOrgan content={BUBBLE_ORGAN_M} />);
    tap("mi");
    fireEvent.click(screen.getByRole("button", { name: "Explotar burbuja mi" }));
    expect(screen.queryByRole("button", { name: "Explotar burbuja mi" })).toBeNull();
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("clears pending merges and prevents stale completion after reset", () => {
    render(<BubbleOrgan content={BUBBLE_ORGAN_M} />);
    tap("ma"); tap("ma");
    fireEvent.click(screen.getByRole("button", { name: /Otra vez/i }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.queryByText("¡Formaste mamá!")).toBeNull();
    expect(recordEvent).not.toHaveBeenCalled();
    tap("ma"); tap("ma");
    act(() => vi.advanceTimersByTime(1000));
    expect(recordEvent).toHaveBeenCalledTimes(1);
  });

  it("offers a sound toggle and never uses device text-to-speech", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak });
    render(<BubbleOrgan content={BUBBLE_ORGAN_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Silenciar efectos" }));
    tap("ma"); tap("ma");
    act(() => vi.advanceTimersByTime(1000));
    expect(speak).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
