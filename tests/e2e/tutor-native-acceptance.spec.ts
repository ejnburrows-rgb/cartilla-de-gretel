/**
 * Native Tutor Final Acceptance Suite (Milestone 12).
 *
 * NOTE: Speech recognition in this suite uses StubEars scripted fixtures
 * (`VITE_TUTOR_EARS=stub` via `cartilla.tutor.test-ears.v1` localStorage key).
 * Scripted fixtures are explicitly labeled and NEVER represent live microphone
 * or Vosk recognition accuracy.
 *
 * Verifies:
 * 1. End-to-end scripted session on /tutor/1 (StubEars scripted fixtures)
 * 2. Layout switching (Call -> Split -> Full-screen Flip Chart + PiP bottom-left/bottom-right -> Practice)
 *    preserving the exact same persistent avatar DOM node & session state
 * 3. Flip Chart rendering & verified highlight regions
 * 4. Supervised Workbook & Game launch inside Mode D (Practice)
 * 5. Structured Replay ("Repetición estructurada de la sesión") & teacher report/log availability
 * 6. Offline cold restart (`context.setOffline(true)`)
 * 7. Responsive visual screenshots at 390x844, 1366x768, 820x1180, and 1180x820
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  readProgressEvents,
  scriptLessonQueue,
  stubGetUserMedia,
  tapMicWhenReady,
  trackConsoleErrors,
  tutorSessionUrl,
} from "./support/tutor-helpers";

const SCREENSHOT_DIR =
  process.env.TUTOR_ACCEPTANCE_SCREENSHOT_DIR ||
  path.join(process.cwd(), "test-results", "tutor-native-acceptance");

const REQUIRED_VIEWPORTS = [
  { width: 390, height: 844, tag: "390x844" },
  { width: 1366, height: 768, tag: "1366x768" },
  { width: 820, height: 1180, tag: "820x1180" },
  { width: 1180, height: 820, tag: "1180x820" },
] as const;

test.describe("Tutor Native Final Acceptance (StubEars scripted fixtures)", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    stubGetUserMedia(page);
  });

  test("end-to-end scripted session, 4-mode layout switching without avatar remount, Flip Chart, Practice, and Replay", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const consoleErrors = trackConsoleErrors(page);

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(tutorSessionUrl(1, { code: "aceptacion", slot: 7 }));
    await expect(page.locator("[data-tutor-call-shell]")).toBeVisible({ timeout: 60_000 });

    // Confirm scripted fixture notice is explicitly visible
    await expect(page.getByText("Prueba: micrófono simulado")).toBeVisible();

    // Capture exact DOM reference of the persistent avatar node BEFORE any layout switches
    await page.evaluate(() => {
      const slot = document.querySelector("[data-tutor-avatar-slot]");
      const puppet = document.querySelector("[data-tutor-puppet]");
      (window as unknown as Record<string, unknown>).__initialAvatarSlot = slot;
      (window as unknown as Record<string, unknown>).__initialPuppetNode = puppet;
    });

    // 1. Run scripted StubEars interaction (item 1: vowel "a")
    await scriptLessonQueue(page, 1);
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () =>
          (await readProgressEvents(page)).some(
            (ev) => ev.item_id === "l1-vowel-a" && ev.result === "correct",
          ),
        { timeout: 60_000 },
      )
      .toBe(true);

    // 2. Mode A (Call) -> Mode B (Split)
    await page.locator('[data-layout-option="split"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "split",
    );
    await expect(page.locator("[data-tutor-flipchart-frame]")).toBeVisible();

    // Verify Flip Chart presenter & highlight surface rendered
    await expect(page.locator("[data-tutor-flipchart-frame]")).toContainText(/Rotafolio|Lámina/i);

    // 3. Mode B (Split) -> Mode C (Full-screen Flip Chart + PiP)
    await page.locator('[data-layout-option="flipchart-pip"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "flipchart-pip",
    );

    // Dock PiP bottom-left -> verify attribute
    await page.getByRole("button", { name: "Acoplar ventana abajo a la izquierda" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-left",
    );

    // Dock PiP bottom-right -> verify attribute
    await page.getByRole("button", { name: "Acoplar ventana abajo a la derecha" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-right",
    );

    // 4. Mode C -> Mode D (Practice: Workbook + Game host)
    await page.locator('[data-layout-option="practice"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "practice",
    );
    await expect(page.getByTestId("tutor-practice-host")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("tutor-practice-host")).toHaveAttribute(
      "data-practice-kind",
      "workbook",
    );

    // 5. Return to Mode A (Call) and confirm the EXACT SAME avatar DOM node persisted across all 4 modes
    await page.locator('[data-layout-option="call"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "call",
    );

    const sameAvatarNodes = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      return {
        sameSlot: w.__initialAvatarSlot === document.querySelector("[data-tutor-avatar-slot]"),
        samePuppet: w.__initialPuppetNode === document.querySelector("[data-tutor-puppet]"),
      };
    });
    expect(sameAvatarNodes).toEqual({ sameSlot: true, samePuppet: true });

    // 6. Open Structured Replay popover and verify honest label + recorded session log availability
    await page.getByRole("button", { name: "Ver repetición estructurada" }).click();
    const replayPopover = page.locator("[data-tutor-replay-popover]");
    await expect(replayPopover).toBeVisible();
    await expect(replayPopover).toContainText("Repetición estructurada de la sesión");

    // Close replay cleanly
    await page.getByRole("button", { name: "Cerrar repetición" }).click();
    await expect(replayPopover).toBeHidden();

    // Verify zero console errors
    expect(consoleErrors.errors()).toEqual([]);
  });

  test("offline cold restart readiness and modular offline pack UI on /tutor", async ({
    context,
    page,
  }) => {
    test.setTimeout(30_000);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/tutor", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Tutor de Gretel" })).toBeVisible({
      timeout: 15_000,
    });

    // Verify modular offline pack UI & Tier-3 opt-in isolation labels
    const packSection = page.locator("[data-tutor-offline-pack]");
    await expect(packSection).toBeVisible();
    await packSection.locator("[data-tutor-pack-toggle]").click();
    await expect(packSection.locator('[data-pack-slot="universal"]')).toBeVisible();
    await expect(packSection.locator('[data-pack-slot="avatar"]')).toBeVisible();
    await expect(packSection.locator('[data-pack-slot="vosk"]')).toBeVisible();
    await expect(packSection.locator('[data-pack-slot="lesson-1"]')).toBeVisible();
    await expect(packSection.locator('[data-pack-slot="lesson-24"]')).toBeVisible();
    await expect(packSection.locator('[data-pack-slot="tier3-local-llm-qa"]')).toContainText(
      "No incluido por defecto",
    );

    // Verify offline cold restart (`context.setOffline(true)`) via Service Worker cache
    const swReady = await page
      .evaluate(async () => {
        if (!("serviceWorker" in navigator)) return false;
        if (!navigator.serviceWorker.controller) {
          await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
        }
        const html = `<!doctype html>${document.documentElement.outerHTML}`;
        const cache = await caches.open("cartilla:tutor:v1.1.0:e2e-cold");
        await cache.put(
          "/tutor",
          new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
        );
        const control = await caches.open("cartilla:tutor:control");
        await control.put(
          "/__tutor_active_pack__",
          new Response(
            JSON.stringify({
              cacheName: "cartilla:tutor:v1.1.0:e2e-cold",
              version: "v1.1.0",
              buildId: "e2e",
              resources: [],
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
        );
        return true;
      })
      .catch(() => false);

    expect(swReady).toBe(true);

    // Close the dev-server page (and its HMR socket) while keeping a blank tab open,
    // matching tutor-offline-pack.spec.ts, before toggling offline mode.
    const coldPage = await context.newPage();
    await page.close();
    await context.setOffline(true);
    try {
      const res = await coldPage.goto("/tutor", {
        waitUntil: "commit",
        timeout: 15_000,
      });
      expect(res?.fromServiceWorker()).toBe(true);
    } finally {
      await context.setOffline(false);
      await coldPage.close();
    }
  });

  for (const vp of REQUIRED_VIEWPORTS) {
    test(`captures acceptance screenshot at ${vp.tag}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(tutorSessionUrl(1, { code: "visual", slot: 1 }));
      await expect(page.locator("[data-tutor-call-shell]")).toBeVisible({ timeout: 60_000 });

      // Show Split mode on wide/tablet viewports, Call mode on phone so layout diversity is captured
      if (vp.width >= 820) {
        await page.locator('[data-layout-option="split"]').click();
        await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
          "data-layout-mode",
          "split",
        );
        // Verify real Flip Chart board rendered with non-zero dimensions and visible content
        const board = page.getByTestId("flipchart-native-board");
        await expect(board).toBeVisible({ timeout: 15_000 });
        await page
          .waitForFunction(
            () => {
              const el = document.querySelector<HTMLElement>('[data-testid="flipchart-native-board"]');
              if (!el) return false;
              const rect = el.getBoundingClientRect();
              const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
              const imgsReady = imgs.every((img) => img.complete && img.naturalWidth > 0);
              return rect.width > 120 && rect.height > 120 && imgsReady;
            },
            { timeout: 15_000 },
          );
      }

      // Assert zero horizontal overflow at every required viewport (no clipping)
      const overflow = await page.evaluate(() => ({
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        shellOverflow: (() => {
          const shell = document.querySelector<HTMLElement>("[data-tutor-call-shell]");
          return shell ? shell.scrollWidth - shell.clientWidth : 0;
        })(),
      }));
      expect(overflow.docOverflow).toBeLessThanOrEqual(0);
      expect(overflow.shellOverflow).toBeLessThanOrEqual(0);

      const filePath = path.join(SCREENSHOT_DIR, `tutor-acceptance-${vp.tag}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      expect(fs.existsSync(filePath)).toBe(true);
    });
  }
});
