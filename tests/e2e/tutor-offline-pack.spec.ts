/**
 * Tutor offline pack e2e (item 8 of the swarm brief) — the teacher flow on
 * /tutor: "Preparar sin internet" downloads the pack, sets the
 * cartilla.tutor.pack.v1 marker, and re-entry shows the completed state.
 */
import { expect, test } from "@playwright/test";
import { readPackMarker, trackConsoleErrors } from "./support/tutor-helpers";

test.describe("tutor offline pack", () => {
  test("teacher prepares the pack once; marker is set and re-entry shows the completed state", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const consoleErrors = trackConsoleErrors(page);

    await page.goto("/tutor");
    await expect(page.getByRole("heading", { name: "Tutor de Gretel" })).toBeVisible();
    await page.getByRole("button", { name: "Preparar sin internet" }).click();

    // Download runs against the local dev server (Vosk model + line audio +
    // pack files, same-origin only). Status stays live via role=status.
    await expect(page.getByText(/Listo sin internet — v1\.0\.0/)).toBeVisible({
      timeout: 240_000,
    });

    // The completion marker (not a partial download) is on the device.
    const marker = await readPackMarker(page);
    expect(marker).not.toBeNull();
    expect(marker).toMatchObject({ version: "v1.0.0" });
    expect(Number(marker?.bytes ?? 0)).toBeGreaterThan(0);

    // Re-entry (fresh mount of the same page) shows the completed state.
    await page.reload();
    await expect(page.getByText(/Listo sin internet — v1\.0\.0/)).toBeVisible({ timeout: 60_000 });
    expect(consoleErrors.errors()).toEqual([]);
  });
});