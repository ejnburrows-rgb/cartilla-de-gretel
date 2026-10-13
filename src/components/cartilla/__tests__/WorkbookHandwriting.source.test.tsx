/**
 * Source-scoped template lookup must reach BOTH Workbook writing lines.
 * Use the real renderer, trace component and freehand host; only browser
 * canvas/audio capabilities are stubbed. No activity/retry behavior changes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FaithfulPageRenderer } from "../FaithfulPageRenderer";
import { WorkbookLetterTrace } from "../WorkbookLetterTrace";
import { DragLetterTrace } from "../DragLetterTrace";
import type { PageRegion } from "@/lib/book-faithful";

vi.mock("@/lib/gretel-bus", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gretel-bus")>()),
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => true }));

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,mock");
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function writingPair(modelText: string): PageRegion[] {
  return [
    { id: "source-model", regionType: "writing-line", order: 0, fontRole: "body", modelText },
    { id: "source-repeat", regionType: "writing-line", order: 1, fontRole: "body" },
  ];
}

const FREEHAND_MODELS = [
  "Z",
  "z",
  "Ñ",
  "ñ",
  "rr",
  "o",
  "v",
  "u",
  "a",
  "e",
  "i",
  "m",
  "p",
  "t",
  "d",
  "l",
  "n",
  "b",
  "r",
  "g",
  "f",
  "j",
  "y",
];
const GUIDED_MODELS = [
  "O",
  "A",
  "M",
  "N",
  "T",
  "V",
  "G",
  "Y",
  "J",
  "s",
  "c",
  "E",
  "I",
  "U",
  "P",
  "S",
  "L",
  "D",
  "R",
  "C",
  "B",
  "F",
];

describe("Workbook handwriting source gating reaches the existing renderer", () => {
  it.each(FREEHAND_MODELS)(
    "%s and its inherited practice line use real freehand canvases",
    (letter) => {
      const { container } = render(
        <FaithfulPageRenderer pageNumber={999} regions={writingPair(letter)} interactive native />,
      );
      expect(container.querySelectorAll(".fp-writing-line--freehand")).toHaveLength(2);
      expect(screen.getAllByLabelText("Área para escribir")).toHaveLength(2);
      expect(screen.getAllByText(letter, { selector: ".fp-writing-line__model" })).toHaveLength(2);
      expect(container.querySelector(".fp-trace")).toBeNull();
      expect(screen.queryByRole("listbox")).toBeNull();
    },
  );

  it.each(GUIDED_MODELS)("%s and its inherited practice line remain guided", (letter) => {
    const { container } = render(
      <FaithfulPageRenderer pageNumber={999} regions={writingPair(letter)} interactive native />,
    );
    expect(container.querySelectorAll(".fp-writing-line--trace")).toHaveLength(2);
    expect(container.querySelectorAll(".fp-trace__svg")).toHaveLength(2);
    expect(screen.queryByLabelText("Área para escribir")).toBeNull();
  });

  it.each(["Z", "z", "o", "v", "u", "Ñ", "rr", "RR"])(
    "direct WorkbookLetterTrace cannot bypass source gating for %s",
    (letter) => {
      const { container } = render(<WorkbookLetterTrace modelText={letter} />);
      expect(container.firstChild).toBeNull();
    },
  );

  it("keeps game-only Z tracing available with its unchanged path", () => {
    const { container } = render(<DragLetterTrace letter="Z" />);
    const guide = container.querySelector('svg path[stroke-dasharray="1,12"]');
    expect(guide?.getAttribute("d")).toBe(
      "M 25 20 L 50 20 L 75 20 L 50 60 L 25 100 L 50 100 L 75 100",
    );
  });

  it("noninteractive Workbook references retain printed models and static writing lines", () => {
    const { container } = render(
      <FaithfulPageRenderer pageNumber={999} regions={writingPair("Z")} native />,
    );
    expect(screen.getByText("Z", { selector: ".fp-writing-line__model" })).toBeTruthy();
    expect(container.querySelectorAll(".fp-writing-line__rule")).toHaveLength(2);
    expect(container.querySelector(".fp-trace")).toBeNull();
    expect(screen.queryByLabelText("Área para escribir")).toBeNull();
  });

  it("supports the same audited O template in mouse tap and touch drag modes", () => {
    for (const mode of ["tap", "drag"]) {
      vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
          matches: mode === "tap" ? query === "(pointer: fine)" : query === "(pointer: coarse)",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      );
      const { container, unmount } = render(<WorkbookLetterTrace modelText="O" />);
      expect(container.querySelector(".fp-trace")?.getAttribute("data-mode")).toBe(mode);
      expect(container.querySelector('path[stroke-dasharray="1,11"]')?.getAttribute("d")).toBe(
        "M 72 27 L 50 20 L 25 25 L 20 60 L 25 95 L 50 100 L 75 95 L 80 60 L 72 27",
      );
      unmount();
    }
  });
});
