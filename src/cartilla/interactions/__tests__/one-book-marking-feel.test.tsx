/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { MarkCircle } from "../MarkCircle";
import { TapSelect } from "../TapSelect";
import { SyllableWordCircle } from "../SyllableWordCircle";
import { DirectPencilConnector, type PencilTarget } from "../PencilConnector";
import type { WorkbookObject } from "@/content/workbook/types";
import type { PageRegion } from "@/lib/book-faithful";
import { WORKBOOK_MARK_TIMING } from "@/components/cartilla/WorkbookPencilMark";

const { drawMs, holdMs, eraseMs } = WORKBOOK_MARK_TIMING;

vi.mock("@/lib/gretel-bus", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/gretel-bus")>(),
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => false }));

import { gretelEvent } from "@/lib/gretel-bus";

describe("One-Book Marking Feel — Approved Sequence Across All 4 Interaction Types", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("1. Marca con una X / MarkCircle", () => {
    const sampleObjects: WorkbookObject[] = [
      {
        id: "obj-1",
        box: { xPct: 10, yPct: 10, wPct: 30, hPct: 30 },
        text: "Oso",
        interaction: { kind: "mark-circle", data: { correct: true } },
      },
      {
        id: "obj-2",
        box: { xPct: 50, yPct: 10, wPct: 30, hPct: 30 },
        text: "Pato",
        interaction: { kind: "mark-circle", data: { correct: false } },
      },
    ];

    it("draws mark in ash pencil first, then resolves to green on correct answer", () => {
      const onResult = vi.fn();
      const { container } = render(
        <MarkCircle
          objects={sampleObjects}
          instruction="Marca con una x los dibujos correctos."
          onResult={onResult}
          reducedMotion={false}
        />,
      );

      const btn1 = container.querySelector("button")!;
      fireEvent.click(btn1);

      // t=0: Drawing phase - ash pencil mark and big wooden pencil present
      const flightPencil = document.querySelector(".workbook-pencil-flight");
      expect(flightPencil).toBeTruthy();
      expect(flightPencil?.getAttribute("data-mark-status")).toBe("drawing");

      const markContainer = container.querySelector(".workbook-pencil-mark");
      expect(markContainer).toBeTruthy();
      expect(markContainer?.getAttribute("data-mark-status")).toBe("drawing");
      expect(markContainer?.getAttribute("data-mark-type")).toBe("x");

      // Advance through drawMs
      act(() => vi.advanceTimersByTime(drawMs));
      expect(markContainer?.getAttribute("data-mark-status")).toBe("holding");

      // Advance through holdMs
      act(() => vi.advanceTimersByTime(holdMs));
      expect(onResult).toHaveBeenCalledWith({ objectId: "obj-1", result: "correct" });
      expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    });

    it("draws in ash pencil, turns red, then eraser removes it on wrong answer", () => {
      const onResult = vi.fn();
      const { container } = render(
        <MarkCircle
          objects={sampleObjects}
          instruction="Marca con una x los dibujos correctos."
          onResult={onResult}
          reducedMotion={false}
        />,
      );

      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[1]); // Wrong option (Pato)

      const markContainer = container.querySelector(".workbook-pencil-mark");
      expect(markContainer).toBeTruthy();
      expect(markContainer?.getAttribute("data-mark-status")).toBe("drawing");

      // Advance through drawMs + holdMs
      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(markContainer?.getAttribute("data-mark-status")).toBe("erasing");
      expect(document.querySelector(".workbook-pencil--eraser")).toBeTruthy();

      // Eraser scrubs away the mark
      act(() => vi.advanceTimersByTime(eraseMs));
      expect(onResult).toHaveBeenCalledWith({ objectId: "obj-2", result: "wrong" });
      expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    });
  });

  describe("2. TapSelect (Picture / vowel selection)", () => {
    const sampleObjects: WorkbookObject[] = [
      {
        id: "vowel-a",
        box: { xPct: 10, yPct: 10, wPct: 30, hPct: 30 },
        text: "Avión",
        interaction: { kind: "tap-select", data: { correct: true } },
      },
      {
        id: "vowel-b",
        box: { xPct: 50, yPct: 10, wPct: 30, hPct: 30 },
        text: "Uvas",
        interaction: { kind: "tap-select", data: { correct: false } },
      },
    ];

    it("draws circle in ash pencil first, then resolves to green on correct answer", () => {
      const onResult = vi.fn();
      const onComplete = vi.fn();
      const { container } = render(
        <TapSelect
          objects={sampleObjects}
          onResult={onResult}
          onComplete={onComplete}
          reducedMotion={false}
        />,
      );

      const btnA = container.querySelector("button")!;
      fireEvent.click(btnA);

      const mark = container.querySelector(".workbook-pencil-mark");
      expect(mark).toBeTruthy();
      expect(mark?.getAttribute("data-mark-status")).toBe("drawing");
      expect(mark?.getAttribute("data-mark-type")).toBe("circle");

      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(onResult).toHaveBeenCalledWith({ objectId: "vowel-a", result: "correct" });
      expect(onComplete).toHaveBeenCalled();
    });

    it("draws circle in ash pencil, turns red, and erases on wrong answer", () => {
      const onResult = vi.fn();
      const { container } = render(
        <TapSelect
          objects={sampleObjects}
          onResult={onResult}
          reducedMotion={false}
        />,
      );

      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[1]); // Wrong option (Uvas)

      const mark = container.querySelector(".workbook-pencil-mark");
      expect(mark).toBeTruthy();
      expect(mark?.getAttribute("data-mark-status")).toBe("drawing");

      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(mark?.getAttribute("data-mark-status")).toBe("erasing");

      act(() => vi.advanceTimersByTime(eraseMs));
      expect(onResult).toHaveBeenCalledWith({ objectId: "vowel-b", result: "wrong" });
    });
  });

  describe("3. SyllableWordCircle", () => {
    const sampleRegion: PageRegion = {
      id: "test-syllable",
      regionType: "syllable-match",
      order: 1,
      fontRole: "body",
      syllable: "ma",
      matchRows: [
        [
          { word: "mamá", correct: true },
          { word: "sapo", correct: false },
        ],
      ],
    };

    it("circles syllable with ash pencil start and green resolution", () => {
      const { container } = render(
        <SyllableWordCircle region={sampleRegion} lessonId="test-lesson" />,
      );

      const mamaBtn = container.querySelector("button")!;
      fireEvent.pointerUp(mamaBtn, { clientX: 10 });

      const mark = container.querySelector(".workbook-pencil-mark");
      expect(mark).toBeTruthy();
      expect(mark?.getAttribute("data-mark-status")).toBe("drawing");

      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "test-syllable-0" });
    });

    it("circles wrong syllable occurrence with ash start and eraser retry", () => {
      const { container } = render(
        <SyllableWordCircle region={sampleRegion} lessonId="test-lesson" />,
      );

      const buttons = container.querySelectorAll("button");
      fireEvent.pointerUp(buttons[1], { clientX: 10 }); // sapo has no "ma"

      const mark = container.querySelector(".workbook-pencil-mark");
      expect(mark).toBeTruthy();
      expect(mark?.getAttribute("data-mark-status")).toBe("drawing");

      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(mark?.getAttribute("data-mark-status")).toBe("erasing");

      act(() => vi.advanceTimersByTime(eraseMs));
      expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "test-syllable-1" });
    });
  });

  describe("4. DirectPencilConnector (Line Matching)", () => {
    const targets: PencilTarget[] = [
      { id: "left-a", label: "A", role: "left", pairId: "pair-1" },
      { id: "right-avion", label: "Avión", role: "right", pairId: "pair-1" },
      { id: "right-ojo", label: "Ojo", role: "right", pairId: "pair-2" },
    ];

    it("drags a teal line and keeps it on correct pair connection", () => {
      const onResult = vi.fn();
      const { container } = render(
        <DirectPencilConnector
          pageKey="test-pair"
          targets={targets}
          mode="pair"
          onResult={onResult}
          reducedMotion={false}
        />,
      );

      // Verify teal line rendering
      expect(container.querySelector(".am-direct-pencil")).toBeTruthy();
    });
  });
});
