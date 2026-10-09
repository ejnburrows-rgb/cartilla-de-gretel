import { expect, test } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };

function allFinishedPages() {
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  const completionMap: Record<string, string[]> = {};
  for (let page = 1; page <= 90; page++) {
    const pageObj = data[String(page)];
    if (pageObj?.regions) {
      completionMap[String(page)] = pageObj.regions.map((r) => `page-${page}-${r.id}`);
    } else {
      completionMap[String(page)] = [`page-${page}-done`];
    }
  }
  return completionMap;
}

test.describe("Workbook Source Order & 86–87 Guard Spec", () => {
  test.beforeEach(async ({ page }) => {
    const finishedMap = allFinishedPages();
    await page.addInitScript((map) => {
      localStorage.setItem("cartilla.page-completion.v1", JSON.stringify(map));
    }, finishedMap);
  });

  test("verifies lesson and page resolution for Lesson 1", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "1");
  });

  test("verifies lesson and page resolution for Lesson 8", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "23");
  });

  test("verifies explicit SOURCE_BLOCKED handling on page 86 (Lesson 23)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/leccion/23", { waitUntil: "domcontentloaded" });
    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "83");

    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click(); // page 84
    await expect(lesson).toHaveAttribute("data-native-page", "84");
    await next.click(); // page 85
    await expect(lesson).toHaveAttribute("data-native-page", "85");
    await next.click(); // page 86
    await expect(lesson).toHaveAttribute("data-native-page", "86");

    const blockedNotice = page.locator("[data-source-blocked='true']");
    await expect(blockedNotice).toBeVisible();
    await expect(blockedNotice).toContainText("Esta página falta en el escaneo del libro");

    await page.screenshot({
      path: "docs/proofs/source-order-guard/page-86-blocked.png",
      fullPage: true,
    });
  });

  test("verifies explicit SOURCE_BLOCKED handling on page 87 (Lesson 24)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/leccion/24", { waitUntil: "domcontentloaded" });
    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "87");

    const blockedNotice = page.locator("[data-source-blocked='true']");
    await expect(blockedNotice).toBeVisible();
    await expect(blockedNotice).toContainText("Esta página falta en el escaneo del libro");

    await page.screenshot({
      path: "docs/proofs/source-order-guard/page-87-blocked.png",
      fullPage: true,
    });
  });
});
