import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React, { lazy } from "react";
import "@testing-library/jest-dom/vitest";

const mockGetMyProgress = vi.fn();
vi.mock("@/lib/student.functions", () => ({
  getMyProgress: (...args: any) => mockGetMyProgress(...args),
}));

let currentSession: any = { studentId: "studentA", studentCode: "A", display_name: "Student A" };
vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => currentSession,
}));

vi.mock("@/lib/lesson-progress", () => ({
  useLessonProgress: () => ({ isCompleted: () => false }),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  lazyRouteComponent: (load: () => Promise<Record<string, React.ComponentType>>, name: string) =>
    lazy(async () => ({ default: (await load())[name] })),
  useParams: () => ({ n: "3" }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  redirect: () => { throw new Error("Redirected"); },
}));

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({ lang: "es" }),
}));

const mockRewards = {
  allStickers: [],
  stickers: [],
  allBadges: [],
  badges: [],
};
vi.mock("@/lib/rewards", () => ({
  useRewards: () => mockRewards,
}));

import { Route } from "../mi-progreso";
vi.stubEnv("VITE_CRM_REVIEW", "false");

const ProgressPage = Route.options.component as React.ComponentType;

describe("MiProgreso race condition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not show Student A's data when it resolves after Student B has signed in", async () => {
    let resolveA: (value: any) => void;
    let resolveB: (value: any) => void;
    
    mockGetMyProgress.mockImplementation(({ data }) => {
      if (data.studentId === "studentA") {
        return new Promise((res) => { resolveA = res; });
      }
      if (data.studentId === "studentB") {
        return new Promise((res) => { resolveB = res; });
      }
      return Promise.resolve({});
    });

    currentSession = { studentId: "studentA", studentCode: "A" } as any;

    const { unmount } = render(<ProgressPage />);

    // Request for A is in flight.
    await waitFor(
      () => {
        expect(mockGetMyProgress).toHaveBeenCalledWith({ data: { studentId: "studentA", studentCode: "A" } });
      },
      // Deflake: the TanStack router vite plugin rewrites this route into a dynamic
      // lazyRouteComponent import that can exceed the 1000ms default on a cold cache.
      { timeout: 5000 },
    );

    // Now Student B signs in!
    currentSession = { studentId: "studentB", studentCode: "B" } as any;
    window.dispatchEvent(new Event("cartilla:student-session"));
    
    // Request for B is in flight.
    await waitFor(() => {
        expect(mockGetMyProgress).toHaveBeenCalledWith({ data: { studentId: "studentB", studentCode: "B" } });
    });

    // Resolve B first
    resolveB!({
      student: { display_name: "Student B", student_code: "B" },
      class: { name: "Class B" },
      events: [],
      lessonProgress: [],
    });

    await waitFor(() => {
        expect(screen.getByText(/Student B/)).toBeInTheDocument();
    });

    // Now resolve A
    resolveA!({
      student: { display_name: "Student A", student_code: "A" },
      class: { name: "Class A" },
      events: [],
      lessonProgress: [],
    });
    
    // Wait a bit to ensure it doesn't switch
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.queryByText(/Student A/)).not.toBeInTheDocument();
    expect(screen.getByText(/Student B/)).toBeInTheDocument();
  });
});
