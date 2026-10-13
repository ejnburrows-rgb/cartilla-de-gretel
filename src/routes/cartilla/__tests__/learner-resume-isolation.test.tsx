import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lazy, Suspense, useState } from "react";
import { learnerStorageKey } from "@/lib/learner-storage";
import { readLearnerResume, saveLearnerResume } from "@/lib/learner-resume";

const identity = vi.hoisted(() => ({
  demo: null as null | { classId: string; studentId: string },
}));
vi.mock("@/lib/demo-student-session", () => ({ getDemoStudentSession: () => identity.demo }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  lazyRouteComponent: (load: () => Promise<Record<string, React.ComponentType>>, name: string) =>
    lazy(async () => ({ default: (await load())[name] })),
  useParams: () => ({ n: "3" }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: null, isFetched: true, isError: false }),
}));
vi.mock("@/lib/useServerFn", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/lib/assignments.functions", () => ({ listMyAssignments: vi.fn() }));
vi.mock("@/lib/student.functions", () => ({ getMyProgress: vi.fn(), saveLastPage: vi.fn() }));
vi.mock("@/lib/student-session", () => ({ useStudentSession: () => null, recordEvent: vi.fn() }));
vi.mock("@/lib/lesson-progress", () => ({
  useLessonProgress: vi.fn(),
  isLessonUnlocked: () => true,
  markLessonCompleted: vi.fn(),
}));
vi.mock("@/lib/seed-data", () => ({ listSeedStudentAssignments: () => [] }));
vi.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ lang: "es" }) }));
vi.mock("@/utils/buildPageArray", () => ({
  buildPageArray: () => [1, 2, 3].map((pageNumber) => ({ id: String(pageNumber), pageNumber })),
}));
vi.mock("@/components/cartilla/DemoStudentBanner", () => ({ DemoStudentBanner: () => null }));
vi.mock("@/components/cartilla/GardenScene", () => ({
  GardenScene: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/gretel/GretelCinematic", () => ({ GretelCinematic: () => null }));
vi.mock("@/components/gretel/GretelPresence", () => ({ GretelPresence: () => null }));
vi.mock("@/components/cartilla/ReconstructedWorkbookPage", () => ({
  ReconstructedWorkbookPage: () => null,
}));
vi.mock("@/components/cartilla/FaithfulPageRenderer", () => ({ FaithfulPageRenderer: () => null }));
function Viewer({
  initialPage = 0,
  onPageChange,
  pages,
}: {
  initialPage?: number;
  onPageChange?: (n: number) => void;
  pages: { pageNumber: number }[];
}) {
  const [index, setIndex] = useState(initialPage);
  return (
    <>
      <output>{pages[index]?.pageNumber}</output>
      <button
        onClick={() => {
          setIndex(index + 1);
          onPageChange?.(index + 1);
        }}
      >
        Next
      </button>
    </>
  );
}
vi.mock("@/components/StudentBook/NativeLessonViewer", () => ({
  NativeLessonViewer: (props: Parameters<typeof Viewer>[0]) => <Viewer {...props} />,
}));
vi.mock("@/components/StudentBook/CurlPageViewer", () => ({
  CurlPageViewer: (props: Parameters<typeof Viewer>[0]) => <Viewer {...props} />,
}));
import { Leccion } from "../-leccion-view";
import { Route } from "../cuaderno";
const Workbook = Route.options.component!;
async function show(element: React.ReactNode) {
  render(<Suspense fallback={<p>Loading</p>}>{element}</Suspense>);
  await screen.findByRole("status");
}
function select(id: string | null) {
  act(() => {
    identity.demo = id ? { classId: "class", studentId: id } : null;
    window.dispatchEvent(new Event("cartilla:student-session"));
  });
}
beforeEach(() => {
  cleanup();
  localStorage.clear();
  identity.demo = null;
});
afterEach(cleanup);
describe("lesson learner resume", () => {
  it("A page 2 → B page 1 → A page 2, without overwriting B's bookmark", async () => {
    select("A");
    saveLearnerResume(3, 1);
    await show(<Leccion />);
    expect(screen.getByRole("status").textContent).toBe("2");
    select("B");
    expect(screen.getByRole("status").textContent).toBe("1");
    expect(readLearnerResume(3)?.page).toBe(0);
    select("A");
    expect(screen.getByRole("status").textContent).toBe("2");
    expect(readLearnerResume(3)?.page).toBe(1);
  });
  it("preserves navigation after remount and isolates anonymous/demo learners", async () => {
    saveLearnerResume(3, 2);
    select("A");
    await show(<Leccion />);
    expect(screen.getByRole("status").textContent).toBe("1");
    fireEvent.click(screen.getByText("Next"));
    cleanup();
    await show(<Leccion />);
    expect(screen.getByRole("status").textContent).toBe("2");
    select(null);
    expect(screen.getByRole("status").textContent).toBe("3");
    select("A");
    expect(screen.getByRole("status").textContent).toBe("2");
  });
});
describe("complete Workbook bookmark", () => {
  it("saves and restores independently on remount, A→B→A and anonymous return", async () => {
    select("A");
    await show(<Workbook />);
    fireEvent.click(screen.getByText("Next"));
    select("B");
    expect(screen.getByRole("status").textContent).toBe("1");
    select("A");
    expect(screen.getByRole("status").textContent).toBe("2");
    cleanup();
    await show(<Workbook />);
    expect(screen.getByRole("status").textContent).toBe("2");
    select(null);
    expect(screen.getByRole("status").textContent).toBe("1");
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    select("A");
    expect(screen.getByRole("status").textContent).toBe("2");
    select(null);
    expect(screen.getByRole("status").textContent).toBe("3");
  });
  it("keeps reader progress independent from lesson resume", async () => {
    select("A");
    saveLearnerResume(3, 2);
    await show(<Workbook />);
    fireEvent.click(screen.getByText("Next"));
    expect(readLearnerResume(3)).toEqual({ lesson: 3, page: 2 });
  });
  it("restores printed page 88 by identity, preserving the 85→88 gap", async () => {
    localStorage.setItem(learnerStorageKey("cartilla.workbook-reader-page.v1"), "85");
    await show(<Workbook />);
    expect(screen.getByRole("status").textContent).toBe("85");
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByRole("status").textContent).toBe("88");
    cleanup();
    await show(<Workbook />);
    expect(screen.getByRole("status").textContent).toBe("88");
  });
  it.each(["86", "87", "-1", "garbage", "999"])(
    "ignores an invalid or unavailable printed page %s",
    async (value) => {
      localStorage.setItem(learnerStorageKey("cartilla.workbook-reader-page.v1"), value);
      await show(<Workbook />);
      expect(screen.getByRole("status").textContent).toBe("1");
    },
  );
});
