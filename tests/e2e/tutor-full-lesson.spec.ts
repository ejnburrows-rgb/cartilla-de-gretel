/**
 * Full-Lesson Autonomous Tutor E2E Proof (Lesson 1 & Lesson 8 · Pp).
 *
 * Explicit honesty disclosures:
 * - Speech recognition uses StubEars scripted fixtures (`VITE_TUTOR_EARS=stub`
 *   via `cartilla.tutor.test-ears.v1` localStorage script). Scripted fixtures
 *   are NOT live microphone or Vosk accuracy measurements.
 * - Desktop (`1366x768`) and mobile (`390x844`) viewports are Playwright
 *   emulated viewports.
 * - Playwright video recording is enabled (`video: "on"`).
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  expectSameOriginOnly,
  expectSessionEnded,
  gumCallCount,
  micReadyToListen,
  readProgressEvents,
  readTutorMemory,
  scriptLessonQueue,
  sessionEnded,
  stubGetUserMedia,
  tapMicWhenReady,
  trackConsoleErrors,
  trackRequests,
  tutorSessionUrl,
} from "./support/tutor-helpers";

const ORIGIN = "http://127.0.0.1:5175";
const ARTIFACT_DIR =
  process.env.TUTOR_FULL_LESSON_ARTIFACT_DIR ||
  "/Users/ejn/.gemini/antigravity/brain/bfa2eb2c-2895-40ef-8a19-77a5607722cb";

const EXPECTED_REPORT_SECTIONS = [
  "Resumen de la sesión",
  "Contenido trabajado",
  "Actividades realizadas",
  "Logros demostrados",
  "Dificultades observadas",
  "Pistas utilizadas",
  "Contenido pendiente",
  "Recomendaciones para continuar",
] as const;

test.use({
  video: { mode: "on", size: { width: 1366, height: 768 } },
});

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    shellOverflow: (() => {
      const shell = document.querySelector<HTMLElement>("[data-tutor-call-shell]");
      return shell ? shell.scrollWidth - shell.clientWidth : 0;
    })(),
  }));
  expect(overflow.docOverflow).toBeLessThanOrEqual(0);
  expect(overflow.shellOverflow).toBeLessThanOrEqual(0);
}

async function driveUntilPracticeOrEnded(page: Page, maxTaps: number): Promise<number> {
  let taps = 0;
  while (true) {
    const reachedPractice =
      (await page
        .locator('[data-tutor-practice-banner][data-pedagogical-stage="WORKBOOK_PRACTICE"]')
        .count()) > 0;
    if (reachedPractice || (await sessionEnded(page))) break;

    await expect
      .poll(
        async () =>
          (await page
            .locator('[data-tutor-practice-banner][data-pedagogical-stage="WORKBOOK_PRACTICE"]')
            .count()) > 0 ||
          (await sessionEnded(page)) ||
          (await micReadyToListen(page)),
        { timeout: 120_000 },
      )
      .toBe(true);

    const nowPractice =
      (await page
        .locator('[data-tutor-practice-banner][data-pedagogical-stage="WORKBOOK_PRACTICE"]')
        .count()) > 0;
    if (nowPractice || (await sessionEnded(page))) break;

    await page.locator("[data-tutor-mic]").click();
    taps += 1;
    if (taps > maxTaps) {
      throw new Error(`Did not reach Workbook Practice or Ended after ${maxTaps} mic taps`);
    }
  }
  return taps;
}

test.describe("Tutor Full-Lesson E2E Proof (StubEars scripted fixtures, emulated viewports)", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    stubGetUserMedia(page);
  });

  test("Lesson 1 (emulated 1366x768, StubEars scripted): start-to-finish flow, layout switches, 3-level hints, workbook, game, replay & report", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    const consoleErrors = trackConsoleErrors(page);
    const requests = trackRequests(page);
    const observedThinkingAtIdle: string[] = [];

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(tutorSessionUrl(1, "full-l1", 2));
    await expect(page.locator("[data-tutor-call-shell]")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Prueba: micrófono simulado")).toBeVisible();

    // Sample status badge during initial start/idle stages: must NEVER say "Pensando…" while idle
    for (let i = 0; i < 6; i += 1) {
      const stateInfo = await page.evaluate(() => {
        const pill = document.querySelector(".tutor-state-pill");
        return {
          state: pill?.getAttribute("data-tutor-state") ?? "",
          text: pill?.textContent?.trim() ?? "",
        };
      });
      if (stateInfo.state === "thinking" || stateInfo.text.includes("Pensando")) {
        observedThinkingAtIdle.push(`${stateInfo.state}:${stateInfo.text}`);
      }
      await page.waitForTimeout(150);
    }
    expect(observedThinkingAtIdle).toEqual([]);

    // Capture persistent avatar DOM identity before layout switches
    await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      w.__l1AvatarSlot = document.querySelector("[data-tutor-avatar-slot]");
      w.__l1PuppetNode = document.querySelector("[data-tutor-puppet]");
    });

    // Script Lesson 1 (24 items), with 2 errors before correction on item 0 ("a")
    const items = await scriptLessonQueue(page, 1, {
      0: [
        { ok: true, transcript: "e", alternatives: [] },
        { ok: true, transcript: "i", alternatives: [] },
        { ok: true, transcript: "a", alternatives: [] },
      ],
    });
    expect(items.ids).toHaveLength(24);

    // Wait for autonomous flow to arrive at LISTEN (after Welcome -> Objective -> Flipchart -> Model)
    await expect.poll(async () => micReadyToListen(page), { timeout: 60_000 }).toBe(true);

    // Confirm honest waiting badge ("Esperando respuesta") when idle in LISTEN
    await expect(page.locator(".tutor-state-pill")).toHaveAttribute("data-tutor-state", "waiting");
    await expect(page.locator(".tutor-state-pill")).toContainText("Esperando respuesta");
    await expect(page.locator("[data-tutor-question-prompt]")).toBeVisible();

    // Exercise layout switches: call -> split -> flipchart-pip (bottom-left & bottom-right) -> practice -> call
    await page.locator('[data-layout-option="split"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "split",
    );
    await expect(page.getByTestId("flipchart-native-board")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="tutor-flipchart-highlight"]').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "full-l1-split-1366x768.png"),
      fullPage: false,
    });

    await page.locator('[data-layout-option="flipchart-pip"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "flipchart-pip",
    );
    await page.getByRole("button", { name: "Acoplar ventana abajo a la izquierda" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-left",
    );
    await page.getByRole("button", { name: "Acoplar ventana abajo a la derecha" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-right",
    );
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "full-l1-pip-1366x768.png"),
      fullPage: false,
    });

    await page.locator('[data-layout-option="practice"]').click();
    await expect(page.getByTestId("tutor-practice-host")).toBeVisible({ timeout: 15_000 });
    await page.locator('[data-layout-option="call"]').click();
    await expect(page.locator("[data-tutor-call-shell]")).toHaveAttribute(
      "data-layout-mode",
      "call",
    );

    const preserved = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      return {
        sameSlot: w.__l1AvatarSlot === document.querySelector("[data-tutor-avatar-slot]"),
        samePuppet: w.__l1PuppetNode === document.querySelector("[data-tutor-puppet]"),
      };
    });
    expect(preserved).toEqual({ sameSlot: true, samePuppet: true });

    // Mistake 1 -> Hint level 1
    await tapMicWhenReady(page);
    await expect(page.locator('[data-tutor-hint-card][data-tutor-hint-level="1"]')).toBeVisible({
      timeout: 30_000,
    });

    // Mistake 2 -> Hint level 2 (simpler explanation)
    await tapMicWhenReady(page);
    await expect(page.locator('[data-tutor-hint-card][data-tutor-hint-level="2"]')).toBeVisible({
      timeout: 30_000,
    });

    // Successful correction on item 0 ("a")
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () => (await readProgressEvents(page)).find((ev) => ev.item_id === "l1-vowel-a"),
        { timeout: 30_000 },
      )
      .toMatchObject({ result: "correct_after_retry", attempts: 3 });

    // Drive remaining 23 items to autonomous Workbook Practice (Mode D)
    await driveUntilPracticeOrEnded(page, items.ids.length * 2);

    // Autonomous Mode D Workbook Practice
    await expect(
      page.locator('[data-tutor-practice-banner][data-pedagogical-stage="WORKBOOK_PRACTICE"]'),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("tutor-practice-host")).toHaveAttribute(
      "data-practice-kind",
      "workbook",
    );
    await page.locator("[data-tutor-complete-workbook]").click();

    // Autonomous Mode D Reinforcement Game
    await expect(
      page.locator('[data-tutor-practice-banner][data-pedagogical-stage="GAME_PRACTICE"]'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("tutor-practice-host")).toHaveAttribute(
      "data-practice-kind",
      "game",
    );
    await page.locator("[data-tutor-complete-game]").click();

    // Completion, Structured Replay, and 8-section Teacher Report readiness
    await expectSessionEnded(page);
    await expect(page.getByRole("heading", { name: "¡Muy bien!" })).toBeVisible();
    await expect(
      page.locator("[data-tutor-replay], [aria-label='Repetición estructurada de la sesión']"),
    ).toBeVisible();
    const report = page.locator("[data-tutor-teacher-report-ready]");
    await expect(report).toBeVisible();
    for (const title of EXPECTED_REPORT_SECTIONS) {
      await expect(report.locator(`[data-report-section="${title}"]`)).toBeVisible();
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "full-l1-complete-1366x768.png"),
      fullPage: false,
    });

    const events = await readProgressEvents(page);
    expect(events.map((e) => e.item_id)).toEqual(items.ids);
    const memory = await readTutorMemory(page);
    expect(Object.keys(memory).length).toBeGreaterThan(0);
    expect(await gumCallCount(page)).toBe(0);
    expectSameOriginOnly(requests.urls(), ORIGIN);
    expect(consoleErrors.errors()).toEqual([]);

    const video = page.video();
    await page.close();
    if (video) {
      await video.saveAs(path.join(ARTIFACT_DIR, "tutor-full-lesson-1-1366x768.webm"));
    }
  });

  test("Lesson 8 Pp (emulated 390x844 phone, StubEars scripted): consonant/syllable flow, hints, layout switches, workbook & game", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    const consoleErrors = trackConsoleErrors(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(tutorSessionUrl(8, "full-l8", 3));
    await expect(page.locator("[data-tutor-call-shell]")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /Lección 8/ })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    // Status badge must NOT show "Pensando…" while idle at lesson start
    const initialBadge = await page.locator(".tutor-state-pill").getAttribute("data-tutor-state");
    expect(initialBadge).not.toBe("thinking");

    // Script Lesson 8 (40 items: syllables pa-pu, words, sight word yo, sentences)
    // Item 0 is "pa"; "pe" and "po" are Lesson 8 distractors -> OTHER_WORD fails -> hints 1 & 2 -> correction "pa"
    const items = await scriptLessonQueue(page, 8, {
      0: [
        { ok: true, transcript: "pe", alternatives: [] },
        { ok: true, transcript: "po", alternatives: [] },
        { ok: true, transcript: "pa", alternatives: [] },
      ],
    });
    expect(items.ids).toHaveLength(40);

    await expect.poll(async () => micReadyToListen(page), { timeout: 60_000 }).toBe(true);
    await expect(page.locator(".tutor-state-pill")).toHaveAttribute("data-tutor-state", "waiting");
    await assertNoHorizontalOverflow(page);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "full-l8-call-390x844.png"),
      fullPage: false,
    });

    // Exercise layout switches on phone 390x844
    await page.locator('[data-layout-option="split"]').click();
    await expect(page.getByTestId("flipchart-native-board")).toBeVisible({ timeout: 15_000 });
    await assertNoHorizontalOverflow(page);
    await page.locator('[data-layout-option="flipchart-pip"]').click();
    await page.getByRole("button", { name: "Acoplar ventana abajo a la izquierda" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-left",
    );
    await page.getByRole("button", { name: "Acoplar ventana abajo a la derecha" }).click();
    await expect(page.locator("[data-tutor-avatar-slot]")).toHaveAttribute(
      "data-pip-corner",
      "bottom-right",
    );
    await assertNoHorizontalOverflow(page);
    await page.locator('[data-layout-option="call"]').click();

    // Mistake -> Hint level 1 -> Mistake -> Hint level 2 -> Correction on "pa"
    await tapMicWhenReady(page);
    await expect(page.locator('[data-tutor-hint-card][data-tutor-hint-level="1"]')).toBeVisible({
      timeout: 30_000,
    });
    await tapMicWhenReady(page);
    await expect(page.locator('[data-tutor-hint-card][data-tutor-hint-level="2"]')).toBeVisible({
      timeout: 30_000,
    });
    await tapMicWhenReady(page);
    await expect
      .poll(
        async () => (await readProgressEvents(page)).find((ev) => ev.item_id === "l8-syllable-pa"),
        { timeout: 30_000 },
      )
      .toMatchObject({ result: "correct_after_retry", attempts: 3 });

    // Drive remaining 39 items to Workbook Practice
    await driveUntilPracticeOrEnded(page, items.ids.length * 2);

    await expect(
      page.locator('[data-tutor-practice-banner][data-pedagogical-stage="WORKBOOK_PRACTICE"]'),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("tutor-practice-host")).toHaveAttribute(
      "data-practice-kind",
      "workbook",
    );
    await assertNoHorizontalOverflow(page);
    await page.locator("[data-tutor-complete-workbook]").click();

    // Reinforcement game for Lesson 8
    await expect(
      page.locator('[data-tutor-practice-banner][data-pedagogical-stage="GAME_PRACTICE"]'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("tutor-practice-host")).toHaveAttribute(
      "data-practice-kind",
      "game",
    );
    await assertNoHorizontalOverflow(page);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "full-l8-game-390x844.png"),
      fullPage: false,
    });
    await page.locator("[data-tutor-complete-game]").click();

    // Completion + Replay + 8-section Teacher Report
    await expectSessionEnded(page);
    await expect(page.getByRole("heading", { name: "¡Muy bien!" })).toBeVisible();
    const report = page.locator("[data-tutor-teacher-report-ready]");
    await expect(report).toBeVisible();
    for (const title of EXPECTED_REPORT_SECTIONS) {
      await expect(report.locator(`[data-report-section="${title}"]`)).toBeVisible();
    }

    const events = await readProgressEvents(page);
    expect(events.map((e) => e.item_id)).toEqual(items.ids);
    expect(await gumCallCount(page)).toBe(0);
    expect(consoleErrors.errors()).toEqual([]);

    const video = page.video();
    await page.close();
    if (video) {
      await video.saveAs(path.join(ARTIFACT_DIR, "tutor-full-lesson-8-390x844.webm"));
    }
  });
});
