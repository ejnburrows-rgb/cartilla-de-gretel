import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClass, listClasses, updateStudent } from "@/lib/teacher.functions";
import { ClassRoster } from "../ClassRoster";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(), getClass: vi.fn(), updateStudent: vi.fn(), createClass: vi.fn(),
  addStudents: vi.fn(), deleteStudent: vi.fn(), archiveStudent: vi.fn(), restoreStudent: vi.fn(),
}));
vi.mock("@/lib/seed-data", () => ({ isSeedSessionActive: () => false }));

let client: QueryClient;
let storedName: string;
beforeEach(() => {
  vi.resetAllMocks();
  storedName = "Alumno sintético";
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.mocked(listClasses).mockResolvedValue([{
    id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", student_count: 1, created_at: "2026-01-01",
  }]);
  vi.mocked(getClass).mockImplementation(async () => ({
    class: { id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", created_at: "2026-01-01" },
    students: [{ id: "synthetic-student", display_name: storedName, student_code: "SYN01", created_at: "2026-01-01",
      archived_at: null, teacher_notes: null, events: 0, lessons: 0, lastSeen: null, completionPercent: 0 }],
  }));
  vi.mocked(updateStudent).mockImplementation(async ({ data }) => {
    storedName = data.displayName!;
    return { ok: true };
  });
});
afterEach(() => { cleanup(); client.clear(); });

async function edit() {
  render(<QueryClientProvider client={client}><ClassRoster /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Alumno sintético" }));
  return screen.getByDisplayValue("Alumno sintético");
}

describe("ClassRoster rename recovery", () => {
  it("preserves the typed name and editor on rejection, then retries and refreshes the saved name", async () => {
    vi.mocked(updateStudent).mockRejectedValueOnce(new Error("Error sintético al guardar"));
    const input = await edit();
    fireEvent.change(input, { target: { value: "Nombre corregido" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByText("Error sintético al guardar")).toBeVisible();
    expect(screen.getByDisplayValue("Nombre corregido")).toBe(input);
    expect(input).not.toHaveAttribute("readonly");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByRole("button", { name: "Nombre corregido" })).toBeVisible();
    expect(screen.queryByDisplayValue("Nombre corregido")).toBeNull();
    expect(updateStudent).toHaveBeenCalledTimes(2);
    expect(updateStudent).toHaveBeenLastCalledWith({ data: { id: "synthetic-student", displayName: "Nombre corregido" } });
    expect(storedName).toBe("Nombre corregido");
  });

  it("prevents Enter plus blur double submission in the same event turn and during the request", async () => {
    let finish!: (value: { ok: boolean }) => void;
    vi.mocked(updateStudent).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const input = await edit();
    fireEvent.change(input, { target: { value: "Nombre pendiente" } });
    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.blur(input);
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(updateStudent).toHaveBeenCalledTimes(1);
    expect(input).toHaveAttribute("readonly");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(updateStudent).toHaveBeenCalledTimes(1);
    finish({ ok: true });
    await waitFor(() => expect(screen.queryByDisplayValue("Nombre pendiente")).toBeNull());
  });

  it("cancels with Escape without saving the changed draft", async () => {
    const input = await edit();
    fireEvent.change(input, { target: { value: "No guardar" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Alumno sintético" })).toBeVisible();
    expect(updateStudent).not.toHaveBeenCalled();
  });

  it("closes an unchanged editor without making an update request", async () => {
    const input = await edit();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Alumno sintético" })).toBeVisible();
    expect(updateStudent).not.toHaveBeenCalled();
  });
});
