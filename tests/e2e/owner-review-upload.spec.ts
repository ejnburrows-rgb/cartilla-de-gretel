import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const fixture = { summary: { total: "1" }, issues: [{ id: "fixture1", classification: "MISSING", page: "7", problem: "fixture", remedy: "fixture" }] };

for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  test(`replacement image survives JSON backup at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/review/artwork-board.json", (route) => route.fulfill({ json: fixture }));
    await page.goto("/revision");
    const art = page.locator("#art-fixture1");
    const upload = art.getByRole("button", { name: "Upload owner replacement" });
    await expect(upload).toBeDisabled();
    await expect(art).toContainText("No decision yet");
    await art.locator('input[type="file"]').setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: png });
    await upload.click();
    await expect(art).toContainText("Your decision: Upload owner replacement");
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("cartilla:owner-review:v1")!));
    expect(Buffer.from(stored.history[0].replacement.dataUrl.split(",")[1], "base64")).toEqual(png);
    const imageDownload = page.waitForEvent("download");
    await art.getByRole("link", { name: "Download saved replacement: fixture.png" }).click();
    expect(await readFile(await (await imageDownload).path())).toEqual(png);

    const jsonDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download JSON" }).click();
    const backup = await readFile(await (await jsonDownload).path());
    const csvDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV" }).click();
    expect((await readFile(await (await csvDownload).path(), "utf8"))).toContain("fixture.png");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#history input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: backup });
    await expect(page.getByText("Restored.", { exact: true })).toBeVisible();
    await page.reload();
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("cartilla:owner-review:v1")!));
    expect(restored.history[0].replacement.dataUrl).toBe(stored.history[0].replacement.dataUrl);
    await expect(page.getByRole("link", { name: "Download fixture.png" })).toBeVisible();
  });
}

test("storage failure reports an error without recording approval", async ({ page }) => {
  await page.route("**/review/artwork-board.json", (route) => route.fulfill({ json: fixture }));
  await page.goto("/revision");
  const art = page.locator("#art-fixture1");
  await art.locator('input[type="file"]').setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: png });
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("storage unavailable"); }; });
  await art.getByRole("button", { name: "Upload owner replacement" }).click();
  await expect(art.getByRole("alert")).toContainText("Could not save");
  await expect(art).toContainText("No decision yet");
  expect(await page.evaluate(() => localStorage.getItem("cartilla:owner-review:v1"))).toBeNull();
});
