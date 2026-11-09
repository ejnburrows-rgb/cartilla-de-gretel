/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  WORKBOOK_MARK_TIMING,
  WorkbookPencilMark,
} from "../src/components/cartilla/WorkbookPencilMark";
import { useReducedMotion } from "../src/hooks/useReducedMotion";

vi.mock("../src/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("../src/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("../src/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn(() => false) }));

const { drawMs, holdMs, eraseMs, approachMs } = WORKBOOK_MARK_TIMING;

describe("Adversarial Empirical Challenge: Workbook Pencil Mark P0", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.documentElement.className = "";
  });

  describe("1. Single Animated Pencil Element Invariant", () => {
    it("renders strictly 1 animated pencil during drawing of an X mark", () => {
      render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-x-1" />);
      const pencils = document.querySelectorAll(".workbook-pencil-flight .workbook-pencil");
      expect(pencils).toHaveLength(1);

      // Verify shape components inside the single pencil
      const pencilShape = pencils[0].querySelector(".workbook-pencil__shape");
      expect(pencilShape).toBeTruthy();

      // Ensure no second pencil exists in the flight portal
      expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(1);
    });

    it("renders strictly 1 animated pencil during wrong answer before transition to eraser", () => {
      render(<WorkbookPencilMark markType="x" isCorrect={false} itemId="adv-x-wrong" />);
      // While drawing: exactly 1 pencil
      expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil")).toHaveLength(1);
      expect(document.querySelector(".workbook-pencil--eraser")).toBeNull();

      // Advance through draw and hold
      act(() => vi.advanceTimersByTime(drawMs + holdMs));

      // Now in erasing state: pencil is gone, eraser is present
      expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil")).toHaveLength(1);
      expect(document.querySelector(".workbook-pencil--eraser")).toBeTruthy();
    });

    it("renders strictly 0 animated pencils for pre-restored marks", () => {
      // Status pre-restored as correct
      const { unmount: u1 } = render(
        <WorkbookPencilMark markType="x" status="correct" itemId="adv-restored-correct" />,
      );
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
      expect(document.querySelectorAll(".workbook-pencil")).toHaveLength(0);
      u1();

      // Status pre-restored as wrong
      const { unmount: u2 } = render(
        <WorkbookPencilMark markType="x" status="wrong" itemId="adv-restored-wrong" />,
      );
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
      expect(document.querySelectorAll(".workbook-pencil")).toHaveLength(0);
      u2();
    });

    it("renders strictly 0 animated pencils when reduced motion is preferred", () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-reduced" />);
      expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
      expect(document.querySelectorAll(".workbook-pencil")).toHaveLength(0);
    });
  });

  describe("2. Connected X strokes on one physical pencil", () => {
    it("keeps both ink strokes separate and connects them with one lifted hop", () => {
      const { container } = render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-geom-1" />);
      const motions = [...document.querySelectorAll(".workbook-pencil-flight .workbook-pencil animateMotion")];
      expect(motions).toHaveLength(3);
      const ink = [...container.querySelectorAll(".workbook-pencil-mark__stroke")];
      expect(ink).toHaveLength(2);
      expect(motions[0].getAttribute("path")).toBe(ink[0].getAttribute("d"));
      expect(motions[1].getAttribute("path")).toBe(ink[1].getAttribute("d"));
      for (const motion of motions) {
        expect(motion.getAttribute("path")).toMatch(/^M /);
        expect(motion.getAttribute("path")?.match(/M /g)).toHaveLength(1);
      }
      expect(motions[2].getAttribute("path")).toContain(" Q ");
      expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(1);
    });

    it("keeps spline timing and path progress monotone across strokes and hop", () => {
      render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-motion-timing" />);
      const motions = [...document.querySelectorAll(".workbook-pencil-flight .workbook-pencil animateMotion")];
      expect(motions).toHaveLength(3);
      for (const motion of motions) {
        expect(motion.getAttribute("calcMode")).toBe("spline");
        const times = motion.getAttribute("keyTimes")!.split(";").map(Number);
        const points = motion.getAttribute("keyPoints")!.split(";").map(Number);
        expect(times.length).toBe(points.length);
        expect(times[0]).toBe(0); expect(times.at(-1)).toBe(1);
        expect(points[0]).toBe(0); expect(points.at(-1)).toBe(1);
        for (let i=1;i<times.length;i++) {
          expect(times[i]).toBeGreaterThan(times[i-1]);
          expect(points[i]).toBeGreaterThanOrEqual(points[i-1]);
        }
        expect(motion.getAttribute("keySplines")!.split(";")).toHaveLength(times.length-1);
      }
      const first = motions[0];
      const firstDuration = Number(first.getAttribute("dur")!.replace("ms", ""));
      expect(Number(first.getAttribute("keyTimes")!.split(";")[1]) * firstDuration).toBeCloseTo(approachMs, 2);
      expect(Number(motions[2].getAttribute("begin")!.replace("ms", ""))).toBeLessThan(Number(motions[1].getAttribute("begin")!.replace("ms", "")));
    });
  });

  describe("3. Active Flight Counter & html.workbook-pencil-active Class Lifecycle", () => {
    it("adds class on start, holds during flight, and removes immediately on flight end", () => {
      document.documentElement.classList.add("student-pencil");
      render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-class-life" />);

      // Active during drawing
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Advance through drawMs
      act(() => vi.advanceTimersByTime(drawMs));
      // Still in holding/flight transition
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Advance through holdMs
      act(() => vi.advanceTimersByTime(holdMs));
      // Now flight is completely over (status is "correct")
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });

    it("handles multiple concurrent marks with reference-counted flight counter", () => {
      document.documentElement.classList.add("student-pencil");

      // Mount Mark 1
      const { unmount: u1 } = render(<WorkbookPencilMark markType="x" isCorrect itemId="m1" />);
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Mount Mark 2 while Mark 1 is still active
      const { unmount: u2 } = render(<WorkbookPencilMark markType="x" isCorrect itemId="m2" />);
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Unmount Mark 1 prematurely
      u1();
      // Class MUST remain active because Mark 2 is still flying!
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Unmount Mark 2
      u2();
      // Class must now be removed because active count reached 0
      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });

    it("restores cursor immediately if component unmounts mid-flight", () => {
      document.documentElement.classList.add("student-pencil");
      const { unmount } = render(<WorkbookPencilMark markType="x" isCorrect itemId="adv-abort" />);

      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);

      // Abort mid-flight (e.g. user navigated away or page turned)
      unmount();

      expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    });
  });

  describe("4. CSS Rule Specificity & Accessibility Invariants", () => {
    it("ensures workbook-pencil.css contains required accessibility selectors", () => {
      const cssPath = path.resolve(__dirname, "../src/styles/workbook-pencil.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      // Forced colors must override cursor hiding
      expect(css).toContain("@media (forced-colors: active)");
      expect(css).toContain("cursor: auto !important;");

      // Pointer fine condition
      expect(css).toContain("@media (hover: hover) and (pointer: fine)");
      expect(css).toContain("cursor: none !important;");

      // Accessibility classes must not have cursor suppressed
      expect(css).toContain(":not(.a11y-contrast)");
      expect(css).toContain(":not(.a11y-dyslexia)");
      expect(css).toContain(":not(.a11y-large)");
      expect(css).toContain(":not(.a11y-xlarge)");
    });
  });
});
