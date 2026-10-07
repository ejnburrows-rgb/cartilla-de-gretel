/**
 * Owner rule: Back always works; Siguiente / Terminar lección only after the
 * page's required activity is complete. Completion comes from the existing
 * `activity:complete` bus events (no parallel progress system).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";

vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => true }));
import { focusGretelActivity, gretelEvent, onGretelEvent } from "@/lib/gretel-bus";
import { requiredActivitiesForPage, pageCompletionState } from "@/lib/page-completion";
import { markLessonCompleted, resetProgress } from "@/lib/lesson-progress";
import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

// Lesson 8 (P): p23 letter tracing + drawing, p24 syllable circles,
// p25 reading-only, p26 fill-in + sentences.
const PAGES: WorkbookPageEntry[] = [23, 24, 25, 26].map((pageNumber, i) => ({
  id: `lesson-8-page-${i + 1}`,
  pageNumber,
  gretelLine: `Página ${pageNumber}`,
  content: <div data-testid={`content-${pageNumber}`}>Página {pageNumber}</div>,
}));

function complete(activityId: string) {
  act(() => {
    focusGretelActivity({ activityId });
    gretelEvent("activity:complete");
  });
}

function completePage(pageNumber: number) {
  for (const a of requiredActivitiesForPage(pageNumber)) complete(a.id);
}

const next = () => screen.getByRole("button", { name: /Siguiente|Terminar lección/ });
const back = () => screen.getByRole("button", { name: /Anterior/ });
const current = () => Number(document.querySelector("[data-native-page]")?.getAttribute("data-native-page"));

beforeEach(() => {
  vi.useFakeTimers();
  window.scrollTo = vi.fn() as never;
  localStorage.clear();
  resetProgress();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("page requirements come from the verified page layout", () => {
  it("activity pages have requirements; reading-only pages have none", () => {
    expect(requiredActivitiesForPage(23).map((a) => a.kind)).toEqual(
      expect.arrayContaining(["draw-box"]),
    );
    expect(requiredActivitiesForPage(24).every((a) => a.kind === "syllable-match")).toBe(true);
    expect(requiredActivitiesForPage(24)).toHaveLength(5);
    expect(requiredActivitiesForPage(25)).toEqual([]);
    expect(requiredActivitiesForPage(26).map((a) => a.kind)).toEqual(["fill-in-blank", "writing-response"]);
    expect(pageCompletionState(25).complete).toBe(true);
  });

  it("every one of the 90 pages is completable (no requirement without an emitting activity)", () => {
    for (let p = 1; p <= 90; p += 1) {
      for (const a of requiredActivitiesForPage(p)) {
        expect(a.id.startsWith(`page-${p}-`)).toBe(true);
        expect(a.label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("NativeLessonViewer completion gate", () => {
  it("an incomplete page cannot advance and shows navigation guidance without counting it as a Gretel hint", () => {
    const busEvents: string[] = [];
    const off = onGretelEvent((type) => busEvents.push(type));
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    expect(current()).toBe(23);
    expect(next().getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(next());
    expect(current()).toBe(23);
    expect(screen.getByRole("status").textContent).toMatch(/termina/i);
    expect(screen.getByRole("status").textContent).toMatch(/tu dibujo/);
    expect(busEvents).not.toContain("hint:show");
    // keyboard activation goes through the same guard
    fireEvent.keyDown(next(), { key: "Enter" });
    expect(current()).toBe(23);
    off();
  });

  it("completing the page's required work enables Siguiente immediately", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    const required = requiredActivitiesForPage(23);
    for (const a of required.slice(0, -1)) complete(a.id);
    expect(next().getAttribute("aria-disabled")).toBe("true");
    complete(required[required.length - 1]!.id);
    expect(next().hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(next());
    expect(current()).toBe(24);
  });

  it("the previous page remains reachable even when the current page is incomplete", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);
    fireEvent.click(next());
    expect(current()).toBe(24);
    expect(next().getAttribute("aria-disabled")).toBe("true");
    expect((back() as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(back());
    expect(current()).toBe(23);
    // completion persisted: coming back does not re-lock the finished page
    expect(next().hasAttribute("aria-disabled")).toBe(false);
  });

  it("a reading-only page never blocks", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} initialPage={2} />);
    expect(current()).toBe(25);
    expect(next().hasAttribute("aria-disabled")).toBe(false);
  });

  it("the final page cannot finish the lesson before its requirement is met", () => {
    const onFinish = vi.fn();
    render(
      <NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} initialPage={3} onFinish={onFinish} />,
    );
    expect(current()).toBe(26);
    expect(next().textContent).toMatch(/Terminar lección/);
    fireEvent.click(next());
    expect(onFinish).not.toHaveBeenCalled();
    completePage(26);
    fireEvent.click(next());
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("events from another page's activity do not unlock this page", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(24);
    expect(next().getAttribute("aria-disabled")).toBe("true");
  });

  it("an already completed lesson is not re-gated", () => {
    markLessonCompleted(8);
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    expect(next().hasAttribute("aria-disabled")).toBe(false);
  });
});

describe("real workbook activities feed the gate through their own events", () => {
  it("page 24: circling every syllable word with the real component unlocks Siguiente", async () => {
    const { buildPageArray } = await import("@/utils/buildPageArray");
    const pages = buildPageArray(8);
    render(<NativeLessonViewer pages={pages} chapterLabel="Lección 8" lessonNumber={8} initialPage={1} />);
    expect(current()).toBe(24);
    expect(next().getAttribute("aria-disabled")).toBe("true");
    const { validSyllableStarts } = await import("@/cartilla/interactions/SyllableWordCircle");
    const sections = [...document.querySelectorAll<HTMLElement>(".native-syllable")];
    expect(sections).toHaveLength(5);
    for (const section of sections) {
      const syllable = section.querySelector("h2")?.textContent?.trim() ?? "";
      for (const button of [...section.querySelectorAll<HTMLButtonElement>("button")]) {
        const word = button.getAttribute("aria-label") ?? "";
        if (validSyllableStarts(word, syllable).length > 0) {
          act(() => {
            fireEvent.pointerDown(button);
            fireEvent.click(button, { detail: 0 });
          });
          act(() => {
            vi.advanceTimersByTime(6000);
          });
        }
      }
    }
    expect(next().hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(next());
    expect(current()).toBe(25);
  });
  it("Gretel's independent retry does not erase an already completed page activity", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="P" />);
    completePage(23);
    expect(next().getAttribute("data-locked")).toBeNull();
    const activity = requiredActivitiesForPage(23)[0]!;
    act(() => gretelEvent("activity:retry", {
      activityId: activity.id,
      reaction: "independent-retry",
    }));
    expect(next().getAttribute("data-locked")).toBeNull();
  });

  it("requires the new freehand writing controls and relocks after clearing work", () => {
    expect(requiredActivitiesForPage(47).filter((a) => a.kind === "writing-line")).toHaveLength(4);
    render(<NativeLessonViewer pages={PAGES} chapterLabel="P" />);
    completePage(23);
    expect(next().getAttribute("data-locked")).toBeNull();
    const activity = requiredActivitiesForPage(23)[0]!;
    act(() => gretelEvent("activity:retry", { activityId: activity.id, reason: "work-cleared" }));
    fireEvent.click(next());
    expect(current()).toBe(23);
    expect(next().getAttribute("data-locked")).toBe("true");
  });

});
