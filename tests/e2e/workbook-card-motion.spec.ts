import { test, expect, type Page } from "@playwright/test";

// Pencil-matching card pictures on Workbook pages 5, 8, 11, 14 and 17 use the
// same owner-approved natural motion as Lessons 2–6 page 1 (#735). Only
// registered actors move; every other card picture stays a plain still image.
const PAGES: { lesson: number; index: number; page: string; moving: string[] }[] = [
  {
    lesson: 2,
    index: 1,
    page: "5",
    moving: ["oveja-alive.svg", "olla-alive.svg", "oso-alive.svg"],
  },
  {
    lesson: 3,
    index: 1,
    page: "8",
    moving: ["oso-alive.svg", "abeja-alive.svg", "leccion-1/pez.webp"],
  },
  {
    lesson: 4,
    index: 1,
    page: "11",
    moving: ["oso-alive.svg", "elefante-alive.svg", "abeja-alive.svg"],
  },
  {
    lesson: 5,
    index: 1,
    page: "14",
    moving: ["iman-alive.svg", "oso-alive.svg", "abeja-alive.svg"],
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
  await page.waitForSelector(".native-lesson-viewer[data-native-page]", { timeout: 20_000 });
}

async function cards(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".am-direct-pencil__card")].map((card) => {
      const wrapper = card.querySelector<HTMLElement>(".living-illustration");
      const img = card.querySelector("img");
      return {
        src: img?.getAttribute("src") ?? "",
        loaded: Boolean(img && img.complete && img.naturalWidth > 0),
        natural: wrapper?.dataset.naturalMotion === "true",
        ambient: wrapper?.dataset.ambientMotion ?? "none",
        living: Boolean(wrapper),
      };
    }),
  );
}

for (const target of PAGES) {
  test(`Workbook page ${target.page}: approved card pictures move on the real page`, async ({
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
    const moving = all.filter((c) => c.natural || c.ambient !== "none");
    for (const m of target.moving) {
      expect(
        moving.some((c) => c.src.includes(m)),
        `${m} moves`,
      ).toBe(true);
    }
    expect(moving).toHaveLength(target.moving.length);
    for (const c of all.filter((c) => !c.living))
      expect(c.src, "still picture keeps its source").not.toContain("-alive");
  });
}

test("Workbook card pictures are all still under reduced motion", async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await openPage(page, 4, 1);
  await expect(page.locator(".native-lesson-viewer")).toHaveAttribute("data-native-page", "11");
  await expect.poll(async () => (await cards(page)).length).toBe(8);
  const all = await cards(page);
  expect(all.filter((c) => c.natural || c.ambient !== "none")).toHaveLength(0);
  expect(all.every((c) => !c.src.includes("-alive"))).toBe(true);
  await context.close();
});
