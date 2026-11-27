import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const OUT_VIDEO_DIR = path.resolve("test-results/hybrid-recordings");
const OFFSETS_PATH = path.join(OUT_VIDEO_DIR, "offsets.json");

function saveTimingMeta(key: string, value: number): void {
  let current: Record<string, number> = {};
  try {
    if (fs.existsSync(OFFSETS_PATH)) {
      current = JSON.parse(fs.readFileSync(OFFSETS_PATH, "utf8")) as Record<string, number>;
    }
  } catch {
    current = {};
  }
  current[key] = Number(Math.max(0, value).toFixed(3));
  fs.writeFileSync(OFFSETS_PATH, JSON.stringify(current, null, 2) + "\n");
}

async function waitForHybridReady(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { __HYBRID_READY__?: boolean }).__HYBRID_READY__ === true);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(160);
}

test.describe("Gretel Hybrid ($0 Mesh + 2-Bone IK + Rhubarb + Flow Kit) E2E Proof", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT_VIDEO_DIR, { recursive: true });
  });

  test("Complete 8-phase teacher sequence on Desktop (1366x768) with live proof frames", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 1366, height: 768 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 1366, height: 768 } },
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/tutor-hybrid-preview.html", { waitUntil: "networkidle" });
    await waitForHybridReady(page);

    const frameLoc = page.locator("#viewportFrame");
    await frameLoc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);

    const trimStartSec = (Date.now() - contextStartMs) / 1000;
    saveTimingMeta("hybrid-demo-desktop-1366x768", trimStartSec);

    const observedPhases = new Set<string>();
    const observedVisemes = new Set<string>();

    // Uninterrupted 11.6s real-time sequence run for smooth video recording (sample lightly every 180ms)
    await page.locator("#btnRunSequence").click();
    const runStartMs = Date.now();
    while (Date.now() - runStartMs < 11900) {
      await page.waitForTimeout(180);
      const telemetry = await page.evaluate(() => {
        const el = document.getElementById("viewportFrame");
        return {
          phase: el?.dataset.hybridPhase ?? "",
          viseme: el?.dataset.viseme ?? "",
        };
      });
      if (telemetry.phase) observedPhases.add(telemetry.phase);
      if (telemetry.viseme) observedVisemes.add(telemetry.viseme);
    }

    expect(pageErrors).toEqual([]);
    expect(observedPhases.has("listen_1")).toBe(true);
    expect(observedPhases.has("write_demonstrate")).toBe(true);
    expect(observedPhases.has("erase_board")).toBe(true);
    expect(observedPhases.has("speak_rhubarb")).toBe(true);
    expect(observedPhases.has("listen_feedback")).toBe(true);
    expect(observedVisemes.size).toBeGreaterThanOrEqual(2);

    // Close video cleanly BEFORE jumping to deterministic proof snapshots
    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(saved, path.join(OUT_VIDEO_DIR, "hybrid-demo-desktop-1366x768.webm"));
    }

    // Separate lightweight screenshot pass at exact key moments (zero stall in recorded video!)
    const snapPage = await browser.newPage({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 1366, height: 768 },
    });
    await snapPage.goto("/tutor-hybrid-preview.html", { waitUntil: "networkidle" });
    await waitForHybridReady(snapPage);
    const snapLoc = snapPage.locator("#viewportFrame");
    await snapLoc.scrollIntoViewIfNeeded();
    const keySnaps: Array<[number, string]> = [
      [0.7, "frame-1-listening.png"],
      [2.95, "frame-2-turning.png"],
      [4.75, "frame-3-writing-ik.png"],
      [6.75, "frame-4-erasing-ik.png"],
      [8.75, "frame-5-speaking-rhubarb.png"],
    ];
    for (const [sec, filename] of keySnaps) {
      await snapPage.evaluate((s) => {
        (window as unknown as { __HYBRID_JUMP__?: (t: number) => void }).__HYBRID_JUMP__?.(s);
      }, sec);
      await snapPage.waitForTimeout(80);
      await snapLoc.screenshot({ path: path.join(OUT_VIDEO_DIR, filename) });
    }
    await snapPage.close();
  });

  test("Complete 8-phase teacher sequence on Mobile (390x844) with zero overflow", async ({
    browser,
  }) => {
    const contextStartMs = Date.now();
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: OUT_VIDEO_DIR, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();
    await page.goto("/tutor-hybrid-preview.html?viewport=mobile", { waitUntil: "networkidle" });
    await waitForHybridReady(page);

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    expect(noHorizontalOverflow).toBe(true);

    const frameLoc = page.locator("#viewportFrame");
    await frameLoc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    saveTimingMeta("hybrid-demo-mobile-390x844", (Date.now() - contextStartMs) / 1000);

    await page.locator("#btnRunSequence").click();
    await page.waitForTimeout(11850);

    const finalPhase = await page.evaluate(
      () => document.getElementById("viewportFrame")?.dataset.hybridPhase ?? "",
    );
    expect(finalPhase).toBe("listen_feedback");

    const video = page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(saved, path.join(OUT_VIDEO_DIR, "hybrid-demo-mobile-390x844.webm"));
    }

    const mobileSnap = await browser.newPage({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 390, height: 844 },
    });
    await mobileSnap.goto("/tutor-hybrid-preview.html?viewport=mobile", {
      waitUntil: "networkidle",
    });
    await waitForHybridReady(mobileSnap);
    await mobileSnap.evaluate(() => {
      (window as unknown as { __HYBRID_JUMP__?: (t: number) => void }).__HYBRID_JUMP__?.(4.75);
    });
    await mobileSnap.waitForTimeout(80);
    await mobileSnap
      .locator("#viewportFrame")
      .screenshot({ path: path.join(OUT_VIDEO_DIR, "frame-6-mobile-ik.png") });
    await mobileSnap.close();
  });

  test("Live Tutor Session (/tutor/1?previewHybrid=1) mounts Hybrid Stage cleanly", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5175",
      viewport: { width: 1280, height: 860 },
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/tutor/1?code=clase&slot=1&previewHybrid=1", { waitUntil: "networkidle" });
    const stage = page.locator("[data-tutor-hybrid-stage]");
    await expect(stage).toBeVisible();
    await expect(page.locator("[data-tutor-puppet]")).toHaveAttribute(
      "data-puppet-mode",
      "hybrid-rig-preview",
    );

    const canvasBox = await stage.locator("canvas").boundingBox();
    expect(canvasBox?.width ?? 0).toBeGreaterThan(200);
    expect(canvasBox?.height ?? 0).toBeGreaterThan(150);
    expect(pageErrors).toEqual([]);
    await context.close();
  });
});
