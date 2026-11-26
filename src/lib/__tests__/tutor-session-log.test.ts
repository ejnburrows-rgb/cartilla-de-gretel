/**
 * @vitest-environment jsdom
 */
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STRUCTURED_REPLAY_LABEL,
  STUDENT_DEVICE_RECORDINGS_NOTICE,
  TEACHER_REPORT_SECTION_TITLES,
  TUTOR_SESSION_LOG_STORAGE_KEY,
  addTeacherNote,
  appendSessionEvent,
  clearAllSessionLogs,
  clearSessionLogsForLearner,
  createSessionLog,
  exportSessionLogsJson,
  finalizeSessionLog,
  generateTeacherSessionReport,
  importSessionLogsJson,
  listSessionLogsForLearner,
  loadAllSessionLogs,
  removeTeacherNote,
  removeTeacherOverride,
  saveSessionLog,
  setTeacherOverride,
  type SessionLogKvStorage,
  type TutorSessionLog,
} from "../tutor-session-log";
import { TUTOR_PACK_MARKER_KEY } from "../tutor-offline-pack";
import { TutorReplay } from "@/components/tutor/TutorReplay";
import {
  DEFAULT_TUTOR_CONSENT,
  TutorConsentControls,
} from "@/components/tutor/TutorConsentControls";

function makeMemoryKv(): SessionLogKvStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function buildSampleSession(): TutorSessionLog {
  let session = createSessionLog({
    sessionId: "sess-demo-1",
    learnerId: "learner-slot-4",
    lesson: 7,
    objective: "Practicar las sílabas ma, me, mi de la Lección 7",
    isDemo: true,
    curriculumVersion: "cartilla-24-v1",
    resourceVersions: {
      curriculumVersion: "cartilla-24-v1",
      dialogueManifestVersion: "v2.0",
      packVersion: "v1.1.0",
    },
    startedAt: "2026-11-26T15:00:00.000Z",
  });

  session = appendSessionEvent(session, {
    kind: "sheet_opened",
    summary: "Apertura de página impresa 28 (hoja PDF 30)",
    printedPage: 28,
    pdfSheet: 30,
    at: "2026-11-26T15:00:10.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "activity_started",
    summary: "Inicio de actividad sílabas",
    activityId: "silabas",
    at: "2026-11-26T15:00:20.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "presentation_action",
    summary: "Gretel señala la sílaba ma",
    presentationAction: "point_syllable",
    itemId: "l7-syl-ma",
    itemText: "ma",
    at: "2026-11-26T15:00:30.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "outcome",
    summary: "Leyó 'ma' en el primer intento",
    itemId: "l7-syl-ma",
    itemText: "ma",
    outcome: "correct",
    attemptNumber: 1,
    at: "2026-11-26T15:00:45.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "hint",
    summary: "Pista articulatoria para la sílaba me",
    itemId: "l7-syl-me",
    itemText: "me",
    hintKind: "articulatory",
    at: "2026-11-26T15:01:05.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "outcome",
    summary: "Confundió 'me' con 'mi'",
    itemId: "l7-syl-me",
    itemText: "me",
    outcome: "missed",
    attemptNumber: 2,
    at: "2026-11-26T15:01:20.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "correction",
    summary: "Gretel modeló lentamente 'me'",
    itemId: "l7-syl-me",
    itemText: "me",
    correctionDetail: "Modelado lento de m + e",
    at: "2026-11-26T15:01:30.000Z",
  });
  session = appendSessionEvent(session, {
    kind: "progress_change",
    summary: "Progreso actualizado en Lección 7",
    progressFrom: "introduced",
    progressTo: "practicing",
    at: "2026-11-26T15:01:50.000Z",
  });
  session = finalizeSessionLog(session, "2026-11-26T15:02:00.000Z", [
    {
      itemId: "l7-word-mama",
      label: "mamá",
      activityId: "palabras",
      printedPage: 29,
      reason: "Quedó pendiente por cierre de tiempo",
    },
  ]);

  return session;
}

beforeEach(() => {
  localStorage.clear();
});

describe("tutor-session-log: structured event log & storage resilience", () => {
  it("records timestamped events, keeps printedPage separate from pdfSheet, and strips raw media", () => {
    let session = buildSampleSession();
    session = appendSessionEvent(session, {
      kind: "answer",
      summary: "Respuesta estructurada",
      itemId: "l7-syl-mi",
      at: "2026-11-26T15:02:00.000Z",
      // Hostile raw media fields must be stripped
      ...({
        rawAudio: "data:audio/webm;base64,AAA",
        imageBlob: "data:image/png;base64,BBB",
        fullTranscript: "mi mi mi",
      } as object),
    });

    expect(session.replayKind).toBe(STRUCTURED_REPLAY_LABEL);
    expect(session.replayKind).toBe("Repetición estructurada de la sesión");
    expect(session.durationMs).toBe(120_000);
    expect(session.sheets).toEqual([
      { printedPage: 28, pdfSheet: 30 },
      { printedPage: 29, pdfSheet: null },
    ]);
    expect(session.activities).toEqual(["silabas", "palabras"]);
    expect(session.keyMoments.map((m) => m.tag)).toEqual(["hint", "mistake", "correction"]);
    expect(session.unfinishedWork).toHaveLength(1);

    const serialized = JSON.stringify(session);
    expect(serialized).not.toContain("rawAudio");
    expect(serialized).not.toContain("imageBlob");
    expect(serialized).not.toContain("fullTranscript");
  });

  it("handles corrupt storage gracefully and isolates learners when listing or clearing", () => {
    const store = makeMemoryKv();
    store.setItem(TUTOR_PACK_MARKER_KEY, JSON.stringify({ version: "v1.1.0" }));
    store.setItem(TUTOR_SESSION_LOG_STORAGE_KEY, "{corrupt json");

    const corruptLoad = loadAllSessionLogs(store);
    expect(corruptLoad.ok).toBe(false);
    expect(corruptLoad.error).toBe("corrupt_data");
    expect(corruptLoad.data).toEqual([]);

    const s1 = buildSampleSession();
    const s2 = createSessionLog({
      sessionId: "sess-other",
      learnerId: "learner-slot-9",
      lesson: 3,
      curriculumVersion: "cartilla-24-v1",
    });

    expect(saveSessionLog(s1, store).ok).toBe(true);
    expect(saveSessionLog(s2, store).ok).toBe(true);

    expect(listSessionLogsForLearner("learner-slot-4", store)).toHaveLength(1);
    expect(listSessionLogsForLearner("learner-slot-9", store)).toHaveLength(1);

    clearSessionLogsForLearner("learner-slot-4", store);
    expect(listSessionLogsForLearner("learner-slot-4", store)).toEqual([]);
    expect(listSessionLogsForLearner("learner-slot-9", store)).toHaveLength(1);
    expect(store.getItem(TUTOR_PACK_MARKER_KEY)).toBe(JSON.stringify({ version: "v1.1.0" }));

    clearAllSessionLogs(store);
    expect(loadAllSessionLogs(store).data).toEqual([]);
    expect(store.getItem(TUTOR_PACK_MARKER_KEY)).toBe(JSON.stringify({ version: "v1.1.0" }));
  });

  it("handles QuotaExceededError without crashing", () => {
    const quotaStore: SessionLogKvStorage = {
      getItem: () => null,
      setItem: () => {
        const err = new Error("Quota exceeded");
        err.name = "QuotaExceededError";
        throw err;
      },
      removeItem: () => {},
    };
    const res = saveSessionLog(buildSampleSession(), quotaStore);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("quota_exceeded");
  });
});

describe("authorized local JSON export/import and 8-section Spanish teacher report", () => {
  it("exports with explicit student-device notice and imports cleanly while rejecting corrupt JSON", () => {
    const store = makeMemoryKv();
    const session = buildSampleSession();
    const exported = exportSessionLogsJson([session]);

    expect(exported).toContain(STUDENT_DEVICE_RECORDINGS_NOTICE);

    const badImport = importSessionLogsJson("{bad", store);
    expect(badImport.ok).toBe(false);

    const goodImport = importSessionLogsJson(exported, store);
    expect(goodImport.ok).toBe(true);
    expect(goodImport.importedCount).toBe(1);
    expect(listSessionLogsForLearner("learner-slot-4", store)).toHaveLength(1);
  });

  it("generates the exact 8 Spanish sections keeping observations separate from recommendations, reflecting teacher notes & overrides", () => {
    let session = buildSampleSession();
    session = addTeacherNote(session, "Excelente concentración durante la lectura de sílabas.");
    expect(session.teacherNotes).toHaveLength(1);

    // Teacher overrides 'me' from missed -> correct_after_retry
    session = setTeacherOverride(session, {
      itemId: "l7-syl-me",
      itemLabel: "me",
      originalOutcome: "missed",
      overriddenOutcome: "correct_after_retry",
      reason: "Hubo ruido externo; lo pronunció correctamente en el segundo intento",
    });

    const report = generateTeacherSessionReport(session);
    expect(report.sections.map((s) => s.title)).toEqual([...TEACHER_REPORT_SECTION_TITLES]);
    expect(report.sections).toHaveLength(8);
    expect(report.observations).toHaveLength(7);
    expect(report.observations.every((s) => s.category === "observation")).toBe(true);
    expect(report.recommendations.title).toBe("Recomendaciones para continuar");
    expect(report.recommendations.category).toBe("recommendation");
    // Override reflected in Logros demostrados
    const logros = report.sections.find((s) => s.title === "Logros demostrados");
    expect(logros?.lines.some((line) => line.includes("me") && line.includes("ajustado por docente"))).toBe(
      true,
    );

    // Removing note & override works cleanly
    session = removeTeacherNote(session, session.teacherNotes[0].id);
    session = removeTeacherOverride(session, "l7-syl-me");
    expect(session.teacherNotes).toHaveLength(0);
    expect(session.teacherOverrides).toHaveLength(0);
  });

  it("keeps Flip Chart flipchartSheet separate from Workbook printedPage/pdfSheet and formats both accurately (Gitar #15)", () => {
    let session = createSessionLog({
      sessionId: "sess-sheets-separation",
      learnerId: "learner-slot-2",
      lesson: 1,
      startedAt: "2026-11-26T15:00:00.000Z",
    });

    session = appendSessionEvent(session, {
      kind: "sheet_opened",
      summary: "Rotafolio · lámina 2 abierta",
      flipchartSheet: 2,
      // Even if a caller mistakenly passed a workbook printedPage on a flipchart event, it must be ignored
      printedPage: 99,
      sheetSource: "flipchart",
      at: "2026-11-26T15:00:05.000Z",
    });

    session = appendSessionEvent(session, {
      kind: "sheet_opened",
      summary: "Cuaderno · página impresa 3 abierta",
      printedPage: 3,
      pdfSheet: 5,
      sheetSource: "workbook",
      at: "2026-11-26T15:00:15.000Z",
    });

    const flipchartEvent = session.events.find((e) => e.sheetSource === "flipchart");
    expect(flipchartEvent?.flipchartSheet).toBe(2);
    expect(flipchartEvent?.printedPage).toBeUndefined();
    expect(flipchartEvent?.pdfSheet).toBeUndefined();

    expect(session.sheets).toEqual([
      { flipchartSheet: 2, source: "flipchart" },
      { printedPage: 3, pdfSheet: 5, source: "workbook" },
    ]);

    const report = generateTeacherSessionReport(session);
    const contentSection = report.sections.find((s) => s.title === "Contenido trabajado");
    expect(contentSection?.lines[0]).toContain("Rotafolio · lámina 2");
    expect(contentSection?.lines[0]).toContain("Cuaderno · pág. impresa 3 (hoja PDF 5)");
    expect(contentSection?.lines[0]).not.toContain("pág. impresa 99");

    // TutorReplay renders Flip Chart as "Rotafolio · lámina 2" on step 1 and Workbook on step 2
    const { rerender } = render(createElement(TutorReplay, { session, initialIndex: 1 }));
    expect(screen.getByText("Rotafolio · lámina 2")).toBeTruthy();

    rerender(createElement(TutorReplay, { session, initialIndex: 2 }));
    expect(screen.getByText("Cuaderno · pág. impresa 3 (hoja PDF 5)")).toBeTruthy();
  });

  it("formats legacy saved Flip Chart sessions using pdfSheet before printedPage, plus new Flip Chart and Workbook sessions", () => {
    const baseSession = createSessionLog({
      sessionId: "sess-legacy-flipchart",
      learnerId: "learner-slot-3",
      lesson: 1,
      startedAt: "2026-11-26T15:00:00.000Z",
    });

    // 1. Historical saved session: { source: "flipchart", printedPage: 1, pdfSheet: 3 } without flipchartSheet
    const historicalSession: TutorSessionLog = {
      ...baseSession,
      sheets: [{ source: "flipchart", printedPage: 1, pdfSheet: 3 }],
      events: [
        ...baseSession.events,
        {
          id: "evt-legacy-fc",
          at: "2026-11-26T15:00:05.000Z",
          offsetMs: 5000,
          kind: "sheet_opened",
          summary: "Rotafolio · lámina 3 abierta",
          sheetSource: "flipchart",
          printedPage: 1,
          pdfSheet: 3,
        },
      ],
    };

    const historicalReport = generateTeacherSessionReport(historicalSession);
    const historicalContent = historicalReport.sections.find((s) => s.title === "Contenido trabajado");
    expect(historicalContent?.lines[0]).toBe("Páginas trabajadas: Rotafolio · lámina 3.");
    expect(historicalContent?.lines[0]).not.toContain("lámina 1");
    expect(historicalContent?.lines[0]).not.toContain("pág. impresa 1");

    const { rerender } = render(
      createElement(TutorReplay, { session: historicalSession, initialIndex: 1 }),
    );
    expect(screen.getByText("Rotafolio · lámina 3")).toBeTruthy();
    expect(screen.queryByText(/lámina 1/i)).toBeNull();
    expect(screen.queryByText(/pág\. impresa 1/i)).toBeNull();

    // 2. Newly recorded session: { source: "flipchart", flipchartSheet: 3 }
    const newFlipchartSession: TutorSessionLog = {
      ...baseSession,
      sessionId: "sess-new-flipchart",
      sheets: [{ source: "flipchart", flipchartSheet: 3 }],
      events: [
        ...baseSession.events,
        {
          id: "evt-new-fc",
          at: "2026-11-26T15:00:05.000Z",
          offsetMs: 5000,
          kind: "sheet_opened",
          summary: "Rotafolio · lámina 3 abierta",
          sheetSource: "flipchart",
          flipchartSheet: 3,
        },
      ],
    };
    const newFcReport = generateTeacherSessionReport(newFlipchartSession);
    const newFcContent = newFcReport.sections.find((s) => s.title === "Contenido trabajado");
    expect(newFcContent?.lines[0]).toBe("Páginas trabajadas: Rotafolio · lámina 3.");

    rerender(createElement(TutorReplay, { session: newFlipchartSession, initialIndex: 1 }));
    expect(screen.getByText("Rotafolio · lámina 3")).toBeTruthy();

    // 3. Workbook session: { source: "workbook", printedPage: 1, pdfSheet: 7 }
    const workbookSession: TutorSessionLog = {
      ...baseSession,
      sessionId: "sess-workbook-page",
      sheets: [{ source: "workbook", printedPage: 1, pdfSheet: 7 }],
      events: [
        ...baseSession.events,
        {
          id: "evt-wb",
          at: "2026-11-26T15:00:05.000Z",
          offsetMs: 5000,
          kind: "sheet_opened",
          summary: "Cuaderno · página impresa 1 abierta",
          sheetSource: "workbook",
          printedPage: 1,
          pdfSheet: 7,
        },
      ],
    };
    const wbReport = generateTeacherSessionReport(workbookSession);
    const wbContent = wbReport.sections.find((s) => s.title === "Contenido trabajado");
    expect(wbContent?.lines[0]).toBe("Páginas trabajadas: Cuaderno · pág. impresa 1 (hoja PDF 7).");

    rerender(createElement(TutorReplay, { session: workbookSession, initialIndex: 1 }));
    expect(screen.getByText("Cuaderno · pág. impresa 1 (hoja PDF 7)")).toBeTruthy();
  });
});

describe("TutorReplay & TutorConsentControls UI invariants", () => {
  it("labels TutorReplay explicitly as 'Repetición estructurada de la sesión' and jumps to mistakes/corrections/hints", () => {
    const session = buildSampleSession();
    const onSelect = vi.fn();
    render(createElement(TutorReplay, { session, onSelectEvent: onSelect }));

    expect(screen.getByText(STRUCTURED_REPLAY_LABEL)).toBeTruthy();
    expect(screen.getByText(/cartilla-24-v1/)).toBeTruthy();

    // Jump to Pistas
    fireEvent.click(screen.getByRole("button", { name: /Pistas \(1\)/i }));
    expect(screen.getAllByText(/Pista articulatoria para la sílaba me/i).length).toBeGreaterThan(0);

    // Jump to Errores
    fireEvent.click(screen.getByRole("button", { name: /Errores \(1\)/i }));
    expect(screen.getAllByText(/Confundió 'me' con 'mi'/i).length).toBeGreaterThan(0);

    // Jump to Correcciones
    fireEvent.click(screen.getByRole("button", { name: /Correcciones \(1\)/i }));
    expect(screen.getAllByText(/Gretel modeló lentamente 'me'/i).length).toBeGreaterThan(0);
  });

  it("keeps student mic and camera OFF by default and provides separate opt-in toggles", () => {
    expect(DEFAULT_TUTOR_CONSENT.studentMic).toBe(false);
    expect(DEFAULT_TUTOR_CONSENT.studentCamera).toBe(false);
    expect(DEFAULT_TUTOR_CONSENT.audiovisualRecording).toBe(false);
    expect(DEFAULT_TUTOR_CONSENT.eventLogging).toBe(false);

    const onChange = vi.fn();
    render(
      createElement(TutorConsentControls, {
        sessionId: "sess-1",
        learnerId: "learner-1",
        onConsentChange: onChange,
      }),
    );

    const micToggle = screen.getByLabelText("Activar micrófono del estudiante") as HTMLInputElement;
    const camToggle = screen.getByLabelText("Activar cámara del estudiante") as HTMLInputElement;
    const logToggle = screen.getByLabelText("Activar registro estructurado de eventos") as HTMLInputElement;
    const avToggle = screen.getByLabelText("Activar grabación audiovisual opcional") as HTMLInputElement;

    expect(micToggle.checked).toBe(false);
    expect(camToggle.checked).toBe(false);
    expect(logToggle.checked).toBe(false);
    expect(avToggle.checked).toBe(false);

    // Toggling eventLogging does NOT enable mic, camera, or audiovisual recording
    fireEvent.click(logToggle);
    expect(onChange).toHaveBeenLastCalledWith({
      eventLogging: true,
      audiovisualRecording: false,
      studentMic: false,
      studentCamera: false,
    });
  });
});
