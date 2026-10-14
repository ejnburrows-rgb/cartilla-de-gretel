import { test, expect, type Page } from "@playwright/test";

// Teacher Flip Chart sheets (Láminas 4, 6, 7): the vowel pictures that have built
// natural part motion (scripts/living-motion/fc_natives.py) play it inside their
// own SVG. The picture never wobbles as a whole, the other pictures on the sheet
// stay still, and reduced motion shows the still drawing.
const FC = "/cartilla/art/optimized/flipchart-native";
const SHEETS: Array<[number, string[]]> = [
  [2, ["p004-oso", "p004-oveja", "p004-olla"]],
  [4, ["p006-elefante"]],
  [5, ["p007-iman"]],
];

async function pictures(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".living-illustration")].map((w) => {
      const img = w.querySelector<HTMLImageElement>("img.living-illustration__art");
      const anim = (el: Element | null) => (el ? getComputedStyle(el).animationName : "none");
      const r = w.getBoundingClientRect();
      return {
        picture: w.dataset.pictureSrc ?? "",
        src: img?.getAttribute("src") ?? "",
        natural: w.dataset.naturalMotion,
        width: img?.naturalWidth ?? 0,
        shown:
          r.width > 40 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight,
        wholeMotion: [w, img, ...w.querySelectorAll(".living-illustration__part")].some(
          (el) => anim(el) !== "none",
        ),
      };
    }),
  );
}

async function openSheet(page: Page, n: number) {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("-alive.svg"))
      failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(`/cartilla/presentar/${n}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".living-illustration").first()).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>("img.living-illustration__art")].every(
      (i) => i.complete,
    ),
  );
  return failed;
}

for (const [screen, size] of [
  ["projector", { width: 1920, height: 1080 }],
  ["laptop", { width: 1366, height: 768 }],
] as const) {
  for (const [sheet, names] of SHEETS) {
    test(`${screen}: Flip Chart sheet ${sheet} vowel pictures move only their parts`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport: size });
      const page = await context.newPage();
      const failed = await openSheet(page, sheet);
      const all = await pictures(page);
      for (const n of names) {
        const pic = all.find((p) => p.picture === `${FC}/${n}.png`);
        expect(pic, `${n} is on sheet ${sheet}`).toBeTruthy();
        expect(pic!.src, `${n} plays its natural-motion SVG`).toBe(`${FC}/${n}-alive.svg`);
        expect(pic!.natural).toBe("true");
        expect(pic!.width, `${n} decoded`).toBeGreaterThan(0);
        expect(pic!.shown, `${n} is on screen`).toBe(true);
        expect(pic!.wholeMotion, `${n} has no whole-picture CSS motion`).toBe(false);
      }
      for (const p of all.filter((x) => !names.some((n) => x.picture.endsWith(`/${n}.png`)))) {
        expect(p.wholeMotion, `${p.picture} stays still`).toBe(false);
        expect(p.src, `${p.picture} stays still`).not.toContain("-alive.svg");
      }
      expect(failed).toEqual([]);
      await page.screenshot({
        path: `test-results/flipchart-vowel-motion/${screen}-s${sheet}-a.png`,
      });
      await page.waitForTimeout(1300);
      await page.screenshot({
        path: `test-results/flipchart-vowel-motion/${screen}-s${sheet}-b.png`,
      });
      await context.close();
    });
  }
}

test("reduced motion: Flip Chart vowel pictures show the still drawing", async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  await openSheet(page, 2);
  const all = await pictures(page);
  for (const n of ["p004-oso", "p004-oveja", "p004-olla"]) {
    const pic = all.find((p) => p.picture === `${FC}/${n}.png`);
    expect(pic, n).toBeTruthy();
    expect(pic!.src, `${n} shows the still drawing`).toBe(`${FC}/${n}.png`);
    expect(pic!.natural).toBe("false");
    expect(pic!.wholeMotion).toBe(false);
  }
  await page.screenshot({ path: "test-results/flipchart-vowel-motion/projector-s2-reduced.png" });
  await context.close();
});
