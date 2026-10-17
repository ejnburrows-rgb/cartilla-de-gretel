import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import * as CRMStudentProgressModule from "@/lib/crm-student-progress";
import { Route as EstudianteRoute } from "../crm.$classId.$studentId.index.lazy";
import { Route as ReporteRoute } from "../crm.$classId.$studentId.reporte.lazy";

vi.mock("@/lib/crm-student-progress", () => ({
  fetchCrmStudentProgress: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function createTestRouter(Component: any) {
  const rootRoute = createRootRoute();
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: () => {
      // Mock useParams for the test
      Route.useParams = vi.fn().mockReturnValue({ classId: "class1", studentId: "student1" });
      return <Component />;
    },
  });

  const Route = {
    useParams: vi.fn().mockReturnValue({ classId: "class1", studentId: "student1" }),
  };

  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ["/test"] }),
    context: {},
  });

  // Inject the mocked route context into the component scope if needed
  return router;
}

// We have to mock Route for the lazy components
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    createLazyFileRoute: () => (config: any) => {
      const Component = config.component;
      // Add useParams to Route mock directly on the component or in the scope
      Component.useParams = vi.fn().mockReturnValue({ classId: "class1", studentId: "student1" });
      return Component;
    },
    Link: ({ children }: any) => <a href="/">{children}</a>,
  };
});

describe("CRM Student Route Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("shows an alert when fetchCrmStudentProgress fails in the index route", async () => {
    vi.spyOn(CRMStudentProgressModule, "fetchCrmStudentProgress").mockRejectedValue(
      new Error("Network Error"),
    );

    const TestComponent = EstudianteRoute as unknown as React.ComponentType;

    // Patch useParams for the test
    (EstudianteRoute as any).useParams = vi
      .fn()
      .mockReturnValue({ classId: "class1", studentId: "student1" });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });

    expect(screen.getByText(/Hubo un error al cargar los datos del alumno/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeTruthy();
    expect(screen.queryByText(/Cargando alumno/i)).toBeNull();
  });

  it("shows an alert when fetchCrmStudentProgress fails in the reporte route", async () => {
    vi.spyOn(CRMStudentProgressModule, "fetchCrmStudentProgress").mockRejectedValue(
      new Error("Network Error"),
    );

    const TestComponent = ReporteRoute as unknown as React.ComponentType;

    // Patch useParams for the test
    (ReporteRoute as any).useParams = vi
      .fn()
      .mockReturnValue({ classId: "class1", studentId: "student1" });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });

    expect(screen.getByText(/Hubo un error al cargar los datos del alumno/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeTruthy();
    expect(screen.queryByText(/Cargando reporte/i)).toBeNull();
  });
});
