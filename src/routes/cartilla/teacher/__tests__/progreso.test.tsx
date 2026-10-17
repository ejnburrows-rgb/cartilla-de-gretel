/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route as ProgresoRoute } from "../progreso.lazy";
import * as teacherFunctions from "@/lib/teacher.functions";
import * as seedData from "@/lib/seed-data";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(),
  getClassProgress: vi.fn(),
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: vi.fn(),
  listSeedClasses: vi.fn(),
  getSeedClassProgress: vi.fn(),
}));

function renderProgreso() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const history = createMemoryHistory({ initialEntries: ["/cartilla/teacher/progreso"] });
  const rootRoute = createRootRouteWithContext()({ component: Outlet });
  const progresoRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cartilla/teacher/progreso",
    component: ProgresoRoute.options.component,
  });
  const routeTree = rootRoute.addChildren([progresoRoute]);
  const router = createRouter({ routeTree, history });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("/cartilla/teacher/progreso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error UI when query fails", async () => {
    vi.mocked(seedData.isSeedSessionActive).mockReturnValue(false);
    vi.mocked(teacherFunctions.listClasses).mockResolvedValue([
      {
        id: "class-1",
        name: "Class 1",
        student_count: 5,
        join_code: "123",
        created_at: "2023-01-01",
      },
    ]);
    vi.mocked(teacherFunctions.getClassProgress).mockRejectedValue(new Error("Network Error"));

    renderProgreso();

    // Verify it doesn't show "No hay alumnos."
    await waitFor(() => {
      expect(screen.queryByText("No hay alumnos")).toBeNull();
    });

    // Check for error UI
    const errorMsg = await screen.findByText(/Hubo un error al cargar el progreso/i);
    expect(errorMsg).toBeTruthy();

    // Check for retry button
    const retryBtn = screen.getByRole("button", { name: /Reintentar/i });
    expect(retryBtn).toBeTruthy();
  });
});
