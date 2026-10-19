import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorGameTemplate } from "../AuthorGameTemplate";
import { MariposasGame } from "../CoreGames";
import { MARIPOSAS_P } from "@/content/games/core-games";
import { PICK_ERASE_MS, PICK_SETTLE_MS } from "../PickMark";
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe("game marking and continuity", () => {
  it("marks wrong, erases, retries, and advances only after a complete correct word", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    const wrong = screen.getByRole("button", { name: "mo" });
    fireEvent.click(wrong); expect(wrong.getAttribute("data-pick-mark")).toBe("wrong");
    act(() => vi.advanceTimersByTime(PICK_ERASE_MS));
    expect(wrong.hasAttribute("data-pick-mark")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "pa" }));
    expect(screen.getByRole("button", { name: "pa" }).getAttribute("data-pick-mark")).toBe("right");
    act(() => vi.advanceTimersByTime(PICK_SETTLE_MS));
    fireEvent.click(screen.getByRole("button", { name: "pi" }));
    act(() => vi.advanceTimersByTime(PICK_SETTLE_MS));
    expect(screen.getByText("Palabra 2 de 3")).toBeDefined();
  });
  it("reset cancels pending advancement", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "pa" }));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText("Palabra 1 de 3")).toBeDefined();
    expect(screen.getAllByText("__")).toHaveLength(2);
  });
  it("switching letter remounts the mechanic and cancels old feedback", () => {
    render(<AuthorGameTemplate mechanic="mariposas" lesson={8} />);
    fireEvent.click(screen.getByRole("button", { name: "mo" }));
    fireEvent.click(screen.getByRole("button", { name: "Mm" }));
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("button", { name: "Mm" }).getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[data-pick-mark="wrong"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "rr" }));
    expect(screen.getByRole("button", { name: "rr" }).getAttribute("aria-pressed")).toBe("true");
  });
});
