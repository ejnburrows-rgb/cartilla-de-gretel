/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { buildPageArray } from "../buildPageArray";
import { CATALOG } from "@/lib/lesson-catalog";

afterEach(() => cleanup());

describe("all 24 lessons render without error (approval-walkthrough sweep)", () => {
  for (const entry of CATALOG) {
    it(
      `Lección ${entry.n} (${entry.title}) — every real page renders cleanly`,
      { timeout: 15_000 },
      () => {
        const pages = buildPageArray(entry.n);
        expect(pages.length).toBeGreaterThan(0);
        expect(pages.every((page) => !page.cover)).toBe(true);

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
