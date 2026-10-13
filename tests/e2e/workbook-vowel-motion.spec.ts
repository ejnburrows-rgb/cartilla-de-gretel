import { test, expect, type Page } from "@playwright/test";

// Workbook vowel-review pages (Lessons 2-6, first page): the vowel pictures that
// have built natural part motion (scripts/living-motion/wb_vowels.py) play it
// inside their own SVG. The picture itself never wobbles as a whole, other
// pictures on the page stay still, and reduced motion shows the still drawing.
const ALIVE: Record<string, string> = {
  oso: "/cartilla/art/faithful/vocal-o/oso-alive.svg",
  oveja: "/cartilla/art/faithful/vocal-o/oveja-alive.svg",
  olla: "/cartilla/art/faithful/vocal-o/olla-alive.svg",
  elefante: "/cartilla/art/faithful/vocal-e/elefante-alive.svg",
  avión: "/cartilla/art/faithful/vocal-a/avion-alive.svg",
  abeja: "/cartilla/art/faithful/vocal-a/abeja-alive.svg",
  abanico: "/cartilla/art/faithful/vocal-a/abanico-alive.svg",
  imán: "/cartilla/art/faithful/vocal-i/iman-alive.svg",
};
const LESSONS: Array<[number, string[]]> = [
  [2, ["oso", "oveja", "olla"]],
  [3, ["oso", "oveja", "elefante", "avión", "abeja", "abanico", "imán"]],
  [4, ["elefante", "abeja"]],
  [5, ["oso", "olla", "abanico", "imán"]],
  [6, ["oso", "oveja", "elefante", "abeja"]],
];
// Held still: their old whole-picture motion moved the drawn ground/background
// too (owner rule 2026-10-11: only the parts that really move may move).
const HELD = ["oruga", "araña", "ardilla", "erizo", "iguana", "insecto", "unicornio"];
const STILL = ["uno", "iglú", "ojos", "estrella", "uvas", ...HELD];

async function pictures(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".living-illustration")].map((w) => {
      const img = w.querySelector<HTMLImageElement>("img.living-illustration__art");
      const anim = (el: Element | null) => (el ? getComputedStyle(el).animationName : "none");
      return {
        name: w.dataset.pictureName ?? "",
        src: img?.getAttribute("src") ?? "",
        natural: w.dataset.naturalMotion,
        ambient: w.dataset.ambientMotion,
        width: img?.naturalWidth ?? 0,
        wholeMotion: [w, img, ...w.querySelectorAll(".living-illustration__part")].some(
          (el) => anim(el) !== "none",
        ),
        parts: w.querySelectorAll(".living-illustration__part").length,
      };
    }),
  );
}

async function openLesson(page: Page, n: number) {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("-alive.svg"))
      failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(`/cartilla/leccion/${n}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".living-illustration").first()).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>("img.living-illustration__art")].every(
      (i) => i.complete,
    ),
  );
  return failed;
}

for (const [viewport, size] of [
  ["laptop", { width: 1366, height: 768 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  for (const [lesson, names] of LESSONS) {
    test(`${viewport}: Lesson ${lesson} vowel pictures move only their parts`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport: size, hasTouch: viewport === "phone" });
      const page = await context.newPage();
      const failed = await openLesson(page, lesson);
      const all = await pictures(page);
      for (const name of names) {
        const pic = all.find((p) => p.name === name && p.src.includes("/faithful/vocal-"));
        expect(pic, `${name} is on Lesson ${lesson}`).toBeTruthy();
        expect(pic!.src, `${name} plays its natural-motion SVG`).toBe(ALIVE[name]);
        expect(pic!.natural).toBe("true");
        expect(pic!.width, `${name} decoded`).toBeGreaterThan(0);
        expect(pic!.wholeMotion, `${name} has no whole-picture CSS motion`).toBe(false);
        expect(pic!.parts).toBe(0);
      }
      for (const p of all.filter((x) => STILL.includes(x.name))) {
        expect(p.wholeMotion, `${p.name} stays still`).toBe(false);
        expect(p.natural, `${p.name} stays still`).toBe("false");
      }
      if (lesson === 5 || lesson === 6) {
        // leccion-1/pez.webp is the book's airplane (pages 13, 16): it glides as a
        // whole like a flying airplane and never wags a fish tail.
        const plane = all.find((p) => p.src.endsWith("/leccion-1/pez.webp"));
        expect(plane?.name).toBe("avión");
        expect(plane?.ambient).toBe("glide");
        expect(plane?.parts).toBe(0);
      }
      expect(failed).toEqual([]);
      const first = page.locator(`.living-illustration[data-picture-name="${names[0]}"]`).first();
      await first.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `test-results/workbook-vowel-motion/${viewport}-l${lesson}-a.png`,
      });
      await page.waitForTimeout(1300);
      await page.screenshot({
        path: `test-results/workbook-vowel-motion/${viewport}-l${lesson}-b.png`,
      });
      await context.close();
    });
  }
}

test("reduced motion: vowel pictures show the still drawing and nothing moves", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();
  await openLesson(page, 3);
  const all = await pictures(page);
  for (const name of ["oso", "oveja", "elefante", "avión", "abeja", "abanico", "imán"]) {
    const pic = all.find((p) => p.name === name && p.src.includes("/faithful/vocal-"));
    expect(pic, name).toBeTruthy();
    expect(pic!.src, `${name} shows the still drawing`).not.toContain("-alive.svg");
    expect(pic!.natural).toBe("false");
    expect(pic!.wholeMotion).toBe(false);
  }
  await page.screenshot({ path: "test-results/workbook-vowel-motion/laptop-l3-reduced.png" });
  await context.close();
});
