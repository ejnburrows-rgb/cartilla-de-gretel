/**
 * @vitest-environment jsdom
 *
 * Regression: all 24 lessons have exercise packs, faithful page layouts with
 * interactive region types, and catalog page ranges that render without crash.
 * Progress path for interactive exercises is exercised via recordEvent mock.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { LESSONS, TOTAL_PAGES } from "@/content/lesson-meta";
import { hasPageLayout, getPageLayout } from "@/lib/book-faithful";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { allLessonExercises } from "@/data/lesson-exercises";
import { exerciseForPage } from "@/content/exercise-seed";
import { InteractiveReadingSentences } from "../InteractivePageExercises";
import type { PageRegion } from "@/lib/book-faithful";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";

const INTERACTIVE_TYPES = new Set([
  "picture-grid",
  "vowel-pick-one",
  "vowel-match-all",
  "vowel-line-match",
  "syllable-match",
  "fill-in-blank",
  "writing-line",
  "draw-box",
  "reading-sentences",
]);

describe("24-lesson activities inventory (regression)", () => {
  it("catalog and lesson-meta cover 24 lessons / 90 pages", () => {
    expect(TOTAL_LESSONS).toBe(24);
    expect(CATALOG).toHaveLength(24);
    expect(LESSONS).toHaveLength(24);
    expect(TOTAL_PAGES).toBe(90);
  });

  it("every lesson has at least one lesson-exercise pack entry", () => {
    for (let n = 1; n <= 24; n++) {
      const pack = allLessonExercises.filter((e) => e.lessonNumber === n);
      expect(pack.length, `lesson ${n} exercise pack empty`).toBeGreaterThan(0);
      for (const ex of pack) {
        expect(ex).toHaveProperty("kind");
        expect(ex).toHaveProperty("studentFacingStatus");
        expect(ex).toHaveProperty("prompt");
      }
    }
  });

  it("every catalog page has a faithful layout", () => {
    for (const entry of CATALOG) {
      const pages = getLessonPageNumbers(entry.pages);
      expect(pages.length, `L${entry.n} page range`).toBeGreaterThan(0);
      for (const p of pages) {
        expect(hasPageLayout(p), `missing layout page ${p} (L${entry.n})`).toBe(true);
        const layout = getPageLayout(p);
        expect(layout, `null layout page ${p}`).toBeTruthy();
        expect(layout!.length).toBeGreaterThan(0);
      }
    }
  });

  it("every lesson has at least one interactive region type in layouts", () => {
    for (const entry of CATALOG) {
      const pages = getLessonPageNumbers(entry.pages);
      let interactive = 0;
      const kinds = new Set<string>();
      for (const p of pages) {
        const layout = getPageLayout(p) ?? [];
        for (const r of layout) {
          if (INTERACTIVE_TYPES.has(r.regionType)) {
            interactive += 1;
            kinds.add(r.regionType);
          }
        }
      }
      expect(interactive, `L${entry.n} has no interactive regions`).toBeGreaterThan(0);
      // exercise seed also resolves for every page in range
      for (const p of pages) {
        expect(exerciseForPage(p), `exercise seed page ${p}`).toBeTruthy();
      }
    }
  });

  it("graded interactive regions carry correct flags (no silent ungraded traps)", () => {
    const gradedTypes = [
      "picture-grid",
      "vowel-pick-one",
      "vowel-match-all",
      "vowel-line-match",
      "syllable-match",
      "fill-in-blank",
    ];
    for (const entry of CATALOG) {
      for (const p of getLessonPageNumbers(entry.pages)) {
        for (const r of getPageLayout(p) ?? []) {
          if (!gradedTypes.includes(r.regionType)) continue;
          const blob = JSON.stringify(r);
          expect(blob.includes('"correct"'), `L${entry.n} p${p} ${r.id} missing correct`).toBe(
            true,
          );
        }
      }
    }
  });

  it("lists incomplete lessons only when studentFacingStatus is not ready", () => {
    const incomplete: number[] = [];
    for (let n = 1; n <= 24; n++) {
      const pack = allLessonExercises.filter((e) => e.lessonNumber === n);
      const notReady = pack.some((e) => e.studentFacingStatus !== "ready");
      if (notReady) incomplete.push(n);
    }
    // Source-uncertain packs kept pending on purpose
    expect(incomplete).toEqual([17, 19, 20, 21, 22, 23, 24]);
  });
});

describe("InteractiveReadingSentences progress path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("records exercise progress when every book sentence is tapped", () => {
    const region: PageRegion = {
      id: "p21-read",
      regionType: "reading-sentences",
      order: 0,
      fontRole: "body",
      sentences: ["Mi mamá me mima.", "Mamá ama a Memo."],
    };
    const { getAllByRole, getByRole } = render(
      <InteractiveReadingSentences region={region} accent="#E63946" lessonId="7" />,
    );
    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(recordEvent).not.toHaveBeenCalled();
    fireEvent.click(buttons[1]);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(gretelEvent).toHaveBeenCalledWith("activity:complete");
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "7",
        kind: "exercise",
        score: 2,
        total: 2,
        meta: expect.objectContaining({
          exercise: "reading_sentences_p21-read",
          completed: true,
        }),
      }),
    );
    expect(getByRole("status").textContent).toMatch(/Lectura marcada/);
  });
});
