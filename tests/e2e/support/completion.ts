import type { Page } from "@playwright/test";
import layouts from "../../../src/data/page-layouts.json" with { type: "json" };

const PAGES = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
export const PAGE_COMPLETION_KEY = "cartilla.page-completion.v1";

/** Completion record for printed pages, in the same shape the app stores. */
export function completionFor(pages: number[]): Record<string, string[]> {
  return Object.fromEntries(
    pages.map((page) => [
      String(page),
      (PAGES[String(page)]?.regions ?? []).map((r) => `page-${page}-${r.id}`),
    ]),
  );
}

/**
 * Marks earlier pages as already finished before the app loads, so a test can
 * walk past the completion gate ("Siguiente" stays locked until a page is done)
 * without the test having to solve every activity on the way.
 */
export async function seedCompletedPages(page: Page, pages: number[]) {
  await page.addInitScript(
    ([key, map]) => {
      const current = JSON.parse(localStorage.getItem(key as string) || "{}");
      localStorage.setItem(key as string, JSON.stringify({ ...(map as object), ...current }));
    },
    [PAGE_COMPLETION_KEY, completionFor(pages)] as const,
  );
}
