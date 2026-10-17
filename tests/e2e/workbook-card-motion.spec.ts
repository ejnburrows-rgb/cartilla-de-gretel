import { test, expect, type Page } from "@playwright/test";

// Pencil-card pictures on the real Workbook pages render through the shared
// LivingIllustration path. Registered actors play their existing owner-approved
// motion (alive.svg part motion, or the airplane's approved glide); every other
// card picture stays the identical plain still image. Recovers #764.
const PAGES: { lesson: number; index: number; page: string; moving: string[] }[] = [
  // Page 3 pair pictures (ocho, araña, iglesia, escoba, uno) have no registered
  // actor or alive.svg, so they must stay exactly the same still images.
  { lesson: 1, index: 2, page: "3", moving: [] },
  {
    lesson: 3,
    index: 1,
    page: "8",
    moving: ["oso-alive.svg", "abeja-alive.svg", "leccion-1/pez.webp"],
  },
  { lesson: 6, index: 1, page: "17", moving: ["oso-alive.svg", "iman-alive.svg"] },
];

async function openPage(page: Page, lesson: number, index: number) {
  await page.addInitScript(
    ({ lesson, index }) => {
      const v = JSON.stringify({ lesson, page: index });
      window.localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, v);
      window.localStorage.setItem("cartilla.learner-resume.v1", v);
    },
    { lesson, index },
  );
  await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".native-lesson-viewer[data-native-page]", { timeout: 30_000 });
}

async function cards(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".am-direct-pencil__card")]
      .filter((card) => card.querySelector("img"))
      .map((card) => {
        const wrapper = card.querySelector<HTMLElement>(".living-illustration");
        const img = card.querySelector("img");
        return {
          src: img?.getAttribute("src") ?? "",
          loaded: Boolean(img && img.complete && img.naturalWidth > 0),
          natural: wrapper?.dataset.naturalMotion === "true",
          ambient: wrapper?.dataset.ambientMotion ?? "none",
          living: Boolean(wrapper),
          listenButton: Boolean(card.querySelector("[role=button]")),
        };
      }),
  );
}

for (const target of PAGES) {
  test(`Workbook page ${target.page}: registered card pictures use the living path`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openPage(page, target.lesson, target.index);
    await expect(page.locator(".native-lesson-viewer")).toHaveAttribute(
      "data-native-page",
      target.page,
    );
    await expect
      .poll(async () => (await cards(page)).every((c) => c.loaded), { timeout: 15_000 })
      .toBe(true);
    const all = await cards(page);
    expect(all.length).toBeGreaterThan(0);
    const moving = all.filter((c) => c.natural || c.ambient !== "none");
    for (const m of target.moving)
      expect(
        moving.some((c) => c.src.includes(m)),
        `${m} moves`,
      ).toBe(true);
    expect(moving).toHaveLength(target.moving.length);
    for (const c of all.filter((c) => !c.living)) expect(c.src).not.toContain("-alive");
    expect(all.some((c) => c.listenButton)).toBe(false);
  });
}

for (const target of PAGES.filter((p) => p.moving.length)) {
  test(`Workbook page ${target.page}: card pictures are still under reduced motion`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await openPage(page, target.lesson, target.index);
    await expect(page.locator(".native-lesson-viewer")).toHaveAttribute(
      "data-native-page",
      target.page,
    );
    await expect
      .poll(async () => (await cards(page)).every((c) => c.loaded), { timeout: 15_000 })
      .toBe(true);
    const all = await cards(page);
    expect(all.filter((c) => c.natural || c.ambient !== "none")).toHaveLength(0);
    expect(all.every((c) => !c.src.includes("-alive"))).toBe(true);
    await context.close();
  });
}
