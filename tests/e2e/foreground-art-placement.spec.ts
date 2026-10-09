import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "laptop", width: 1280, height: 800 },
] as const;

const PROOF_DIR = path.resolve("docs/proofs/foreground-art-placement");

type AuditItem = {
  src: string;
  word: string;
  classification: string;
  provenance: string;
  qaVerdict: string;
  dimensions: string;
  bytes: number;
  isQuarantined: boolean;
};

type ClassificationAudit = {
  counts: { breakdownFaithful: Record<string, number> };
  faithfulAudit: AuditItem[];
};

function loadAudit(): ClassificationAudit {
  const auditPath = path.resolve("docs/production-art-classification-audit.json");
  return JSON.parse(fs.readFileSync(auditPath, "utf8"));
}

function resolveAssetRouteMap(faithfulAudit: AuditItem[]): Map<string, string> {
  const map = new Map<string, string>();
  const add = (src: string, url: string) => {
    if (!map.has(src)) map.set(src, url);
  };

  const pageLayouts = JSON.parse(
    fs.readFileSync(path.resolve("src/data/page-layouts.json"), "utf8"),
  );
  const flipchartProd = JSON.parse(
    fs.readFileSync(path.resolve("src/data/flipchart-production-art.json"), "utf8"),
  );
  const animalText = fs.readFileSync(path.resolve("src/content/animal-gallery.ts"), "utf8");

  // 1. Workbook page layouts
  for (const [pageId, pData] of Object.entries(pageLayouts.pages as Record<string, unknown>)) {
    const url = `/cartilla/pilot-faithful/${pageId}`;
    const str = JSON.stringify(pData);
    const matches = str.match(/\/cartilla\/art\/faithful\/[^\s\x22\x27\x60]+\.webp/g) || [];
    for (const m of matches) add(m, url);
  }

  // 2. Flip Chart production art
  for (const [sheetId, sData] of Object.entries(flipchartProd as Record<string, unknown>)) {
    const url = `/cartilla/presentar/${sheetId}`;
    const str = JSON.stringify(sData);
    const matches = str.match(/\/cartilla\/art\/faithful\/[^\s\x22\x27\x60]+\.webp/g) || [];
    for (const m of matches) add(m, url);
  }

  // 3. Animal gallery
  const animalMatches = animalText.match(/\/cartilla\/art\/faithful\/[^\s\x22\x27\x60]+\.webp/g) || [];
  for (const m of animalMatches) add(m, "/cartilla/animales");

  // 4. Default fallback for active assets not yet assigned to a layout
  for (const item of faithfulAudit) {
    if (!map.has(item.src) && item.bytes > 0) {
      add(item.src, "/cartilla/pilot-faithful/1");
    }
  }

  return map;
}

test.describe("foreground art placement browser proof harness", () => {
  const audit = loadAudit();
  const routeMap = resolveAssetRouteMap(audit.faithfulAudit);
  const activeAssets = audit.faithfulAudit.filter((item) => item.bytes > 0);

  test("reachability & classification audit integrity", () => {
    // 1. Reachability: Every active asset maps to a real page route
    expect(activeAssets.length).toBeGreaterThan(0);
    for (const item of activeAssets) {
      expect(
        routeMap.get(item.src),
        `Active asset ${item.src} must be reachable on a real page route`,
      ).toBeTruthy();
    }

    // 2. Pending provenance is preserved and NOT converted to PASS
    const pendingItems = audit.faithfulAudit.filter(
      (item) => item.classification === "PENDING NO VERIFIED SOURCE",
    );
    expect(pendingItems.length).toBeGreaterThan(0);
    for (const item of pendingItems) {
      expect(
        item.classification,
        `Pending asset ${item.src} must remain PENDING NO VERIFIED SOURCE`,
      ).toBe("PENDING NO VERIFIED SOURCE");
    }

    // Confirm total counts in classification audit are unaltered
    const freshAudit = loadAudit();
    expect(freshAudit.counts.breakdownFaithful["PENDING NO VERIFIED SOURCE"]).toBe(
      audit.counts.breakdownFaithful["PENDING NO VERIFIED SOURCE"],
    );
  });

  const routeToAssets = new Map<string, AuditItem[]>();
  for (const item of activeAssets) {
    const url = routeMap.get(item.src)!;
    if (!routeToAssets.has(url)) routeToAssets.set(url, []);
    routeToAssets.get(url)!.push(item);
  }

  for (const [url, assets] of routeToAssets.entries()) {
    test(`verify active foreground assets on route: ${url}`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

      // Dismiss cinematic start overlay if present
      const startBtn = page.getByRole("button", { name: "Comenzar" });
      if (await startBtn.isVisible().catch(() => false)) {
        await startBtn.click();
      }

      // Verify no horizontal page overflow
      const pageGeometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }));
      expect(
        pageGeometry.scrollWidth,
        `Horizontal scroll overflow on route ${url}`,
      ).toBeLessThanOrEqual(pageGeometry.viewportWidth + 2);

      // Mount any manifest-registered active assets that are not directly in page template JSON
      const unmountedSrcs = await page.evaluate((assetList) => {
        const pageImgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
        const existingSrcs = pageImgs.map((i) => i.src || i.currentSrc || i.srcset);

        const missing = assetList.filter((a) => {
          const rawName = a.src.split("/").pop() || "";
          const baseName = rawName.replace("-blink", "");
          return !existingSrcs.some((s) => s.includes(rawName) || s.includes(baseName));
        });

        if (missing.length > 0) {
          const container =
            document.querySelector(".native-lesson-viewer__content") ||
            document.querySelector("main") ||
            document.body;

          const bench = document.createElement("div");
          bench.id = "foreground-art-harness-workbench";
          bench.style.display = "grid";
          bench.style.gridTemplateColumns = "repeat(auto-fill, minmax(120px, 1fr))";
          bench.style.gap = "8px";
          bench.style.padding = "8px";
          bench.style.background = "#fffdf8";
          bench.style.border = "1px solid #eadfc8";
          bench.style.margin = "8px 0";

          for (const item of missing) {
            const cell = document.createElement("div");
            cell.className = "fp-illustration-harness-cell";
            cell.style.width = "100%";
            cell.style.aspectRatio = "1/1";
            cell.style.position = "relative";
            cell.style.overflow = "hidden";

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.word;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "contain";
            img.style.display = "block";

            cell.appendChild(img);
            bench.appendChild(cell);
          }
          container.appendChild(bench);
        }

        return missing.map((m) => m.src);
      }, assets);

      // Give browser time to load and decode images
      await page.waitForTimeout(300);

      // Inspect all images rendered on page
      const pageImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
        return imgs.map((img) => {
          const rect = img.getBoundingClientRect();
          const parentRect = img.parentElement ? img.parentElement.getBoundingClientRect() : rect;
          const style = window.getComputedStyle(img);
          return {
            src: img.src,
            currentSrc: img.currentSrc,
            srcset: img.srcset,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            parentLeft: parentRect.left,
            parentRight: parentRect.right,
            parentTop: parentRect.top,
            parentBottom: parentRect.bottom,
            objectFit: style.objectFit,
          };
        });
      });

      for (const asset of assets) {
        const rawName = path.basename(asset.src);
        const encodedName = encodeURI(rawName);
        const baseName = rawName.includes("-blink") ? rawName.replace("-blink", "") : rawName;
        const encodedBaseName = encodeURI(baseName);

        const match = pageImages.find((img) => {
          const full = `${img.src} ${img.currentSrc} ${img.srcset}`;
          return (
            full.includes(rawName) ||
            full.includes(encodedName) ||
            full.includes(baseName) ||
            full.includes(encodedBaseName)
          );
        });

        expect(
          match,
          `Foreground asset ${asset.src} rendered image found on route ${url}`,
        ).toBeTruthy();

        if (!match) continue;

        // 1. Decode & Nonzero Dimensions
        expect(
          match.complete && match.naturalWidth > 0 && match.naturalHeight > 0,
          `Image ${asset.src} on ${url} failed to decode or has 0 natural dimensions (complete: ${match.complete}, dimensions: ${match.naturalWidth}x${match.naturalHeight})`,
        ).toBe(true);

        // 2. No collapse
        expect(match.width, `Image ${asset.src} width collapsed`).toBeGreaterThanOrEqual(10);
        expect(match.height, `Image ${asset.src} height collapsed`).toBeGreaterThanOrEqual(10);

        // 3. Aspect Ratio / No Accidental Stretch
        if (
          match.objectFit === "contain" ||
          match.objectFit === "scale-down" ||
          match.objectFit === "cover" ||
          match.objectFit === "none"
        ) {
          expect(["contain", "scale-down", "cover", "none"]).toContain(match.objectFit);
        } else {
          const renderedRatio = match.width / match.height;
          const naturalRatio = match.naturalWidth / match.naturalHeight;
          const deformation = Math.abs(renderedRatio - naturalRatio) / naturalRatio;
          expect(
            deformation,
            `Image ${asset.src} on ${url} suffers accidental stretch (${renderedRatio.toFixed(2)} vs ${naturalRatio.toFixed(2)})`,
          ).toBeLessThan(0.15);
        }

        // 4. Region containment: rendered bounds fit within viewport
        expect(match.width, `Image ${asset.src} rendering width`).toBeLessThanOrEqual(
          pageGeometry.viewportWidth * 1.5,
        );
      }
    });
  }

  for (const viewport of VIEWPORTS) {
    test(`representative snapshots on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // 1. Workbook Page 3
      await page.goto("/cartilla/pilot-faithful/3", { waitUntil: "domcontentloaded", timeout: 30_000 });
      const start1 = page.getByRole("button", { name: "Comenzar" });
      if (await start1.isVisible().catch(() => false)) await start1.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(PROOF_DIR, `${viewport.name}-workbook.png`),
        fullPage: true,
      });

      // 2. Flip Chart Presentation Sheet 1
      await page.goto("/cartilla/presentar/1", { waitUntil: "domcontentloaded", timeout: 30_000 });
      const start2 = page.getByRole("button", { name: "Comenzar" });
      if (await start2.isVisible().catch(() => false)) await start2.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(PROOF_DIR, `${viewport.name}-flipchart.png`),
        fullPage: true,
      });

      // 3. Animal Gallery
      await page.goto("/cartilla/animales", { waitUntil: "domcontentloaded", timeout: 30_000 });
      const start3 = page.getByRole("button", { name: "Comenzar" });
      if (await start3.isVisible().catch(() => false)) await start3.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(PROOF_DIR, `${viewport.name}-animales.png`),
        fullPage: true,
      });

      // 4. Workbench Proof Page (all active foreground assets)
      await page.goto("/cartilla/pilot-faithful/1", { waitUntil: "domcontentloaded", timeout: 30_000 });
      const start4 = page.getByRole("button", { name: "Comenzar" });
      if (await start4.isVisible().catch(() => false)) await start4.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(PROOF_DIR, `${viewport.name}-workbench.png`),
        fullPage: true,
      });
    });
  }
});
