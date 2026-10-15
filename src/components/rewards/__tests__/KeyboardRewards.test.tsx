import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, renderHook, act } from "@testing-library/react";
import { BadgeGrid } from "../BadgeGrid";
import { StickerReel } from "../StickerReel";
import { PipelineBoard, type DashboardStudent } from "@/features/teacher-crm/components/PipelineBoard";
import { feelBus } from "@/lib/feel-bus";
import { BADGES, STICKERS, useRewards } from "@/lib/rewards";

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

    it("announces locked badges as disabled while keeping them focusable", () => {
      const { rerender } = render(<BadgeGrid earnedIds={[]} />);
      const locked = screen.getByRole("button", { name: new RegExp(BADGES[0].name) });
      expect(locked.getAttribute("aria-disabled")).toBe("true");
      expect(locked.getAttribute("tabindex")).toBe("0");

      rerender(<BadgeGrid earnedIds={[BADGES[0].id]} />);
      const earned = screen.getByRole("button", { name: new RegExp(BADGES[0].name) });
      expect(earned.getAttribute("aria-disabled")).toBe("false");
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

    it("exposes student cards across all columns as radio options with aria-checked", () => {
      const onSelect = vi.fn();
      render(<PipelineBoard students={students} selectedStudentId="b" onSelectStudent={onSelect} />);

      const group = screen.getByRole("radiogroup", { name: "Seleccionar alumno" });
      expect(group).toBeTruthy();

      for (const student of students) {
        const radio = screen.getByRole("radio", { name: `Seleccionar alumno ${student.name}` });
        expect(radio.getAttribute("tabindex")).toBe("0");
        expect(radio.getAttribute("aria-checked")).toBe(String(student.id === "b"));
      }
    });

    it("selects students via Enter, Space, and click handlers identically", () => {
      const onSelect = vi.fn();
      render(<PipelineBoard students={students} selectedStudentId={null} onSelectStudent={onSelect} />);

      const ana = screen.getByRole("radio", { name: "Seleccionar alumno Ana" });
      const bruno = screen.getByRole("radio", { name: "Seleccionar alumno Bruno" });
      const carla = screen.getByRole("radio", { name: "Seleccionar alumno Carla" });

      fireEvent.keyDown(ana, { key: "Enter" });
      fireEvent.keyDown(bruno, { key: " " });
      fireEvent.click(carla);
      fireEvent.keyDown(carla, { key: "Escape" });

      expect(onSelect.mock.calls).toEqual([["a"], ["b"], ["c"]]);
    });
  });

  describe("Learner Scoping", () => {
    function setLearner(classId: string | null, studentId: string | null) {
      if (classId && studentId) {
        localStorage.setItem("cartilla.student-session.v1", JSON.stringify({ classId, studentId }));
      } else {
        localStorage.removeItem("cartilla.student-session.v1");
      }
      window.dispatchEvent(new Event("cartilla:student-session"));
    }

    afterEach(() => {
      localStorage.clear();
      setLearner(null, null);
    });

    it("scopes stickers and badges to the active learner", () => {
      // Switch to Learner A
      setLearner("class-A", "student-A");

      const { result } = renderHook(() => useRewards());

      expect(result.current.stickers).toEqual([]);
      expect(result.current.badges).toEqual([]);

      // Learner A earns a sticker and a badge
      act(() => {
        result.current.claimSticker(1);
        result.current.claimBadge("first_step");
      });

      expect(result.current.stickers).toEqual([1]);
      expect(result.current.badges).toEqual(["first_step"]);

      // Switch to Learner B
      act(() => {
        setLearner("class-B", "student-B");
      });

      // Learner B starts with neither
      expect(result.current.stickers).toEqual([]);
      expect(result.current.badges).toEqual([]);

      // Learner B earns its own
      act(() => {
        result.current.claimSticker(2);
      });

      expect(result.current.stickers).toEqual([2]);
      expect(result.current.badges).toEqual([]);

      // Switch back to Learner A
      act(() => {
        setLearner("class-A", "student-A");
      });

      // A's history is untouched
      expect(result.current.stickers).toEqual([1]);
      expect(result.current.badges).toEqual(["first_step"]);
    });
  });
});
