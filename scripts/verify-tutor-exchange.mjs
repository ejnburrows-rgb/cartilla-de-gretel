#!/usr/bin/env node
import { chromium, expect } from "@playwright/test";

const [base] = process.argv.slice(2);
if (!base) throw new Error("Usage: node scripts/verify-tutor-exchange.mjs <preview-url>");

const desktop = { width: 1366, height: 768 };
const phone = { width: 390, height: 844 };
const checks = [
  { lesson: 3, target: "a", next: "abanico", viewport: desktop, wrong: "o" },
  { lesson: 4, target: "e", next: "elefante", viewport: phone, checkDrawer: true },
  { lesson: 7, target: "ma", next: "me", viewport: phone, reducedMotion: true },
  { lesson: 2, target: "o", next: "ola", viewport: desktop, interrupt: true },
];

const browser = await chromium.launch({
  executablePath: process.env.TUTOR_CHROME_PATH || undefined,
  proxy: process.env.TUTOR_PROXY_SERVER ? { server: process.env.TUTOR_PROXY_SERVER } : undefined,
});

async function expectCenteredCamera(camera) {
  await expect(camera).toHaveAttribute("data-classroom-camera", "call");
  await expect.poll(() => camera.evaluate((node) => {
    const frame = node.parentElement.getBoundingClientRect();
    const plate = node.getBoundingClientRect();
    // The approved face anchor is at 31.875% of the wide painted plate.
    return Math.abs((plate.left + plate.width * 0.31875 - frame.left) / frame.width - 0.5);
  })).toBeLessThan(0.04);
}

try {
  for (const check of checks) {
    const page = await browser.newPage({
      viewport: check.viewport,
      reducedMotion: check.reducedMotion ? "reduce" : "no-preference",
      ignoreHTTPSErrors: process.env.TUTOR_TEST_IGNORE_CERT_ERRORS === "1",
    });
    try {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(new URL("/cartilla/lecciones", base).href);
      await page.getByRole("link", { name: "Aprender con Gretel", exact: true }).click();
      await page.getByRole("link", { name: new RegExp(`^Lección ${check.lesson}\\s`) }).click();
      const prompt = page.locator("[data-tutor-question-prompt]");
      const camera = page.locator(".tutor-classroom-camera");
      await expect(prompt).toContainText(`«${check.target}»`, { timeout: 22000 });

      await expectCenteredCamera(camera);
      await page.getByRole("button", { name: "Abrir transcripción", exact: true }).click();
      const input = page.getByRole("textbox", { name: "Escribir respuesta o pregunta", exact: true });
      const submit = page.getByRole("button", { name: "Enviar mensaje", exact: true });
      if (check.wrong) {
        await input.fill(check.wrong);
        await submit.click();
        await expect(page.getByText("Esa es la O.", { exact: true }).last()).toBeVisible();
        await input.fill(check.target);
        if (!(await submit.isEnabled())) {
          await input.press("Enter");
          await expect(input).toHaveValue(check.target);
        }
      } else {
        await input.fill(check.target);
      }
      await submit.click({ timeout: 18000 });

      const phases = check.reducedMotion
        ? ["still"]
        : ["turning", "writing", "underlining", "taking-eraser", "erasing", "returning"];
      for (const phase of phases) {
        const board = page.locator(`[data-board-target="${check.target}"][data-board-phase="${phase}"]:visible`);
        await expect(board).toBeVisible({ timeout: 24000 });
        await expect(camera).toHaveAttribute("data-classroom-camera", "board");
        await expect.poll(() => camera.evaluate((node) =>
          node.getBoundingClientRect().width / node.parentElement.getBoundingClientRect().width,
        )).toBeLessThan(1.02);
        if (check.checkDrawer) {
          expect(await board.evaluate((node) => {
            const drawer = document.querySelector("[data-tutor-transcript-drawer]");
            return drawer && drawer.getBoundingClientRect().top >= node.getBoundingClientRect().bottom;
          })).toBeTruthy();
        }
        if (check.interrupt) {
          await page.getByRole("button", { name: "Interrumpir a Gretel", exact: true }).click();
          await expect(page.locator("[data-board-target]:visible")).toHaveCount(0);
          break;
        }
      }
      await expect(prompt).toContainText(`«${check.next}»`, { timeout: 22000 });
      await expectCenteredCamera(camera);
      if (check.reducedMotion) {
        const duration = await camera.evaluate((node) => Number.parseFloat(getComputedStyle(node).transitionDuration));
        expect(duration).toBeLessThan(0.001);
      }
      expect(errors).toEqual([]);
      console.log(JSON.stringify({ lesson: check.lesson, target: check.target, viewport: check.viewport, next: check.next }));
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
