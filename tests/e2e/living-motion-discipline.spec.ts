import { test, expect, type Page } from "@playwright/test";

// #497 / #502: on a Workbook exercise page only registered living actors move;
// every other picture stays still, and reduced motion stops everything.
// Whether an actor is rigged with separate moving parts (wings, tail, head) or
// moves as one whole picture depends on the art in use, so the check reads it
// from the rendered page instead of assuming it per picture.
const ACTORS = ["oso", "oveja", "abanico", "avión", "abeja", "elefante"];
const STATIC = ["escalera", "escuela", "olla", "uno", "isla", "oreja"];

async function motionOf(page: Page, name: string) {
  return page.evaluate((pictureName) => {
    const wrapper = document.querySelector<HTMLElement>(
      `.fp-ix-cell .living-illustration[data-picture-name="${pictureName}"]`,
    );
    if (!wrapper) return null;
    const anim = (el: Element | null) => (el ? getComputedStyle(el).animationName : "missing");
    return {
      wrapper: anim(wrapper),
      art: anim(wrapper.querySelector(".living-illustration__art")),
      partRigged: wrapper.classList.contains("living-illustration--part-rigged"),
      parts: [...wrapper.querySelectorAll(".living-illustration__part")].map(anim),
      anyRunning: [wrapper, ...wrapper.querySelectorAll("*")].some(
        (el) => getComputedStyle(el).animationName !== "none",
      ),
    };
  }, name);
}

test("Workbook page 1: registered actors move, static art stays static", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/cartilla/leccion/1");
  await expect(page.locator(".fp-ix-cell .living-illustration").first()).toBeVisible({
    timeout: 30_000,
  });

  for (const name of ACTORS) {
    const m = await motionOf(page, name);
    expect(m, `${name} cell exists`).not.toBeNull();
    if (m!.partRigged) {
      expect(m!.parts.length, `${name} renders its registered parts`).toBeGreaterThan(0);
      expect(
        m!.parts.every((a) => a !== "none"),
        `${name} parts animate`,
      ).toBe(true);
      expect(m!.art, `${name} base art does not drift from its parts`).toBe("none");
    } else {
      expect(m!.parts, `${name} has no unrigged parts`).toHaveLength(0);
      expect(m!.wrapper !== "none" || m!.art !== "none", `${name} actor animates`).toBe(true);
    }
  }
  for (const name of STATIC) {
    const m = await motionOf(page, name);
    expect(m, `${name} cell exists`).not.toBeNull();
    expect(m!.anyRunning, `${name} stays static`).toBe(false);
  }
});

test("Workbook page 1: reduced motion stops every picture", async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 820, height: 1180 },
  });
  const page = await context.newPage();
  await page.goto("/cartilla/leccion/1");
  await expect(page.locator(".fp-ix-cell .living-illustration").first()).toBeVisible({
    timeout: 30_000,
  });
  for (const name of [...ACTORS, ...STATIC]) {
    const m = await motionOf(page, name);
    expect(m, `${name} cell exists`).not.toBeNull();
    expect(m!.anyRunning, `${name} is still under reduced motion`).toBe(false);
  }
  await context.close();
});
