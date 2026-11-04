import { expect, test, type Page } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };

const PAGES = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
const PAGE_KEY = "cartilla.page-completion.v1";

/** Marks only the named original, available printed pages as completed. */
function completionFor(pages: number[]): Record<string, string[]> {
  return Object.fromEntries(
    pages.map((page) => [
      String(page),
      PAGES[String(page)]!.regions.map((r) => `page-${page}-${r.id}`),
    ]),
  );
}

async function openLesson(page: Page, lesson: number, completed: number[] = []) {
  await page.addInitScript(
    ([key, map]) => localStorage.setItem(key as string, JSON.stringify(map)),
    [PAGE_KEY, completionFor(completed)] as const,
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
  return page.locator(".native-lesson-viewer");
}

test.describe("Workbook source order — missing printed scans skipped", () => {
  test("lessons 1 and 8 open on their original first printed page", async ({ page }) => {
    for (const [lesson, first] of [[1, 1], [8, 23]] as const) {
      const viewer = await openLesson(page, lesson);
      await expect(viewer).toHaveAttribute("data-native-page", String(first));
    }
  });

  test("lesson 23 finishes on authentic printed page 85, not a page 86 placeholder", async ({ page }) => {
    const viewer = await openLesson(page, 23, [83, 84, 85]);
    const next = viewer.getByTestId("button-next");
    for (const expected of [83, 84, 85]) {
      await expect(viewer).toHaveAttribute("data-native-page", String(expected));
      await expect(viewer.locator("[data-source-blocked='true']")).toHaveCount(0);
      if (expected !== 85) await next.click();
    }
    await expect(next).toHaveText(/Terminar lección/);
    await expect(next).not.toHaveAttribute("data-locked", "true");
  });

  test("lesson 24 starts on authentic printed page 88, not a page 87 placeholder", async ({ page }) => {
    const viewer = await openLesson(page, 24);
    await expect(viewer).toHaveAttribute("data-native-page", "88");
    await expect(viewer.locator("[data-source-blocked='true']")).toHaveCount(0);
    await expect(viewer.locator("[data-gretel-activity]").first()).toBeVisible();
  });
});
