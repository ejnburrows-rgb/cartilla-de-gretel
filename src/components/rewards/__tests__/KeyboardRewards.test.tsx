import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BadgeGrid } from "../BadgeGrid";
import { StickerReel } from "../StickerReel";
import { feelBus } from "@/lib/feel-bus";
import { BADGES, STICKERS } from "@/lib/rewards";

vi.mock("@/lib/feel-bus", () => ({
  feelBus: { emit: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Rewards keyboard interaction", () => {
  it("makes earned and locked badge tiles keyboard-reachable", () => {
    render(<BadgeGrid earnedIds={[]} />);
    const badge = screen.getByRole("button", { name: new RegExp(BADGES[0].name) });
    expect(badge.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(badge, { key: "Enter" });
    fireEvent.keyDown(badge, { key: " " });
    expect(feelBus.emit).toHaveBeenCalledTimes(2);
    expect(feelBus.emit).toHaveBeenCalledWith("tap");
    fireEvent.keyDown(badge, { key: "Escape" });
    expect(feelBus.emit).toHaveBeenCalledTimes(2);
  });

  it("makes sticker tiles operable by Enter, Space and pointer", () => {
    render(<StickerReel earnedIds={[]} />);
    const sticker = screen.getByRole("button", { name: "Lección 1: Pegatina bloqueada" });
    expect(sticker.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(sticker, { key: "Enter" });
    fireEvent.keyDown(sticker, { key: " " });
    fireEvent.click(sticker);
    expect(feelBus.emit).toHaveBeenCalledTimes(3);
    expect(feelBus.emit).toHaveBeenCalledWith("tap");
    expect(STICKERS[0].lessonId).toBe(1);
  });
});
