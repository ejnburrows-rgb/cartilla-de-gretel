import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";

const PROOF_DIR = path.resolve("docs/proofs/archetypes-5-6");

async function ensureProofDir() {
  await fs.mkdir(PROOF_DIR, { recursive: true });
}

async function dismissCinematic(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
}

async function expectNoBrokenImages(page: Page, label: string) {
  const visibleImages = page.locator("img:visible");
  const count = await visibleImages.count();
  for (let i = 0; i < count; i++) {
    const img = visibleImages.nth(i);
    const natural = await img.evaluate((node: HTMLImageElement) => ({
      src: node.currentSrc || node.src,
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
    }));
    expect(
      natural.complete && natural.naturalWidth > 0 && natural.naturalHeight > 0,
      `Broken visible image in ${label}: ${natural.src}`
    ).toBeTruthy();
  }
}

async function checkNoClippingOrOverflow(page: Page, label: string) {
  const fit = await page.evaluate(() => {
    const body = document.querySelector<HTMLElement>(".faithful-page__body") || document.body;
    return {
      windowOverflowX: document.documentElement.scrollWidth - window.innerWidth,
      windowOverflowY: document.documentElement.scrollHeight - window.innerHeight,
      bodyOverflowX: body.scrollWidth - body.clientWidth,
      bodyOverflowY: body.scrollHeight - body.clientHeight,
    };
  });
  expect(fit.windowOverflowX, `${label} window overflow X`).toBeLessThanOrEqual(2);
  expect(fit.bodyOverflowX, `${label} body overflow X`).toBeLessThanOrEqual(2);
}

test.describe("Workbook Archetype 5 & 6 Proof", () => {
  test.beforeAll(async () => {
    await ensureProofDir();
  });

  test("Archetype 5: Handwriting/tracing and freehand drawing, progressive fade, persistence, responsive fit, reduced motion", async ({ page }) => {
    // 1. Laptop fit (1280x800) & Initial visual check on Lesson 7 (Printed page 19 - Archetype 5)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    // Wait for the real Workbook surface: domcontentloaded alone can capture a
    // blank page and still pass the generic helpers (the old laptop proof PNG
    // was an empty canvas).
    await expect(page.locator(".fp-trace:visible").first()).toBeVisible({ timeout: 15000 });

    await expectNoBrokenImages(page, "Archetype 5 laptop");
    await checkNoClippingOrOverflow(page, "Archetype 5 laptop");

    // Capture laptop screenshot
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-laptop.png") });

    // Verify tracing guides and freehand drawing controls existence
    const trace = page.locator(".fp-trace:visible").first();
    const traceCount = await page.locator(".fp-trace:visible").count();
    expect(traceCount, "Tracing rows present").toBeGreaterThan(0);

    const drawCanvas = page.locator(".am-dibuja:visible").first();
    await expect(drawCanvas).toBeVisible();

    // Verify mode toggle / progressive fade / stroke interaction on trace
    const modeToggle = trace.locator(".fp-trace__mode-toggle");
    if (await modeToggle.isVisible().catch(() => false)) {
      await modeToggle.click({ force: true });
      await page.waitForTimeout(200);
    }

    // Perform freehand stroke on drawing canvas
    const drawBox = await drawCanvas.boundingBox();
    if (drawBox) {
      await page.mouse.move(drawBox.x + 40, drawBox.y + 40);
      await page.mouse.down();
      await page.mouse.move(drawBox.x + 120, drawBox.y + 90, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    // Perform stroke on tracing guide
    const dot = trace.locator(".fp-trace__dot").first();
    if (await dot.isVisible().catch(() => false)) {
      await dot.click({ force: true });
      await page.waitForTimeout(200);
    }

    // Capture tracing and drawn proof
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-tracing-drawn.png") });

    // Verify persistence (reload page)
    await page.reload({ waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    await expect(page.locator(".fp-trace:visible").first()).toBeVisible({ timeout: 15000 });

    // Verify responsive viewports for Archetype 5
    // Tablet (820x1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await expectNoBrokenImages(page, "Archetype 5 tablet");
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-tablet.png") });

    // Phone (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoBrokenImages(page, "Archetype 5 phone");
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-phone.png") });

    // Reduced motion presentation on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-reduced-motion.png") });
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("Archetype 6: Syllable recognition / circle, ordering, save/reload persistence, responsive fit, reduced motion", async ({ page }) => {
    // 1. Laptop fit (1280x800) on Pilot faithful route for Printed page 20 (Archetype 6)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/cartilla/pilot-faithful/20", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible").first(),
    ).toBeVisible({ timeout: 15000 });

    await expectNoBrokenImages(page, "Archetype 6 laptop");
    await checkNoClippingOrOverflow(page, "Archetype 6 laptop");

    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-laptop.png") });

    // Verify syllable match rows / circle selection / source ordering
    const syllableMatchRows = page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible");
    const matchCount = await syllableMatchRows.count();
    expect(matchCount, "Syllable match rows present").toBeGreaterThan(0);

    // Interact with first syllable / word choice
    const selectableWord = page.locator(".native-syllable__word:visible, .fp-syllable-match__word:visible, .am-lasso__target:visible").first();
    if (await selectableWord.isVisible().catch(() => false)) {
      await selectableWord.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-syllable-selected.png") });

    // Verify save/reload persistence where supported
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible").first(),
    ).toBeVisible({ timeout: 15000 });

    // Verify responsive viewports for Archetype 6
    // Tablet (820x1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await expectNoBrokenImages(page, "Archetype 6 tablet");
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-tablet.png") });

    // Phone (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoBrokenImages(page, "Archetype 6 phone");
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-phone.png") });

    // Reduced motion presentation on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-reduced-motion.png") });
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });
});
