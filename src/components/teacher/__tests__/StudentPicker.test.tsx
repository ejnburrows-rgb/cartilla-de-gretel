import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentPicker } from "../StudentPicker";
import * as TeacherFunctions from "@/lib/teacher.functions";
import * as SeedData from "@/lib/seed-data";
import "@testing-library/jest-dom";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(),
  getClass: vi.fn(),
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: vi.fn(),
  listSeedClasses: vi.fn(),
  getSeedClass: vi.fn(),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("StudentPicker", () => {
  it("associates labels with their respective comboboxes", async () => {
    vi.mocked(SeedData.isSeedSessionActive).mockReturnValue(true);
    vi.mocked(SeedData.listSeedClasses).mockReturnValue([
      { id: "class-1", name: "Class 1", student_count: 2 },
    ] as any);
    vi.mocked(SeedData.getSeedClass).mockReturnValue({
      id: "class-1",
      name: "Class 1",
      students: [
        { id: "student-1", display_name: "Student 1" },
        { id: "student-2", display_name: "Student 2" },
      ],
    } as any);

    renderWithQueryClient(<StudentPicker onSelectionChange={vi.fn()} />);

    const classSelect = await screen.findByRole("combobox", { name: "Clase" });
    const studentSelect = await screen.findByRole("combobox", { name: "Alumno" });

    expect(classSelect).toBeInTheDocument();
    expect(studentSelect).toBeInTheDocument();
  });
});
