/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonTimer } from "../LessonTimer";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("visible classroom LessonTimer accessibility", () => {
  it("names the count-up time without creating nonexistent timer controls", () => {
    vi.useFakeTimers();
    render(<LessonTimer />);
    const timer = screen.getByRole("timer", { name: "Tiempo transcurrido: 0:00" });
    expect(timer).toHaveAttribute("aria-live", "off");
    expect(timer.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(timer).toHaveAttribute("aria-label", "Tiempo transcurrido: 0:02");
  });

  it("names countdown and overtime without per-second live announcements", () => {
    vi.useFakeTimers();
    render(<LessonTimer limitSeconds={2} />);
    const timer = screen.getByRole("timer", { name: "Tiempo restante: 0:02" });
    expect(timer).toHaveAttribute("aria-live", "off");
    expect(timer).toHaveTextContent("Quedan 0:02");

    act(() => vi.advanceTimersByTime(3000));
    expect(timer).toHaveAttribute("aria-label", "Tiempo vencido hace 0:01");
    expect(timer).toHaveTextContent("Tiempo vencido +0:01");
    expect(timer.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
