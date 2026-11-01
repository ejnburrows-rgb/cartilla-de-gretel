/** Built application + actual Cache Storage and SW. No StubEars or fake READY. */
import { expect, test } from "@playwright/test";

test("verified pack survives closing the page and cold-opens every tutor route offline", async ({
  context,
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/tutor");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.getByRole("button", { name: "Preparar sin internet" }).click();
  await expect(page.getByText(/Listo sin internet — v1\.1\.0/)).toBeVisible({ timeout: 150_000 });
  const marker = await page.evaluate(async () => {
    const control = await caches.open("cartilla:tutor:control");
    return (await (await control.match("/__tutor_active_pack__"))!.json()) as {
      cacheName: string;
      resources: { url: string; bytes: number }[];
    };
  });
  expect(marker.resources.some((asset) => asset.url.includes("vosk-model-small-es"))).toBe(true);
  expect(marker.resources.reduce((sum, asset) => sum + asset.bytes, 0)).toBeGreaterThan(40_000_000);
  // Keep a blank tab while closing the original app tab; avoids an embedded
  // headless browser terminating when its last tab closes.
  const cold = await context.newPage();
  await page.close();
  await context.setOffline(true);
  cold.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/tutor", "/tutor/1?code=offline&slot=3", "/tutor/2", "/tutor/3"]) {
    const response = await cold.goto(route);
    expect(response?.fromServiceWorker()).toBe(true);
    if (route === "/tutor")
      await expect(cold.getByRole("heading", { name: "Tutor de Gretel" })).toBeVisible();
    else await expect(cold.locator("[data-tutor-target-word]")).toBeVisible({ timeout: 30_000 });
  }
  // Return to the teacher control before simulating browser storage eviction.
  await cold.goto("/tutor");
  // A partial cache must immediately lose its ready status.
  await cold.evaluate(async (cacheName) => {
    const pack = await caches.open(cacheName);
    await pack.delete("/audio/voz/vocabulario/oso.mp3");
  }, marker.cacheName);
  await cold.goto("/tutor");
  await expect(cold.getByText("Hay que preparar de nuevo")).toBeVisible();
  expect(errors).toEqual([]);
});

test("a required download failure preserves the previously committed cache pointer", async ({
  context,
  page,
}) => {
  await page.goto("/tutor");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.getByRole("button", { name: "Preparar sin internet" }).click();
  await expect(page.getByText(/Listo sin internet/)).toBeVisible({ timeout: 150_000 });
  const before = await page.evaluate(async () => {
    const cache = await caches.open("cartilla:tutor:control");
    return (await cache.match("/__tutor_active_pack__"))!.text();
  });
  await context.route("**/models/vosk/*.bin", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.getByRole("button", { name: "Preparar sin internet" }).click();
  await expect(page.getByText(/Preparación incompleta/)).toBeVisible({ timeout: 150_000 });
  const after = await page.evaluate(async () => {
    const cache = await caches.open("cartilla:tutor:control");
    return (await cache.match("/__tutor_active_pack__"))!.text();
  });
  expect(after).toBe(before);
});
