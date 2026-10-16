/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@tanstack/react-router", () => ({
  createLazyFileRoute: () => (Component: unknown) => {
    // Return a mocked Route object that has useParams
    const RouteObj = {
      useParams: vi.fn(),
      component: Component,
    };
    return RouteObj;
  },
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock("@/lib/seed-data", () => ({
  isSeedSessionActive: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/crm-student-progress", () => ({
  fetchCrmStudentProgress: vi.fn(),
}));

import { LeccionDetail } from "../crm.$classId.$studentId.$lessonId.lazy";
import { Route as RouteObj } from "../crm.$classId.$studentId.$lessonId.lazy";
import { useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderComponent() {
  return render(
    <QueryClientProvider client={queryClient}>
      <LeccionDetail />
    </QueryClientProvider>,
  );
}

describe("LeccionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (RouteObj.useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      classId: "class-1",
      studentId: "student-1",
      lessonId: "1",
    });
  });

  it("shows Completada badge when computeLessonStatus returns completed even without lesson_completed event", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        student: { id: "student-1", display_name: "Test Student", student_code: "123" },
        events: [], // NO lesson_completed event
        lessonProgress: [{ lesson_id: "1", status: "completed" }], // Row says completed
      },
      isLoading: false,
    });

    renderComponent();

    // The badge has the text "Completada"
    const badge = screen.getByText("Completada");
    expect(badge).toBeTruthy();
  });

  it("does not show Completada badge when computeLessonStatus returns in_progress even without lesson_completed event", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        student: { id: "student-1", display_name: "Test Student", student_code: "123" },
        events: [],
        lessonProgress: [{ lesson_id: "1", status: "started" }], // Row says started (in_progress)
      },
      isLoading: false,
    });

    renderComponent();

    const badge = screen.queryByText("Completada");
    expect(badge).toBeNull();
  });
});
