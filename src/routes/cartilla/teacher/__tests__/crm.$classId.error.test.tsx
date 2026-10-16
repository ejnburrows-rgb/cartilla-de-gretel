/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as teacherFunctions from "@/lib/teacher.functions";

vi.mock("@/lib/teacher.functions", () => ({
  getClass: vi.fn(),
  getClassProgress: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
    createLazyFileRoute: () => (config: Record<string, unknown>) => {
      // Return an object mimicking Route with useParams mocked
      return {
        options: config,
        useParams: () => ({ classId: "test-class-id" }),
      };
    },
    useParams: () => ({ classId: "test-class-id" }),
  };
});

// Mock the route module completely so we can supply Route.useParams directly
vi.mock("../crm.$classId.index.lazy", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("../crm.$classId.index.lazy");
  const MockedRoute = {
    ...(actual.Route as Record<string, unknown>),
    useParams: () => ({ classId: "test-class-id" }),
  };
  return {
    ...actual,
    Route: MockedRoute,
  };
});

// Import component AFTER mocking router
import { Route as CrmClassRoute } from "../crm.$classId.index.lazy";

describe("CRM Class Dashboard Error Handling", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Do not retry for testing error state
        },
      },
    });
  });

  it("renders a Spanish error alert and retry button if the query fails", async () => {
    // Mock BOTH queries to reject so loading is finished and isError is true
    vi.mocked(teacherFunctions.getClass).mockImplementation(() =>
      Promise.reject(new Error("Network Error")),
    );
    vi.mocked(teacherFunctions.getClassProgress).mockImplementation(() =>
      Promise.reject(new Error("Network Error")),
    );

    const CrmOverviewComponent = CrmClassRoute.options.component as unknown as React.ComponentType;

    render(
      <QueryClientProvider client={queryClient}>
        <CrmOverviewComponent />
      </QueryClientProvider>,
    );

    // Wait until loading message disappears
    await waitFor(
      () => {
        expect(screen.queryByText("Cargando clase...")).toBeNull();
      },
      { timeout: 2000 },
    );

    // Verify error message with role="alert" appears
    const alert = await screen.findByRole("alert");
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain("Error al cargar la clase");

    const retryBtn = screen.getByRole("button", { name: /Reintentar/i });
    expect(retryBtn).toBeTruthy();

    // Setup success for retry
    vi.mocked(teacherFunctions.getClass).mockResolvedValue({
      class: { id: "test-class-id", name: "Success Class", join_code: "12345" },
      students: [],
    } as unknown as ReturnType<typeof teacherFunctions.getClass> extends Promise<infer U>
      ? U
      : never);
    vi.mocked(teacherFunctions.getClassProgress).mockResolvedValue({
      attentionByStudent: {},
      perLesson: {},
      recentEvents: [],
      perStudent: [],
      perStudentExercise: {},
      assignments: [],
    } as unknown as ReturnType<typeof teacherFunctions.getClassProgress> extends Promise<infer U>
      ? U
      : never);

    // Click retry
    fireEvent.click(retryBtn);

    // Wait for the success state to render
    const heading = await screen.findByRole("heading", { name: "Success Class" });
    expect(heading).toBeTruthy();
  });
});
