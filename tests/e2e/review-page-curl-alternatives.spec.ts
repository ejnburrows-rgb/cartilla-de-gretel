import { expect, test } from "@playwright/test";
import { seedCompletedPages } from "./support/completion";

test.use({ video: "on" });
for (const device of [
  { name: "mobile-emulated", width: 390, height: 844, touch: true },
  { name: "desktop", width: 1366, height: 768, touch: false },
]) {
  for (const style of ["corner", "edge"] as const) {
    test.describe(`${device.name} ${style}`, () => {
      test.use({ viewport: { width: device.width, height: device.height }, hasTouch: device.touch, isMobile: device.touch });
      test("turns a real Lesson 3 page forward and back", async ({ page }, info) => {
        await seedCompletedPages(page, [7, 8]); // Synthetic progress only; not a test of completing these activities.
        await page.goto(`/cartilla/leccion/3?curl=${style}`, { waitUntil: "domcontentloaded" });
        const reader = page.locator(".native-lesson-viewer");
        await expect(reader).toHaveAttribute("data-native-page", "7");
        await page.screenshot({ path: info.outputPath("before.png") });
        const started = Date.now();
        await page.getByTestId("button-next").click();
        const curl = page.locator(".native-page-curl");
        await expect(curl).toHaveAttribute("data-curl-style", style);
        await page.waitForTimeout(450);
        await page.screenshot({ path: info.outputPath("turn.png") });
        await expect(reader).toHaveAttribute("data-native-page", "8", { timeout: 8000 });
        console.log(`${device.name} ${style}: click to page 8 ${Date.now() - started} ms`);
        await expect(reader).toHaveAttribute("data-turn-phase", "idle", { timeout: 3000 });
        await page.getByTestId("button-prev").click();
        await expect(reader).toHaveAttribute("data-native-page", "7", { timeout: 8000 });
      });
    });
  }
}

test("buttons, keys, corner and swipe remain locked during a real wrong mark", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedCompletedPages(page, [7]);
  await page.goto("/cartilla/leccion/3?cursor=contract&curl=edge", { waitUntil: "domcontentloaded" });
  const reader = page.locator(".native-lesson-viewer");
  await expect(reader).toHaveAttribute("data-native-page", "7");
  await page.evaluate(() => {
    const root = document.querySelector(".native-lesson-viewer")!;
    const seen = new Set<string>();
    (window as any).__guardProbe = { seen: [], failures: [] };
    const pointer = (type: string, x: number, y: number) => new PointerEvent(type, { bubbles: true, pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, buttons: type === "pointerup" ? 0 : 1, clientX: x, clientY: y });
    const observer = new MutationObserver(() => {
      for (const mark of root.querySelectorAll(".workbook-pencil-mark[data-mark-status]")) {
        const phase = mark.getAttribute("data-mark-status") || "";
        if (!["drawing", "holding", "erasing"].includes(phase) || seen.has(phase)) continue;
        seen.add(phase);
        (window as any).__guardProbe.seen.push(phase);
        // Synthetic dispatch targets each real handler within the short holding phase.
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        (root.querySelector('[data-testid="button-next"]') as HTMLElement)?.click();
        const corner = root.querySelector('[data-testid="corner-next"]');
        corner?.dispatchEvent(pointer("pointerdown", 300, 700));
        corner?.dispatchEvent(pointer("pointermove", 100, 700));
        corner?.dispatchEvent(pointer("pointerup", 100, 700));
        (corner as HTMLElement)?.click();
        root.dispatchEvent(pointer("pointerdown", 300, 400));
        root.dispatchEvent(pointer("pointerup", 100, 400));
        setTimeout(() => {
          if (root.getAttribute("data-native-page") !== "7" || root.getAttribute("data-turn-phase") !== "idle") (window as any).__guardProbe.failures.push(phase);
        }, 50);
      }
    });
    observer.observe(root, { attributes: true, childList: true, subtree: true, attributeFilter: ["data-mark-status"] });
  });
  const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
  await wrong.click();
  await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 12000 });
  await page.waitForTimeout(200);
  const result = await page.evaluate(() => (window as any).__guardProbe);
  expect(result.seen).toEqual(["drawing", "holding", "erasing"]);
  expect(result.failures).toEqual([]);
  await expect(reader).toHaveAttribute("data-native-page", "7");
});
