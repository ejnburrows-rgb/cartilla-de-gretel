import { expect, test } from "@playwright/test";
import layouts from "../../src/data/page-layouts.json" with { type: "json" };

function finishedPage(page: number) {
  const data = layouts.pages as Record<
    string,
    { regions: Array<{ id: string; regionType: string }> }
  >;
  return data[String(page)]!.regions.map((region) => `page-${page}-${region.id}`);
}

test("p2 uses shared pencil feedback, stays keyboard accessible, and restores completed answers", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    (done) => localStorage.setItem("cartilla.page-completion.v1", JSON.stringify({ "1": done })),
    finishedPage(1),
  );
  await page.goto("/cartilla/leccion/1");
  const viewer = page.locator(".native-lesson-viewer");
  await expect(viewer).toHaveAttribute("data-native-page", "1");
  await viewer.getByTestId("button-next").click();
  await expect(viewer).toHaveAttribute("data-native-page", "2");

  const next = viewer.getByTestId("button-next");
  await expect(next).toHaveAttribute("aria-disabled", "true");
  expect(await viewer.getByRole("button", { name: /^Vocal/ }).count()).toBe(0);

  const wrong = viewer.getByRole("button", { name: "manzana", exact: true });
  // Under reduced motion the eraser step lasts 60 ms, so record every mark state
  // the wrong picture passes through instead of hoping to catch it on screen.
  await wrong.evaluate((button) => {
    const seen: string[] = ((window as unknown as { markStatuses: string[] }).markStatuses = []);
    new MutationObserver(() => {
      button.querySelectorAll("[data-mark-status]").forEach((mark) => {
        const status = mark.getAttribute("data-mark-status");
        if (status && seen[seen.length - 1] !== status) seen.push(status);
      });
    }).observe(button, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-mark-status"],
    });
  });
  await wrong.click();
  await expect
    .poll(
      () => page.evaluate(() => (window as unknown as { markStatuses: string[] }).markStatuses),
      { timeout: 4000 },
    )
    .toContain("erasing");
  await expect(wrong.locator(".workbook-pencil-mark-container")).toHaveCount(0, { timeout: 1500 });
  await expect(wrong).toBeEnabled();

  for (const name of ["anillo", "estrella", "indio", "oso", "uniforme"]) {
    const target = viewer.getByRole("button", { name, exact: true });
    if (name === "anillo") await target.click();
    else {
      await target.focus();
      await page.keyboard.press("Enter");
    }
    await expect(target.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  }

  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cartilla.exercise-stats.v1") || "{}"),
  );
  const result = Object.values(stats["1"]).find((s: any) =>
    s.meta?.exercise?.startsWith("vowel_pick_one"),
  ) as any;
  expect(result.hits).toBe(5);
  expect(result.attempts).toBe(6);
  expect(result.meta.completed).toBe(true);
  await page.screenshot({
    path: "verification-screenshots/p0-p2-pencil-feedback.png",
    fullPage: true,
  });

  await page.reload();
  await expect(viewer).toHaveAttribute("data-native-page", "2");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await expect(viewer.locator(".fp-ix-cell.graded-correct")).toHaveCount(5);
  await expect(viewer.locator('[data-mark-status="correct"]')).toHaveCount(5);
});

test("p5 example + five answers; a wrong try, reload and return never strand completed work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((done) => {
    if (!localStorage.getItem("cartilla.page-completion.v1"))
      localStorage.setItem("cartilla.page-completion.v1", JSON.stringify({ "4": done }));
    (window as unknown as { proofEvents: unknown[] }).proofEvents = [];
    window.addEventListener("gretel:bus", (event) =>
      (window as unknown as { proofEvents: unknown[] }).proofEvents.push(
        (event as CustomEvent).detail,
      ),
    );
  }, finishedPage(4));
  await page.goto("/cartilla/leccion/2");
  const viewer = page.locator(".native-lesson-viewer");
  await expect(viewer).toHaveAttribute("data-native-page", "4");
  await viewer.getByTestId("button-next").click();
  await expect(viewer).toHaveAttribute("data-native-page", "5");
  const next = viewer.getByTestId("button-next");
  await expect(viewer.getByRole("button", { name: "ola", exact: true })).toHaveAttribute(
    "data-example",
    "true",
  );
  await expect(viewer.getByRole("button", { name: "ola", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await next.click({ force: true });
  await next.click({ force: true });
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { proofEvents: Array<{ type: string }> }).proofEvents.filter(
          (event) => event.type === "hint:show",
        ).length,
    ),
  ).toBe(0);
  const wrong = viewer.getByRole("button", { name: "iglú", exact: true });
  await wrong.click();
  // Owner decision 2026-10-14: lesson pages have no Gretel guide (no cue, hint or
  // Ayuda button). A wrong picture is erased and can simply be tried again.
  await expect(page.locator('[data-testid="gretel-presence"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ayuda", exact: true })).toHaveCount(0);
  await expect(wrong).toBeEnabled({ timeout: 10_000 });
  await expect(wrong).toHaveAttribute("aria-pressed", "false");
  for (const name of ["oveja", "ojos"]) {
    const target = viewer.getByRole("button", { name, exact: true });
    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
  }
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await page.reload();
  await expect(viewer).toHaveAttribute("data-native-page", "5");
  await expect(viewer.getByRole("button", { name: "oveja", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const name of ["oreja", "olla"]) {
    const target = viewer.getByRole("button", { name, exact: true });
    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
  }
  await expect(next).toHaveAttribute("aria-disabled", "true");
  const last = viewer.getByRole("button", { name: "oso", exact: true });
  await last.click();
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cartilla.exercise-stats.v1") || "{}"),
  );
  const result = Object.values(stats["2"]).find((s: any) =>
    s.meta?.exercise?.startsWith("pencil_line_2:p5"),
  ) as any;
  // No Gretel help exists on lesson pages, so finishing after one wrong try is the child's own success.
  expect(result.meta).toMatchObject({
    outcome: "independent-success",
    completed: true,
    assisted: false,
  });
  expect(result.hits).toBe(5);
  expect(result.attempts).toBe(6);
  // Advance the browser clock beyond the former delayed-reset window.
  await page.clock.install();
  await page.clock.fastForward(10000);
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await page.screenshot({
    path: "verification-screenshots/p0-p5-assisted-complete.png",
    fullPage: true,
  });
  await next.click();
  await expect(viewer).toHaveAttribute("data-native-page", "6");
  await expect(viewer.getByRole("button", { name: /Terminar lección/ })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await viewer.getByRole("button", { name: /Anterior/ }).click();
  await expect(viewer).toHaveAttribute("data-native-page", "5");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await page.reload();
  await expect(viewer).toHaveAttribute("data-native-page", "5");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await expect(viewer.getByRole("button", { name: "oso", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
