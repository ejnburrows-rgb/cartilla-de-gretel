/**
 * @vitest-environment jsdom
 */
// Full 24-lesson render sweep — the automated stand-in for "click through
// every lesson before EJN's approval walkthrough" in an environment where a
// real browser can't be driven. Renders every real page of every real lesson
// exactly the way the student workbook does (interactive) and fails loudly
// on anything that would embarrass the walkthrough: a thrown render error, a
// console.error, or a page silently falling back to "en preparación" when
// every lesson is supposed to be fully authored.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { buildPageArray } from "../buildPageArray";
import { CATALOG } from "@/lib/lesson-catalog";

afterEach(() => cleanup());

describe("all 24 lessons render without error (approval-walkthrough sweep)", () => {
  for (const entry of CATALOG) {
    // L2 (and dense vowel pages) can exceed the default 5s under parallel load.
    it(
      `Lección ${entry.n} (${entry.title}) — every real page renders cleanly`,
      { timeout: 15_000 },
      () => {
        const pages = buildPageArray(entry.n);
        expect(pages.length).toBeGreaterThan(0);

        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
          for (const page of pages) {
            let container: HTMLElement;
            expect(() => {
              ({ container } = render(page.content));
            }).not.toThrow();
            const text = container!.textContent ?? "";
            expect(text).not.toContain("Página en preparación");
          }
        } finally {
          expect(consoleError).not.toHaveBeenCalled();
          consoleError.mockRestore();
        }
      },
    );
  }
});
