import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ video: "on" });
for (const viewport of [{width:390,height:844},{width:1366,height:768}]) {
test(`partial real artwork board loads and saves at ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
  await page.setViewportSize(viewport);
  const layouts = JSON.parse(await readFile("src/data/page-layouts.json", "utf8"));
  const board: {issues: {id:string; page:string; servedPath:string; pageImage:string}[]} = JSON.parse(await readFile("public/review/artwork-board.json", "utf8"));
  const pages = layouts.pages as Record<string, { regions: { cells?: { illustrationSrc?: string; caption?: string }[] }[] }>;
  const expected = ["1", "7", "8"].flatMap((p) => pages[p].regions.flatMap((region) => (region.cells ?? []).map((cell) => ({page:p, src:cell.illustrationSrc}))));
  expect(board.issues.map((r) => ({page:r.page, src:r.servedPath}))).toEqual(expected);
  expect(board.issues).toHaveLength(44);
  expect(new Set(board.issues.map((r) => r.id)).size).toBe(44);
  await page.goto("/revision");
  await expect(page.getByText(/Partial: workbook pages 1, 7 and 8 only/)).toBeVisible();
  await expect(page.getByText("Showing 44 of 44 artwork entries.")).toBeVisible();
  for (const row of board.issues) {
    expect((await page.request.get(row.servedPath)).ok()).toBeTruthy();
    expect((await page.request.get(row.pageImage)).ok()).toBeTruthy();
  }
  const broken = await page.evaluate(async (paths) => {
    const checks = await Promise.all([...new Set(paths)].map((src) => new Promise<string | null>((resolve) => {
      const img = new Image(); img.onload = () => resolve(img.naturalWidth > 0 ? null : src); img.onerror = () => resolve(src); img.src = src;
    })));
    return checks.filter(Boolean);
  }, board.issues.flatMap((r) => [r.servedPath, r.pageImage]));
  expect(broken).toEqual([]);
  const art = page.locator("#art-WB-007-14");
  await art.scrollIntoViewIfNeeded();
  await expect(art.locator("img")).toHaveCount(3);
  await expect.poll(() => art.locator("img").evaluateAll((imgs) => imgs.every((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(art).toContainText("avión");
  await expect(art).toContainText("SOURCE MISMATCH");
  await expect(art).toContainText("Existing candidate — not applied or approved");
  await expect(art).toContainText("No decision yet");
  await page.screenshot({path:testInfo.outputPath("artwork-board.png")});
  const bytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  await art.locator('input[type="file"]').setInputFiles({name:"fixture.png",mimeType:"image/png",buffer:bytes});
  await art.getByRole("button", {name:"Upload owner replacement"}).click();
  await expect(art).toContainText("Your decision: Upload owner replacement");
  const download = page.waitForEvent("download");
  await page.getByRole("button",{name:"Download JSON"}).click();
  const backup = JSON.parse(await readFile(await (await download).path(),"utf8"));
  const saved = JSON.stringify(backup);
  expect(saved).toContain(bytes.toString("base64"));
});
}
