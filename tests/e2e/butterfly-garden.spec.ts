import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const proof = path.resolve("docs/proofs/mariposas-2026-10-29");
const words = [["ma", "pa"], ["po", "mo"], ["Mu", "pi"], ["Pe", "Pe"], ["Pu", "ma"], ["Pu", "pi"]];

test.use({ video: "on" });
// Include cold Chromium/video fixture startup in the same journey budget.
test.setTimeout(90_000);

async function openGame(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/auth/v1/**", (route) => route.abort());
  await page.route("**/rest/v1/**", (route) => route.abort());
  await page.goto("/cartilla/juego/mariposas-p");
  await expect(page.getByTestId("word")).toHaveText("mapa");
  await expect(page.getByTestId("bf-ma")).toBeVisible();
  await expect.poll(() => page.getByTestId("bf-ma").evaluate((el) => el.style.transform)).toContain("translate(");
  return errors;
}

async function place(page: import("@playwright/test").Page, id: string, slot: number, touch = false) {
  const butterfly = page.getByTestId(`bf-${id}`);
  if (touch) await butterfly.tap(); else await butterfly.click();
  await expect(page.getByTestId(`slot-${slot}`)).toHaveText(id, { ignoreCase: true });
  await expect(butterfly.locator(".bfg-anim-flutter-fly")).toHaveCount(0);
}

test("desktop reduced motion: round result, wrong answer, focus and reload persistence", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = await openGame(page);
  const can = page.getByTestId("can");
  await can.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("word")).toHaveText("pomo");
  await expect(can).toBeFocused();
  for (let i = 0; i < 5; i++) await can.press("Enter");
  await expect(page.getByTestId("word")).toHaveText("mapa");
  expect(await page.evaluate(() => localStorage.getItem("cartilla.exercise-stats.v1"))).toBeNull();

  await page.getByTestId("bf-pa").evaluate((el) => {
    const changes: string[] = [];
    (window as any).__butterflyTransforms = changes;
    new MutationObserver(() => changes.push(el.style.transform)).observe(el, { attributes: true, attributeFilter: ["style"] });
  });
  await place(page, "pa", 0);
  const transforms = await page.evaluate(() => [...new Set((window as any).__butterflyTransforms)]);
  expect(transforms).toHaveLength(2);
  await page.getByTestId("check").click();
  await expect(page.getByTestId("slot-0")).not.toHaveText("pa");
  await expect(page.getByTestId("bf-pa")).toHaveAttribute("data-card", "yes");
  await page.waitForTimeout(300);

  for (let w = 0; w < words.length; w++) {
    for (let slot = 0; slot < words[w]!.length; slot++) await place(page, words[w]![slot]!, slot);
    await page.getByTestId("check").click();
    await expect(page.getByRole("status")).toHaveText("¡Muy bien!");
    if (w < words.length - 1) await can.click();
  }
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("cartilla.exercise-stats.v1") ?? "{}")["game:mariposas-p"]?.mariposas);
  await expect.poll(saved).toMatchObject({ attempts: 6, hits: 6, completedRounds: 1 });
  await page.getByTestId("check").click();
  expect((await saved()).completedRounds).toBe(1);
  await page.screenshot({ path: path.join(proof, "desktop-completed.png") });
  await page.reload();
  await expect(page.getByTestId("word")).toHaveText("mapa");
  expect((await saved()).completedRounds).toBe(1);
  expect(errors).toEqual([]);
});

test("phone touch: animated delivery, wrong return, correct word and help", async ({ browser }) => {
  test.setTimeout(90_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    recordVideo: { dir: test.info().outputPath("phone-video"), size: { width: 390, height: 844 } } });
  const page = await context.newPage();
  const errors = await openGame(page);
  await page.screenshot({ path: path.join(proof, "phone-initial.png") });
  await place(page, "pa", 0, true);
  await page.getByTestId("check").tap();
  await expect(page.getByTestId("slot-0")).not.toHaveText("pa");
  await expect(page.getByTestId("bf-pa")).toHaveAttribute("data-card", "yes");
  await page.waitForTimeout(1400);
  await place(page, "ma", 0, true);
  await place(page, "pa", 1, true);
  await page.getByTestId("check").tap();
  await expect(page.getByRole("status")).toHaveText("¡Muy bien!");
  await page.screenshot({ path: path.join(proof, "phone-correct.png") });
  await page.getByTestId("help").tap();
  await expect(page.getByRole("heading", { name: "Instrucciones:" })).toBeVisible();
  await page.getByRole("button", { name: "¡A jugar!" }).tap();
  // Tap the moving congratulation control as a touchscreen user does; waiting
  // for CSS bounce to become stationary would never activate the real button.
  const canBox = (await page.getByTestId("can").boundingBox())!;
  await page.touchscreen.tap(canBox.x + canBox.width / 2, canBox.y + canBox.height / 2);
  await expect(page.getByTestId("word")).toHaveText("pomo");
  expect(errors).toEqual([]);
  const video = page.video();
  await context.close();
  await video!.saveAs(path.join(proof, "phone-touch.webm"));
});

test("tablet and projector: original images load and game controls fit", async ({ page }) => {
  const masterDir = path.resolve("src/assets/games/butterfly-garden");
  const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  const masters = new Map(fs.readdirSync(masterDir).map((name) => [hash(fs.readFileSync(path.join(masterDir, name))), name]));
  const served = new Map<string, { sha256: string; master: string }>();
  for (const viewport of [{ width: 768, height: 1024 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    const errors = await openGame(page);
    for (const id of ["can", "help", "check", "net", "slot-0", "slot-2"]) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
    const images = await page.locator("img").evaluateAll((els) => els.map((el) => ({ src: el.currentSrc, loaded: el.complete && el.naturalWidth > 0 })));
    expect(images.every((image) => image.loaded)).toBe(true);
    for (const src of new Set(images.map((image) => image.src))) {
      if (served.has(src)) continue;
      const response = await page.request.get(src);
      expect(response.ok()).toBe(true);
      const sha256 = hash(await response.body());
      expect(masters.has(sha256), src).toBe(true);
      served.set(src, { sha256, master: masters.get(sha256)! });
    }
    fs.writeFileSync(path.join(proof, `images-${viewport.width}.json`), JSON.stringify(images, null, 2));
    await page.screenshot({ path: path.join(proof, `viewport-${viewport.width}.png`) });
    expect(errors).toEqual([]);
  }
  fs.writeFileSync(path.join(proof, "served-original-image-hashes.json"), JSON.stringify([...served], null, 2));
});
