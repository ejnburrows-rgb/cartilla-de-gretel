import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PipelineBoard } from "../PipelineBoard";

const students = [
  { id: "a", name: "Ana", progress: 20, lastActive: "Hoy", alert: true },
  { id: "b", name: "Bruno", progress: 55, lastActive: "Ayer", alert: false },
  { id: "c", name: "Carla", progress: 99, lastActive: "Hoy", alert: false },
];

afterEach(() => {
  cleanup();
});

describe("PipelineBoard keyboard access", () => {
  it("exposes all three student statuses as keyboard-focusable controls", () => {
    const select = vi.fn();
    render(<PipelineBoard students={students} selectedStudentId="b" onSelectStudent={select} />);
    for (const student of students) {
      const button = screen.getByRole("button", { name: `Seleccionar alumno ${student.name}` });
      expect(button.getAttribute("tabindex")).toBe("0");
      expect(button.getAttribute("aria-pressed")).toBe(String(student.id === "b"));
    }
  });

  it("selects students with Enter, Space and pointer without triggering unrelated keys", () => {
    const select = vi.fn();
    render(<PipelineBoard students={students} selectedStudentId={null} onSelectStudent={select} />);
    const ana = screen.getByRole("button", { name: "Seleccionar alumno Ana" });
    const bruno = screen.getByRole("button", { name: "Seleccionar alumno Bruno" });
    const carla = screen.getByRole("button", { name: "Seleccionar alumno Carla" });
    fireEvent.keyDown(ana, { key: "Enter" });
    fireEvent.keyDown(bruno, { key: " " });
    fireEvent.click(carla);
    fireEvent.keyDown(carla, { key: "Escape" });
    expect(select.mock.calls).toEqual([["a"], ["b"], ["c"]]);
  });
});
