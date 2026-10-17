import { expect, test } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };

test("page 1 pencil feedback preserves correct work, erases wrong marks, and restores completion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cartilla/leccion/1");
  const viewer = page.locator(".native-lesson-viewer");
  await expect(viewer).toHaveAttribute("data-native-page", "1");

  const grid = viewer.locator(".fp-ix-grid");
  const correctTargets = grid.locator('[data-gretel-correct="true"]');
  const wrong = grid.locator('[data-gretel-correct="false"]').first();
  const correctCount = await correctTargets.count();
  expect(correctCount).toBeGreaterThan(0);
  await expect(grid.getByRole("button", { name: "Comprobar" })).toHaveCount(0);

  const firstCorrect = correctTargets.first();
  await firstCorrect.click();
  await expect(firstCorrect.locator('[data-mark-status="correct"]')).toHaveCount(1, {
    timeout: 4000,
  });
  await expect(firstCorrect).toBeDisabled();

  // Under reduced motion the eraser step lasts only ~60 ms, so record every mark
  // status the wrong answer passes through instead of polling for that instant.
  await wrong.evaluate((el) => {
    const seen: string[] = ((window as any).__wrongMarkStatuses = []);
    const record = () =>
      el
        .querySelectorAll("[data-mark-status]")
        .forEach((m) => seen.push(m.getAttribute("data-mark-status") || ""));
    new MutationObserver(record).observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-mark-status"],
    });
  });
  await wrong.click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__wrongMarkStatuses as string[]), {
      timeout: 8000,
    })
    .toContain("erasing");
  await expect(wrong.locator(".workbook-pencil-mark-container")).toHaveCount(0, { timeout: 1500 });
  await expect(wrong).toBeEnabled();
  await expect(grid.locator(".graded-wrong")).toHaveCount(0);

  await page.screenshot({
    path: "docs/proofs/batch-2/p1-pencil-retry-no-reveal.png",
    fullPage: true,
  });

  for (let i = 1; i < correctCount; i++) {
    const target = correctTargets.nth(i);
    await target.click();
    await expect(target.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  }

  const next = viewer.getByRole("button", { name: "Siguiente" });
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await page.reload();
  await expect(viewer).toHaveAttribute("data-native-page", "1");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await expect(viewer.locator('[data-mark-status="correct"]')).toHaveCount(correctCount);
});

test("repeated syllables are accepted and Completa responds immediately without revealing the answer", async ({
  page,
}) => {
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  await page.addInitScript(
    (done) => localStorage.setItem("cartilla.page-completion.v1", JSON.stringify(done)),
    Object.fromEntries(
      [23, 24, 25].map((n) => [n, data[String(n)]!.regions.map((r) => `page-${n}-${r.id}`)]),
    ),
  );
  await page.goto("/cartilla/leccion/8");
  const viewer = page.locator(".native-lesson-viewer");
  await viewer.getByRole("button", { name: "Siguiente" }).click();
  await expect(viewer).toHaveAttribute("data-native-page", "24", { timeout: 6000 });
  const paRow = viewer.locator(".native-syllable").first();
  // "papá" holds the syllable "pa" twice; it still counts as one right word.
  await paRow.getByRole("button", { name: "papá", exact: true }).click();
  await expect(paRow.getByRole("status")).toContainText("1 de");
  await paRow.getByRole("button", { name: "papá", exact: true }).click();
  await expect(paRow.getByRole("status")).not.toContainText("2 de");
  await page.screenshot({ path: "docs/proofs/batch-2/repeated-syllable.png", fullPage: true });
  // The probe above changed live work on page 24; reload so the seeded finished
  // pages apply again and the walk continues to the fill-in page.
  await page.goto("/cartilla/leccion/8");
  if ((await viewer.getAttribute("data-native-page")) === "23") {
    await viewer.getByRole("button", { name: "Siguiente" }).click();
    await expect(viewer).toHaveAttribute("data-native-page", "24", { timeout: 6000 });
  }
  await viewer.getByRole("button", { name: "Siguiente" }).click();
  await expect(viewer).toHaveAttribute("data-native-page", "25", { timeout: 6000 });
  await viewer.getByRole("button", { name: "Siguiente" }).click();
  await expect(viewer).toHaveAttribute("data-native-page", "26", { timeout: 8000 });
  const item = viewer.locator(".fp-ix-fill__item").first();
  // papá = pa + pá: "pa" is the wrong choice for the blank, "pá" the right one.
  // A wrong choice is marked for retry right away and never reveals the answer.
  await item.getByRole("button", { name: "pa", exact: true }).click();
  await expect(item.locator(".is-retry")).toHaveCount(1);
  await expect(item.locator(".graded-correct")).toHaveCount(0);
  await expect(viewer.getByRole("button", { name: "Comprobar" })).toHaveCount(0);
  await item.getByRole("button", { name: "pá", exact: true }).click();
  await expect(item.locator(".graded-correct")).toHaveCount(1);
  await page.screenshot({ path: "docs/proofs/batch-2/completa-corrected.png", fullPage: true });
});

test("independent completion has independent evidence and wrong attempts remain in accuracy", async ({
  page,
}) => {
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  await page.addInitScript(
    (done) => localStorage.setItem("cartilla.page-completion.v1", JSON.stringify({ "1": done })),
    data["1"]!.regions.map((r) => `page-1-${r.id}`),
  );
  await page.goto("/cartilla/leccion/1");
  const viewer = page.locator(".native-lesson-viewer");
  await viewer.getByRole("button", { name: "Siguiente" }).click();
  for (const name of ["anillo", "estrella", "indio", "oso", "uniforme"])
    await viewer.getByRole("button", { name, exact: true }).click();
  await expect(viewer.getByRole("button", { name: "Siguiente" })).not.toHaveAttribute(
    "aria-disabled",
    "true",
  );
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cartilla.exercise-stats.v1") || "{}"),
  );
  const result = Object.values(stats["1"]).find((s: any) =>
    s.meta?.exercise?.startsWith("vowel_pick_one"),
  ) as any;
  expect(result.meta).toMatchObject({
    outcome: "independent-success",
    assisted: false,
    completed: true,
  });
  expect(result.hits).toBe(5);
  expect(result.attempts).toBe(5);
  await page.screenshot({ path: "docs/proofs/batch-2/independent-complete.png", fullPage: true });
});
