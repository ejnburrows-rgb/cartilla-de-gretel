import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

test.describe("Gretel Voice Technical Readiness", () => {
  test("audition route renders title, audition line, provider seam badge, and owner guidance", async ({
    page,
  }) => {
    await page.goto("/cartilla/voces", { waitUntil: "networkidle" });

    // 1. Verify heading
    await expect(page.getByRole("heading", { name: "Audición de voces de Gretel" })).toBeVisible();

    // 2. Verify audition line from printed book
    const auditionText =
      "Presiona los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido.";
    await expect(page.getByText(auditionText)).toBeVisible();

    // 3. Verify technical readiness badge
    await expect(page.getByText("Estado de preparación técnica")).toBeVisible();
    await expect(page.getByText("✓ Abstracción lista (One-Config Seam)")).toBeVisible();

    // 4. Verify owner guidance block
    await expect(page.getByText("Honestidad, no promesas:")).toBeVisible();

    // 5. Test interaction on audition button if candidates exist
    const listenButton = page.getByRole("button", { name: /escuchar|reproduciendo/i }).first();
    if (await listenButton.isVisible().catch(() => false)) {
      await listenButton.click();
      await page.waitForTimeout(500);
    }

    // 6. Capture screenshot for proof directory
    const proofDir = path.resolve("docs/proofs/gretel-voice-readiness");
    if (!fs.existsSync(proofDir)) {
      fs.mkdirSync(proofDir, { recursive: true });
    }
    await page.screenshot({
      path: path.join(proofDir, "voces-preview.png"),
      fullPage: true,
    });
  });
});
