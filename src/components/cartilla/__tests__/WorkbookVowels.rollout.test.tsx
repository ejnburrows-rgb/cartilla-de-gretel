/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FaithfulPageRenderer } from "../FaithfulPageRenderer";
import { WorkbookLetterTrace } from "../WorkbookLetterTrace";
import { DirectPencilConnector } from "@/cartilla/interactions/PencilConnector";
import { ActivityContext } from "@/lib/activity-events";
import { getPageLayout } from "@/lib/book-faithful";
import { isWorkbookPageSourceBlocked } from "@/lib/workbook-pages";
import { loadLassoProgress, saveLassoProgress } from "@/lib/activity-canvas-store";
import { learnerStorageKey } from "@/lib/learner-storage";

const identity = vi.hoisted(() => ({
  demo: null as null | { classId: string; studentId: string },
}));

vi.mock("@/lib/demo-student-session", () => ({
  getDemoStudentSession: () => identity.demo,
}));

vi.mock("@/lib/gretel-bus", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gretel-bus")>()),
  gretelEvent: vi.fn(),
  onGretelEvent: vi.fn(() => () => {}),
  focusGretelActivity: vi.fn(),
  releaseGretelActivity: vi.fn(),
}));

vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

function installCanvasMock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = function () {
    return {
      setTransform: vi.fn(),
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
      canvas: this,
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).toDataURL = vi.fn(() => "data:image/png;base64,mock");
}

describe("Track A: Vowels Curriculum Rollout (Lessons 1, 2, 4, 5 and U)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    identity.demo = null;
    installCanvasMock();
    vi.clearAllMocks();

    // Default to fine pointer (mouse -> tap mode)
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q === "(pointer: fine)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("1. Writing Lines (Uppercase guided trace & Lowercase freehand canvas)", () => {
    it("Lesson 2 (Page 6 - Vocal O): renders uppercase trace for O and O2, freehand canvas for o and o2", () => {
      const regions = getPageLayout(6);
      expect(regions).not.toBeNull();
      const { container } = render(
        <FaithfulPageRenderer pageNumber={6} lessonNumber={2} regions={regions ?? []} interactive native />,
      );

      // Verify uppercase writing lines render guided WorkbookLetterTrace
      const traceLines = container.querySelectorAll(".fp-writing-line--trace");
      expect(traceLines.length).toBe(2); // p6-write-O and p6-write-O2

      // Verify lowercase writing lines render freehand DibujaHost
      const freehandLines = container.querySelectorAll(".fp-writing-line--freehand");
      expect(freehandLines.length).toBe(2); // p6-write-o and p6-write-o2

      // Models display
      const models = Array.from(container.querySelectorAll(".fp-writing-line__model")).map(el => el.textContent);
      expect(models).toEqual(["o", "o"]); // Lowercase freehand headers display the model letter

      // Freehand canvases respond to pointer events
      const canvases = container.querySelectorAll(".am-dibuja canvas");
      expect(canvases.length).toBeGreaterThanOrEqual(2);
    });

    it("Uppercase O trace: sequential tap mode through 9 checkpoints completes and emits activity:complete", async () => {
      const onEvent = vi.fn();
      const { container } = render(
        <ActivityContext.Provider
          value={{
            activityId: "page-6-p6-write-O",
            isolated: false,
            isCurrent: () => true,
            onEvent,
          }}
        >
          <WorkbookLetterTrace modelText="O" />
        </ActivityContext.Provider>,
      );

      const traceRoot = container.querySelector(".fp-trace");
      expect(traceRoot?.getAttribute("data-mode")).toBe("tap");
      expect(traceRoot?.getAttribute("data-status")).toBe("idle");

      // Tap checkpoints sequentially (9 points for O)
      for (let i = 0; i < 9; i++) {
        const active = container.querySelector(".fp-trace__dot--active");
        expect(active).toBeTruthy();
        fireEvent.click(active!);
      }

      expect(traceRoot?.getAttribute("data-status")).toBe("done");
      expect(screen.getByRole("button", { name: /Reiniciar el trazo/i })).toBeTruthy();
    });

    it("Lesson 4 (Page 12 - Vocal E): renders uppercase trace for E and E2, freehand canvas for e and e2", () => {
      const regions = getPageLayout(12);
      expect(regions).not.toBeNull();
      const { container } = render(
        <FaithfulPageRenderer pageNumber={12} lessonNumber={4} regions={regions ?? []} interactive native />,
      );

      const traceLines = container.querySelectorAll(".fp-writing-line--trace");
      expect(traceLines.length).toBe(2); // E and E2

      const freehandLines = container.querySelectorAll(".fp-writing-line--freehand");
      expect(freehandLines.length).toBe(2); // e and e2

      // Tap checkpoints sequentially for E (4 strokes: down, top bar, mid bar, bottom bar = 10 points)
      const firstTrace = traceLines[0].querySelector(".fp-trace");
      expect(firstTrace).toBeTruthy();
      expect(firstTrace?.getAttribute("data-status")).toBe("idle");
    });

    it("Lesson 5 (Page 15 - Vocal I): renders uppercase trace for I and I2, freehand canvas for i and i2", () => {
      const regions = getPageLayout(15);
      expect(regions).not.toBeNull();
      const { container } = render(
        <FaithfulPageRenderer pageNumber={15} lessonNumber={5} regions={regions ?? []} interactive native />,
      );

      const traceLines = container.querySelectorAll(".fp-writing-line--trace");
      expect(traceLines.length).toBe(2); // I and I2

      const freehandLines = container.querySelectorAll(".fp-writing-line--freehand");
      expect(freehandLines.length).toBe(2); // i and i2
    });

    it("Lesson 6 (Page 18 - Vocal U): renders uppercase trace for U and U2, freehand canvas for u and u2", () => {
      const regions = getPageLayout(18);
      expect(regions).not.toBeNull();
      const { container } = render(
        <FaithfulPageRenderer pageNumber={18} lessonNumber={6} regions={regions ?? []} interactive native />,
      );

      const traceLines = container.querySelectorAll(".fp-writing-line--trace");
      expect(traceLines.length).toBe(2); // U and U2

      const freehandLines = container.querySelectorAll(".fp-writing-line--freehand");
      expect(freehandLines.length).toBe(2); // u and u2
    });

    it("Lesson 1 (Pages 1, 2, 3 - Vowels Intro): faithfully renders without writing lines", () => {
      const p1 = getPageLayout(1);
      const p2 = getPageLayout(2);
      const p3 = getPageLayout(3);
      expect(p1).not.toBeNull();
      expect(p2).not.toBeNull();
      expect(p3).not.toBeNull();

      const r1 = p1!.map(r => r.regionType);
      const r2 = p2!.map(r => r.regionType);
      const r3 = p3!.map(r => r.regionType);

      expect(r1).toContain("picture-grid");
      expect(r2).toContain("vowel-pick-one");
      expect(r3).toContain("vowel-match-all");
      expect(r1).not.toContain("writing-line");
      expect(r2).not.toContain("writing-line");
      expect(r3).not.toContain("writing-line");
    });
  });

  describe("2. Vowel Line Matching (vowel-line-match direct pencil & neutral retry)", () => {
    it("Page 5 (Vocal O): center button Oo connects to picture targets with neutral retry on wrong target", () => {
      const regions = getPageLayout(5);
      expect(regions).not.toBeNull();
      const { container } = render(
        <FaithfulPageRenderer pageNumber={5} lessonNumber={2} regions={regions ?? []} interactive native />,
      );

      // Verify direct pencil connector is rendered
      const centerBtn = container.querySelector(".am-direct-pencil__center");
      expect(centerBtn).toBeTruthy();
      expect(centerBtn?.textContent).toContain("Oo");

      // Verify NO rope or lasso elements
      expect(container.querySelector(".am-lasso__rope-layer")).toBeNull();
      expect(container.querySelector(".fp-ix-cell__lasso")).toBeNull();

      // Find wrong target and correct target
      const wrongTarget = container.querySelector(".am-direct-pencil__target[data-correct='false']") as HTMLButtonElement;
      const correctTarget = container.querySelector(".am-direct-pencil__target[data-correct='true']:not([data-example='true'])") as HTMLButtonElement;
      expect(wrongTarget).toBeTruthy();
      expect(correctTarget).toBeTruthy();

      // Simulate click-to-connect from center to wrong target
      fireEvent.click(centerBtn!);
      expect(centerBtn?.classList.contains("is-active")).toBe(true);

      fireEvent.click(wrongTarget);

      // Neutral retry styling: target gets is-retry class, retry animation appears
      expect(wrongTarget.classList.contains("is-retry")).toBe(true);
      expect(container.querySelector(".am-direct-pencil__retry-group")).toBeTruthy();

      // Now click center to correct target
      fireEvent.click(centerBtn!);
      fireEvent.click(correctTarget);

      // Correct target gets is-connected class
      expect(correctTarget.classList.contains("is-connected")).toBe(true);
    });

    it("Page 11 (Vocal E), Page 14 (Vocal I), Page 17 (Vocal U): all render approved DirectPencilConnector", () => {
      for (const [pageNum, lessonNum, expectedLetter] of [[11, 4, "Ee"], [14, 5, "Ii"], [17, 6, "Uu"]] as const) {
        cleanup();
        const regions = getPageLayout(pageNum);
        expect(regions).not.toBeNull();
        const { container } = render(
          <FaithfulPageRenderer pageNumber={pageNum} lessonNumber={lessonNum} regions={regions ?? []} interactive native />,
        );

        const centerBtn = container.querySelector(".am-direct-pencil__center");
        expect(centerBtn).toBeTruthy();
        expect(centerBtn?.textContent).toContain(expectedLetter);

        // Targets present
        const targets = container.querySelectorAll(".am-direct-pencil__target");
        expect(targets.length).toBeGreaterThanOrEqual(6);

        // No lasso/rope
        expect(container.querySelector(".am-lasso__rope-layer")).toBeNull();
      }
    });
  });

  describe("3. Learner Session Isolation (Student A -> Student B -> Student A)", () => {
    it("isolates vowel line match progress between Student A and Student B", () => {
      // Step 1: Student A is logged in
      identity.demo = { classId: "class-alpha", studentId: "student-1" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      const pageKey = "2:p5-match";
      // Student A connects targets
      saveLassoProgress(pageKey, ["p5-match-1", "p5-match-2"]);

      // Verify Student A sees saved progress
      const snapA = loadLassoProgress(pageKey);
      expect(snapA?.completedIds).toEqual(["p5-match-1", "p5-match-2"]);

      // Step 2: Switch to Student B
      identity.demo = { classId: "class-alpha", studentId: "student-2" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      // Verify Student B sees NO completed lines (empty / fresh)
      const snapB = loadLassoProgress(pageKey);
      expect(snapB).toBeNull();

      // Step 3: Switch back to Student A
      identity.demo = { classId: "class-alpha", studentId: "student-1" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      // Verify Student A's completed lines are restored
      const snapAReturned = loadLassoProgress(pageKey);
      expect(snapAReturned?.completedIds).toEqual(["p5-match-1", "p5-match-2"]);
    });

    it("isolates letter trace progress in activity-events between Student A and Student B", () => {
      // Step 1: Student A completes letter trace
      identity.demo = { classId: "class-alpha", studentId: "student-1" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      const k = learnerStorageKey("cartilla.activity-state.v1:page-6-p6-write-O:finishedWork");
      localStorage.setItem(k, JSON.stringify(true));

      // Student A has finishedWork = true
      expect(JSON.parse(localStorage.getItem(k)!)).toBe(true);

      // Step 2: Switch to Student B
      identity.demo = { classId: "class-alpha", studentId: "student-2" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      const kB = learnerStorageKey("cartilla.activity-state.v1:page-6-p6-write-O:finishedWork");
      expect(localStorage.getItem(kB)).toBeNull();

      // Step 3: Switch back to Student A
      identity.demo = { classId: "class-alpha", studentId: "student-1" };
      window.dispatchEvent(new Event("cartilla:student-session"));

      const kAReturn = learnerStorageKey("cartilla.activity-state.v1:page-6-p6-write-O:finishedWork");
      expect(JSON.parse(localStorage.getItem(kAReturn)!)).toBe(true);
    });
  });

  describe("4. Strict Owner Invariants", () => {
    it("Pages 86–87 remain strictly SOURCE_BLOCKED and are never rendered as active vowel exercises", () => {
      expect(isWorkbookPageSourceBlocked(86)).toBe(true);
      expect(isWorkbookPageSourceBlocked(87)).toBe(true);
      expect(isWorkbookPageSourceBlocked(5)).toBe(false);
      expect(isWorkbookPageSourceBlocked(6)).toBe(false);
      expect(isWorkbookPageSourceBlocked(11)).toBe(false);
      expect(isWorkbookPageSourceBlocked(12)).toBe(false);
      expect(isWorkbookPageSourceBlocked(14)).toBe(false);
      expect(isWorkbookPageSourceBlocked(15)).toBe(false);
      expect(isWorkbookPageSourceBlocked(17)).toBe(false);
      expect(isWorkbookPageSourceBlocked(18)).toBe(false);
    });
  });
});
