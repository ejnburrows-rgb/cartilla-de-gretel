import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";

const PROOF_DIR = path.resolve("docs/proofs/living-motion-regression");

async function ensureProofDir() {
  await fs.mkdir(PROOF_DIR, { recursive: true });
}

test.describe("Living Motion Regression Suite", () => {
  test.beforeAll(async () => {
    await ensureProofDir();
  });

  test("Workbook Page 1: registered living actors render, move, and pass asset checks", async ({ page }) => {
    const failedUrls: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && (response.url().includes("/art/") || response.url().includes(".svg") || response.url().includes(".png") || response.url().includes(".webp"))) {
        failedUrls.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/leccion/1", { waitUntil: "networkidle" });

    const livingIllustrations = page.locator(".living-illustration");
    await expect(livingIllustrations.first()).toBeVisible({ timeout: 30_000 });

    const naturalActors = ["oso", "oveja", "avión", "abanico", "elefante", "imán", "olla"];
    for (const actorName of naturalActors) {
      const wrapper = page.locator(`.living-illustration[data-picture-name="${actorName}"]`).first();
      await expect(wrapper, `Living illustration for ${actorName} exists`).toBeVisible();

      const isNatural = await wrapper.getAttribute("data-natural-motion");
      expect(isNatural, `${actorName} uses self-animated natural motion`).toBe("true");

      const img = wrapper.locator("img.living-illustration__art");
      await expect(img).toBeVisible();

      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth, `${actorName} image rendered with positive naturalWidth`).toBeGreaterThan(0);

      const imgSrc = await img.getAttribute("src");
      expect(imgSrc, `${actorName} display src uses aliveSrc SVG`).toContain("-alive.svg");
    }

    // abeja on Page 1 uses ambient CSS hover motion
    const abejaWrapper = page.locator('.living-illustration[data-picture-name="abeja"]').first();
    await expect(abejaWrapper, "Living illustration for abeja exists").toBeVisible();
    expect(await abejaWrapper.getAttribute("data-ambient-motion"), "abeja uses hover ambient motion").toBe("hover");

    const abejaImg = abejaWrapper.locator("img.living-illustration__art");
    await expect(abejaImg).toBeVisible();
    const abejaWidth = await abejaImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(abejaWidth, "abeja image rendered with positive naturalWidth").toBeGreaterThan(0);

    expect(failedUrls, "No asset URLs failed on Workbook Page 1").toEqual([]);

    await page.screenshot({
      path: path.join(PROOF_DIR, "workbook-page1.png"),
      fullPage: true,
    });
  });

  test("Flip Chart Lesson 7: registered scene actor renders and uses aliveSrc", async ({ page }) => {
    const failedUrls: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && (response.url().includes("/art/") || response.url().includes(".svg") || response.url().includes(".png") || response.url().includes(".webp"))) {
        failedUrls.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "networkidle" });

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 30_000 });

    const sceneWrapper = page.locator('.living-illustration[data-picture-src*="p009-scene.png"]').first();
    await expect(sceneWrapper, "Flip chart Lesson 7 scene actor exists").toBeVisible({ timeout: 15_000 });

    const isNatural = await sceneWrapper.getAttribute("data-natural-motion");
    expect(isNatural, "p009-scene uses self-animated natural motion").toBe("true");

    const img = sceneWrapper.locator("img.living-illustration__art");
    await expect(img).toBeVisible();

    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, "p009-scene image rendered with positive naturalWidth").toBeGreaterThan(0);

    const imgSrc = await img.getAttribute("src");
    expect(imgSrc, "p009-scene display src uses aliveSrc SVG").toContain("p009-scene-alive.svg");

    expect(failedUrls, "No asset URLs failed on Flip Chart Lesson 7").toEqual([]);

    await page.screenshot({
      path: path.join(PROOF_DIR, "flipchart-lesson7.png"),
      fullPage: true,
    });
  });

  test("Reduced motion: falls back to still assets and halts motion across Workbook Page 1 and Flip Chart Lesson 7", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    // Test Workbook Page 1 under reduced motion
    await page.goto("/cartilla/leccion/1", { waitUntil: "networkidle" });
    const wbLiving = page.locator(".living-illustration");
    await expect(wbLiving.first()).toBeVisible({ timeout: 30_000 });

    const wbActors = ["oso", "oveja", "avión", "abanico", "elefante", "imán", "olla", "abeja"];
    for (const actorName of wbActors) {
      const wrapper = page.locator(`.living-illustration[data-picture-name="${actorName}"]`).first();
      await expect(wrapper).toBeVisible();

      expect(await wrapper.getAttribute("data-natural-motion")).toBe("false");
      expect(await wrapper.getAttribute("data-ambient-motion")).toBe("none");

      const img = wrapper.locator("img.living-illustration__art");
      const imgSrc = await img.getAttribute("src");
      expect(imgSrc, `${actorName} uses still asset under reduced motion`).not.toContain("-alive.svg");
      expect(imgSrc, `${actorName} uses still image file`).toMatch(/\.(svg|png|webp)$/);

      const anyRunning = await wrapper.evaluate((el) => {
        const els = [el, ...el.querySelectorAll("*")];
        return els.some((e) => getComputedStyle(e).animationName !== "none");
      });
      expect(anyRunning, `${actorName} has no running CSS animations under reduced motion`).toBe(false);
    }

    await page.screenshot({
      path: path.join(PROOF_DIR, "workbook-page1-reduced-motion.png"),
      fullPage: true,
    });

    // Test Flip Chart Lesson 7 under reduced motion
    await page.goto("/cartilla/presentar/7", { waitUntil: "networkidle" });
    const sceneWrapper = page.locator('.living-illustration[data-picture-src*="p009-scene.png"]').first();
    await expect(sceneWrapper).toBeVisible({ timeout: 15_000 });

    expect(await sceneWrapper.getAttribute("data-natural-motion")).toBe("false");
    expect(await sceneWrapper.getAttribute("data-ambient-motion")).toBe("none");

    const img = sceneWrapper.locator("img.living-illustration__art");
    const imgSrc = await img.getAttribute("src");
    expect(imgSrc, "p009-scene uses still PNG under reduced motion").toContain("p009-scene.png");

    await page.screenshot({
      path: path.join(PROOF_DIR, "flipchart-lesson7-reduced-motion.png"),
      fullPage: true,
    });

    await context.close();
  });
});
