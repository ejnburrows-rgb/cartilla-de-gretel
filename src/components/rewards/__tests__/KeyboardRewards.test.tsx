import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BadgeGrid } from "../BadgeGrid";
import { StickerReel } from "../StickerReel";
import { PipelineBoard, type DashboardStudent } from "@/features/teacher-crm/components/PipelineBoard";
import { feelBus } from "@/lib/feel-bus";
import { BADGES, STICKERS } from "@/lib/rewards";

vi.mock("@/lib/feel-bus", () => ({
  feelBus: { emit: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Keyboard Rewards and Pipeline Board Interactions", () => {
  describe("BadgeGrid keyboard semantics", () => {
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
  });

  describe("StickerReel keyboard semantics", () => {
    it("makes sticker tiles operable by Enter, Space and pointer", () => {
      render(<StickerReel earnedIds={[]} />);
      const sticker = screen.getByRole("button", { name: /^Lección 1:/ });
      expect(sticker.getAttribute("tabindex")).toBe("0");

      fireEvent.keyDown(sticker, { key: "Enter" });
      fireEvent.keyDown(sticker, { key: " " });
      fireEvent.click(sticker);
      expect(feelBus.emit).toHaveBeenCalledTimes(3);
      expect(feelBus.emit).toHaveBeenCalledWith("tap");
      expect(STICKERS[0].lessonId).toBe(1);
    });
  });

  describe("PipelineBoard keyboard semantics", () => {
    const students: DashboardStudent[] = [
      { id: "a", name: "Ana", progress: 20, lastActive: "Hoy", alert: true },
      { id: "b", name: "Bruno", progress: 55, lastActive: "Ayer", alert: false },
      { id: "c", name: "Carla", progress: 99, lastActive: "Hoy", alert: false },
    ];

    it("exposes student cards across all columns as keyboard-focusable controls with aria-pressed", () => {
      const onSelect = vi.fn();
      render(<PipelineBoard students={students} selectedStudentId="b" onSelectStudent={onSelect} />);

      for (const student of students) {
        const button = screen.getByRole("button", { name: `Seleccionar alumno ${student.name}` });
        expect(button.getAttribute("tabindex")).toBe("0");
        expect(button.getAttribute("aria-pressed")).toBe(String(student.id === "b"));
      }
    });

    it("selects students via Enter, Space, and click handlers identically", () => {
      const onSelect = vi.fn();
      render(<PipelineBoard students={students} selectedStudentId={null} onSelectStudent={onSelect} />);

      const ana = screen.getByRole("button", { name: "Seleccionar alumno Ana" });
      const bruno = screen.getByRole("button", { name: "Seleccionar alumno Bruno" });
      const carla = screen.getByRole("button", { name: "Seleccionar alumno Carla" });

      fireEvent.keyDown(ana, { key: "Enter" });
      fireEvent.keyDown(bruno, { key: " " });
      fireEvent.click(carla);
      fireEvent.keyDown(carla, { key: "Escape" });

      expect(onSelect.mock.calls).toEqual([["a"], ["b"], ["c"]]);
    });
  });
});
