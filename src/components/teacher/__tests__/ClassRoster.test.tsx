// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClassRoster } from "../ClassRoster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { listClasses, getClass } from "@/lib/teacher.functions";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(),
  getClass: vi.fn(),
  createClass: vi.fn(),
  addStudents: vi.fn(),
  deleteStudent: vi.fn(),
  updateStudent: vi.fn(),
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

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ClassRoster />
    </QueryClientProvider>
  );
};

describe("ClassRoster error handling", () => {
  it("displays error state when listClasses rejects", async () => {
    vi.mocked(listClasses).mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    // Verify error message
    expect(await screen.findByText("Error al cargar tus clases")).toBeTruthy();
    expect(await screen.findByText("Hubo un problema de conexión al intentar obtener tu lista de clases.")).toBeTruthy();
    
    // The select box should also show an error state
    expect(await screen.findByText("Error al cargar clases")).toBeTruthy();

    // Verify retry button for classes
    const retryButtons = await screen.findAllByText("Reintentar");
    expect(retryButtons.length).toBeGreaterThan(0);
    
    // Simulate retry
    vi.mocked(listClasses).mockResolvedValueOnce([]);
    fireEvent.click(retryButtons[0]);
    
    // Wait for the empty state
    expect(await screen.findByText("Aún no tienes clases creadas")).toBeTruthy();
  });

  it("displays error state when getClass rejects", async () => {
    vi.mocked(listClasses).mockResolvedValueOnce([
      { id: "class-1", name: "Class 1", join_code: "1234", student_count: 0 }
    ]);
    vi.mocked(getClass).mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    // Verify error message for students
    expect(await screen.findByText("Error al cargar los alumnos")).toBeTruthy();
    expect(await screen.findByText("No pudimos cargar la lista de alumnos de esta clase.")).toBeTruthy();

    // Verify retry button for students
    const retryButton = await screen.findByText("Reintentar");
    
    // Simulate retry
    vi.mocked(getClass).mockResolvedValueOnce({
      id: "class-1",
      name: "Class 1",
      join_code: "1234",
      students: []
    });
    fireEvent.click(retryButton);
    
    // Wait for the empty state
    expect(await screen.findByText("Esta clase está vacía")).toBeTruthy();
  });

  it("displays empty state when listClasses succeeds but is empty", async () => {
    vi.mocked(listClasses).mockResolvedValueOnce([]);

    renderComponent();

    expect(await screen.findByText("Aún no tienes clases creadas")).toBeTruthy();
    expect(screen.queryByText("Error al cargar tus clases")).toBeNull();
  });

  it("displays empty state when getClass succeeds but is empty", async () => {
    vi.mocked(listClasses).mockResolvedValueOnce([
      { id: "class-1", name: "Class 1", join_code: "1234", student_count: 0 }
    ]);
    vi.mocked(getClass).mockResolvedValueOnce({
      id: "class-1",
      name: "Class 1",
      join_code: "1234",
      students: []
    });

    renderComponent();

    expect(await screen.findByText("Esta clase está vacía")).toBeTruthy();
    expect(screen.queryByText("Error al cargar los alumnos")).toBeNull();
  });
});
