import { expect, test } from "@playwright/test";

test.use({ video: "on" });

for (const device of [
  { name: "phone", width: 390, height: 844, touch: true },
  { name: "desktop", width: 1366, height: 768, touch: false },
]) {
  test.describe(`${device.name}: unified single HD classic wooden pencil & back eraser`, () => {
    test.use({
      viewport: { width: device.width, height: device.height },
      hasTouch: device.touch,
      isMobile: device.touch,
    });

    test("single classic wooden pencil draws wrong answer, flips 180° onto back pink eraser + 12 crumbs to rub it out", async ({
      page,
    }, info) => {
      await page.goto("/cartilla/leccion/3?cursor=contract", {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });

      const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
      const photoTip = cursor.locator('[data-testid="contract-pencil-photo-tip"]');

      if (!device.touch) {
        const stage = page.locator(".native-lesson-viewer__content");
        const sb = (await stage.boundingBox())!;
        await page.mouse.move(sb.x + sb.width * 0.25, sb.y + sb.height * 0.25);
        await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
        await expect(cursor).toHaveAttribute("data-pencil-pose", "hd-tip");
        const meta = await cursor.evaluate((el) => {
          const photoSvg = el.querySelector<SVGSVGElement>('[data-testid="contract-pencil-photo-tip"]');
          const headImg = el.querySelector<SVGImageElement>('[data-testid="contract-pencil-photo-head"]');
          const barrel = el.querySelector<SVGRectElement>('[data-testid="contract-pencil-barrel-extension"]');
          const svg = el.querySelector("svg.contract-pencil-cursor__svg");
          const barrelRect = barrel?.getBoundingClientRect();
          return {
            hasPhotoSvg: !!photoSvg && getComputedStyle(photoSvg).display !== "none",
            photoOverflow: photoSvg?.getAttribute("overflow"),
            hasPhotoHead: !!headImg?.getAttribute("href")?.startsWith("data:image/webp;base64,"),
            barrelReachesEdge:
              !!barrelRect &&
              (barrelRect.right >= window.innerWidth - 1 ||
                barrelRect.bottom >= window.innerHeight - 1),
            hasSvg: !!svg,
            overflow: svg?.getAttribute("overflow"),
            hasText: !!svg?.querySelector("text"),
            hasHB: (svg?.textContent ?? "").includes("HB"),
            hasMask: !!svg?.querySelector("mask"),
          };
        });
        expect(meta).toEqual({
          hasPhotoSvg: true,
          photoOverflow: "visible",
          hasPhotoHead: true,
          barrelReachesEdge: true,
          hasSvg: true,
          overflow: "visible",
          hasText: false,
          hasHB: false,
          hasMask: false,
        });
      }

      const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
      await wrong.scrollIntoViewIfNeeded();
      if (device.touch) await wrong.tap();
      else await wrong.click();

      await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
      await page.waitForTimeout(700);
      // Zero separate flight pencil in contract mode — only ONE physical pencil exists
      await expect(page.locator(".workbook-pencil-flight")).toHaveCount(0);
      // Regression lock: contract non-scaling-stroke segments must never carry pathLength/dasharray
      const dashedSegments = await page.evaluate(() =>
        [...document.querySelectorAll(".workbook-pencil-mark__contract-strokes path")].filter(
          (p) => p.hasAttribute("pathLength") || p.hasAttribute("stroke-dasharray"),
        ).length,
      );
      expect(dashedSegments).toBe(0);
      const drawBox = await photoTip.boundingBox();
      expect(drawBox).not.toBeNull();
      expect(drawBox!.width).toBeGreaterThanOrEqual(device.touch ? 140 : 200);
      expect(drawBox!.x).toBeGreaterThanOrEqual(0);
      expect(drawBox!.y).toBeGreaterThanOrEqual(0);
      await page.screenshot({ path: info.outputPath("whole-pencil.png") });

      // Wait for the eraser to rub out the wrong mark with 12 crumbs
      const eraser = cursor.locator(".workbook-pencil--eraser .workbook-pencil__eraser-hd");
      await expect(eraser).toBeVisible({ timeout: 10000 });
      await expect(page.locator(".workbook-pencil-flight")).toHaveCount(0);
      await expect(page.locator('[id$="-eraser-mask"]')).toHaveCount(0);
      await expect(page.locator(".workbook-pencil__crumbs > g")).toHaveCount(12);
      // Sequential X rub-out mask: the two diagonals have distinct rub windows matching eraser motion
      const rubKeyTimes = await page.evaluate(() =>
        [...document.querySelectorAll('mask[id$="-rub"] path animate')].map((a) =>
          a.getAttribute("keyTimes"),
        ),
      );
      expect(rubKeyTimes).toHaveLength(2);
      expect(rubKeyTimes[0]).not.toBe(rubKeyTimes[1]);
      // Let the 450ms flip finish and rub well into Diagonal 2 so pink crumbs & sequential rub are clearly visible
      await page.waitForTimeout(1050);
      const flipTransform = await cursor
        .locator('[data-testid="contract-pencil-flip"]')
        .getAttribute("transform");
      expect(flipTransform).toContain("rotate(180.00");

      const eraseBox = await eraser.boundingBox();
      expect(eraseBox).not.toBeNull();
      expect(eraseBox!.width).toBeGreaterThan(80);
      expect(eraseBox!.height).toBeGreaterThan(60);
      await page.screenshot({ path: info.outputPath("hd-eraser.png") });

      // After erasing finishes, mark is cleared and cursor returns to graphite tip pose
      await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 12000 });
      await expect(cursor).toHaveAttribute("data-tool", "pencil", { timeout: 5000 });
    });

    test("top two pencil cursor prototypes (/revision): @image1 close-up pencil in Prototype B orientation draws continuous Circle and sequential X with zero offset", async ({
      page,
    }, info) => {
      await page.goto("/revision", { waitUntil: "domcontentloaded" });
      const topTwo = page.getByTestId("top-two-pencil-prototypes");
      await expect(topTwo).toBeVisible({ timeout: 30000 });

      // 1. Prototype 1 — Circle Action
      const circleTrigger = page.getByTestId("prototype-circle-trigger");
      await circleTrigger.evaluate((el) => el.scrollIntoView({ block: "center" }));
      if (device.touch) await circleTrigger.tap();
      else await circleTrigger.click();

      const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
      const photoTip = cursor.locator('[data-testid="contract-pencil-photo-tip"]');
      await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });

      // Verify @image1 600×497 photographic asset loads synchronously with (0,0) top-left hotspot
      // and extended yellow barrel reaches past viewport edges with zero cut-off gap
      const photoMeta = await photoTip.evaluate((svgEl: SVGSVGElement) => {
        const head = svgEl.querySelector<SVGImageElement>('[data-testid="contract-pencil-photo-head"]');
        const barrel = svgEl.querySelector<SVGRectElement>(
          '[data-testid="contract-pencil-barrel-extension"]',
        );
        const barrelRect = barrel?.getBoundingClientRect();
        return {
          viewBox: svgEl.getAttribute("viewBox"),
          overflow: svgEl.getAttribute("overflow"),
          hasHeadWebp: !!head?.getAttribute("href")?.startsWith("data:image/webp;base64,"),
          transformOrigin: svgEl.style.transformOrigin,
          barrelReachesEdge:
            !!barrelRect &&
            (barrelRect.right >= window.innerWidth - 1 ||
              barrelRect.bottom >= window.innerHeight - 1),
        };
      });
      expect(photoMeta).toEqual({
        viewBox: "0 0 600 497",
        overflow: "visible",
        hasHeadWebp: true,
        transformOrigin: "0px 0px",
        barrelReachesEdge: true,
      });
      await page.waitForTimeout(1150);
      const circleMaskMeta = await page.evaluate(() => {
        const maskPath = document.querySelector<SVGPathElement>(
          '[data-testid="prototype-circle-card"] [data-contract-mask-path="0"]',
        );
        return {
          linecap: maskPath?.getAttribute("stroke-linecap"),
          dashoffset: Number(maskPath?.getAttribute("stroke-dashoffset") ?? "100"),
        };
      });
      expect(circleMaskMeta.linecap).toBe("butt");
      expect(circleMaskMeta.dashoffset).toBeGreaterThan(5);
      expect(circleMaskMeta.dashoffset).toBeLessThan(95);

      const circleTipBox = (await photoTip.boundingBox())!;
      expect(circleTipBox).not.toBeNull();
      expect(circleTipBox.width).toBeGreaterThanOrEqual(device.touch ? 150 : 220);
      await page.screenshot({ path: info.outputPath("top-prototype-1-circle-drawing.png") });

      await expect(circleTrigger).toHaveAttribute("aria-pressed", "true", { timeout: 8000 });
      await page.screenshot({ path: info.outputPath("top-prototype-1-circle-done.png") });

      // 2. Prototype 2 — X Action (Diagonal 1 then Diagonal 2 sequentially)
      const xTrigger = page.getByTestId("prototype-x-trigger");
      await xTrigger.evaluate((el) => el.scrollIntoView({ block: "center" }));
      if (device.touch) await xTrigger.tap();
      else await xTrigger.click();

      await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
      // Mid Diagonal 1 (~700ms after click: 300ms approach + 400ms into 850ms stroke 0)
      await page.waitForTimeout(700);
      const xDiag1Meta = await page.evaluate(() => {
        const m0 = document.querySelector<SVGPathElement>(
          '[data-testid="prototype-x-card"] [data-contract-mask-path="0"]',
        );
        const m1 = document.querySelector<SVGPathElement>(
          '[data-testid="prototype-x-card"] [data-contract-mask-path="1"]',
        );
        return {
          linecap0: m0?.getAttribute("stroke-linecap"),
          offset0: Number(m0?.getAttribute("stroke-dashoffset") ?? "100"),
          offset1: Number(m1?.getAttribute("stroke-dashoffset") ?? "100"),
        };
      });
      expect(xDiag1Meta.linecap0).toBe("butt");
      expect(xDiag1Meta.offset0).toBeLessThan(95);
      expect(xDiag1Meta.offset1).toBe(100);
      const xTipBox1 = (await photoTip.boundingBox())!;
      // Keep the exact same close-up scale throughout both actions
      expect(Math.abs(xTipBox1.width - circleTipBox.width)).toBeLessThanOrEqual(4);
      expect(Math.abs(xTipBox1.height - circleTipBox.height)).toBeLessThanOrEqual(4);
      await page.screenshot({ path: info.outputPath("top-prototype-2-x-diag1.png") });

      // Mid Diagonal 2 (~1100ms later: ~1800ms total -> inside stroke 1 [1410..2260ms])
      await page.waitForTimeout(1100);
      const xDiag2Meta = await page.evaluate(() => {
        const m0 = document.querySelector<SVGPathElement>(
          '[data-testid="prototype-x-card"] [data-contract-mask-path="0"]',
        );
        const m1 = document.querySelector<SVGPathElement>(
          '[data-testid="prototype-x-card"] [data-contract-mask-path="1"]',
        );
        return {
          offset0: Number(m0?.getAttribute("stroke-dashoffset") ?? "100"),
          offset1: Number(m1?.getAttribute("stroke-dashoffset") ?? "100"),
        };
      });
      expect(xDiag2Meta.offset0).toBe(0);
      expect(xDiag2Meta.offset1).toBeLessThan(95);
      await page.screenshot({ path: info.outputPath("top-prototype-2-x-diag2.png") });

      await expect(xTrigger).toHaveAttribute("aria-pressed", "true", { timeout: 8000 });
      await page.screenshot({ path: info.outputPath("top-prototype-2-x-done.png") });
    });
  });
}
