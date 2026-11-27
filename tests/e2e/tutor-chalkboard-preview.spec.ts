import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const OUT_VIDEO_DIR = path.resolve("test-results/chalkboard-recordings");
const OFFSETS_PATH = path.join(OUT_VIDEO_DIR, "offsets.json");

function saveOffset(key: string, sec: number): void {
  let current: Record<string, number> = {};
  try {
    if (fs.existsSync(OFFSETS_PATH)) {
      current = JSON.parse(fs.readFileSync(OFFSETS_PATH, "utf8")) as Record<string, number>;
    }
  } catch {
    current = {};
  }
  current[key] = Number(Math.max(0, sec).toFixed(3));
  fs.writeFileSync(OFFSETS_PATH, JSON.stringify(current, null, 2) + "\n");
}

async function waitForChalkboardRigDecoded(page: Page): Promise<void> {
  await expect(page.locator("#audioMeta")).toHaveAttribute("data-visemes-loaded", "true");
  await expect(page.locator("#chalkboardSvg")).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = [
      "/cartilla/images/gretel/tutor/chalkboard-candidates/gretel-face-base.png",
      "/cartilla/images/gretel/tutor/chalkboard-candidates/mouth-X.png",
      "/cartilla/images/gretel/tutor/chalkboard-candidates/iris-left.png",
      "/cartilla/images/gretel/tutor/chalkboard-candidates/iris-right.png",
      "/cartilla/images/gretel/tutor/chalkboard-candidates/lid-50.png",
    ];
    await Promise.all(
      urls.map(
        (u) =>
          new Promise<void>((res) => {
            const im = new Image();
            im.onload = () => res();
            im.onerror = () => res();
            im.src = u;
          }),
      ),
    );
  });
  await page.waitForTimeout(180);
}

test.describe("Gretel Premium Chalkboard Previews A & B (Desktop & Mobile real browser recordings)", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT_VIDEO_DIR, { recursive: true });
  });

  test("Preview A (Desktop 1366x768) — Gretel listening naturally with independent pupils, lids & brows", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 1366, height: 768 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 1366, height: 768 } },
    });
    const page = await context.newPage();
    await page.goto("/tutor-avatar-preview.html?mode=listening", {
      waitUntil: "networkidle",
    });

    await waitForChalkboardRigDecoded(page);
    await page.locator("#viewportFrame").scrollIntoViewIfNeeded();
    saveOffset("preview-A-listening-desktop-1366x768", (Date.now() - contextStartMs) / 1000);

    const t0 = await page.evaluate(() => ({
      pupil: document.getElementById("rigIrisLeft")?.style.transform ?? "",
      brow: document.getElementById("rigBrowLeft")?.style.transform ?? "",
      head: document.getElementById("rigHead")?.style.transform ?? "",
    }));
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.getElementById("btnBlinkNow")?.click());
    await page.waitForTimeout(3400);
    const t1 = await page.evaluate(() => ({
      pupil: document.getElementById("rigIrisLeft")?.style.transform ?? "",
      brow: document.getElementById("rigBrowLeft")?.style.transform ?? "",
      head: document.getElementById("rigHead")?.style.transform ?? "",
    }));

    expect(t0.head).not.toBe(t1.head);
    expect(t0.pupil).not.toBe(t1.pupil);

    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(saved, path.join(OUT_VIDEO_DIR, "preview-A-listening-desktop-1366x768.webm"));
    }
  });

  test("Preview A (Mobile 390x844) — Gretel listening naturally with zero overflow", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();
    await page.goto("/tutor-avatar-preview.html?mode=listening&viewport=mobile", {
      waitUntil: "networkidle",
    });

    await waitForChalkboardRigDecoded(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
    await page.locator("#viewportFrame").scrollIntoViewIfNeeded();
    saveOffset("preview-A-listening-mobile-390x844", (Date.now() - contextStartMs) / 1000);

    await page.waitForTimeout(2600);
    await page.evaluate(() => document.getElementById("btnBlinkNow")?.click());
    await page.waitForTimeout(3400);

    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(saved, path.join(OUT_VIDEO_DIR, "preview-A-listening-mobile-390x844.webm"));
    }
  });

  test("Preview B (Desktop 1366x768) — Gretel speaking real recording + synchronized chalkboard write, circle, arcs & erase", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 1366, height: 768 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 1366, height: 768 } },
    });
    const page = await context.newPage();
    await page.goto("/tutor-avatar-preview.html?mode=speaking", {
      waitUntil: "networkidle",
    });
    await waitForChalkboardRigDecoded(page);
    await page.locator("#viewportFrame").scrollIntoViewIfNeeded();

    await page.locator("#btnDemoSpeakingChalkboard").click();
    saveOffset(
      "preview-B-speaking-chalkboard-desktop-1366x768",
      (Date.now() - contextStartMs) / 1000,
    );
    await page.waitForTimeout(5600);

    await expect(page.locator("#chalkWordText")).toHaveText("abanico");

    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(
        saved,
        path.join(OUT_VIDEO_DIR, "preview-B-speaking-chalkboard-desktop-1366x768.webm"),
      );
    }
  });

  test("Preview B (Mobile 390x844) — Gretel speaking + chalkboard interaction in mobile layout", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();
    await page.goto("/tutor-avatar-preview.html?mode=speaking&viewport=mobile", {
      waitUntil: "networkidle",
    });
    await waitForChalkboardRigDecoded(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
    await page.locator("#viewportFrame").scrollIntoViewIfNeeded();

    await page.locator("#btnDemoSpeakingChalkboard").click();
    saveOffset(
      "preview-B-speaking-chalkboard-mobile-390x844",
      (Date.now() - contextStartMs) / 1000,
    );
    await page.waitForTimeout(5600);

    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(
        saved,
        path.join(OUT_VIDEO_DIR, "preview-B-speaking-chalkboard-mobile-390x844.webm"),
      );
    }
  });

  test("Integrated Tutor session (/tutor/1?previewRig=1) preserves 1 persistent chalkboard instance across all 4 FaceTime modes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/tutor/1?code=clase&slot=1&previewRig=1", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("[data-tutor-chalkboard-stage]")).toBeVisible({ timeout: 15_000 });

    const initialTag = await page.evaluate(() => {
      const el = document.querySelector("[data-tutor-chalkboard-stage]") as HTMLElement & {
        __persistToken?: string;
      };
      if (el) el.__persistToken = "alive";
      return Boolean(el);
    });
    expect(initialTag).toBe(true);

    for (const mode of ["split", "flipchart-pip", "practice", "call"]) {
      await page.locator(`[data-layout-option="${mode}"]`).click();
      const persisted = await page.evaluate(
        () =>
          (
            document.querySelector("[data-tutor-chalkboard-stage]") as
              | (HTMLElement & { __persistToken?: string })
              | null
          )?.__persistToken,
      );
      expect(persisted).toBe("alive");
    }
  });
});
