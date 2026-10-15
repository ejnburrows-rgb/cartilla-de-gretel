import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React, { lazy } from "react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import "@testing-library/jest-dom/vitest";

const mockGetMyProgress = vi.fn();
vi.mock("@/lib/student.functions", () => ({
  getMyProgress: (...args: any) => mockGetMyProgress(...args),
}));

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => ({ studentId: "s1", studentCode: "S1" }),
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
const MiProgreso = Route.options.component as React.ComponentType;

describe("mi-progreso component", () => {
  it("only counts valid numeric lesson IDs toward completion total and keeps per-word exercises", async () => {
    mockGetMyProgress.mockResolvedValueOnce({
      student: { display_name: "Test Student", student_code: "1234" },
      class: { name: "Test Class" },
      events: [
        { lesson_id: "1", event_kind: "lesson_completed", score: null, total: null },
        { lesson_id: "silabas-o", event_kind: "lesson_completed", score: null, total: null }, // Phantom game id
        { lesson_id: "2", event_kind: "lesson_completed", score: null, total: null },
        { lesson_id: "silabas-o", event_kind: "exercise", score: 1, total: 1, meta: { exercise: "syllable-builder" } },
      ],
      lessonProgress: [],
    });

    render(<MiProgreso />);
    
    const countElement = await screen.findByText(`2/${TOTAL_LESSONS}`);
    expect(countElement).toBeInTheDocument();
    
    // There are four Stat components. Ejercicios is the second one, its label is 'Ejercicios'.
    // The value should be '1' because there's 1 run (key: 'silabas-o:syllable-builder').
    const exercisesLabel = await screen.findByText("Ejercicios");
    const statContainer = exercisesLabel.closest(".kid-card");
    expect(statContainer).not.toBeNull();
    const val = within(statContainer as HTMLElement).getByText("1");
    expect(val).toBeInTheDocument();
  });
});