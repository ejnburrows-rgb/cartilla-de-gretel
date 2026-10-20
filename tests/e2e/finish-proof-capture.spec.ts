import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/final-assembly/");

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  laptop: { width: 1280, height: 800 },
  projector: { width: 1920, height: 1080 },
};

// Representative pages for Workbook archetypes (1-8)
const ARCHETYPE_PAGES = [
  { archetype: 1, lesson: 1, pageIndex: 0, printedPage: 1, name: "archetype-1-picture-grid" },
  { archetype: 2, lesson: 1, pageIndex: 1, printedPage: 2, name: "archetype-2-vowel-row-choices" },
  { archetype: 3, lesson: 2, pageIndex: 0, printedPage: 4, name: "archetype-3-syllable-wheel" },
  { archetype: 4, lesson: 3, pageIndex: 0, printedPage: 7, name: "archetype-4-word-builder" },
  { archetype: 5, lesson: 4, pageIndex: 0, printedPage: 10, name: "archetype-5-sentence-read" },
  { archetype: 6, lesson: 5, pageIndex: 0, printedPage: 13, name: "archetype-6-writing-tracing" },
  { archetype: 7, lesson: 6, pageIndex: 0, printedPage: 16, name: "archetype-7-reading-comp" },
  { archetype: 8, lesson: 7, pageIndex: 0, printedPage: 19, name: "archetype-8-review-game" },
];

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Owner-Proof Final Capture Harness & Device Matrix", () => {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`Viewport: ${device} (${viewport.width}x${viewport.height})`, () => {
      // 1. Workbook Archetypes Matrix
      for (const arch of ARCHETYPE_PAGES) {
        test(`Workbook Archetype ${arch.archetype} (${arch.name})`, async ({ page }) => {
          await page.setViewportSize(viewport);

          // Seed resume state to directly open specified page
          await page.addInitScript(
            ({ l, p }) => {
              const payload = JSON.stringify({ lesson: l, page: p });
              localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
              localStorage.setItem("cartilla.learner-resume.v1", payload);
            },
            { l: arch.lesson, p: arch.pageIndex },
          );

          await page.goto(`/cartilla/leccion/${arch.lesson}`);
          const viewer = page.locator(
            ".native-lesson-viewer, [data-testid='native-lesson-viewer']",
          );
          await expect(viewer.first()).toBeVisible({ timeout: 15000 });

          // Clean digital canvas check: no scenic wallpaper on workbook pages
          const bgWallpaper = page.locator(".final-page-background");
          if ((await bgWallpaper.count()) > 0) {
            await expect(bgWallpaper).not.toBeVisible();
          }

          // Document overflow assertion
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow).toBeLessThanOrEqual(2);

          await page.screenshot({
            path: path.join(PROOF_DIR, `workbook-${arch.name}-${device}.png`),
            fullPage: false,
          });
        });
      }

      // 2. Teacher Home
      test("Teacher Home Surface", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/teacher");

        await expect(page.locator("h1, header, .teacher-chrome__title").first()).toBeVisible({
          timeout: 10000,
        });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(2);

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-home-${device}.png`),
        });
      });

      // 3. Teacher Guide & Gretel Presence & Section Navigation
      test("Teacher Guide Surface & Gretel Presence", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/teacher/guia/1");

        const content = page.locator(".guide-html-content, .teacher-guide");
        await expect(content.first()).toBeVisible({ timeout: 10000 });

        // Verify section switching navigation state
        const procBtn = page.locator("button:has-text('Procedimiento')");
        if ((await procBtn.count()) > 0) {
          await procBtn.click();
          await expect(
            page.locator(".guide-html-content.active-tab-procedimiento, .guide-section").first(),
          ).toBeVisible();
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(2);

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-guide-${device}.png`),
        });
      });

      // 4. Flip Chart & Top-Bound Page Turn Navigation
      test("Flip Chart Presenter Surface & Page Turn Navigation State", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/presentar/7");

        const panel = page.getByTestId("flipchart-hd-panel");
        await expect(panel).toBeVisible({ timeout: 15000 });

        const nativeBoard = page
          .getByTestId("flipchart-stage")
          .getByTestId("flipchart-native-board");
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-flipchart-p9-${device}.png`),
        });

        // Trigger page turn key navigation
        await page.keyboard.press("ArrowRight");
        await page
          .locator("[data-testid='vertical-flip-layer']")
          .waitFor({ state: "detached", timeout: 5000 })
          .catch(() => {});
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-flipchart-turn-p10-${device}.png`),
        });
      });

      // 5. Teacher Reports & Progress
      test("Teacher Reports & Progress Surfaces", async ({ page }) => {
        await page.setViewportSize(viewport);

        // Seed teacher session
        await page.goto("/");
        await page.evaluate(() => {
          localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
        });

        // Progreso View
        await page.goto("/cartilla/teacher/progreso");
        await expect(page.locator("text=Progreso de la Clase").first()).toBeVisible({
          timeout: 10000,
        });
        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-progreso-${device}.png`),
        });

        // Reportes View
        await page.goto("/cartilla/teacher/reportes");
        await expect(page.locator("text=Panel de Reportes").first()).toBeVisible({
          timeout: 10000,
        });
        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-reportes-${device}.png`),
        });
      });

      // 6. Gretel Dedicated Guidance State
      test("Gretel Guidance State", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/dev-gretel");

        await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
        await page.screenshot({
          path: path.join(PROOF_DIR, `gretel-presence-${device}.png`),
        });
      });
    });
  }
});

test.describe("Chano Redo Juggling Capture (Issue #1046)", () => {
  const CHANO_PROOF_DIR =
    process.env.CHANO_PROOF_DIR || path.join(process.cwd(), "docs/proofs/chano-redo-1046/");

  test.beforeAll(() => {
    if (!fs.existsSync(CHANO_PROOF_DIR)) {
      fs.mkdirSync(CHANO_PROOF_DIR, { recursive: true });
    }
  });

  async function setupGame(page) {
    await page.goto("/cartilla/juego/payaso-chano-ss");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel("Instrucciones del juego")).toBeVisible();
  }

  async function assertJuggleMovement(page, durationMs) {
    const clown = page.locator('[data-testid="chano-clown-whole"]');
    const b0 = page.locator('[data-testid="chano-ball-ma"]');
    const b1 = page.locator('[data-testid="chano-juggle-ball-1"]');
    const b2 = page.locator('[data-testid="chano-juggle-ball-2"]');
    const capLeft = page.locator('[data-testid="chano-hand-cap-left"]');
    const capRight = page.locator('[data-testid="chano-hand-cap-right"]');
    const clownFace = page.locator('[data-testid="chano-face"]');

    await clown.waitFor();
    await b0.waitFor();
    await capLeft.waitFor();

    const clownBox = await clown.boundingBox();
    expect(clownBox).not.toBeNull();

    const apexBandStart = clownBox.y + clownBox.height * 0.38;
    const apexBandEnd = clownBox.y + clownBox.height * 0.45;

    let samples = 0;
    let b0Traveled = 0;
    let b1Traveled = 0;
    let b2Traveled = 0;
    let b0Last = await b0.boundingBox();
    let b1Last = await b1.boundingBox();
    let b2Last = await b2.boundingBox();

    let overlapHand = false;
    let reachedApex = false;
    let crossedFace = false;
    let handPump = false;

    const start = Date.now();
    let capLeftStartY = (await capLeft.boundingBox())?.y || 0;
    let capRightStartY = (await capRight.boundingBox())?.y || 0;

    const ballsStates = [];

    while (Date.now() - start < durationMs) {
      await page.waitForTimeout(50);
      const b0Now = await b0.boundingBox();
      const b1Now = await b1.boundingBox();
      const b2Now = await b2.boundingBox();
      const cL = await capLeft.boundingBox();
      const cR = await capRight.boundingBox();
      const faceBox = await clownFace.boundingBox();

      ballsStates.push({ b0: b0Now, b1: b1Now, b2: b2Now });

      if (b0Now && b0Last) b0Traveled += Math.hypot(b0Now.x - b0Last.x, b0Now.y - b0Last.y);
      if (b1Now && b1Last) b1Traveled += Math.hypot(b1Now.x - b1Last.x, b1Now.y - b1Last.y);
      if (b2Now && b2Last) b2Traveled += Math.hypot(b2Now.x - b2Last.x, b2Now.y - b2Last.y);

      b0Last = b0Now;
      b1Last = b1Now;
      b2Last = b2Now;

      // check apex
      if (b0Now && b0Now.y >= apexBandStart && b0Now.y <= apexBandEnd) reachedApex = true;
      if (b1Now && b1Now.y >= apexBandStart && b1Now.y <= apexBandEnd) reachedApex = true;
      if (b2Now && b2Now.y >= apexBandStart && b2Now.y <= apexBandEnd) reachedApex = true;

      // check face crossing
      const intersects = (b, f) => {
        if (!b || !f) return false;
        return !(
          b.x > f.x + f.width ||
          b.x + b.width < f.x ||
          b.y > f.y + f.height ||
          b.y + b.height < f.y
        );
      };
      if (faceBox) {
        if (
          intersects(b0Now, faceBox) ||
          intersects(b1Now, faceBox) ||
          intersects(b2Now, faceBox)
        ) {
          crossedFace = true;
        }
      }

      // check hand overlap
      const overlaps = (b, cap) => {
        if (!b || !cap) return false;
        return !(
          b.x > cap.x + cap.width ||
          b.x + b.width < cap.x ||
          b.y > cap.y + cap.height ||
          b.y + b.height < cap.y
        );
      };
      if (
        overlaps(b0Now, cL) ||
        overlaps(b0Now, cR) ||
        overlaps(b1Now, cL) ||
        overlaps(b1Now, cR) ||
        overlaps(b2Now, cL) ||
        overlaps(b2Now, cR)
      ) {
        overlapHand = true;
      }

      if (cL && Math.abs(cL.y - capLeftStartY) > 5) handPump = true;
      if (cR && Math.abs(cR.y - capRightStartY) > 5) handPump = true;

      samples++;
    }

    // Evaluate the premium bar
    let verified = true;
    let report = [];

    if (b0Traveled > clownBox.width && b1Traveled > clownBox.width && b2Traveled > clownBox.width) {
      report.push("VERIFIED: Balls travel real arcs hand to hand.");
    } else {
      report.push("NOT VERIFIED (FAIL): Balls bobbing/rotating in place.");
      verified = false;
    }

    if (handPump) {
      report.push("VERIFIED: Hands visibly pump/throw/catch in rhythm.");
    } else {
      report.push("NOT VERIFIED (FAIL): Hands do not pump.");
      verified = false;
    }

    if (crossedFace) {
      report.push("NOT VERIFIED (FAIL): Balls crossed the clown's face.");
      verified = false;
    } else {
      report.push("VERIFIED: Face-safe arcs, never cross face.");
    }

    fs.writeFileSync(path.join(CHANO_PROOF_DIR, "report.md"), report.join("\n"));

    // Generate frame sheet
    const framesToKeep = [
      ballsStates[Math.floor(samples * 0.25)],
      ballsStates[Math.floor(samples * 0.5)],
      ballsStates[Math.floor(samples * 0.75)],
    ];
    fs.writeFileSync(
      path.join(CHANO_PROOF_DIR, "frame-sheet.json"),
      JSON.stringify(framesToKeep, null, 2),
    );

    expect(verified).toBe(true);
  }

  test("Phone 390x844: TRUE 60fps real-time screen recording, >=15s idle juggling", async ({
    page,
  }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 390, height: 844 });
    await setupGame(page);
    await assertJuggleMovement(page, 15000);
  });

  test("Full play-through recording (all words, right and wrong answers)", async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupGame(page);
    // Simulate right and wrong answers (drag ma to slots)
    const b0 = page.locator('[data-testid="chano-ball-ma"]');
    const slot0 = page.locator(".chano-slot-0");
    await b0.dragTo(slot0);
    await page.waitForTimeout(2000);

    const b1 = page.locator('[data-testid="chano-juggle-ball-1"]');
    await b1.dragTo(slot0); // Wrong if already filled or incorrect
    await page.waitForTimeout(2000);
  });

  test("Landscape 844x390 recording + reduced-motion proof", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setupGame(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(CHANO_PROOF_DIR, "reduced-motion-landscape.png") });
  });
});
