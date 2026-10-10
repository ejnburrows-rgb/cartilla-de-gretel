import { expect, test, type Page } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };

const PAGES = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
const PAGE_KEY = "cartilla.page-completion.v1";

/** Marks only the named real (non-blocked) pages as already completed. */
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

/** A SOURCE_BLOCKED page shows only the notice: no invented work, nothing to complete. */
async function expectSourceBlocked(viewer: ReturnType<Page["locator"]>, pageNumber: number) {
  await expect(viewer).toHaveAttribute("data-native-page", String(pageNumber));
  await expect(viewer.locator("[data-source-blocked='true']").first()).toContainText(
    "Esta página falta en el escaneo del libro",
  );
  await expect(viewer.locator("[data-gretel-activity]")).toHaveCount(0);
  await expect(viewer.locator("[class*='fp-region']")).toHaveCount(0);
  await expect(viewer.locator("input, textarea, canvas")).toHaveCount(0);
  await expect(viewer).toHaveAttribute("data-page-complete", "true");
}

test.describe("Workbook source order & 86–87 SOURCE_BLOCKED guard", () => {
  test("lessons 1 and 8 open on their authoritative first printed page", async ({ page }) => {
    for (const [lesson, first] of [
      [1, 1],
      [8, 23],
    ] as const) {
      const viewer = await openLesson(page, lesson);
      await expect(viewer).toHaveAttribute("data-native-page", String(first));
    }
  });

  test("page 86 has no invented exercise and never blocks finishing lesson 23", async ({
    page,
  }, testInfo) => {
    const viewer = await openLesson(page, 23, [83, 84, 85]);
    const next = viewer.getByTestId("button-next");
    for (const expected of [83, 84, 85]) {
      await expect(viewer).toHaveAttribute("data-native-page", String(expected));
      await next.click();
    }
    await expectSourceBlocked(viewer, 86);
    await expect(next).toHaveText(/Terminar lección/);
    await expect(next).not.toHaveAttribute("data-locked", "true");
    await page.screenshot({
      path: testInfo.outputPath("page-86-source-blocked.png"),
      fullPage: true,
    });
  });

  test("a fresh learner advances from page 87 to page 88 without completing anything", async ({
    page,
  }, testInfo) => {
    const viewer = await openLesson(page, 24);
    await expectSourceBlocked(viewer, 87);
    await page.screenshot({
      path: testInfo.outputPath("page-87-source-blocked.png"),
      fullPage: true,
    });
    await viewer.getByTestId("button-next").click();
    await expect(viewer).toHaveAttribute("data-native-page", "88");
    await expect(viewer.locator("[data-gretel-activity]").first()).toBeVisible();
  });
});
