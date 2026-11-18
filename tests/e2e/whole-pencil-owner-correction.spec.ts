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
      const pencilShape = cursor.locator("svg.contract-pencil-cursor__svg .workbook-pencil__shape");

      if (!device.touch) {
        const stage = page.locator(".native-lesson-viewer__content");
        const sb = (await stage.boundingBox())!;
        await page.mouse.move(sb.x + sb.width * 0.25, sb.y + sb.height * 0.25);
        await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
        await expect(cursor).toHaveAttribute("data-pencil-pose", "hd-tip");
        const meta = await cursor.evaluate((el) => {
          const svg = el.querySelector("svg.contract-pencil-cursor__svg");
          return {
            hasImg: !!el.querySelector("img"),
            hasSvg: !!svg,
            overflow: svg?.getAttribute("overflow"),
            hasText: !!svg?.querySelector("text"),
            hasHB: (svg?.textContent ?? "").includes("HB"),
            hasMask: !!svg?.querySelector("mask"),
            parts: ["lead", "wood", "lacq", "metal", "eraser"].every(
              (p) => !!svg?.querySelector(`linearGradient[id$="-${p}"]`),
            ),
          };
        });
        expect(meta).toEqual({
          hasImg: false,
          hasSvg: true,
          overflow: "visible",
          hasText: false,
          hasHB: false,
          hasMask: false,
          parts: true,
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
      const drawBox = await pencilShape.boundingBox();
      expect(drawBox).not.toBeNull();
      expect(drawBox!.width).toBeGreaterThanOrEqual(device.touch ? 120 : 180);
      expect(drawBox!.x).toBeGreaterThanOrEqual(0);
      expect(drawBox!.y).toBeGreaterThanOrEqual(0);
      if (!device.touch) {
        expect(drawBox!.x + drawBox!.width).toBeLessThanOrEqual(device.width);
        expect(drawBox!.y + drawBox!.height).toBeLessThanOrEqual(device.height);
      }
      await page.screenshot({ path: info.outputPath("whole-pencil.png") });

      // Wait for the EXACT SAME single pencil to flip 180° onto its back pink eraser dome + 12 crumbs
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

      // Size consistency: erasing pencil is the EXACT SAME single physical pencil (no 4× giant replacement)
      const eraseBox = await eraser.boundingBox();
      expect(eraseBox).not.toBeNull();
      expect(Math.abs(eraseBox!.width - drawBox!.width) / drawBox!.width).toBeLessThan(0.15);
      expect(Math.abs(eraseBox!.height - drawBox!.height) / drawBox!.height).toBeLessThan(0.15);
      await page.screenshot({ path: info.outputPath("hd-eraser.png") });

      // After erasing finishes, mark is cleared and cursor returns to graphite tip pose
      await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 12000 });
      await expect(cursor).toHaveAttribute("data-tool", "pencil", { timeout: 5000 });
    });
  });
}
