import { expect, test } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };
const groups: Record<number, number[]> = {
  19: [67, 68, 69, 70],
  20: [71, 72, 73, 74],
  21: [75, 76, 77, 78],
  22: [79, 80, 81, 82],
  23: [83, 84, 85],
  24: [88, 89, 90],
};
async function openSourcePage(
  page: import("@playwright/test").Page,
  lesson: number,
  number: number,
) {
  await page.addInitScript(
    ({ lesson, number, index }) => {
      // Only prior lessons unlocked: the current page is genuinely unfinished.
      localStorage.setItem(
        "cartilla.lesson-progress.v1",
        JSON.stringify(Array.from({ length: lesson - 1 }, (_, i) => i + 1)),
      );
      localStorage.setItem(
        `cartilla.learner-resume.v1:${lesson}`,
        JSON.stringify({ lesson, page: index, printedPage: number }),
      );
    },
    { lesson, number, index: groups[lesson].indexOf(number) },
  );
  await page.goto(`/cartilla/leccion/${lesson}`);
  await expect(page.locator(".native-lesson-viewer")).toHaveAttribute(
    "data-native-page",
    String(number),
  );
  await page.evaluate(() => document.fonts.ready);
}
for (const width of [390, 844, 1280]) {
  test(`all 22 source pages render within ${width}px without added pictures`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const [lesson, numbers] of Object.entries(groups))
      for (const number of numbers) {
        await openSourcePage(page, Number(lesson), number);
        const book = page.locator(".fp-lane-c");
        await expect(book).toBeVisible();
        await expect(book.locator(".living-illustration, .fp-art-pending")).toHaveCount(0);
        if ([67, 71, 75, 79, 83].includes(number) && width === 390) {
          await expect
            .poll(
              async () => {
                const paper = await book.boundingBox();
                const footer = await page.locator(".native-lesson-viewer__footer").boundingBox();
                return !!paper && !!footer && footer.y >= paper.y + paper.height - 1;
              },
              { message: `page ${number}: navigation never covers the writing area` },
            )
            .toBe(true);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `page ${number}`,
        ).toBe(true);
        for (const grid of await book.locator(".fp-ix-fill--book-grid").all()) {
          expect(
            await grid.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length),
          ).toBe(3);
        }
        for (const word of await book.locator(".native-syllable__letters").all()) {
          expect(
            await word.evaluate((e) => {
              const w = e.getBoundingClientRect(),
                b = e.closest("button")!.getBoundingClientRect();
              return w.left >= b.left - 1 && w.right <= b.right + 1;
            }),
            `page ${number}: word remains in its target`,
          ).toBe(true);
        }
      }
    expect(errors).toEqual([]);
  });
}
for (const [lesson, number] of [
  [19, 68],
  [20, 72],
  [21, 76],
  [22, 80],
  [23, 84],
  [24, 88],
]) {
  test(`page ${number}: existing pencil retries, circles and restores real selection`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSourcePage(page, lesson, number);
    const host = page.locator(".native-syllable").first();
    const button = host.locator(".native-syllable__word").first();
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    // taza ends in za, so use its first character; the other five use the last.
    await button.dispatchEvent("pointerup", {
      clientX: number === 88 ? box!.x + 1 : box!.x + box!.width - 1,
      pointerId: 1,
    });
    await expect(host.getByRole("status")).toContainText("Inténtalo otra vez");
    await expect(host.locator(".is-retrying")).toHaveCount(0, { timeout: 10000 });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 10000 });
    await page.reload();
    await expect(
      page.locator(".native-syllable").first().locator(".native-syllable__word").first(),
    ).toHaveAttribute("aria-pressed", "true");
  });
}
for (const [lesson, number] of [
  [19, 70],
  [20, 74],
  [21, 78],
  [22, 82],
  [24, 90],
]) {
  test(`page ${number}: six source blanks and sentence writing save real work`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSourcePage(page, lesson, number);
    const source = (
      layouts.pages as Record<
        string,
        {
          regions: Array<{
            regionType: string;
            fillItems?: Array<{ choices: Array<{ correct?: boolean }> }>;
          }>;
        }
      >
    )[String(number)].regions.find((r) => r.regionType === "fill-in-blank")!;
    const items = page.locator(".fp-ix-fill__item");
    await expect(items).toHaveCount(6);
    for (let i = 0; i < 6; i++)
      await items
        .nth(i)
        .locator(".fp-ix-fill__choice")
        .nth(source.fillItems![i].choices.findIndex((c) => c.correct))
        .click();
    await expect(page.locator(".fp-ix-fill__blank--correct")).toHaveCount(6);
    await page.locator("textarea").fill("Mi oración de prueba.");
    await page.reload();
    await expect(page.locator("textarea")).toHaveValue("Mi oración de prueba.");
    await expect(page.locator(".fp-ix-fill__blank--correct")).toHaveCount(6);
  });
}
for (const [lesson, number] of [
  [19, 67],
  [20, 71],
  [21, 75],
  [22, 79],
  [23, 83],
]) {
  test(`page ${number}: existing tracing and drawing hosts retain real work`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSourcePage(page, lesson, number);
    for (const trace of await page.locator(".fp-trace").all()) {
      let count = 0;
      while (await trace.locator(".fp-trace__dot--active").count()) {
        await trace.locator(".fp-trace__dot--active").click();
        expect(++count).toBeLessThan(100);
      }
      await expect(trace).toHaveAttribute("data-status", "done");
    }
    const hosts = await page.locator(".am-dibuja").all();
    for (const host of hosts) {
      const canvas = host.locator("canvas");
      await canvas.scrollIntoViewIfNeeded();
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      await page.mouse.move(box!.x + 15, box!.y + 20);
      await page.mouse.down();
      await page.mouse.move(box!.x + box!.width - 20, box!.y + Math.min(box!.height - 10, 45), {
        steps: 20,
      });
      await page.mouse.up();
      const ready = host.getByRole("button", { name: "Listo", exact: true });
      await expect(ready).toBeEnabled();
      await ready.click();
    }
    await page.reload();
    for (const trace of await page.locator(".fp-trace").all())
      await expect(trace).toHaveAttribute("data-status", "done");
    await expect(page.locator(".am-dibuja__completed-banner")).toHaveCount(hosts.length);
  });
}
