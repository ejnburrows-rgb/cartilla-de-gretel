/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TapSelect } from "../TapSelect";
import type { WorkbookObject } from "@/content/workbook/types";

vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";

const sampleObjects: WorkbookObject[] = [
  {
    id: "obj-a",
    box: { xPct: 10, yPct: 10, wPct: 20, hPct: 20 },
    text: "Opción A",
    interaction: { type: "tap-select", data: { correct: false } },
  },
  {
    id: "obj-b",
    box: { xPct: 40, yPct: 10, wPct: 20, hPct: 20 },
    text: "Opción B",
    interaction: { type: "tap-select", data: { correct: false } },
  },
  {
    id: "obj-c",
    box: { xPct: 70, yPct: 10, wPct: 20, hPct: 20 },
    text: "Opción C",
    interaction: { type: "tap-select", data: { correct: true } },
  },
];

describe("TapSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("preserves incorrect-choice feedback duration on rapid A -> B retries", () => {
    const onResult = vi.fn();
    render(<TapSelect objects={sampleObjects} onResult={onResult} reducedMotion={false} />);

    const btnA = screen.getByRole("button", { name: "Opción A" });
    const btnB = screen.getByRole("button", { name: "Opción B" });

    // Tap A at t=0
    fireEvent.click(btnA);
    expect(btnA.className).toContain("is-wrong");
    expect(btnB.className).not.toContain("is-wrong");
    expect(playWrongBuzz).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");

    // Advance 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(btnA.className).toContain("is-wrong");

    // Tap B at t=300ms
    fireEvent.click(btnB);
    expect(btnB.className).toContain("is-wrong");
    expect(playWrongBuzz).toHaveBeenCalledTimes(2);

    // Advance 100ms (t=400ms from start)
    // At t=400ms, A's timer would fire in unfixed code and prematurely clear B's wrong state!
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // B must STILL be visibly incorrect (is-wrong) at t=400ms (only 100ms after B was tapped)
    expect(btnB.className).toContain("is-wrong");

    // Advance remaining 300ms (t=700ms from start, 400ms from B tap)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(btnB.className).not.toContain("is-wrong");
  });

  it("cleans up timer on unmount without state updates", () => {
    const { unmount } = render(
      <TapSelect objects={sampleObjects} reducedMotion={false} />,
    );

    const btnA = screen.getByRole("button", { name: "Opción A" });
    fireEvent.click(btnA);
    expect(btnA.className).toContain("is-wrong");

    // Unmount while timer is pending
    unmount();

    // Advance timers - should not throw console errors or update unmounted state
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(400);
      });
    }).not.toThrow();
  });

  it("completes ONCE on correct choice and handles keyboard/click activation", () => {
    const onResult = vi.fn();
    const onComplete = vi.fn();

    render(
      <TapSelect
        objects={sampleObjects}
        onResult={onResult}
        onComplete={onComplete}
        reducedMotion={false}
      />,
    );

    const btnC = screen.getByRole("button", { name: "Opción C" }) as HTMLButtonElement;

    // Click correct option C
    fireEvent.click(btnC);

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(onResult).toHaveBeenLastCalledWith({ objectId: "obj-c", result: "correct" });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(btnC.className).toContain("is-correct");
    expect(btnC.disabled).toBe(true);

    // Attempting further clicks after solved does nothing
    fireEvent.click(btnC);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(playCorrectChord).toHaveBeenCalledTimes(1);
  });

  it("orders events and feedback correctly on wrong attempt", () => {
    const events: string[] = [];
    const onResult = vi.fn().mockImplementation(() => events.push("onResult"));
    (playWrongBuzz as ReturnType<typeof vi.fn>).mockImplementation(() =>
      events.push("playWrongBuzz"),
    );
    (gretelEvent as ReturnType<typeof vi.fn>).mockImplementation(() =>
      events.push("gretelEvent"),
    );

    render(
      <TapSelect
        objects={sampleObjects}
        onResult={onResult}
        reducedMotion={false}
      />,
    );

    const btnA = screen.getByRole("button", { name: "Opción A" });
    fireEvent.click(btnA);

    expect(events).toEqual(["playWrongBuzz", "gretelEvent", "onResult"]);
  });
});
