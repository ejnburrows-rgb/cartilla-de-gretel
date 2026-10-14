import { test, expect } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };
for (const [name, viewport] of Object.entries({
  phone: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
})) {
  test(`Workbook ${name}: background behind working picture targets`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (done) => localStorage.setItem("cartilla.page-completion.v1", JSON.stringify({ "1": done })),
      layouts.pages["1"].regions.map((r) => `page-1-${r.id}`),
    );
    const failures: string[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/backgrounds/final/") && !r.ok()) failures.push(r.url());
    });
    await page.goto("/cartilla/leccion/1");
    const viewer = page.locator(".native-lesson-viewer");
    await viewer.getByRole("button", { name: "Siguiente" }).click();
    const bg = viewer.locator(".final-page-background");
    await expect(bg).toHaveAttribute("data-background-printed-page", "2");
    await expect(bg).toHaveJSProperty("complete", true);
    await expect(bg).toHaveJSProperty("naturalWidth", 1103);
    expect(await bg.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    expect(await bg.evaluate((el) => getComputedStyle(el).objectFit)).toBe("contain");
    const target = viewer.getByRole("button", { name: "anillo", exact: true });
    await target.scrollIntoViewIfNeeded();
    const before = await target.boundingBox();
    await bg.evaluate((el) => (el.style.display = "none"));
    expect(await target.boundingBox()).toEqual(before);
    await page.screenshot({
      path: `docs/proofs/final-backgrounds/workbook-${name}-before.png`,
      fullPage: true,
    });
    await bg.evaluate((el) => (el.style.display = ""));
    await target.click();
    await expect(target).toHaveClass(/graded-correct/);
    expect(failures).toEqual([]);
    await page.screenshot({
      path: `docs/proofs/final-backgrounds/workbook-${name}-after.png`,
      fullPage: true,
    });
  });
}
for (const [name, viewport] of Object.entries({
  portrait: { width: 820, height: 1180 },
  landscape: { width: 1280, height: 800 },
})) {
  test(`Flip Chart ${name}: sheet identity and whole-composition fit`, async ({ page }) => {
    // Owner direction 2026-10-07: the Flip Chart is a clean paper surface with
    // no background image; the sheet itself is the printed-layout replica.
    await page.setViewportSize(viewport);
    await page.goto("/cartilla/presentar/1");
    const stage = page.getByTestId("flipchart-stage");
    await expect(stage).toBeVisible();
    await expect(stage.locator(".final-page-background")).toHaveCount(0);
    const sheet = stage.locator('[data-native-flipchart="true"]').first();
    await expect(sheet).toHaveAttribute("data-flipchart-page", "3");
    const stageBox = (await stage.boundingBox())!;
    const sheetBox = (await sheet.boundingBox())!;
    expect(sheetBox.width).toBeGreaterThan(0);
    expect(sheetBox.x).toBeGreaterThanOrEqual(stageBox.x - 2);
    expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(stageBox.x + stageBox.width + 2);
    await expect.poll(() => stage.locator("img").evaluateAll((images) =>
      images.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await stage.screenshot({ path: `docs/proofs/final-backgrounds/flipchart-${name}-after.png` });
    await page.goto("/cartilla/presentar/2");
    const second = page.getByTestId("flipchart-stage");
    await expect(second.locator(".final-page-background")).toHaveCount(0);
    await expect(second.locator('[data-native-flipchart="true"]').first()).toHaveAttribute("data-flipchart-page", "4");
  });
}
