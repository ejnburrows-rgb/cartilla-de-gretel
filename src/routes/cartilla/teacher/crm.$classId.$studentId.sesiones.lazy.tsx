import { useMemo, useRef, useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clipboard,
  Download,
  FileUp,
  Info,
  MessageSquarePlus,
  Printer,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { isSeedSessionActive } from "@/lib/seed-data";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { TutorReplay } from "@/components/tutor/TutorReplay";
import {
  STUDENT_DEVICE_RECORDINGS_NOTICE,
  STRUCTURED_REPLAY_LABEL,
  addTeacherNote,
  exportSessionLogsJson,
  formatDurationEs,
  generateTeacherSessionReport,
  importSessionLogsJson,
  loadAllSessionLogs,
  removeTeacherNote,
  removeTeacherOverride,
  saveSessionLog,
  setTeacherOverride,
  type TutorSessionEvent,
  type TutorSessionLog,
  type TutorSessionOutcome,
} from "@/lib/tutor-session-log";
import "@/styles/teacher-print.css";

export const Route = createLazyFileRoute("/cartilla/teacher/crm/$classId/$studentId/sesiones")({
  component: TeacherSesionesReview,
});

const OUTCOME_LABEL: Record<TutorSessionOutcome, string> = {
  correct: "Logrado (primer intento)",
  correct_after_retry: "Logrado tras reintento",
  missed: "Dificultad observada",
  skipped: "Omitido",
};

function TeacherSesionesReview() {
  const { classId, studentId } = Route.useParams();
  const isSeed = useMemo(() => isSeedSessionActive(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: progress } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const [sessions, setSessions] = useState<TutorSessionLog[]>(() => {
    const loaded = loadAllSessionLogs();
    return (loaded.data ?? []).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    const loaded = loadAllSessionLogs();
    const list = (loaded.data ?? []).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return list[0]?.sessionId ?? null;
  });

  const [selectedEvent, setSelectedEvent] = useState<TutorSessionEvent | null>(null);
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [jsonPasteText, setJsonPasteText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [overrideItemId, setOverrideItemId] = useState("");
  const [overrideOutcome, setOverrideOutcome] = useState<TutorSessionOutcome>("correct");
  const [overrideReason, setOverrideReason] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const activeSession = useMemo(
    () => sessions.find((s) => s.sessionId === selectedSessionId) ?? sessions[0] ?? null,
    [sessions, selectedSessionId],
  );

  const report = useMemo(
    () => (activeSession ? generateTeacherSessionReport(activeSession) : null),
    [activeSession],
  );

  const outcomeItems = useMemo(() => {
    if (!activeSession) return [];
    const seen = new Map<string, { itemId: string; label: string; outcome: TutorSessionOutcome }>();
    for (const evt of activeSession.events) {
      if (evt.kind === "outcome" && evt.itemId && evt.outcome) {
        seen.set(evt.itemId, {
          itemId: evt.itemId,
          label: evt.itemText ?? evt.itemId,
          outcome: evt.outcome,
        });
      }
    }
    return [...seen.values()];
  }, [activeSession]);

  const refreshSessions = (focusId?: string) => {
    const loaded = loadAllSessionLogs();
    const sorted = (loaded.data ?? []).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    setSessions(sorted);
    if (focusId) {
      setSelectedSessionId(focusId);
    } else if (sorted.length > 0 && !sorted.some((s) => s.sessionId === selectedSessionId)) {
      setSelectedSessionId(sorted[0].sessionId);
    }
  };

  const persistUpdatedSession = (updated: TutorSessionLog) => {
    saveSessionLog(updated);
    refreshSessions(updated.sessionId);
  };

  const handleImportJsonString = (raw: string) => {
    const result = importSessionLogsJson(raw);
    if (!result.ok) {
      setImportFeedback({ ok: false, text: result.error ?? "No se pudo importar el archivo JSON." });
      return;
    }
    setImportFeedback({
      ok: true,
      text: `Se importaron ${result.importedCount} sesión(es) autorizada(s)${
        result.skippedCount > 0 ? ` (${result.skippedCount} omitida(s))` : ""
      }.`,
    });
    setJsonPasteText("");
    setShowPasteBox(false);
    refreshSessions(result.sessions[0]?.sessionId);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      handleImportJsonString(text);
    } catch {
      setImportFeedback({ ok: false, text: "No se pudo leer el archivo seleccionado." });
    } finally {
      event.target.value = "";
    }
  };

  const handleExportLocalJson = () => {
    const targetSessions = activeSession ? [activeSession] : sessions;
    if (targetSessions.length === 0) return;
    const json = exportSessionLogsJson(targetSessions);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gretel-sesiones-${studentId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !noteDraft.trim()) return;
    const updated = addTeacherNote(activeSession, noteDraft, {
      eventId: selectedEvent?.id,
      offsetMs: selectedEvent?.offsetMs,
    });
    setNoteDraft("");
    persistUpdatedSession(updated);
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    const target = outcomeItems.find((i) => i.itemId === overrideItemId) ?? outcomeItems[0];
    if (!target) return;
    const updated = setTeacherOverride(activeSession, {
      itemId: target.itemId,
      itemLabel: target.label,
      originalOutcome: target.outcome,
      overriddenOutcome: overrideOutcome,
      reason: overrideReason || "Ajuste manual del docente",
    });
    setOverrideReason("");
    persistUpdatedSession(updated);
  };

  const handleCopyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.plainText);
    setCopyMessage("Reporte docente copiado");
  };

  const studentDisplayName = progress?.student.display_name ?? `Estudiante ${studentId}`;

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6 pb-10">
      {/* Top navigation & export/import toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/cartilla/teacher/crm/$classId/$studentId"
          params={{ classId, studentId }}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a {studentDisplayName}
        </Link>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
            aria-label="Importar archivo JSON de sesiones"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            <FileUp className="h-4 w-4" /> Importar JSON autorizado
          </button>
          <button
            type="button"
            onClick={() => setShowPasteBox((prev) => !prev)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            Pegar JSON
          </button>
          <button
            type="button"
            onClick={handleExportLocalJson}
            disabled={sessions.length === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" /> Exportar JSON local
          </button>
        </div>
      </div>

      {/* Explicit device-locality notice */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-black">Aviso sobre grabaciones en el dispositivo del estudiante</p>
          <p className="font-semibold leading-relaxed">{STUDENT_DEVICE_RECORDINGS_NOTICE}</p>
        </div>
      </div>

      {importFeedback && (
        <p
          role="status"
          className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${
            importFeedback.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50"
          }`}
          style={importFeedback.ok ? undefined : { color: "#881337" }}
        >
          {importFeedback.text}
        </p>
      )}

      {showPasteBox && (
        <div className="no-print rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-stone-600">
            Pegar JSON autorizado exportado del Tutor de Gretel
            <textarea
              value={jsonPasteText}
              onChange={(e) => setJsonPasteText(e.target.value)}
              rows={5}
              placeholder='{"format":"gretel-tutor-session-export","schemaVersion":1,"sessions":[...]}'
              className="mt-2 w-full rounded-xl border border-stone-300 p-3 font-mono text-xs text-stone-800"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="min-h-10 rounded-xl border border-stone-300 bg-white px-4 text-xs font-bold text-stone-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleImportJsonString(jsonPasteText)}
              className="min-h-10 rounded-xl bg-stone-800 px-4 text-xs font-black text-white"
            >
              Importar sesiones
            </button>
          </div>
        </div>
      )}

      {/* Session selector */}
      <section className="no-print rounded-3xl border-2 border-[#e8dcc0] bg-white p-5 space-y-3">
        <h1 className="text-xl font-black text-stone-800">
          Revisión de sesiones del Tutor — {studentDisplayName}
        </h1>
        {sessions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sessions.map((session) => {
              const isSelected = session.sessionId === activeSession?.sessionId;
              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`rounded-2xl border px-4 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-indigo-50"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                  style={isSelected ? { borderColor: "#6366f1", color: "#1e1b4b" } : undefined}
                >
                  <div className="text-xs font-black">
                    Lección {session.lesson} · {formatDurationEs(session.durationMs)}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    {new Date(session.startedAt).toLocaleString("es-ES")} · {session.events.length} eventos
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-semibold text-stone-500">
            No hay sesiones locales registradas en este dispositivo todavía. Usa «Importar JSON
            autorizado» para cargar una sesión exportada desde el dispositivo del estudiante.
          </p>
        )}
      </section>

      {activeSession && report && (
        <>
          {/* Structured Replay (explicitly labeled "Repetición estructurada de la sesión") */}
          <div className="no-print">
            <TutorReplay session={activeSession} onSelectEvent={(evt) => setSelectedEvent(evt)} />
          </div>

          {/* Teacher Notes & Outcome Overrides (local-only) */}
          <div className="no-print grid gap-5 lg:grid-cols-2">
            {/* Teacher Notes */}
            <section className="rounded-3xl border-2 border-[#e8dcc0] bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                <h2 className="text-base font-black text-stone-800">Notas del docente</h2>
              </div>
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder={
                    selectedEvent
                      ? `Añadir nota vinculada a ${formatDurationEs(selectedEvent.offsetMs)} (${selectedEvent.summary})...`
                      : "Añadir observación del docente sobre esta sesión..."
                  }
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm font-semibold text-stone-800"
                />
                <button
                  type="submit"
                  disabled={!noteDraft.trim()}
                  className="min-h-10 rounded-xl px-4 text-xs font-black text-white disabled:opacity-40"
                  style={{ backgroundColor: "#4338ca" }}
                >
                  Guardar nota local
                </button>
              </form>

              {activeSession.teacherNotes.length > 0 ? (
                <ul className="space-y-2">
                  {activeSession.teacherNotes.map((note) => (
                    <li
                      key={note.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-stone-800">{note.text}</p>
                        <p className="text-[11px] font-bold text-stone-400">
                          {note.offsetMs != null ? `Minuto ${formatDurationEs(note.offsetMs)} · ` : ""}
                          {new Date(note.updatedAt).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => persistUpdatedSession(removeTeacherNote(activeSession, note.id))}
                        aria-label="Eliminar nota"
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-semibold text-stone-500">
                  Sin notas del docente en esta sesión.
                </p>
              )}
            </section>

            {/* Teacher Outcome Overrides */}
            <section className="rounded-3xl border-2 border-[#e8dcc0] bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <h2 className="text-base font-black text-stone-800">Ajustes del docente (overrides)</h2>
              </div>

              {outcomeItems.length > 0 ? (
                <form onSubmit={handleSaveOverride} className="space-y-2.5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-xs font-bold text-stone-600">
                      Elemento
                      <select
                        value={overrideItemId || outcomeItems[0]?.itemId || ""}
                        onChange={(e) => setOverrideItemId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800"
                      >
                        {outcomeItems.map((item) => (
                          <option key={item.itemId} value={item.itemId}>
                            {item.label} ({OUTCOME_LABEL[item.outcome]})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-bold text-stone-600">
                      Resultado ajustado
                      <select
                        value={overrideOutcome}
                        onChange={(e) => setOverrideOutcome(e.target.value as TutorSessionOutcome)}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800"
                      >
                        <option value="correct">{OUTCOME_LABEL.correct}</option>
                        <option value="correct_after_retry">{OUTCOME_LABEL.correct_after_retry}</option>
                        <option value="missed">{OUTCOME_LABEL.missed}</option>
                        <option value="skipped">{OUTCOME_LABEL.skipped}</option>
                      </select>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Motivo del ajuste (ej. ruido en el aula, pronunció bien fuera del micrófono)"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-800"
                  />
                  <button
                    type="submit"
                    className="min-h-10 rounded-xl bg-amber-700 px-4 text-xs font-black text-white"
                  >
                    Aplicar ajuste al reporte
                  </button>
                </form>
              ) : (
                <p className="text-xs font-semibold text-stone-500">
                  Esta sesión no tiene resultados de ítems disponibles para ajustar.
                </p>
              )}

              {activeSession.teacherOverrides.length > 0 && (
                <ul className="space-y-2">
                  {activeSession.teacherOverrides.map((ovr) => (
                    <li
                      key={ovr.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 p-3"
                      style={{ backgroundColor: "rgba(255, 251, 235, 0.7)" }}
                    >
                      <div className="space-y-0.5 text-xs">
                        <p className="font-black text-stone-800">
                          {ovr.itemLabel ?? ovr.itemId}: {OUTCOME_LABEL[ovr.originalOutcome]} →{" "}
                          {OUTCOME_LABEL[ovr.overriddenOutcome]}
                        </p>
                        <p className="font-semibold text-stone-600">{ovr.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          persistUpdatedSession(removeTeacherOverride(activeSession, ovr.itemId))
                        }
                        aria-label="Quitar ajuste"
                        className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* 8-Section Spanish Teacher Report (Observations strictly separate from Recommendations) */}
          <article
            aria-label="Reporte docente de la sesión"
            className="print-page rounded-3xl border-2 border-[#e8dcc0] bg-white p-6 sm:p-8 space-y-6"
          >
            <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#e8dcc0] pb-5">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
                  La Cartilla de Gretel · {STRUCTURED_REPLAY_LABEL}
                </div>
                <h2 className="mt-1 text-2xl font-black text-stone-800">
                  Reporte docente — Lección {activeSession.lesson}
                </h2>
                <p className="mt-1 break-words text-xs font-bold text-stone-500">
                  {studentDisplayName} · Sesión {activeSession.sessionId} · Versión curricular{" "}
                  {activeSession.curriculumVersion}
                </p>
                {activeSession.isDemo && (
                  <p className="mt-2 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-900">
                    Datos sintéticos de demostración (no corresponden a un estudiante real)
                  </p>
                )}
              </div>
              <div className="no-print flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyReport()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 text-xs font-bold text-stone-700"
                >
                  <Clipboard className="h-4 w-4" /> Copiar reporte
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-vowel-a px-3.5 text-xs font-black text-white"
                >
                  <Printer className="h-4 w-4" /> Imprimir / PDF
                </button>
              </div>
            </header>

            {copyMessage && (
              <p className="no-print text-right text-xs font-bold text-emerald-700">{copyMessage}</p>
            )}

            {/* Block A: Observed facts (Sections 1–7) */}
            <div data-report-block="observations" className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-stone-500">
                Observaciones registradas en la sesión
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.observations.map((section) => (
                  <section
                    key={section.title}
                    data-report-section={section.title}
                    className="min-w-0 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-2"
                  >
                    <h3 className="text-sm font-black text-stone-800">{section.title}</h3>
                    <ul className="list-disc pl-4 space-y-1 text-xs font-semibold leading-relaxed text-stone-700 break-words">
                      {section.lines.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>

            {/* Block B: Pedagogical Recommendations (Section 8 — strictly separated) */}
            <section
              data-report-block="recommendations"
              data-report-section={report.recommendations.title}
              className="rounded-2xl border-2 border-blue-200 p-5 space-y-2"
              style={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                Sugerencias pedagógicas (separadas de las observaciones)
              </div>
              <h3 className="text-base font-black text-blue-950">{report.recommendations.title}</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm font-semibold leading-relaxed text-blue-950 break-words">
                {report.recommendations.lines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </section>
          </article>
        </>
      )}
    </div>
  );
}
