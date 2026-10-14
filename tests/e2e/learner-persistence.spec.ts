import { test, expect, type Page } from "@playwright/test";

type Learner = { classId: string; id: string };
async function roster(page: Page): Promise<Learner[]> {
  await page.goto("/cartilla/teacher/crm");
  await expect(page.getByRole("heading", { name: "Hoy en tu clase" })).toBeVisible();
  return page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("cartilla.seed.state.v1")!);
    return data.students
      .filter((s: { class_id: string }) => s.class_id === data.classes[0].id)
      .slice(0, 2)
      .map((s: { class_id: string; id: string }) => ({ classId: s.class_id, id: s.id }));
  });
}
async function select(page: Page, learner: Learner | null) {
  await page.evaluate(async (s) => {
    const path = "/src/lib/demo-student-session.ts";
    const api = await import(/* @vite-ignore */ path);
    if (s) api.startDemoStudentSession(s.classId, s.id);
    else api.endDemoStudentSession();
  }, learner);
}
const suffix = (s: Learner) => `:demo:${s.classId}:${s.id}`;
async function proof(page: Page, name: string) {
  const path = test.info().outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await test.info().attach(name, { path, contentType: "image/png" });
}
test.beforeEach(async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.abort());
  await page.route("**/auth/v1/**", (route) => route.abort());
});
test("lesson 3 resumes A on page 2, B on page 1, refresh and anonymous stay separate", async ({
  page,
}) => {
  test.setTimeout(120000);
  const [a, b] = await roster(page);
  await page.evaluate(
    ({ aKey, bKey }) => {
      localStorage.setItem(
        `cartilla.learner-resume.v1:3${aKey}`,
        JSON.stringify({ lesson: 3, page: 1 }),
      );
      localStorage.setItem(
        `cartilla.learner-resume.v1:3${bKey}`,
        JSON.stringify({ lesson: 3, page: 0 }),
      );
      localStorage.setItem("cartilla.learner-resume.v1:3", JSON.stringify({ lesson: 3, page: 2 }));
    },
    { aKey: suffix(a), bKey: suffix(b) },
  );
  await select(page, a);
  await page.goto("/cartilla/leccion/3");
  const viewer = page.locator(".native-lesson-viewer");
  await expect(viewer).toHaveAttribute("data-native-page", "8");
  await select(page, b);
  await expect(viewer).toHaveAttribute("data-native-page", "7");
  await select(page, a);
  await expect(viewer).toHaveAttribute("data-native-page", "8");
  await page.reload();
  await expect(viewer).toHaveAttribute("data-native-page", "8");
  await select(page, null);
  await expect(viewer).toHaveAttribute("data-native-page", "9");
  await select(page, b);
  await expect(viewer).toHaveAttribute("data-native-page", "7");
  await select(page, a);
  await expect(viewer).toHaveAttribute("data-native-page", "8");
  await proof(page, "lesson3-student-a-page2");
});
async function bookPage(page: Page, printed: number) {
  await expect(page.locator("[data-native-page]")).toHaveAttribute(
    "data-native-page",
    String(printed),
    { timeout: 15000 },
  );
}
async function bookTurn(page: Page, direction: "next" | "prev") {
  await page.keyboard.press(direction === "next" ? "ArrowRight" : "ArrowLeft");
}
async function expectSingleNativeBook(page: Page) {
  await expect(page.locator("[data-native-page]")).toHaveCount(1);
  await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
  await expect(page.getByTestId("book-companion-anchor")).toHaveCount(0);
  await expect(page.locator("[data-workbook-source], [data-reconstructed-master]")).toHaveCount(0);
}
test("phone book saves 85→88 and restores after reload, return, A→B→A and anonymous switching", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  const [a, b] = await roster(page);
  await page.evaluate(
    (key) => localStorage.setItem(key, "85"),
    `cartilla.workbook-reader-page.v1${suffix(a)}`,
  );
  await select(page, a);
  await page.goto("/cartilla/cuaderno");
  await expectSingleNativeBook(page);
  await bookPage(page, 85);
  await page.getByTestId("button-next").click();
  await bookPage(page, 88);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key),
        `cartilla.workbook-reader-page.v1${suffix(a)}`,
      ),
    )
    .toBe("88");
  await page.reload();
  await bookPage(page, 88);
  await page.goto("/cartilla/lecciones");
  await page.goto("/cartilla/cuaderno");
  await bookPage(page, 88);
  await select(page, b);
  await bookPage(page, 1);
  await select(page, a);
  await bookPage(page, 88);
  await select(page, null);
  await bookPage(page, 1);
  await select(page, a);
  await bookPage(page, 88);
  await proof(page, "book-phone-resumed-printed88");
  await page.getByTestId("button-prev").click();
  await bookPage(page, 85);
});
for (const reducedMotion of [false, true]) {
  test(`desktop book is one native page, keeps 85→88 gap, keyboard, buttons and restore (reduced motion ${reducedMotion})`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
    await page.goto("/cartilla/lecciones");
    await page.evaluate(() => localStorage.setItem("cartilla.workbook-reader-page.v1", "85"));
    await page.goto("/cartilla/cuaderno");
    await expectSingleNativeBook(page);
    await bookPage(page, 85);
    await bookTurn(page, "next");
    await bookPage(page, 88);
    await page.getByTestId("button-next").click();
    await bookPage(page, 89);
    await page.reload();
    await bookPage(page, 89);
    await bookTurn(page, "prev");
    await bookPage(page, 88);
    await page.getByTestId("button-prev").click();
    await bookPage(page, 85);
    await proof(page, `book-desktop-${reducedMotion ? "reduced-motion" : "normal"}`);
  });
}
test("handwriting completion tracks remaining ink, interrupted reload and independent learners", async ({
  page,
}) => {
  test.setTimeout(180000);
  const [a, b] = await roster(page);
  await page.evaluate(
    (keys) => {
      for (const key of keys) localStorage.setItem(key, JSON.stringify({ lesson: 24, page: 3 }));
    },
    [a, b].map((s) => `cartilla.learner-resume.v1:24${suffix(s)}`),
  );
  await select(page, a);
  await page.goto("/cartilla/leccion/24");
  await expect(page.locator(".native-lesson-viewer")).toHaveAttribute("data-native-page", "90");
  const response = page.locator(".native-lesson-viewer .fp-writing-response");
  await response.getByRole("button", { name: "Mano alzada" }).click();
  const canvas = response.getByLabel("Área para escribir a mano alzada");
  async function draw(y = 0.3, end = true) {
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * y, { steps: 12 });
    if (end) await page.mouse.up();
  }
  const ink = () =>
    canvas.evaluate((el: HTMLCanvasElement) => {
      const pixels = el.getContext("2d")!.getImageData(0, 0, el.width, el.height).data;
      return pixels.some((alpha, i) => i % 4 === 3 && alpha > 0);
    });
  await draw();
  await response.getByRole("button", { name: "Listo", exact: true }).click();
  await expect(response.getByRole("button", { name: "Completado" })).toBeVisible();
  await response.getByRole("button", { name: "Borrador de goma" }).click();
  await draw();
  await expect.poll(ink).toBe(false);
  await expect(response.getByRole("button", { name: "Listo", exact: true })).toBeDisabled();
  await response.getByRole("button", { name: "Borrador de goma" }).click();
  await draw();
  await response.getByRole("button", { name: "Listo", exact: true }).click();
  await response.getByRole("button", { name: "Limpiar trazo" }).click();
  await expect(response.getByRole("button", { name: "Listo", exact: true })).toBeDisabled();
  await draw(0.6, false);
  await page.reload();
  await page.mouse.up();
  await expect.poll(ink).toBe(true);
  await proof(page, "handwriting-interrupted-reload");
  await select(page, b);
  await response.getByRole("button", { name: "Mano alzada" }).click();
  await expect.poll(ink).toBe(false);
  await select(page, a);
  await expect.poll(ink).toBe(true);
});
