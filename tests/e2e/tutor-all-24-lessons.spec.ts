/**
 * All-24-Lessons Tutor E2E Sweep + Invalid URL Guard + Web-Accessible Avatar Preview.
 *
 * Explicit honesty disclosures:
 * - Speech recognition in this lane uses StubEars scripted fixtures
 *   (`VITE_TUTOR_EARS=stub` via `cartilla.tutor.test-ears.v1` localStorage script).
 *   Scripted fixtures are NOT real on-device Vosk accuracy measurements.
 * - Typed answers are exercised directly via the Transcript drawer text input
 *   and verified to complete without activating the microphone (`gumCallCount === 0`).
 * - Artifact output paths are strictly repo-relative (`test-results/tutor-all-24`),
 *   with an optional `TUTOR_ALL_24_ARTIFACT_DIR` env var override.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  expectSameOriginOnly,
  gumCallCount,
  micReadyToListen,
  readProgressEvents,
  scriptLessonQueue,
  stubGetUserMedia,
  trackConsoleErrors,
  trackRequests,
  tutorSessionUrl,
} from "./support/tutor-helpers";

const ORIGIN = "http://127.0.0.1:5175";
const ARTIFACT_DIR =
  process.env.TUTOR_ALL_24_ARTIFACT_DIR ||
  path.join(process.cwd(), "test-results/tutor-all-24");

const LESSON_BATCHES: ReadonlyArray<{ label: string; lessons: readonly number[] }> = [
  { label: "Lessons 1–6", lessons: [1, 2, 3, 4, 5, 6] },
  { label: "Lessons 7–12", lessons: [7, 8, 9, 10, 11, 12] },
  { label: "Lessons 13–18", lessons: [13, 14, 15, 16, 17, 18] },
  { label: "Lessons 19–24", lessons: [19, 20, 21, 22, 23, 24] },
];

const SCREENSHOT_LESSONS = new Set([1, 12, 24]);

async function verifySingleLesson(page: Page, lesson: number): Promise<void> {
  const consoleErrors = trackConsoleErrors(page);
  const requests = trackRequests(page);

  // Start each lesson with clean localStorage so prior lesson progress never bleeds
  await page.goto(tutorSessionUrl(lesson, `all24-l${lesson}`, 1));
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await expect(page.locator("[data-tutor-call-shell]")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("heading", { name: new RegExp(`Lección\\s+${lesson}\\b`) })).toBeVisible();

  // Honest status badge at start/idle: must never say "Pensando…" while idle
  const initialState = await page.evaluate(() => {
    const pill = document.querySelector(".tutor-state-pill");
    return {
      state: pill?.getAttribute("data-tutor-state") ?? "",
      text: pill?.textContent?.trim() ?? "",
    };
  });
  expect(initialState.state, `Lesson ${lesson} initial state must not be thinking`).not.toBe("thinking");
  expect(initialState.text, `Lesson ${lesson} initial text must not say Pensando`).not.toContain("Pensando");

  // Capture persistent avatar DOM identity BEFORE layout switches
  await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__avatarSlotNode = document.querySelector("[data-tutor-avatar-slot]");
    w.__puppetNode = document.querySelector("[data-tutor-puppet]");
  });

  // Load authentic derived book items for this lesson (StubEars scripted fixture)
  const items = await scriptLessonQueue(page, lesson);
  expect(items.ids.length, `Lesson ${lesson} must have authentic book items`).toBeGreaterThan(0);
  expect(items.texts.length).toBe(items.ids.length);

  // Wait for autonomous flow to reach LISTEN (ready for answer)
  await expect.poll(async () => micReadyToListen(page), { timeout: 60_000 }).toBe(true);

  // Honest status badge when idle in LISTEN: waiting ("Esperando respuesta"), never "Pensando…"
  const listenPill = page.locator(".tutor-state-pill");
  await expect(listenPill).toHaveAttribute("data-tutor-state", "waiting");
  await expect(listenPill).toContainText("Esperando respuesta");
  await expect(page.locator("[data-tutor-question-prompt]")).toBeVisible();

  // Layout switches: Call -> Split (Flip Chart sheet) -> Flip Chart PiP -> Practice (Workbook/game handoff) -> Call
  await page.locator('[data-layout-option="split"]').click();
  await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute("data-layout-mode", "split");
  await expect(page.getByTestId("flipchart-native-board")).toBeVisible({ timeout: 15_000 });

  if (SCREENSHOT_LESSONS.has(lesson)) {
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `lesson-${String(lesson).padStart(2, "0")}-split.png`),
      fullPage: false,
    });
  }

  await page.locator('[data-layout-option="flipchart-pip"]').click();
  await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
    "data-layout-mode",
    "flipchart-pip",
  );
  await expect(page.getByTestId("flipchart-native-board")).toBeVisible({ timeout: 15_000 });

  await page.locator('[data-layout-option="practice"]').click();
  await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
    "data-layout-mode",
    "practice",
  );
  await expect(page.getByTestId("tutor-practice-host")).toBeVisible({ timeout: 15_000 });

  await page.locator('[data-layout-option="call"]').click();
  await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute("data-layout-mode", "call");

  // Confirm persistent avatar DOM node was never unmounted across Call -> Split -> Flip Chart PiP -> Practice -> Call
  const preserved = await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>;
    const slot = document.querySelector("[data-tutor-avatar-slot]");
    const puppet = document.querySelector("[data-tutor-puppet]");
    return {
      hasSlot: Boolean(slot),
      hasPuppet: Boolean(puppet),
      sameSlot: w.__avatarSlotNode === slot,
      samePuppet: w.__puppetNode === puppet,
    };
  });
  expect(preserved, `Lesson ${lesson} avatar DOM identity across layouts`).toEqual({
    hasSlot: true,
    hasPuppet: true,
    sameSlot: true,
    samePuppet: true,
  });

  // Typed answer WITHOUT microphone activation (gumCallCount === 0)
  const openTranscriptBtn = page.getByRole("button", { name: "Abrir transcripción" });
  if ((await openTranscriptBtn.count()) > 0) {
    await openTranscriptBtn.click();
  }
  const textInput = page.getByRole("textbox", { name: "Escribir respuesta o pregunta" });
  await expect(textInput).toBeVisible({ timeout: 10_000 });
  await expect(textInput).toBeEnabled({ timeout: 10_000 });
  await textInput.fill(items.texts[0]);
  await page.getByRole("button", { name: "Enviar mensaje" }).click();

  await expect
    .poll(
      async () => (await readProgressEvents(page)).find((ev) => ev.item_id === items.ids[0]),
      { timeout: 30_000 },
    )
    .toBeTruthy();

  expect(await gumCallCount(page), `Lesson ${lesson} must not activate microphone`).toBe(0);
  expectSameOriginOnly(requests.urls(), ORIGIN);
  expect(consoleErrors.errors(), `Lesson ${lesson} console/page errors`).toEqual([]);
}

test.describe("All-24-Lessons Tutor E2E Sweep (StubEars scripted fixtures, not live Vosk)", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    stubGetUserMedia(page);
  });

  for (const batch of LESSON_BATCHES) {
    test(`${batch.label} (StubEars scripted): authentic book content, Flip Chart, Practice, persistent avatar, typed answer without mic`, async ({
      page,
    }) => {
      test.setTimeout(360_000);
      await page.setViewportSize({ width: 1280, height: 800 });
      for (const lesson of batch.lessons) {
        await verifySingleLesson(page, lesson);
      }
    });
  }

  test("Invalid lesson URLs (/tutor/25, /tutor/0, /tutor/abc) render friendly unavailable screen without crashing", async ({
    page,
  }) => {
    const consoleErrors = trackConsoleErrors(page);

    for (const badParam of ["25", "0", "abc"]) {
      await page.goto(tutorSessionUrl(badParam, "invalid-check", 1));
      await expect(page.getByText("Esta lección todavía no está lista")).toBeVisible({
        timeout: 20_000,
      });
    }

    expect(consoleErrors.errors()).toEqual([]);
  });

  test("Web-accessible Avatar Approval Preview (/tutor-avatar-preview.html) loads over HTTP with web-relative assets & real Rhubarb visemes", async ({
    page,
  }) => {
    const consoleErrors = trackConsoleErrors(page);
    const requests = trackRequests(page);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/tutor-avatar-preview.html");

    await expect(
      page.getByRole("heading", { name: "Gretel Tutor — Vista de Aprobación de Avatar" }),
    ).toBeVisible();

    // Zero file:/// links anywhere in the HTML
    const hasFileProtocol = await page.evaluate(() =>
      document.documentElement.innerHTML.includes("file://"),
    );
    expect(hasFileProtocol).toBe(false);

    // Wait for initial real Rhubarb visemes JSON (abeja) to load
    await expect(page.locator("#audioMeta")).toHaveAttribute("data-visemes-loaded", "true", {
      timeout: 15_000,
    });

    // Switch through abanico and oso to confirm all 3 real Rhubarb viseme JSONs load cleanly
    for (const word of ["abanico", "oso", "abeja"]) {
      await page.locator(`#audioSamplePills button[data-sample="${word}"]`).click();
      await expect(page.locator("#audioMeta")).toContainText(`l1-model-${word}.visemes.json`, {
        timeout: 10_000,
      });
      await expect(page.locator("#audioMeta")).toHaveAttribute("data-visemes-loaded", "true");
    }

    // Verify master and torso-up <img> elements loaded properly
    const imgStates = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.getAttribute("src"),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      })),
    );
    expect(imgStates.length).toBeGreaterThanOrEqual(2);
    for (const img of imgStates) {
      expect(img.complete, `Image ${img.src} must finish loading`).toBe(true);
      expect(img.naturalWidth, `Image ${img.src} must have naturalWidth > 0`).toBeGreaterThan(0);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "tutor-avatar-preview.png"),
      fullPage: false,
    });

    // Trigger the full Speaking + Chalkboard interaction demo and capture key frames
    await page.locator("#btnDemoSpeakingChalkboard").click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "tutor-avatar-speaking.png"),
      fullPage: false,
    });
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "tutor-avatar-listening.png"),
      fullPage: false,
    });
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "tutor-avatar-thinking.png"),
      fullPage: false,
    });

    expectSameOriginOnly(requests.urls(), ORIGIN);
    expect(consoleErrors.errors()).toEqual([]);
  });
});
