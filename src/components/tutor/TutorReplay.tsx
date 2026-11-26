import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  STRUCTURED_REPLAY_LABEL,
  formatDurationEs,
  type TutorKeyMomentTag,
  type TutorSessionEvent,
  type TutorSessionLog,
} from "@/lib/tutor-session-log";

export type TutorReplayFilter = "all" | "mistake" | "correction" | "hint";

export interface TutorReplayProps {
  /** Structured session log to replay using its original resource versions. */
  session: TutorSessionLog;
  /** Optional initial event index to focus on. */
  initialIndex?: number;
  /** Optional callback whenever the active event changes (e.g. for teacher note linking). */
  onSelectEvent?: (event: TutorSessionEvent, index: number) => void;
  /** Optional extra CSS class name. */
  className?: string;
}

const SPEED_OPTIONS = [0.5, 1, 2] as const;

function matchesFilter(event: TutorSessionEvent, filter: TutorReplayFilter): boolean {
  if (filter === "all") return true;
  if (filter === "hint") return event.kind === "hint" || event.keyMomentTag === "hint";
  if (filter === "correction")
    return event.kind === "correction" || event.keyMomentTag === "correction";
  if (filter === "mistake") {
    return (
      event.keyMomentTag === "mistake" ||
      ((event.kind === "outcome" || event.kind === "attempt") && event.outcome === "missed")
    );
  }
  return true;
}

function eventBadge(event: TutorSessionEvent): {
  label: string;
  className: string;
  style?: CSSProperties;
} {
  if (event.kind === "hint") {
    return {
      label: "Pista",
      className: "",
      style: { backgroundColor: "#e0f2fe", color: "#075985", borderColor: "#bae6fd" },
    };
  }
  if (event.kind === "correction") {
    return { label: "Corrección", className: "bg-amber-100 text-amber-900 border-amber-200" };
  }
  if (event.kind === "attempt" && event.outcome === "missed") {
    return { label: "Error", className: "bg-rose-100 text-rose-800 border-rose-200" };
  }
  if (event.kind === "outcome" && event.outcome === "missed") {
    return { label: "Dificultad", className: "bg-rose-100 text-rose-800 border-rose-200" };
  }
  if (event.kind === "outcome" && event.outcome === "correct_after_retry") {
    return { label: "Logro tras corrección", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  }
  if (event.kind === "outcome" && event.outcome === "correct") {
    return { label: "Logro", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  }
  if (event.kind === "progress_change") {
    return {
      label: "Progreso",
      className: "",
      style: { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#c7d2fe" },
    };
  }
  if (event.kind === "unfinished_work") {
    return { label: "Pendiente", className: "bg-orange-100 text-orange-800 border-orange-200" };
  }
  if (event.kind === "presentation_action") {
    return { label: "Presentación", className: "bg-stone-100 text-stone-700 border-stone-200" };
  }
  return { label: event.kind.replace(/_/g, " "), className: "bg-stone-100 text-stone-700 border-stone-200" };
}

function keyMomentTagLabel(tag: TutorKeyMomentTag): string {
  switch (tag) {
    case "mistake":
      return "Error";
    case "correction":
      return "Corrección";
    case "hint":
      return "Pista";
    case "breakthrough":
      return "Avance";
    case "milestone":
      return "Hito";
  }
}

/**
 * Structured session replay viewer.
 * Always explicitly labeled "Repetición estructurada de la sesión" (never video).
 * Reconstructs the chronological sequence of presentation actions, sheets,
 * activities, attempts, hints, corrections, outcomes, and progress changes
 * against the session's original resource versions.
 */
export function TutorReplay({
  session,
  initialIndex = 0,
  onSelectEvent,
  className = "",
}: TutorReplayProps) {
  const events = session.events;
  const maxIndex = Math.max(0, events.length - 1);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), maxIndex),
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [filter, setFilter] = useState<TutorReplayFilter>("all");

  // Reset index when switching sessions
  useEffect(() => {
    setPlaying(false);
    setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, session.events.length - 1)));
  }, [session.sessionId, initialIndex, session.events.length]);

  const activeEvent = events[currentIndex] ?? null;

  useEffect(() => {
    if (activeEvent) {
      onSelectEvent?.(activeEvent, currentIndex);
    }
  }, [activeEvent, currentIndex, onSelectEvent]);

  // Step through structured events during playback
  useEffect(() => {
    if (!playing || events.length <= 1) return;
    if (currentIndex >= maxIndex) {
      setPlaying(false);
      return;
    }
    const curr = events[currentIndex];
    const next = events[currentIndex + 1];
    const rawDelta = Math.max(400, Math.min(3500, (next?.offsetMs ?? 0) - (curr?.offsetMs ?? 0)));
    const delayMs = Math.max(250, Math.round(rawDelta / speed));
    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [playing, currentIndex, maxIndex, events, speed]);

  // Reconstructed state up to currentIndex
  const reconstructed = useMemo(() => {
    let currentPrintedPage: number | null = null;
    let currentPdfSheet: number | null = null;
    let currentFlipchartSheet: number | null = null;
    let currentSheetSource: "workbook" | "flipchart" | null = null;
    let currentActivity: string | null = null;
    let currentItem: string | null = null;
    let lastPresentationAction: string | null = null;
    let lastProgressTo: string | null = null;

    for (let i = 0; i <= currentIndex && i < events.length; i += 1) {
      const evt = events[i];
      if (typeof evt.flipchartSheet === "number") {
        currentFlipchartSheet = evt.flipchartSheet;
        currentPrintedPage = null;
        currentPdfSheet = null;
        currentSheetSource = "flipchart";
      } else if (typeof evt.printedPage === "number") {
        currentPrintedPage = evt.printedPage;
        currentPdfSheet = evt.pdfSheet ?? null;
        currentFlipchartSheet = null;
        currentSheetSource = evt.sheetSource ?? null;
      }
      if (evt.activityId) currentActivity = evt.activityId;
      if (evt.itemText ?? evt.itemId) currentItem = evt.itemText ?? evt.itemId ?? null;
      if (evt.presentationAction) lastPresentationAction = evt.presentationAction;
      if (evt.progressTo) lastProgressTo = evt.progressTo;
    }

    return {
      currentPrintedPage,
      currentPdfSheet,
      currentFlipchartSheet,
      currentSheetSource,
      currentActivity,
      currentItem,
      lastPresentationAction,
      lastProgressTo,
    };
  }, [events, currentIndex]);

  const filteredEvents = useMemo(
    () =>
      events
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => matchesFilter(event, filter)),
    [events, filter],
  );

  const jumpToTag = (tag: "mistake" | "correction" | "hint") => {
    const afterCurrent = events.findIndex((e, idx) => idx > currentIndex && matchesFilter(e, tag));
    const firstMatch =
      afterCurrent >= 0 ? afterCurrent : events.findIndex((e) => matchesFilter(e, tag));
    if (firstMatch >= 0) {
      setPlaying(false);
      setCurrentIndex(firstMatch);
    }
  };

  const counts = useMemo(
    () => ({
      mistake: events.filter((e) => matchesFilter(e, "mistake")).length,
      correction: events.filter((e) => matchesFilter(e, "correction")).length,
      hint: events.filter((e) => matchesFilter(e, "hint")).length,
    }),
    [events],
  );

  return (
    <section
      aria-label={STRUCTURED_REPLAY_LABEL}
      data-tutor-replay=""
      data-replay-step-index={currentIndex}
      className={`min-w-0 rounded-3xl border-2 border-[#e8dcc0] bg-white p-4 sm:p-6 space-y-5 ${className}`}
    >
      {/* Explicit structured-replay header (never labeled as video) */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border bg-indigo-50 px-3 py-1 text-xs font-black"
              style={{ borderColor: "#c7d2fe", color: "#3730a3" }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{STRUCTURED_REPLAY_LABEL}</span>
            </div>
            {session.isDemo && (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-900">
                Demostración sintética (no es un estudiante real)
              </span>
            )}
          </div>
          <h2 className="break-words text-lg font-black text-stone-800">
            Lección {session.lesson} · Sesión {session.sessionId}
          </h2>
          {session.objective && (
            <p className="break-words text-xs font-bold text-stone-700">
              Objetivo: {session.objective}
            </p>
          )}
          <p className="break-words text-xs font-semibold text-stone-500">
            Reconstrucción cronológica desde eventos locales (no es una grabación de pantalla ni video).
            Recursos originales: <span className="font-bold text-stone-700">{session.resourceVersions.curriculumVersion}</span>
            {session.resourceVersions.packVersion ? ` · paquete ${session.resourceVersions.packVersion}` : ""}
            {session.resourceVersions.dialogueManifestVersion
              ? ` · guion ${session.resourceVersions.dialogueManifestVersion}`
              : ""}
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-stone-600">
          <span className="inline-flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDurationEs(session.durationMs)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-1.5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {session.sheets.length} página(s)
          </span>
        </div>
      </header>

      {/* Reconstructed stage snapshot at current event */}
      <div className="rounded-2xl border border-[#e8dcc0] bg-[#fffaf1] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-stone-500">
          <span>
            Paso {events.length > 0 ? currentIndex + 1 : 0} de {events.length}
          </span>
          <span>
            Tiempo: {activeEvent ? formatDurationEs(activeEvent.offsetMs) : "0 s"}
          </span>
        </div>

        {activeEvent ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${eventBadge(activeEvent).className}`}
                style={eventBadge(activeEvent).style}
              >
                {eventBadge(activeEvent).label}
              </span>
              {reconstructed.currentSheetSource === "flipchart" &&
              reconstructed.currentFlipchartSheet != null ? (
                <span className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                  Rotafolio · lámina {reconstructed.currentFlipchartSheet}
                </span>
              ) : reconstructed.currentPrintedPage != null ? (
                <span className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                  {reconstructed.currentSheetSource === "workbook" ? "Cuaderno · " : ""}
                  pág. impresa {reconstructed.currentPrintedPage}
                  {reconstructed.currentPdfSheet != null
                    ? ` (hoja PDF ${reconstructed.currentPdfSheet})`
                    : ""}
                </span>
              ) : null}
              {reconstructed.currentActivity && (
                <span className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700 break-words">
                  Actividad: {reconstructed.currentActivity}
                </span>
              )}
              {reconstructed.currentItem && (
                <span className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700 break-words">
                  Ítem: {reconstructed.currentItem}
                </span>
              )}
            </div>
            <p className="break-words text-base font-black text-stone-800">{activeEvent.summary}</p>
            {activeEvent.correctionDetail && (
              <p className="text-sm font-semibold text-amber-900">
                Corrección: {activeEvent.correctionDetail}
              </p>
            )}
            {activeEvent.progressTo && (
              <p className="text-xs font-bold" style={{ color: "#3730a3" }}>
                Cambio de progreso: {activeEvent.progressFrom ?? "inicio"} → {activeEvent.progressTo}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm font-semibold text-stone-500">
            Esta sesión no tiene eventos estructurados registrados.
          </p>
        )}
      </div>

      {/* Playback controls & scrubber */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setCurrentIndex(0);
              }}
              disabled={events.length === 0 || currentIndex === 0}
              className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 disabled:opacity-40"
              aria-label="Reiniciar repetición"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={events.length === 0 || currentIndex === 0}
              className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 disabled:opacity-40"
              aria-label="Evento anterior"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentIndex >= maxIndex) setCurrentIndex(0);
                setPlaying((prev) => !prev);
              }}
              disabled={events.length <= 1}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-black text-white disabled:opacity-40"
              style={{ backgroundColor: "#4338ca" }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pausar" : "Reproducir"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
              }}
              disabled={events.length === 0 || currentIndex >= maxIndex}
              className="min-h-10 rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 disabled:opacity-40"
              aria-label="Evento siguiente"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5" role="group" aria-label="Velocidad de repetición">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSpeed(option)}
                className={`min-h-9 rounded-lg px-2.5 text-xs font-black ${
                  speed === option
                    ? "bg-stone-800 text-white"
                    : "border border-stone-300 bg-white text-stone-700"
                }`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        {events.length > 1 && (
          <input
            type="range"
            min={0}
            max={maxIndex}
            value={currentIndex}
            onChange={(e) => {
              setPlaying(false);
              setCurrentIndex(Number(e.target.value));
            }}
            aria-label="Línea de tiempo de la repetición estructurada"
            className="w-full"
            style={{ accentColor: "#4338ca" }}
          />
        )}
      </div>

      {/* Quick jump-to buttons for mistakes, corrections, hints */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-stone-500">
          Saltar a:
        </span>
        <button
          type="button"
          onClick={() => jumpToTag("mistake")}
          disabled={counts.mistake === 0}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-800 disabled:opacity-40"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Errores ({counts.mistake})
        </button>
        <button
          type="button"
          onClick={() => jumpToTag("correction")}
          disabled={counts.correction === 0}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900 disabled:opacity-40"
        >
          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
          Correcciones ({counts.correction})
        </button>
        <button
          type="button"
          onClick={() => jumpToTag("hint")}
          disabled={counts.hint === 0}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold disabled:opacity-40"
          style={{ borderColor: "#bae6fd", backgroundColor: "#f0f9ff", color: "#075985" }}
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Pistas ({counts.hint})
        </button>
      </div>

      {/* Key moments strip */}
      {session.keyMoments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
            Momentos clave ({session.keyMoments.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {session.keyMoments.map((moment) => {
              const targetIdx = events.findIndex((e) => e.id === moment.eventId);
              return (
                <button
                  key={`${moment.eventId}-${moment.tag}`}
                  type="button"
                  onClick={() => {
                    if (targetIdx >= 0) {
                      setPlaying(false);
                      setCurrentIndex(targetIdx);
                    }
                  }}
                  className="max-w-full break-words rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-left text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  <span className="font-black text-indigo-700">{keyMomentTagLabel(moment.tag)}</span>{" "}
                  · {formatDurationEs(moment.offsetMs)} — {moment.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chronological event timeline with filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
            Línea cronológica de eventos
          </h3>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["all", "Todos"],
                ["mistake", "Errores"],
                ["correction", "Correcciones"],
                ["hint", "Pistas"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  filter === value
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ol className="space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: "18rem" }}>
          {filteredEvents.map(({ event, index }) => {
            const isActive = index === currentIndex;
            const badge = eventBadge(event);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    isActive
                      ? "bg-indigo-50"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                  style={isActive ? { borderColor: "#818cf8" } : undefined}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${badge.className}`}
                        style={badge.style}
                      >
                        {badge.label}
                      </span>
                      {event.itemText && (
                        <span className="text-xs font-black text-stone-800">{event.itemText}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-stone-600">{event.summary}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-bold text-stone-400">
                    {formatDurationEs(event.offsetMs)}
                  </span>
                </button>
              </li>
            );
          })}
          {filteredEvents.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-xs font-semibold text-stone-500">
              No hay eventos para este filtro.
            </li>
          )}
        </ol>
      </div>

      {/* Unfinished work summary */}
      {session.unfinishedWork.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 space-y-1.5">
          <h3
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
            style={{ color: "#7c2d12" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Contenido pendiente ({session.unfinishedWork.length})
          </h3>
          <ul className="list-disc pl-5 text-xs font-semibold space-y-1" style={{ color: "#431407" }}>
            {session.unfinishedWork.map((item, idx) => (
              <li key={`${item.itemId ?? item.label}-${idx}`}>
                <span className="font-black">{item.label}</span>
                {item.printedPage ? ` (pág. ${item.printedPage})` : ""}: {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
