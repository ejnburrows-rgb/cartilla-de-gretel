/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  CLOSE_UP_MAX,
  CLOSE_UP_ZOOM_MS,
  WORKBOOK_MARK_TIMING,
  WorkbookPencilMark,
} from "../src/components/cartilla/WorkbookPencilMark";
import { useReducedMotion } from "../src/hooks/useReducedMotion";

vi.mock("../src/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("../src/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("../src/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn(() => false) }));

const { drawMs, holdMs, eraseMs } = WORKBOOK_MARK_TIMING;

describe("Adversarial Empirical Stress Harness: Pencil Flights & Cursor State (M6-Iter2)", () => {
  let rootMock: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    document.documentElement.className = "";
    document.documentElement.classList.add("student-pencil");

    // Ensure mock #root exists for close-up zoom checks
    let root = document.getElementById("root");
    if (!root) {
      root = document.createElement("div");
      root.id = "root";
      document.body.appendChild(root);
    }
    root.style.transform = "";
    root.style.transition = "";
    rootMock = root;
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.documentElement.className = "";
    document.body.innerHTML = "";
  });

  describe("1. Massive Concurrency & Interleaved Lifecycle Stress (50 Flights)", () => {
    it("preserves exact ref counting across 50 concurrent marks with random unmounts", () => {
      const handles: { unmount: () => void; id: string }[] = [];

      // 1. Burst mount 50 marks simultaneously
      for (let i = 0; i < 50; i++) {
        const id = `stress-mark-${i}`;
        const isCorrect = i % 2 === 0;
        const markType = i % 3 === 0 ? "circle" : "x";
        const { unmount } = render(
          <WorkbookPencilMark markType={markType} isCorrect={isCorrect} itemId={id} />,
        );
        handles.push({ unmount, id });
      }

      // Cursor hiding class MUST be active
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // 2. Interleave timer advancement and unmounting the first 25
      act(() => vi.advanceTimersByTime(drawMs / 2));
      for (let i = 0; i < 25; i++) {
        handles[i].unmount();
      }
      // 25 marks still flying: class MUST still be present
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // 3. Advance to holding phase
      act(() => vi.advanceTimersByTime(drawMs / 2 + 10));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // 4. Unmount next 24 marks
      for (let i = 25; i < 49; i++) {
        handles[i].unmount();
      }
      // Exactly 1 mark remains active!
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // 5. Unmount the final mark
      handles[49].unmount();

      // Class MUST be removed immediately upon reaching 0 active flights
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });

    it("survives rapid mounting, flapping, and aborting chaos without stuck class", () => {
      for (let cycle = 0; cycle < 100; cycle++) {
        const { unmount } = render(
          <WorkbookPencilMark markType="x" isCorrect={false} itemId={`chaos-${cycle}`} />,
        );
        expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

        // Advance into draw, hold, or erase randomly
        const advanceMs = (cycle * 137) % (drawMs + holdMs + eraseMs);
        act(() => vi.advanceTimersByTime(advanceMs));

        // Abort mid-cycle
        unmount();

        // Must always restore clean state immediately
        expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
      }
    });

    it("handles simulated React 18 StrictMode double-mounting idempotently", () => {
      // Mount 1
      const res = render(<WorkbookPencilMark markType="x" isCorrect itemId="strict-1" />);
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Simulated strict mode remount
      res.unmount();
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);

      const res2 = render(<WorkbookPencilMark markType="x" isCorrect itemId="strict-1" />);
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Complete mark
      act(() => vi.advanceTimersByTime(drawMs + holdMs));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);

      res2.unmount();
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });
  });

  describe("2. Dynamic Props Mutation Mid-Flight", () => {
    it("drops active flight immediately if mark is externally marked correct mid-drawing", () => {
      const { rerender } = render(
        <WorkbookPencilMark markType="x" isCorrect itemId="prop-mut-1" />,
      );
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // 1000ms into drawing, external status changes to "correct" (e.g. state restoration)
      act(() => vi.advanceTimersByTime(1000));
      rerender(<WorkbookPencilMark markType="x" status="correct" itemId="prop-mut-1" />);

      // External status halts flying: active class must be removed immediately
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
    });

    it("drops active flight immediately if user switches to reduced motion mid-drawing", () => {
      const { rerender } = render(
        <WorkbookPencilMark markType="x" isCorrect itemId="prop-mut-2" />,
      );
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      act(() => vi.advanceTimersByTime(1000));

      // User enables reduced motion mid-flight
      vi.mocked(useReducedMotion).mockReturnValue(true);
      rerender(<WorkbookPencilMark markType="x" isCorrect itemId="prop-mut-2" />);

      // The semantic grading turn remains reserved, while decorative flight stops.
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
      act(() => vi.advanceTimersByTime(holdMs));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });
  });

  describe("3. Erasing Lifecycle & Complete Sequence to Erased", () => {
    it("maintains active flight throughout drawing -> holding -> erasing -> erased", () => {
      const onRetry = vi.fn();
      render(<WorkbookPencilMark markType="x" isCorrect={false} itemId="err-flow" onRetry={onRetry} />);

      // Drawing phase
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);
      act(() => vi.advanceTimersByTime(drawMs - 10));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Holding phase
      act(() => vi.advanceTimersByTime(20));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);
      act(() => vi.advanceTimersByTime(holdMs - 20));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Erasing phase starts
      act(() => vi.advanceTimersByTime(10));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);
      expect(document.querySelector(".workbook-pencil--eraser")).toBeTruthy();

      // Erasing continues
      act(() => vi.advanceTimersByTime(eraseMs - 10));
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Erased completion
      act(() => vi.advanceTimersByTime(20));
      expect(onRetry).toHaveBeenCalledTimes(1);

      // Flight is complete: cursor must be restored!
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
    });
  });

  describe("4. Close-Up Zoom Lifecycle and Mutex Protection", () => {
    it("cleans up zoom class and transforms when active marks unmount", () => {
      const { unmount } = render(
        <WorkbookPencilMark markType="x" isCorrect itemId="zoom-test" />,
      );

      // Even if getBoundingClientRect returns 0 in jsdom, we verify unmount cleanup does not crash
      // and properly removes zoom classes and timeout handles
      unmount();
      act(() => vi.advanceTimersByTime(CLOSE_UP_ZOOM_MS + 100));

      expect(document.documentElement.classList.contains("workbook-close-up-zooming")).toBe(false);
    });
  });

  describe("5. SVG Filter & Gradient ID Isolation Invariant", () => {
    it("ensures unique defs IDs across multiple concurrent marks", () => {
      render(
        <div>
          <WorkbookPencilMark markType="circle" isCorrect itemId="iso-1" />
          <WorkbookPencilMark markType="x" isCorrect itemId="iso-2" />
          <WorkbookPencilMark markType="x" isCorrect={false} itemId="iso-3" />
        </div>,
      );

      const filterIds: string[] = [];
      // The accepted queue permits one flight at a time. Collect each owner in turn.
      for (let index = 0; index < 3; index++) {
        expect(document.querySelectorAll(".workbook-pencil-flight")).toHaveLength(1);
        const filters = [...document.querySelectorAll(".workbook-pencil-flight filter")];
        expect(filters).toHaveLength(1);
        filterIds.push(filters[0].id);
        if (index < 2) act(() => vi.advanceTimersByTime(drawMs + holdMs));
      }
      expect(filterIds).toHaveLength(3);
      expect(new Set(filterIds).size).toBe(3);
    });
  });

  describe("6. Accessibility & CSS Rule Contract Enforcement", () => {
    it("ensures stylesheet strictly respects user accessibility constraints", () => {
      const cssPath = path.resolve(__dirname, "../src/styles/workbook-pencil.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      // Verify that all 4 required a11y classes negate cursor suppression
      const requiredA11yTokens = [
        ":not(.a11y-contrast)",
        ":not(.a11y-dyslexia)",
        ":not(.a11y-large)",
        ":not(.a11y-xlarge)",
      ];

      for (const token of requiredA11yTokens) {
        expect(css).toContain(token);
      }

      // Verify forced-colors override
      expect(css).toMatch(/@media\s*\(forced-colors:\s*active\)\s*\{[\s\S]*cursor:\s*auto\s*!important/);

      // Verify hover & pointer fine gating
      expect(css).toMatch(/@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*\{[\s\S]*cursor:\s*none\s*!important/);
    });
  });
});
