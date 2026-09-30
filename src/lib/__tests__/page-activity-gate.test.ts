/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  pageRequiresActivity,
  markPageActivityDone,
  isPageActivityDone,
  readDonePageNumbers,
} from "../page-activity-gate";

beforeEach(() => { window.localStorage.clear(); });

describe("page-activity-gate", () => {
  it("gates pages with a gradable interactive exercise (book page 1 has picture-grid)", () => {
    expect(pageRequiresActivity(1)).toBe(true);
  });

  it("gates page 86 now that its book Completa fill exercise is restored", () => {
    // p86 (Lección 23) has a gradable fill-in-blank activity, verified against
    // the book, so Siguiente must wait for it like any other exercise page.
    expect(pageRequiresActivity(86)).toBe(true);
  });

  it("gates the draw page too (p87 Lección 24: tracing + DibujaHost draw activity)", () => {
    // The draw box reports completion through the same activity signal, so
    // the page gates without deadlocking.
    expect(pageRequiresActivity(87)).toBe(true);
  });

  it("does not gate pages without a verified layout (no activity to finish)", () => {
    expect(pageRequiresActivity(91)).toBe(false);
    expect(pageRequiresActivity(92)).toBe(false);
  });

  it("does not gate unknown pages (no verified layout)", () => {
    expect(pageRequiresActivity(9999)).toBe(false);
  });

  it("persists per-lesson page completion in localStorage", () => {
    expect(isPageActivityDone(7, 101)).toBe(false);
    markPageActivityDone(7, 101);
    expect(isPageActivityDone(7, 101)).toBe(true);
    expect(isPageActivityDone(8, 101)).toBe(false); // other lessons unaffected
    expect(readDonePageNumbers(7).has(101)).toBe(true);
  });
});
