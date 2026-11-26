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
