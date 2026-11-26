/**
 * Teacher Review & Structured Replay E2E Demonstration.
 *
 * Uses explicitly labeled synthetic demo session data (non-real-student data)
 * to verify:
 * 1. Authorized JSON export/import of a completed multi-turn session
 *    (objective, sheets shown, Workbook & game activities, mistakes, hints,
 *    and successful corrections)
 * 2. Real teacher CRM sessions route (/cartilla/teacher/crm/.../sesiones)
 * 3. Explicit notice that student-device recordings are not automatically
 *    transferred to the teacher's device
 * 4. Structured replay ("Repetición estructurada de la sesión", never video)
 *    with timeline scrubbing & jump-to for mistakes, hints, and corrections
 * 5. Local persistence of teacher notes & outcome overrides across reload
 * 6. All 8 Spanish report sections with observations strictly separated from
 *    pedagogical recommendations
 * 7. Desktop (1366x768) and mobile (390x844) screenshots of replay & report
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  STUDENT_DEVICE_RECORDINGS_NOTICE,
  STRUCTURED_REPLAY_LABEL,
  TEACHER_REPORT_SECTION_TITLES,
  TUTOR_SESSION_EXPORT_FORMAT,
  appendSessionEvent,
  createSessionLog,
  exportSessionLogsJson,
  finalizeSessionLog,
  type TutorSessionLog,
} from "../../src/lib/tutor-session-log";
import { trackConsoleErrors } from "./support/tutor-helpers";

const SCREENSHOT_DIR =
  process.env.TEACHER_REVIEW_SCREENSHOT_DIR ||
  "/Users/ejn/.gemini/antigravity/brain/1afe681b-328c-4694-a6f8-d92230341964";

const CRM_SESIONES_PATH = "/cartilla/teacher/crm/seed-class-demo/seed-student-sofia/sesiones";

function buildSyntheticDemoSession(): TutorSessionLog {
  let session = createSessionLog({
    sessionId: "demo-sess-l1-completa",
    learnerId: "demo-estudiante-no-real",
    lesson: 1,
    objective: "Reconocer y trazar la vocal a/A en lectura y escritura inicial",
    isDemo: true,
    curriculumVersion: "cartilla-24-v1",
    resourceVersions: {
      curriculumVersion: "cartilla-24-v1",
      dialogueManifestVersion: "v2.0",
      packVersion: "v1.1.0",
    },
    startedAt: "2026-11-26T14:00:00.000Z",
    consentSnapshot: {
      eventLogging: true,
      audiovisualRecording: true,
      studentMic: true,
      studentCamera: false,
    },
  });

  session = appendSessionEvent(session, {
    kind: "sheet_opened",
    summary: "Lámina del rotafolio: vocal a/A e ilustraciones iniciales",
    printedPage: 2,
    pdfSheet: 4,
    sheetSource: "flipchart",
    at: "2026-11-26T14:00:10.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "presentation_action",
    summary: "Gretel señala la vocal 'a' junto a 'ala'",
    presentationAction: "highlight_vowel_a",
    itemId: "l1-word-ala",
    itemText: "ala",
    at: "2026-11-26T14:00:22.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "outcome",
    summary: "Leyó e identificó 'ala' al primer intento",
    itemId: "l1-word-ala",
    itemText: "ala",
    outcome: "correct",
    attemptNumber: 1,
    at: "2026-11-26T14:00:38.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "sheet_opened",
    summary: "Apertura del Cuaderno de ejercicios: página impresa 3 (hoja PDF 5)",
    printedPage: 3,
    pdfSheet: 5,
    sheetSource: "workbook",
    at: "2026-11-26T14:00:50.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "activity_started",
    summary: "Inicio de actividad del Cuaderno: cuaderno-vocal-a",
    activityId: "cuaderno-vocal-a",
    at: "2026-11-26T14:00:58.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "attempt",
    summary: "Confundió la vocal inicial en 'araña' con 'e'",
    itemId: "l1-word-arana",
    itemText: "araña",
    outcome: "missed",
    attemptNumber: 1,
    at: "2026-11-26T14:01:15.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "hint",
    summary: "Pista articulatoria: abrir bien la boca para /a/ en 'araña'",
    itemId: "l1-word-arana",
    itemText: "araña",
    hintKind: "articulatory",
    at: "2026-11-26T14:01:28.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "correction",
    summary: "Gretel modeló lentamente 'a-ra-ña' separando la sílaba inicial",
    itemId: "l1-word-arana",
    itemText: "araña",
    correctionDetail: "Modelado silábico lento de /a/ + ra + ña",
    at: "2026-11-26T14:01:42.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "outcome",
    summary: "Corrigió con éxito y pronunció 'araña' tras la pista",
    itemId: "l1-word-arana",
    itemText: "araña",
    outcome: "correct_after_retry",
    attemptNumber: 2,
    at: "2026-11-26T14:01:58.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "activity_completed",
    summary: "Actividad del Cuaderno completada: cuaderno-vocal-a",
    activityId: "cuaderno-vocal-a",
    at: "2026-11-26T14:02:10.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "activity_started",
    summary: "Inicio de juego de refuerzo: juego-jardin-mariposas",
    activityId: "juego-jardin-mariposas",
    at: "2026-11-26T14:02:20.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "outcome",
    summary: "Dificultad observada al distinguir 'abeja' en el juego",
    itemId: "l1-word-abeja",
    itemText: "abeja",
    outcome: "missed",
    attemptNumber: 2,
    at: "2026-11-26T14:02:40.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "activity_completed",
    summary: "Juego finalizado: juego-jardin-mariposas",
    activityId: "juego-jardin-mariposas",
    at: "2026-11-26T14:02:55.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "progress_change",
    summary: "Progreso actualizado en Lección 1 (Vocal a)",
    progressFrom: "introduced",
    progressTo: "practicing",
    at: "2026-11-26T14:03:05.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "recording_stopped",
    summary: "Referencia local de grabación audiovisual en dispositivo del estudiante",
    recordingId: "rec-demo-local-only-01",
    at: "2026-11-26T14:03:10.000Z",
  });

  return finalizeSessionLog(session, "2026-11-26T14:03:20.000Z", [
    {
      itemId: "l1-trace-A",
      label: "Trazo de la A mayúscula",
      activityId: "cuaderno-vocal-a",
      printedPage: 3,
      reason: "Quedó pendiente el último renglón de trazo al finalizar el tiempo",
    },
  ]);
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("Teacher Review & Structured Replay E2E (synthetic demo data)", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test("imports/exports synthetic session, exercises structured replay, saves local teacher notes/overrides, verifies 8 Spanish report sections, and captures desktop + mobile screenshots", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const consoleErrors = trackConsoleErrors(page);

    const demoSession = buildSyntheticDemoSession();
    const exportedJson = exportSessionLogsJson([demoSession]);
    const parsedExport = JSON.parse(exportedJson) as {
      format: string;
      deviceNotice: string;
      sessions: TutorSessionLog[];
    };
    expect(parsedExport.format).toBe(TUTOR_SESSION_EXPORT_FORMAT);
    expect(parsedExport.deviceNotice).toBe(STUDENT_DEVICE_RECORDINGS_NOTICE);
    expect(parsedExport.sessions[0].isDemo).toBe(true);
    expect(exportedJson).not.toContain("rawAudio");
    expect(exportedJson).not.toContain("fullTranscript");

    // 1. Open real teacher CRM sessions route at desktop (1366x768)
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(CRM_SESIONES_PATH, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Revisión de sesiones del Tutor/i })).toBeVisible({
      timeout: 30_000,
    });

    // 2. Verify explicit notice that student-device recordings are NOT automatically transferred
    const noticeBox = page.getByRole("note").filter({
      hasText: "Aviso sobre grabaciones en el dispositivo del estudiante",
    });
    await expect(noticeBox).toBeVisible();
    await expect(noticeBox).toContainText(STUDENT_DEVICE_RECORDINGS_NOTICE);

    // 3. Import the exported synthetic JSON file through the real file input
    const fileInput = page.getByLabel("Importar archivo JSON de sesiones");
    await fileInput.setInputFiles({
      name: "demo-gretel-session.json",
      mimeType: "application/json",
      buffer: Buffer.from(exportedJson, "utf-8"),
    });
    await expect(
      page.getByRole("status").filter({ hasText: "Se importaron 1 sesión(es) autorizada(s)." }),
    ).toBeVisible();

    // Also verify local export produces a valid download envelope with the device notice
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Exportar JSON local/i }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const downloadedPayload = fs.readFileSync(downloadPath!, "utf-8");
    expect(downloadedPayload).toContain(STUDENT_DEVICE_RECORDINGS_NOTICE);
    expect(downloadedPayload).toContain("demo-sess-l1-completa");

    // 4. Verify Structured Replay ("Repetición estructurada de la sesión", never video)
    const replaySection = page.locator("[data-tutor-replay]");
    await expect(replaySection).toBeVisible();
    await expect(replaySection).toContainText(STRUCTURED_REPLAY_LABEL);
    await expect(replaySection).toContainText("no es una grabación de pantalla ni video");
    await expect(replaySection).toContainText(/Demostración sintética/i);
    await expect(replaySection).toContainText(demoSession.objective!);

    // Verify jump-to buttons for mistakes, hints, and corrections
    await replaySection.getByRole("button", { name: /Errores \(2\)/i }).click();
    await expect(replaySection).toContainText("Confundió la vocal inicial en 'araña' con 'e'");

    await replaySection.getByRole("button", { name: /Pistas \(1\)/i }).click();
    await expect(replaySection).toContainText("Pista articulatoria: abrir bien la boca para /a/ en 'araña'");

    await replaySection.getByRole("button", { name: /Correcciones \(1\)/i }).click();
    await expect(replaySection).toContainText("Gretel modeló lentamente 'a-ra-ña'");

    // Verify timeline scrubbing to successful correction & game activity
    const scrubber = replaySection.getByRole("slider", {
      name: "Línea de tiempo de la repetición estructurada",
    });
    await scrubber.fill("9");
    await scrubber.dispatchEvent("change");
    await expect(replaySection).toContainText("Corrigió con éxito y pronunció 'araña' tras la pista");
    await expect(replaySection).toContainText("Actividad: cuaderno-vocal-a");

    await scrubber.fill("11");
    await scrubber.dispatchEvent("change");
    await expect(replaySection).toContainText("Actividad: juego-jardin-mariposas");

    // Jump back to correction so desktop screenshot highlights a clear teaching moment
    await replaySection.getByRole("button", { name: /Correcciones \(1\)/i }).click();
    await replaySection.scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow(page);
    await replaySection.screenshot({
      path: path.join(SCREENSHOT_DIR, "teacher-review-replay-1366x768.png"),
    });

    // 5. Verify teacher notes & outcome overrides save locally and survive reload
    const noteText = "Demo docente: respondió muy bien tras el modelado silábico de 'araña'.";
    await page
      .getByPlaceholder(/Añadir observación del docente|Añadir nota vinculada/i)
      .fill(noteText);
    await page.getByRole("button", { name: "Guardar nota local" }).click();
    await expect(page.getByText(noteText)).toBeVisible();

    await page.getByLabel("Elemento").selectOption("l1-word-abeja");
    await page.getByLabel("Resultado ajustado").selectOption("correct_after_retry");
    await page
      .getByPlaceholder(/Motivo del ajuste/i)
      .fill("Demo docente: pronunció 'abeja' claramente en el segundo intento");
    await page.getByRole("button", { name: "Aplicar ajuste al reporte" }).click();
    await expect(page.getByText(/abeja: Dificultad observada → Logrado tras reintento/i)).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(noteText)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/abeja: Dificultad observada → Logrado tras reintento/i)).toBeVisible();

    // 6. Verify all 8 Spanish report sections with observations strictly separated from recommendations
    const reportArticle = page.getByRole("article", { name: "Reporte docente de la sesión" });
    await expect(reportArticle).toBeVisible();

    const observationsBlock = reportArticle.locator('[data-report-block="observations"]');
    const recommendationsBlock = reportArticle.locator('[data-report-block="recommendations"]');
    await expect(observationsBlock).toBeVisible();
    await expect(recommendationsBlock).toBeVisible();

    const observationTitles = TEACHER_REPORT_SECTION_TITLES.slice(0, 7);
    for (const title of observationTitles) {
      await expect(observationsBlock.locator(`[data-report-section="${title}"]`)).toBeVisible();
      await expect(observationsBlock.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
    // Observations block must NEVER contain section 8 (Recommendations)
    await expect(
      observationsBlock.locator('[data-report-section="Recomendaciones para continuar"]'),
    ).toHaveCount(0);

    // Recommendations block must contain section 8 only
    await expect(
      recommendationsBlock.getByRole("heading", { name: "Recomendaciones para continuar", exact: true }),
    ).toBeVisible();
    await expect(recommendationsBlock).toContainText("Continuar en la próxima sesión");

    // Verify objective, sheets, activities, achievements (with override), difficulties, hints, and pending work
    await expect(reportArticle).toContainText(demoSession.objective!);
    await expect(reportArticle).toContainText("Rotafolio · pág. impresa 2 (hoja PDF 4)");
    await expect(reportArticle).toContainText("Cuaderno · pág. impresa 3 (hoja PDF 5)");
    await expect(reportArticle).toContainText("Actividad: cuaderno-vocal-a.");
    await expect(reportArticle).toContainText("Actividad: juego-jardin-mariposas.");
    await expect(reportArticle).toContainText("abeja (logrado tras reintento, 2 intentos) [ajustado por docente]");
    await expect(reportArticle).toContainText("Trazo de la A mayúscula (pág. 3)");

    await reportArticle.scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow(page);
    await reportArticle.screenshot({
      path: path.join(SCREENSHOT_DIR, "teacher-review-report-1366x768.png"),
    });

    // 7. Mobile (390x844) layout verification & screenshots
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);
    await assertNoHorizontalOverflow(page);

    await replaySection.getByRole("button", { name: /Correcciones \(1\)/i }).click();
    await expect(replaySection).toContainText("Gretel modeló lentamente 'a-ra-ña'");
    await replaySection.scrollIntoViewIfNeeded();
    await replaySection.screenshot({
      path: path.join(SCREENSHOT_DIR, "teacher-review-replay-390x844.png"),
    });

    await reportArticle.scrollIntoViewIfNeeded();
    await reportArticle.screenshot({
      path: path.join(SCREENSHOT_DIR, "teacher-review-report-390x844.png"),
    });

    expect(consoleErrors.errors()).toEqual([]);
  });
});
