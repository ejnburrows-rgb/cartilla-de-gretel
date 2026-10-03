import { test, expect } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json";
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
    await page.setViewportSize(viewport);
    await page.goto("/cartilla/presentar/1");
    await expect(page.getByTestId("flipchart-stage")).toBeVisible();
    const stage = page.getByTestId("flipchart-stage");
    const bg = stage.locator(".final-page-background");
    await expect(bg).toHaveAttribute("data-background-printed-page", "1");
    await expect(bg).toHaveAttribute("data-background-pdf-sheet", "3");
    await expect(bg).toHaveJSProperty("complete", true);
    expect(await bg.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await bg.evaluate((el) => getComputedStyle(el).objectFit)).toBe("contain");
    expect(await bg.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    const fg = stage.locator(".fc-native-board__page");
    const before = await fg.boundingBox();
    await bg.evaluate((el) => (el.style.display = "none"));
    expect(await fg.boundingBox()).toEqual(before);
    await stage.screenshot({ path: `docs/proofs/final-backgrounds/flipchart-${name}-before.png` });
    await bg.evaluate((el) => (el.style.display = ""));
    await stage.screenshot({ path: `docs/proofs/final-backgrounds/flipchart-${name}-after.png` });
    await page.goto("/cartilla/presentar/2");
    await expect(
      page.getByTestId("flipchart-stage").locator(".final-page-background"),
    ).toHaveAttribute("data-background-pdf-sheet", "4");
  });
}
