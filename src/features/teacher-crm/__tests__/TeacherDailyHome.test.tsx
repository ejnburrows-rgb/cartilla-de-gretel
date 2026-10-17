/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeacherDailyHome } from "../TeacherDailyHome";

// Mock router links so we don't need a real router context
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock seed data library
vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: vi.fn().mockReturnValue(true),
  listSeedClasses: vi
    .fn()
    .mockReturnValue([{ id: "1", name: "Seed Class 1", created_at: "2023-01-01" }]),
  getSeedClass: vi
    .fn()
    .mockReturnValue({ id: "1", name: "Seed Class 1", created_at: "2023-01-01", students: [] }),
  listSeedAssignments: vi.fn().mockReturnValue([]),
  createSeedClass: vi.fn(),
  addSeedStudents: vi.fn(),
  createSeedAssignment: vi.fn(),
  deleteSeedAssignment: vi.fn(),
}));

// Mock CRM fetching
vi.mock("@/lib/crm-student-progress", () => ({
  fetchCrmStudentProgress: vi.fn().mockResolvedValue([]),
}));

// Mock teacher/db functions
vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn().mockResolvedValue([]),
  getClass: vi.fn().mockResolvedValue(null),
  createClass: vi.fn(),
  addStudents: vi.fn(),
}));

// Mock assignments DB fetch
vi.mock("@/lib/assignments.functions", () => ({
  listAssignments: vi.fn().mockResolvedValue([]),
}));

// Mock demo session clearing
vi.mock("@/lib/demo-student-session", () => ({
  resetDemoClassroom: vi.fn(),
}));

// Mock ResizeObserver for some React components
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("TeacherDailyHome", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("renders without crashing and displays the seed class", async () => {
    render(<TeacherDailyHome />, { wrapper: TestWrapper });

    // Header check
    expect(screen.getByText("Hoy en tu clase")).toBeDefined();

    // Check that we display the class name in the dropdown
    await waitFor(() => {
      const select = screen.getByRole("combobox", { name: "Clase activa" });
      expect(within(select).getByRole("option", { name: "Seed Class 1" })).toBeDefined();
    });
  });

  it("can toggle creating a new class", async () => {
    render(<TeacherDailyHome />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Nueva clase" })).toBeDefined();
    });

    const newClassButton = screen.getByRole("button", { name: "Nueva clase" });
    fireEvent.click(newClassButton);

    // Check that we're now showing the create class form
    expect(screen.getByPlaceholderText("Nombre de la clase")).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancelar nueva clase" })).toBeDefined();
  });
});
