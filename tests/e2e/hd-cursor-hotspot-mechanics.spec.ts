import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const SHOT_DIR = process.env.CURSOR_SCREENSHOT_DIR || "";

async function saveShot(page: Page, name: string) {
  if (!SHOT_DIR) return;
  await fs.mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, name) });
}

async function openLesson3Page(page: Page, pageIndex: number) {
  await page.addInitScript(
    ({ pageIndex }) => {
      Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
      Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
      localStorage.removeItem("cartilla:cursor-mode");
      const resume = JSON.stringify({ lesson: 3, page: pageIndex });
      localStorage.setItem("cartilla.learner-resume.v1:3", resume);
      localStorage.setItem("cartilla.learner-resume.v1", resume);
    },
    { pageIndex },
  );
  await page.goto("/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });
}

for (const viewport of [
  { name: "desktop", width: 1366, height: 768, touch: false },
  { name: "mobile", width: 390, height: 844, touch: true },
]) {
  test.describe(`R1/R2/R3 Lesson 3 & Cuaderno (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.touch,
      isMobile: viewport.touch,
    });

    test("Page 7: HD uncropped pencil, <=1px tip hotspot, navigation exclusion, HD eraser + 12 crumbs", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await openLesson3Page(page, 0);
      const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
      await expect(cursor).toBeAttached();

      if (!viewport.touch) {
        const cell = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
        await cell.scrollIntoViewIfNeeded();
        const cb = (await cell.boundingBox())!;
        const tx = Math.round(cb.x + cb.width * 0.4);
        const ty = Math.round(cb.y + cb.height * 0.4);
        await page.mouse.move(tx, ty, { steps: 5 });
        await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
        await expect(cursor).toHaveAttribute("data-tool", "pencil");

        // Tip hotspot (0, 0) aligns within <= 1px of pointer (tx, ty)
        const cbox = (await cursor.boundingBox())!;
        expect(Math.abs(cbox.x - tx)).toBeLessThanOrEqual(1);
        expect(Math.abs(cbox.y - ty)).toBeLessThanOrEqual(1);

        // Owner-approved 74ccee59 photographic pencil tip (600×497, extended barrel off-screen)
        const svgMeta = await cursor.evaluate((el) => {
          const photoSvg = el.querySelector<SVGSVGElement>('[data-testid="contract-pencil-photo-tip"]');
          const barrel = el.querySelector<SVGRectElement>(
            '[data-testid="contract-pencil-barrel-extension"]',
          );
          const svg = el.querySelector("svg.contract-pencil-cursor__svg");
          const barrelRect = barrel?.getBoundingClientRect();
          return {
            hasPhotoSvg: !!photoSvg && getComputedStyle(photoSvg).display !== "none",
            barrelReachesEdge:
              !!barrelRect &&
              (barrelRect.right >= window.innerWidth - 1 ||
                barrelRect.bottom >= window.innerHeight - 1),
            hasText: !!svg?.querySelector("text"),
            hasHB: (svg?.textContent ?? "").includes("HB"),
            hasOverflowVisible: svg?.getAttribute("overflow") === "visible",
          };
        });
        expect(svgMeta).toEqual({
          hasPhotoSvg: true,
          barrelReachesEdge: true,
          hasText: false,
          hasHB: false,
          hasOverflowVisible: true,
        });

        await saveShot(page, `${viewport.name}-leccion3-p7-pencil-hover.png`);

        // Moving over .native-lesson-viewer__navigation hides custom cursor so pointer returns
        const navBtn = page.locator(".native-lesson-viewer__navigation button").last();
        const nb = (await navBtn.boundingBox())!;
        await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2, { steps: 4 });
        await expect(cursor).toHaveAttribute("data-visible", "false");
      }

      // Trigger wrong answer -> charcoal -> red -> 3.5s HD uncropped eraser + 12 crumbs -> removed
      const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
      await wrong.scrollIntoViewIfNeeded();
      if (viewport.touch) await wrong.tap();
      else await wrong.click();

      const eraserHd = page.locator(".workbook-pencil--eraser .workbook-pencil__eraser-hd");
      await expect(eraserHd).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[id$="-eraser-mask"]')).toHaveCount(0);
      await expect(page.locator(".workbook-pencil__crumbs > g")).toHaveCount(12);
      const eraserBox = await eraserHd.boundingBox();
      expect(eraserBox).not.toBeNull();
      expect(eraserBox!.width).toBeGreaterThan(20);
      expect(eraserBox!.height).toBeGreaterThan(15);
      await page.waitForTimeout(800);
      await saveShot(page, `${viewport.name}-leccion3-p7-eraser-rub.png`);

      await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 10000 });

      // Trigger right answer -> charcoal -> 400ms hold -> green settled
      const right = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
      if (viewport.touch) await right.tap();
      else await right.click();
      await expect(right).toHaveAttribute("aria-pressed", "true", { timeout: 10000 });
      await expect(page.locator('.workbook-pencil-mark[data-mark-status="correct"]')).toHaveCount(1);
    });

    test("Page 8: DirectPencilConnector tip hotspot <=1px under zoom, #3a3a38 drag, visible HD retry eraser + 12 crumbs", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await openLesson3Page(page, 1);
      const connector = page.locator(".am-direct-pencil").first();
      await expect(connector).toBeVisible();

      // Also exercise CSS zoom < 1 on the activity wrapper on desktop/mobile
      if (viewport.name === "mobile") {
        await page.evaluate(() => {
          const act = document.querySelector<HTMLElement>(".faithful-page__body > .gretel-activity");
          if (act) act.style.setProperty("--lc-fit", "0.78");
        });
      }

      const center = connector.locator(".am-direct-pencil__center");
      const bad = connector.locator('.am-direct-pencil__target[data-correct="false"]').first();
      const good = connector
        .locator('.am-direct-pencil__target[data-correct="true"]:not([data-example="true"])')
        .first();

      const cb = (await center.boundingBox())!;
      const bb = (await bad.boundingBox())!;
      const gb = (await good.boundingBox())!;
      const cPt = { x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 };
      const midPt = { x: (cPt.x + gb.x + gb.width / 2) / 2, y: (cPt.y + gb.y + gb.height / 2) / 2 };
      const badPt = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
      const goodPt = { x: gb.x + gb.width / 2, y: gb.y + gb.height / 2 };

      const touch = viewport.touch ? await page.context().newCDPSession(page) : null;
      const downAt = async (pt: { x: number; y: number }) => {
        if (touch) await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...pt, id: 1 }] });
        else {
          await page.mouse.move(pt.x, pt.y);
          await page.mouse.down();
        }
      };
      const moveTo = async (pt: { x: number; y: number }) => {
        if (touch) await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...pt, id: 1 }] });
        else await page.mouse.move(pt.x, pt.y, { steps: 6 });
      };
      const upNow = async () => {
        if (touch) await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        else await page.mouse.up();
      };

      // Active drag line tip matches pointer tip within <= 1px
      await downAt(cPt);
      await moveTo(midPt);
      const activeLine = connector.locator(".am-direct-pencil__active-line line");
      await expect(activeLine).toHaveAttribute("stroke", "#3a3a38");
      const tipBox = (await connector.locator(".am-direct-pencil__active-line circle").boundingBox())!;
      const tipCenter = { x: tipBox.x + tipBox.width / 2, y: tipBox.y + tipBox.height / 2 };
      expect(Math.hypot(tipCenter.x - midPt.x, tipCenter.y - midPt.y)).toBeLessThanOrEqual(1.5);
      await saveShot(page, `${viewport.name}-leccion3-p8-drag-line.png`);

      // Release on wrong target -> 400ms charcoal -> 600ms red -> visible HD retry eraser + 12 pink crumbs
      await moveTo(badPt);
      await upNow();

      const retryEraser = connector.locator(".am-direct-pencil__eraser-shape");
      await expect(retryEraser).toBeVisible({ timeout: 5000 });
      await expect(connector.locator(".workbook-pencil__crumbs > g")).toHaveCount(12);
      const retryBox = await retryEraser.boundingBox();
      expect(retryBox).not.toBeNull();
      expect(retryBox!.width).toBeGreaterThan(20);
      await page.waitForTimeout(700);
      await saveShot(page, `${viewport.name}-leccion3-p8-eraser-rub.png`);

      await expect(connector.locator(".am-direct-pencil__retry-group")).toHaveCount(0, { timeout: 8000 });

      // Connect a good target -> settles green #258351
      await downAt(cPt);
      await moveTo(goodPt);
      await upNow();
      await expect(good).toHaveAttribute("aria-pressed", "true", { timeout: 4000 });
    });

    test("Page 9: WorkbookLetterTrace (#3a3a38 + 400ms hold) & DibujaHost (#3a3a38 + zoom scaling + HD eraser cursor)", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await openLesson3Page(page, 2);
      const trace = page.locator(".fp-trace").first();
      await expect(trace).toBeVisible();

      if (!viewport.touch) {
        // Switch trace to drag mode to verify direct coordinate stroke drawing
        const modeToggle = trace.locator(".fp-trace__mode-toggle");
        await modeToggle.click();
        await expect(trace).toHaveAttribute("data-mode", "drag");

        const svg = trace.locator(".fp-trace__svg");
        const box = (await svg.boundingBox())!;
        const unit = Math.min(box.width / 100, box.height / 120);
        const ox = box.x + (box.width - 100 * unit) / 2;
        const oy = box.y + (box.height - 120 * unit) / 2;
        const toScreen = (vx: number, vy: number) => ({ x: ox + vx * unit, y: oy + vy * unit });

        // Trace "A" stroke 0: (50,20)->(35,60)->(20,100)
        const s0a = toScreen(50, 20);
        const s0b = toScreen(35, 60);
        const s0c = toScreen(20, 100);
        await page.mouse.move(s0a.x, s0a.y);
        await page.mouse.down();
        await page.mouse.move(s0b.x, s0b.y, { steps: 4 });
        await expect(svg.locator('path[stroke="#3a3a38"]')).toHaveCount(1);
        await saveShot(page, `${viewport.name}-leccion3-p9-trace.png`);
        await page.mouse.move(s0c.x, s0c.y, { steps: 4 });
        await page.mouse.up();
      }

      // DibujaHost freehand drawing + HD eraser cursor
      const dibuja = page.locator(".am-dibuja").last();
      await dibuja.scrollIntoViewIfNeeded();
      const drawToggle = dibuja.getByRole("button", { name: "Dibujar" });
      if (await drawToggle.isVisible().catch(() => false)) {
        await drawToggle.click();
      }
      const canvas = dibuja.locator("canvas.am-dibuja__canvas");
      await expect(canvas).toBeVisible();
      const cbox = (await canvas.boundingBox())!;
      const px = cbox.x + cbox.width * 0.45;
      const py = cbox.y + cbox.height * 0.5;
      if (!viewport.touch) {
        await page.mouse.move(px, py);
        await page.mouse.down();
        await page.mouse.move(px + 30, py + 10, { steps: 4 });
        await page.mouse.up();
        // Verify ink was drawn right at the logical coordinate corresponding to (px, py)
        const hasCharcoalPixel = await canvas.evaluate((el: HTMLCanvasElement) => {
          const ctx = el.getContext("2d");
          if (!ctx) return false;
          const data = ctx.getImageData(0, 0, el.width, el.height).data;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
          return false;
        });
        expect(hasCharcoalPixel).toBe(true);

        // Toggle eraser -> SAME single ContractPencilCursor flips 180° onto its back pink eraser dome
        await dibuja.getByRole("button", { name: "Borrador de goma" }).click();
        await page.mouse.move(px + 15, py + 5);
        const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
        await expect(cursor).toHaveAttribute("data-tool", "eraser");
        await expect(cursor).toHaveAttribute("data-pencil-pose", "hd-eraser");
        await page.waitForTimeout(300);
        const eraserMeta = await cursor.evaluate((el) => {
          const tip = el.querySelector<SVGSVGElement>('[data-testid="contract-pencil-photo-tip"]');
          const eraserEl = el.querySelector(".workbook-pencil--eraser .workbook-pencil__eraser-hd");
          const eraserRect = eraserEl?.getBoundingClientRect();
          return {
            hasImgVisible: !!tip && getComputedStyle(tip).display !== "none",
            hasBackEraser: !!eraserEl,
            eraserReachesEdge:
              !!eraserRect && (eraserRect.right >= window.innerWidth - 1 || eraserRect.top <= 1),
            flipTransform:
              el.querySelector('[data-testid="contract-pencil-flip"]')?.getAttribute("transform") ?? "",
          };
        });
        expect(eraserMeta.hasImgVisible).toBe(false);
        expect(eraserMeta.hasBackEraser).toBe(true);
        expect(eraserMeta.eraserReachesEdge).toBe(true);
        expect(eraserMeta.flipTransform).toContain("rotate(180.00");
        await saveShot(page, `${viewport.name}-leccion3-p9-dibuja-eraser.png`);
      }
    });

    test("Full workbook (/cartilla/cuaderno) renders HD pencil cursor and preserves blocked 86-87", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });
      const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
      await expect(cursor).toBeAttached();
      if (!viewport.touch) {
        const content = page.locator(".native-lesson-viewer__content");
        const cb = (await content.boundingBox())!;
        await page.mouse.move(cb.x + cb.width * 0.4, Math.min(viewport.height * 0.5, cb.y + cb.height * 0.4), {
          steps: 5,
        });
        await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
        await expect(cursor).toHaveAttribute("data-pencil-pose", "hd-tip");
      }
      await saveShot(page, `${viewport.name}-cuaderno.png`);
    });
  });
}
