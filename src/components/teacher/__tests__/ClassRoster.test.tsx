// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
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
      { id: "class-1", name: "Class 1", join_code: "1234", student_count: 0, created_at: "2024-01-01T00:00:00Z" }
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
      class: {
        id: "class-1",
        name: "Class 1",
        join_code: "1234",
        created_at: "2024-01-01T00:00:00Z"
      },
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
      { id: "class-1", name: "Class 1", join_code: "1234", student_count: 0, created_at: "2024-01-01T00:00:00Z" }
    ]);
    vi.mocked(getClass).mockResolvedValueOnce({
      class: {
        id: "class-1",
        name: "Class 1",
        join_code: "1234",
        created_at: "2024-01-01T00:00:00Z"
      },
      students: []
    });

    renderComponent();

    expect(await screen.findByText("Esta clase está vacía")).toBeTruthy();
    expect(screen.queryByText("Error al cargar los alumnos")).toBeNull();
  });

  it("keeps cached classes visible when a background refetch fails", async () => {
    vi.mocked(listClasses)
      .mockResolvedValueOnce([
        { id: "class-1", name: "Class 1", join_code: "1234", student_count: 0, created_at: "2024-01-01T00:00:00Z" }
      ])
      .mockRejectedValueOnce(new Error("Network Error"));
    vi.mocked(getClass).mockResolvedValue({
      class: {
        id: "class-1",
        name: "Class 1",
        join_code: "1234",
        created_at: "2024-01-01T00:00:00Z"
      },
      students: []
    });

    renderComponent();

    // initial load succeeds: the class select is rendered
    await waitFor(() => {
      expect(document.querySelector("#active-class-select")).toBeTruthy();
    });

    // background refetch fails while cached data exists
    await queryClient.refetchQueries({ queryKey: ["roster-classes"] });

    // cached roster stays visible; no blocking error panel
    await waitFor(() => {
      expect(screen.queryByText("Error al cargar tus clases")).toBeNull();
    });
    expect(document.querySelector("#active-class-select")).toBeTruthy();
  });

  it("keeps cached students visible when a background refetch fails", async () => {
    const classData = {
      class: {
        id: "class-1",
        name: "Class 1",
        join_code: "1234",
        created_at: "2024-01-01T00:00:00Z"
      },
      students: [{
        id: "s-1",
        display_name: "Ana",
        student_code: "A1",
        created_at: "2024-01-01T00:00:00Z",
        archived_at: null,
        teacher_notes: null,
        events: 0,
        lessons: 0,
        lastSeen: null,
        completionPercent: 0
      }]
    };
    vi.mocked(listClasses).mockResolvedValueOnce([
      { id: "class-1", name: "Class 1", join_code: "1234", student_count: 1, created_at: "2024-01-01T00:00:00Z" }
    ]);
    vi.mocked(getClass)
      .mockResolvedValueOnce(classData)
      .mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    // initial load succeeds: the student table is rendered
    expect(await screen.findByText("Miembros de la Clase")).toBeTruthy();
    expect(await screen.findByText("Ana")).toBeTruthy();

    // background refetch fails while cached data exists
    await queryClient.refetchQueries({ queryKey: ["roster-students"] });

    // cached students stay visible; no blocking error panel
    await waitFor(() => {
      expect(screen.queryByText("Error al cargar los alumnos")).toBeNull();
    });
    expect(screen.getByText("Miembros de la Clase")).toBeTruthy();
    expect(screen.getByText("Ana")).toBeTruthy();
  });
});
