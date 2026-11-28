/**
 * TutorCallShell — Persistent Video-Call Interface with 4 Presentation Modes
 * (Milestone 6).
 *
 * Architectural guarantee:
 * - Renders ONE persistent avatar host (`data-tutor-avatar-slot`) at a fixed
 *   tree position inside `.tutor-call-canvas`.
 * - Switching between Mode A (`call`), Mode B (`split`), Mode C (`flipchart-pip`),
 *   and Mode D (`practice`) changes CSS layout & attributes ONLY — the avatar
 *   DOM node, speech channel, and mic session NEVER remount or restart.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Captions,
  Columns2,
  CornerDownLeft,
  CornerDownRight,
  Disc,
  GripHorizontal,
  Hand,
  Maximize2,
  MessageSquareText,
  Minimize2,
  PanelRight,
  PhoneOff,
  PictureInPicture2,
  RotateCcw,
  Send,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  SPLIT_RATIO_MAX,
  SPLIT_RATIO_MIN,
  TUTOR_LAYOUT_LABELS,
  TUTOR_STATE_LABELS,
  type TutorLayoutMode,
  type TutorPipSize,
  type TutorSessionController,
} from "@/lib/tutor-session";
import "./tutor-stage.css";

export interface TutorCallShellProps {
  controller: TutorSessionController;
  lessonTitle: string;
  lessonSubtitle?: string;
  backLink?: ReactNode;
  /** Persistent Gretel avatar — mounted ONCE and never unmounted across layout switches. */
  avatar: ReactNode;
  /** Lesson word/activity card shown in Mode A and available to the learner. */
  card: ReactNode;
  /** Persistent mic control — mounted ONCE in the call dock/response area. */
  mic: ReactNode;
  /** Optional status notices (unavailable, simulated mic, etc.). */
  status?: ReactNode;
  /** Mode B & C: Flip Chart presenter (`TutorFlipchartPresenter` from @choreography). */
  flipchartSlot?: ReactNode;
  /** Mode D: Real Workbook or game (`TutorPracticeHost` from @choreography). */
  practiceSlot?: ReactNode;
  /** Optional student camera preview (`TutorCameraPanel` from @ears-camera), shown only when enabled. */
  cameraSlot?: ReactNode;
  /** Recording & privacy consent controls (`TutorConsentControls` from @replay-report). */
  consentSlot?: ReactNode;
  /** Structured replay drawer/panel (`TutorReplay` from @replay-report). */
  replaySlot?: ReactNode;
  onReplayLast?: () => void;
  replayDisabled?: boolean;
  onTextSubmit?: (text: string) => void;
  textInputDisabled?: boolean;
  textSubmitDisabled?: boolean;
  onEndCall?: () => void;
}

const LAYOUT_MODES: readonly { id: TutorLayoutMode; shortLabel: string }[] = [
  { id: "call", shortLabel: "Llamada" },
  { id: "split", shortLabel: "Dividida" },
  { id: "flipchart-pip", shortLabel: "Rotafolio" },
  { id: "practice", shortLabel: "Práctica" },
];

const PIP_SIZE_ORDER: readonly TutorPipSize[] = ["sm", "md", "lg"];

export function TutorCallShell({
  controller,
  lessonTitle,
  lessonSubtitle,
  backLink,
  avatar,
  card,
  mic,
  status,
  flipchartSlot,
  practiceSlot,
  cameraSlot,
  consentSlot,
  replaySlot,
  onReplayLast,
  replayDisabled = false,
  onTextSubmit,
  textInputDisabled = false,
  textSubmitDisabled = false,
  onEndCall,
}: TutorCallShellProps) {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draftText, setDraftText] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const [draggingPip, setDraggingPip] = useState(false);
  const pipDragOriginRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseOffsetX: number;
    baseOffsetY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);

  // Sync browser fullscreen changes back to controller.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFs = () => {
      controller.setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, [controller]);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        controller.setFullscreen(false);
      } else if (shellRef.current?.requestFullscreen) {
        await shellRef.current.requestFullscreen();
        controller.setFullscreen(true);
      } else {
        controller.setFullscreen(!snapshot.fullscreen);
      }
    } catch {
      controller.setFullscreen(!snapshot.fullscreen);
    }
  }, [controller, snapshot.fullscreen]);

  // Mode B resizable splitter pointer handlers
  const updateSplitFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const isPortraitPhone =
        typeof window !== "undefined" &&
        window.innerWidth < 768 &&
        window.innerHeight > window.innerWidth;
      const ratio = isPortraitPhone
        ? (clientY - rect.top) / rect.height
        : (clientX - rect.left) / rect.width;
      controller.setSplitRatio(ratio);
    },
    [controller],
  );

  const handleSplitPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDraggingSplit(true);
    updateSplitFromPointer(event.clientX, event.clientY);
  };

  const handleSplitPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingSplit) return;
    updateSplitFromPointer(event.clientX, event.clientY);
  };

  const handleSplitPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingSplit) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingSplit(false);
  };

  const handleSplitKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = 0.05;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      controller.setSplitRatio(snapshot.splitRatio - step);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      controller.setSplitRatio(snapshot.splitRatio + step);
    }
  };

  // Mode C / Mode D PiP drag handlers (clamped inside canvas so PiP never leaves the stage)
  const handlePipPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const pipHost = event.currentTarget.closest("[data-tutor-avatar-slot]");
    const pipRect = pipHost?.getBoundingClientRect();
    let minX = -600;
    let maxX = 600;
    let minY = -600;
    let maxY = 120;
    if (canvasRect && pipRect && canvasRect.width > 0 && pipRect.width > 0) {
      const margin = 8;
      // Current visual position includes current baseOffset; derive allowed offset delta around it
      const spaceLeft = pipRect.left - canvasRect.left - margin;
      const spaceRight = canvasRect.right - pipRect.right - margin;
      const spaceTop = pipRect.top - canvasRect.top - margin;
      const spaceBottom = canvasRect.bottom - pipRect.bottom - margin;
      minX = snapshot.pip.offsetX - Math.max(0, spaceLeft);
      maxX = snapshot.pip.offsetX + Math.max(0, spaceRight);
      minY = snapshot.pip.offsetY - Math.max(0, spaceTop);
      maxY = snapshot.pip.offsetY + Math.max(0, spaceBottom);
    }
    pipDragOriginRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseOffsetX: snapshot.pip.offsetX,
      baseOffsetY: snapshot.pip.offsetY,
      minX,
      maxX,
      minY,
      maxY,
    };
    setDraggingPip(true);
  };

  const handlePipPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const origin = pipDragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    const rawX = origin.baseOffsetX + (event.clientX - origin.startX);
    const rawY = origin.baseOffsetY + (event.clientY - origin.startY);
    const dx = Math.min(origin.maxX, Math.max(origin.minX, rawX));
    const dy = Math.min(origin.maxY, Math.max(origin.minY, rawY));
    controller.setPipOffset(dx, dy);
  };

  const handlePipPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const origin = pipDragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pipDragOriginRef.current = null;
    setDraggingPip(false);
  };

  const cyclePipSize = () => {
    const idx = PIP_SIZE_ORDER.indexOf(snapshot.pip.size);
    const next = PIP_SIZE_ORDER[(idx + 1) % PIP_SIZE_ORDER.length];
    controller.setPipSize(next);
  };

  const handleTextFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = draftText.trim();
    if (!cleaned || textInputDisabled || textSubmitDisabled) return;
    controller.appendTranscript({ speaker: "student", text: cleaned });
    onTextSubmit?.(cleaned);
    setDraftText("");
  };

  const isPipActive =
    snapshot.layoutMode === "flipchart-pip" ||
    (snapshot.layoutMode === "practice" && snapshot.practiceDock === "pip");

  const canInterrupt =
    snapshot.linePlaying ||
    snapshot.state === "speaking" ||
    snapshot.state === "presenting" ||
    snapshot.micCapturing;

  const shellStyle = {
    "--tutor-split-ratio": String(snapshot.splitRatio),
    "--pip-x": `${snapshot.pip.offsetX}px`,
    "--pip-y": `${snapshot.pip.offsetY}px`,
  } as CSSProperties;

  const stateLabel = TUTOR_STATE_LABELS[snapshot.state];

  return (
    <div
      ref={shellRef}
      data-tutor-stage=""
      data-tutor-call-shell=""
      data-layout-mode={snapshot.layoutMode}
      data-practice-dock={snapshot.practiceDock}
      data-tutor-state={snapshot.state}
      className="tutor-call-shell"
      style={shellStyle}
    >
      {/* Top Call Header */}
      <header className="tutor-call-header">
        <div className="tutor-call-header-left">
          {backLink}
          <div className="tutor-call-title-group">
            <h1 className="tutor-call-title">{lessonTitle}</h1>
            {lessonSubtitle ? <span className="tutor-call-subtitle">{lessonSubtitle}</span> : null}
          </div>
          <div
            className="tutor-state-pill"
            data-tutor-state={snapshot.state}
            role="status"
            aria-live="polite"
          >
            <span className="tutor-state-dot" aria-hidden="true" />
            <span>{stateLabel}</span>
          </div>
        </div>

        {/* 4 Presentation Mode Switcher */}
        <div className="tutor-mode-switcher" role="group" aria-label="Modo de presentación">
          {LAYOUT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className="tutor-mode-btn"
              data-layout-option={mode.id}
              aria-pressed={snapshot.layoutMode === mode.id}
              aria-label={TUTOR_LAYOUT_LABELS[mode.id]}
              onClick={() => controller.setLayoutMode(mode.id)}
            >
              {mode.id === "call" && <Video className="h-4 w-4" aria-hidden="true" />}
              {mode.id === "split" && <Columns2 className="h-4 w-4" aria-hidden="true" />}
              {mode.id === "flipchart-pip" && (
                <PictureInPicture2 className="h-4 w-4" aria-hidden="true" />
              )}
              {mode.id === "practice" && <BookOpen className="h-4 w-4" aria-hidden="true" />}
              <span>{mode.shortLabel}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Center Workspace: Persistent Canvas + Optional Transcript Drawer */}
      <div className="tutor-call-workspace">
        <main ref={canvasRef} className="tutor-call-canvas">
          {/* ONE PERSISTENT AVATAR HOST — never unmounts across layout switches */}
          <section
            data-tutor-stage-gretel=""
            data-tutor-avatar-slot=""
            data-pip-corner={snapshot.pip.corner}
            data-pip-size={snapshot.pip.size}
            data-pip-minimized={snapshot.pip.minimized ? "true" : "false"}
            data-pip-dragging={draggingPip ? "true" : "false"}
            aria-label="Gretel"
            className="tutor-call-avatar-host"
          >
            {/* PiP drag & snap toolbar (visible in Mode C & Mode D PiP) */}
            <div
              className="tutor-pip-toolbar"
              data-pip-drag-handle=""
              onPointerDown={handlePipPointerDown}
              onPointerMove={handlePipPointerMove}
              onPointerUp={handlePipPointerUp}
            >
              <span className="tutor-pip-title tutor-ink-soft inline-flex items-center gap-1.5 text-xs font-bold">
                <GripHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="tutor-pip-title-text">Gretel</span>
              </span>
              <div className="tutor-pip-toolbar-actions">
                <button
                  type="button"
                  className="tutor-pip-icon-btn"
                  aria-pressed={snapshot.pip.corner === "bottom-left"}
                  aria-label="Acoplar ventana abajo a la izquierda"
                  title="Abajo a la izquierda"
                  onClick={() => controller.setPipCorner("bottom-left")}
                >
                  <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="tutor-pip-icon-btn"
                  aria-pressed={snapshot.pip.corner === "bottom-right"}
                  aria-label="Acoplar ventana abajo a la derecha"
                  title="Abajo a la derecha"
                  onClick={() => controller.setPipCorner("bottom-right")}
                >
                  <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="tutor-pip-icon-btn"
                  aria-label="Cambiar tamaño de la ventana de Gretel"
                  title="Cambiar tamaño"
                  onClick={cyclePipSize}
                >
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="tutor-pip-icon-btn"
                  aria-label={
                    snapshot.pip.minimized
                      ? "Restaurar ventana de Gretel"
                      : "Minimizar ventana de Gretel"
                  }
                  onClick={() => controller.togglePipMinimized()}
                >
                  {snapshot.pip.minimized ? (
                    <PictureInPicture2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="tutor-call-avatar-inner">
              {avatar}
              {snapshot.captionsVisible && snapshot.activeCaption && !snapshot.pip.minimized ? (
                <p
                  className="tutor-live-caption"
                  data-tutor-live-caption=""
                  role="status"
                  aria-live="polite"
                >
                  {snapshot.activeCaption}
                </p>
              ) : null}
            </div>
          </section>

          {/* Mode B Resizable Split Divider */}
          <div
            role="separator"
            tabIndex={0}
            aria-label="Ajustar tamaño entre Gretel y el Rotafolio"
            aria-valuemin={Math.round(SPLIT_RATIO_MIN * 100)}
            aria-valuemax={Math.round(SPLIT_RATIO_MAX * 100)}
            aria-valuenow={Math.round(snapshot.splitRatio * 100)}
            data-tutor-split-divider=""
            className="tutor-split-divider"
            onPointerDown={handleSplitPointerDown}
            onPointerMove={handleSplitPointerMove}
            onPointerUp={handleSplitPointerUp}
            onKeyDown={handleSplitKeyDown}
          >
            <div className="tutor-split-handle" aria-hidden="true" />
          </div>

          {/* Primary Teaching Surface (adapts cleanly to Mode A / B / C / D) */}
          <section
            className="tutor-call-primary-surface"
            data-tutor-primary-surface={snapshot.layoutMode}
            aria-label={TUTOR_LAYOUT_LABELS[snapshot.layoutMode]}
          >
            {snapshot.layoutMode === "call" ? (
              <>
                {card}
                {snapshot.cameraEnabled ? (
                  <div className="tutor-camera-slot" data-tutor-camera-slot="">
                    {cameraSlot ?? (
                      <div className="tutor-ink-soft p-4 text-center text-sm">
                        Cámara local activada
                      </div>
                    )}
                  </div>
                ) : null}
                {status}
              </>
            ) : null}

            {snapshot.layoutMode === "split" || snapshot.layoutMode === "flipchart-pip" ? (
              <div className="tutor-flipchart-frame" data-tutor-flipchart-frame="">
                {flipchartSlot ?? (
                  <div className="tutor-flipchart-sheet-box tutor-flipchart-fallback rounded-2xl p-6 text-center">
                    <BookOpen className="tutor-cobalt-icon mb-2 h-8 w-8" aria-hidden="true" />
                    <p className="tutor-ink-strong font-bold">
                      Rotafolio · Lección {snapshot.lesson}
                      {snapshot.activeFlipchartPage
                        ? ` · Lámina ${snapshot.activeFlipchartPage}`
                        : ""}
                    </p>
                    <p className="tutor-ink-soft mt-1 text-sm">
                      Relación de aspecto preservada sin recortes.
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {snapshot.layoutMode === "practice" ? (
              <div className="flex h-full w-full flex-col gap-3" data-tutor-practice-frame="">
                <div className="tutor-practice-header flex items-center justify-between gap-2 pb-2">
                  <span className="tutor-ink-strong text-sm font-bold">
                    Práctica guiada
                    {snapshot.activeWorkbookPage ? ` · Página ${snapshot.activeWorkbookPage}` : ""}
                  </span>
                  <button
                    type="button"
                    className="tutor-mode-btn"
                    aria-pressed={snapshot.practiceDock === "pip"}
                    onClick={() =>
                      controller.setPracticeDock(snapshot.practiceDock === "side" ? "pip" : "side")
                    }
                  >
                    {snapshot.practiceDock === "side" ? (
                      <>
                        <PictureInPicture2 className="h-4 w-4" aria-hidden="true" />
                        <span>Gretel flotante</span>
                      </>
                    ) : (
                      <>
                        <PanelRight className="h-4 w-4" aria-hidden="true" />
                        <span>Panel lateral</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {practiceSlot ?? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
                      {card}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </main>

        {/* Expandable Transcript & Text Input Drawer */}
        {snapshot.transcriptOpen ? (
          <aside
            className="tutor-transcript-drawer"
            data-tutor-transcript-drawer=""
            aria-label="Transcripción y entrada de texto"
          >
            <div className="tutor-transcript-header">
              <span>Transcripción</span>
              <button
                type="button"
                className="tutor-pip-icon-btn"
                aria-label="Cerrar transcripción"
                onClick={() => controller.toggleTranscript()}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="tutor-transcript-list" role="log" aria-live="polite">
              {snapshot.transcript.length === 0 ? (
                <p className="tutor-ink-soft text-sm">
                  Aquí aparecerán las intervenciones de la sesión.
                </p>
              ) : (
                snapshot.transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className="tutor-transcript-item"
                    data-speaker={entry.speaker}
                  >
                    <span className="tutor-ink-soft block text-xs font-bold">
                      {entry.speaker === "gretel"
                        ? "Gretel"
                        : entry.speaker === "student"
                          ? "Estudiante"
                          : "Sesión"}
                    </span>
                    <p className="m-0">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
            <form className="tutor-transcript-form" onSubmit={handleTextFormSubmit}>
              <input
                type="text"
                className="tutor-transcript-input"
                value={draftText}
                disabled={textInputDisabled}
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="Escribe una respuesta o pregunta…"
                aria-label="Escribir respuesta o pregunta"
              />
              <button
                type="submit"
                className="tutor-dock-btn"
                disabled={textInputDisabled || textSubmitDisabled || draftText.trim().length === 0}
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </aside>
        ) : null}
      </div>

      {/* Consent / Recording Popover */}
      {consentOpen ? (
        <section
          className="tutor-consent-popover"
          data-tutor-consent-popover=""
          aria-label="Controles de grabación y consentimiento"
        >
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-sm font-extrabold">Grabación y privacidad</strong>
            <button
              type="button"
              className="tutor-pip-icon-btn"
              aria-label="Cerrar controles de grabación"
              onClick={() => setConsentOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {consentSlot ?? (
            <p className="tutor-ink-soft text-sm">
              La grabación y la cámara están desactivadas por defecto. Actívalas solo con permiso.
            </p>
          )}
        </section>
      ) : null}

      {/* Structured Replay Popover */}
      {replayOpen && replaySlot ? (
        <section
          className="tutor-consent-popover"
          data-tutor-replay-popover=""
          aria-label="Repetición estructurada de la sesión"
        >
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-sm font-extrabold">Repetición estructurada de la sesión</strong>
            <button
              type="button"
              className="tutor-pip-icon-btn"
              aria-label="Cerrar repetición"
              onClick={() => setReplayOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {replaySlot}
        </section>
      ) : null}

      {/* Persistent Bottom Video-Call Control Bar */}
      <footer className="tutor-call-dock" aria-label="Controles de llamada">
        <div className="tutor-call-dock-group">
          {mic}

          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={snapshot.muted}
            aria-label={snapshot.muted ? "Activar sonido" : "Silenciar"}
            onClick={() => controller.setMuted(!snapshot.muted)}
          >
            {snapshot.muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="tutor-dock-btn-label">{snapshot.muted ? "Sin sonido" : "Sonido"}</span>
          </button>

          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={snapshot.cameraEnabled}
            aria-label={snapshot.cameraEnabled ? "Apagar cámara" : "Encender cámara"}
            onClick={() => controller.setCameraEnabled(!snapshot.cameraEnabled)}
          >
            {snapshot.cameraEnabled ? (
              <Video className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VideoOff className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="tutor-dock-btn-label">Cámara</span>
          </button>

          <button
            type="button"
            className="tutor-dock-btn tutor-dock-btn--interrupt"
            disabled={!canInterrupt}
            aria-label="Interrumpir a Gretel"
            onClick={() => controller.interrupt()}
          >
            <Hand className="h-4 w-4" aria-hidden="true" />
            <span className="tutor-dock-btn-label">Interrumpir</span>
          </button>

          <button
            type="button"
            className="tutor-dock-btn"
            disabled={replayDisabled}
            aria-label="Escuchar otra vez"
            onClick={onReplayLast}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span className="tutor-dock-btn-label">Repetir</span>
          </button>
        </div>

        <div className="tutor-call-dock-group">
          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={snapshot.captionsVisible}
            aria-label={snapshot.captionsVisible ? "Ocultar subtítulos" : "Mostrar subtítulos"}
            onClick={() => controller.toggleCaptions()}
          >
            <Captions className="h-4 w-4" aria-hidden="true" />
            <span className="tutor-dock-btn-label">Subtítulos</span>
          </button>

          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={snapshot.transcriptOpen}
            aria-label={snapshot.transcriptOpen ? "Ocultar transcripción" : "Abrir transcripción"}
            onClick={() => controller.toggleTranscript()}
          >
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            <span className="tutor-dock-btn-label">Transcripción</span>
          </button>

          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={consentOpen || snapshot.recordingActive}
            aria-label="Controles de grabación"
            onClick={() => {
              setReplayOpen(false);
              setConsentOpen((open) => !open);
            }}
          >
            <Disc
              className={`h-4 w-4 ${snapshot.recordingActive ? "tutor-danger-icon" : ""}`}
              aria-hidden="true"
            />
            <span className="tutor-dock-btn-label">Grabación</span>
          </button>

          {replaySlot ? (
            <button
              type="button"
              className="tutor-dock-btn"
              aria-pressed={replayOpen}
              aria-label="Ver repetición estructurada"
              onClick={() => {
                setConsentOpen(false);
                setReplayOpen((open) => !open);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="tutor-dock-btn-label">Resumen</span>
            </button>
          ) : null}

          <button
            type="button"
            className="tutor-dock-btn"
            aria-pressed={snapshot.fullscreen}
            aria-label={snapshot.fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            onClick={() => void toggleFullscreen()}
          >
            {snapshot.fullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="tutor-dock-btn tutor-dock-btn--danger"
            aria-label="Terminar llamada"
            onClick={() => {
              if (onEndCall) {
                onEndCall();
              } else {
                controller.endSession("exit");
              }
            }}
          >
            <PhoneOff className="h-4 w-4" aria-hidden="true" />
            <span className="tutor-dock-btn-label">Terminar</span>
          </button>
        </div>
      </footer>

      {isPipActive && snapshot.pip.minimized ? (
        <span className="sr-only">Ventana de Gretel minimizada</span>
      ) : null}
    </div>
  );
}

export default TutorCallShell;
