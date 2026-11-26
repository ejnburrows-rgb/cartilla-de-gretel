/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClass, listClasses, addStudents } from "@/lib/teacher.functions";
import { ClassRoster } from "../ClassRoster";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(),
  getClass: vi.fn(),
  updateStudent: vi.fn(),
  createClass: vi.fn(),
  addStudents: vi.fn(),
  deleteStudent: vi.fn(),
  archiveStudent: vi.fn(),
  restoreStudent: vi.fn(),
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: () => false,
  listSeedClasses: vi.fn(),
  getSeedClass: vi.fn(),
  createSeedClass: vi.fn(),
  addSeedStudents: vi.fn(),
  deleteSeedStudent: vi.fn(),
  updateSeedStudent: vi.fn(),
}));

let client: QueryClient;

beforeEach(() => {
  vi.resetAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.mocked(listClasses).mockResolvedValue([{
    id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", student_count: 1, created_at: "2026-01-01",
  }]);
  vi.mocked(getClass).mockImplementation(async () => ({
    class: { id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", created_at: "2026-01-01" },
    students: [{ id: "synthetic-student", display_name: "Alumno 1", student_code: "SYN01", created_at: "2026-01-01",
      archived_at: null, teacher_notes: null, events: 0, lessons: 0, lastSeen: null, completionPercent: 0 }],
  }));
});

afterEach(() => { cleanup(); client.clear(); });

const renderComponent = () => {
  return render(
    <QueryClientProvider client={client}>
      <ClassRoster />
    </QueryClientProvider>
  );
};

describe("ClassRoster addStudent error handling", () => {
  it("displays error state when addStudents rejects", async () => {
    vi.mocked(addStudents).mockRejectedValueOnce(new Error("Error de prueba añadiendo alumno"));

    renderComponent();

    // Wait for roster to load
    await waitFor(() => {
        expect(screen.queryByText("Alumno 1")).toBeVisible();
    });

    const addInput = screen.getByPlaceholderText("Añadir alumno nuevo...");
    const addButton = screen.getByRole("button", { name: "Añadir alumno" });

    fireEvent.change(addInput, { target: { value: "Nuevo Alumno Error" } });
    fireEvent.click(addButton);

    expect(await screen.findByText("Error de prueba añadiendo alumno")).toBeVisible();

    expect(addStudents).toHaveBeenCalledTimes(1);
    expect(addStudents).toHaveBeenCalledWith({ data: { classId: "synthetic-class", names: ["Nuevo Alumno Error"] } });
  });
});
