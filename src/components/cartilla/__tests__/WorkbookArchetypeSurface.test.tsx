/**
 * Tests for the canonical clean digital Workbook surface across page families (WORKBOOK_ARCHETYPE_STANDARD.md).
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FaithfulPageRenderer } from "../FaithfulPageRenderer";
import { FlipchartNativeBoard } from "../FlipchartNativeBoard";
import flipchart from "@/data/teacher-flipchart.json";
import { archetypeMappingForPage, WorkbookArchetype } from "@/data/workbook-archetypes";

vi.mock("@/lib/gretel-bus", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gretel-bus")>()),
  gretelEvent: vi.fn(),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/gretel-speak", () => ({
  speakGretel: vi.fn(() => Promise.resolve()),
  cancelGretelSpeech: vi.fn(),
}));

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe("Workbook Clean Surface & Archetype Wiring", () => {
  it("applies canonical archetype CSS classes to FaithfulPageRenderer for representative pages", () => {
    // Page 1 -> Archetype 1
    const { container: c1 } = render(<FaithfulPageRenderer pageNumber={1} lessonNumber={1} />);
    expect(c1.querySelector(".faithful-page--archetype-1")).toBeTruthy();

    // Page 2 -> Archetype 2
    cleanup();
    const { container: c2 } = render(<FaithfulPageRenderer pageNumber={2} lessonNumber={1} />);
    expect(c2.querySelector(".faithful-page--archetype-2")).toBeTruthy();

    // Page 3 -> Archetype 3
    cleanup();
    const { container: c3 } = render(<FaithfulPageRenderer pageNumber={3} lessonNumber={1} />);
    expect(c3.querySelector(".faithful-page--archetype-3")).toBeTruthy();

    // Page 5 -> Archetype 4
    cleanup();
    const { container: c5 } = render(<FaithfulPageRenderer pageNumber={5} lessonNumber={2} />);
    expect(c5.querySelector(".faithful-page--archetype-4")).toBeTruthy();

    // Page 6 -> Archetype 5
    cleanup();
    const { container: c6 } = render(<FaithfulPageRenderer pageNumber={6} lessonNumber={2} />);
    expect(c6.querySelector(".faithful-page--archetype-5")).toBeTruthy();

    // Page 20 -> Archetype 6
    cleanup();
    const { container: c20 } = render(<FaithfulPageRenderer pageNumber={20} lessonNumber={7} />);
    expect(c20.querySelector(".faithful-page--archetype-6")).toBeTruthy();

    // Page 21 -> Archetype 7
    cleanup();
    const { container: c21 } = render(<FaithfulPageRenderer pageNumber={21} lessonNumber={7} />);
    expect(c21.querySelector(".faithful-page--archetype-7")).toBeTruthy();

    // Page 22 -> Archetype 8
    cleanup();
    const { container: c22 } = render(<FaithfulPageRenderer pageNumber={22} lessonNumber={7} />);
    expect(c22.querySelector(".faithful-page--archetype-8")).toBeTruthy();
  });

  it("strictly preserves pages 86 and 87 as SOURCE_BLOCKED with empty archetypes", () => {
    const map86 = archetypeMappingForPage(86);
    const map87 = archetypeMappingForPage(87);

    expect(map86.sourceStatus).toBe("SOURCE_BLOCKED");
    expect(map86.archetypes).toHaveLength(0);

    expect(map87.sourceStatus).toBe("SOURCE_BLOCKED");
    expect(map87.archetypes).toHaveLength(0);

    const { container: c86 } = render(<FaithfulPageRenderer pageNumber={86} lessonNumber={23} />);
    expect(c86.querySelector("[data-source-blocked='true']")).toBeTruthy();
  });

  it("Flip Chart and Workbook use clean surfaces while retaining instructional foreground", () => {
    // Flip Chart board page 3
    const fcPage = flipchart.pages.find((p) => p.flipchartPage === 3)!;
    const { container: fcContainer } = render(<FlipchartNativeBoard page={fcPage} />);
    const fcBg = fcContainer.querySelector(".final-page-background");
    expect(fcBg).toBeNull();
    expect(fcContainer.querySelectorAll(".fc-native-board__page img").length).toBeGreaterThan(0);

    // Workbook page 1 uses clean digital paper frame
    cleanup();
    const { container: wbContainer } = render(<FaithfulPageRenderer pageNumber={1} lessonNumber={1} />);
    const wbPage = wbContainer.querySelector(".faithful-page");
    expect(wbPage).toBeTruthy();
  });

  it("renders all 8 representative archetypes without layout regression or throwing errors", () => {
    const representativePages = [
      { page: 1, archetype: WorkbookArchetype.PICTURE_GRID_CIRCLE_X },
      { page: 2, archetype: WorkbookArchetype.VOWEL_LETTER_ROW_CHOICES },
      { page: 3, archetype: WorkbookArchetype.MULTI_PAIR_MATCHING },
      { page: 5, archetype: WorkbookArchetype.SINGLE_TARGET_SURROUNDING_PICTURES },
      { page: 6, archetype: WorkbookArchetype.HANDWRITING_TRACING_OPEN_DRAWING },
      { page: 20, archetype: WorkbookArchetype.SYLLABLE_RECOGNITION_CIRCLE },
      { page: 21, archetype: WorkbookArchetype.PHONICS_READING_PRACTICE },
      { page: 22, archetype: WorkbookArchetype.COMPLETE_WORD_SENTENCE_WRITING },
    ];

    for (const { page, archetype } of representativePages) {
      cleanup();
      const mapping = archetypeMappingForPage(page);
      expect(mapping.archetypes).toContain(archetype);

      const { container } = render(
        <FaithfulPageRenderer pageNumber={page} lessonNumber={mapping.lessonNumber} interactive />,
      );
      expect(container.querySelector(`.faithful-page--archetype-${archetype}`)).toBeTruthy();
      expect(container.querySelector(".faithful-page__sidebar")).toBeTruthy();
      expect(container.querySelector(".faithful-page__pagenum")).toBeTruthy();
    }
  });
});
