import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Download,
  FileText,
  Mic,
  MicOff,
  Pause,
  Play,
  ShieldCheck,
  Square,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";
import {
  STRUCTURED_REPLAY_LABEL,
  deleteAvRecordingFromIdb,
  formatDurationEs,
  saveAvRecordingToIdb,
  type TutorSessionConsentSnapshot,
} from "@/lib/tutor-session-log";

export type TutorConsentState = TutorSessionConsentSnapshot;

/**
 * Default consent state: all opt-in toggles start OFF, with student mic and
 * student camera strictly OFF by default.
 */
export const DEFAULT_TUTOR_CONSENT: TutorConsentState = {
  eventLogging: false,
  audiovisualRecording: false,
  studentMic: false,
  studentCamera: false,
};

export interface TutorConsentControlsProps {
  /** Current consent toggle state. */
  consent?: TutorConsentState;
  /** Called whenever any individual opt-in toggle changes. */
  onConsentChange?: (next: TutorConsentState) => void;
  /** Session ID used to tag optional local IndexedDB recordings. */
  sessionId: string;
  /** Anonymous learner ID used to tag optional local IndexedDB recordings. */
  learnerId: string;
  /** Optional controlled canvas element for audiovisual MediaRecorder capture. */
  captureCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  /** Optional Web Audio MediaStreamTrack or MediaStream to mix into recording. */
  audioStream?: MediaStream | null;
  /** Called when a local audiovisual recording is saved to IndexedDB. */
  onRecordingSaved?: (recordingId: string, durationMs: number) => void;
  /** Called when a local audiovisual recording is deleted from IndexedDB. */
  onRecordingDeleted?: (recordingId: string) => void;
  /** Optional extra CSS class name. */
  className?: string;
}

type RecorderStatus = "idle" | "recording" | "paused" | "unsupported" | "error";

interface SavedRecordingPreview {
  id: string;
  url: string;
  mimeType: string;
  durationMs: number;
}

function isMediaRecorderAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof indexedDB !== "undefined"
  );
}

/**
 * Separate opt-in consent controls for:
 * 1. Structured event logging ("Repetición estructurada de la sesión")
 * 2. Optional MediaRecorder audiovisual recording (controlled canvas + Web Audio -> IndexedDB,
 *    graceful fallback to structured replay when unsupported)
 * 3. Student microphone (OFF by default)
 * 4. Student camera (OFF by default)
 *
 * Includes visible recording controls: start, live duration, pause, resume,
 * stop, review, export, and delete.
 */
export function TutorConsentControls({
  consent: controlledConsent,
  onConsentChange,
  sessionId,
  learnerId,
  captureCanvasRef,
  audioStream = null,
  onRecordingSaved,
  onRecordingDeleted,
  className = "",
}: TutorConsentControlsProps) {
  const [internalConsent, setInternalConsent] = useState<TutorConsentState>(
    controlledConsent ?? DEFAULT_TUTOR_CONSENT,
  );
  const consent = controlledConsent ?? internalConsent;

  const [recorderStatus, setRecorderStatus] = useState<RecorderStatus>(() =>
    isMediaRecorderAvailable() ? "idle" : "unsupported",
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savedRecording, setSavedRecording] = useState<SavedRecordingPreview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);

  const updateConsent = (patch: Partial<TutorConsentState>) => {
    const next: TutorConsentState = { ...consent, ...patch };
    if (!controlledConsent) {
      setInternalConsent(next);
    }
    onConsentChange?.(next);
  };

  // Cleanup active recorder & object URL on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (savedRecording?.url) {
        URL.revokeObjectURL(savedRecording.url);
      }
    };
  }, [savedRecording?.url]);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(accumulatedMsRef.current + (Date.now() - startedAtRef.current));
    }, 250);
  };

  const handleStartRecording = () => {
    if (!isMediaRecorderAvailable()) {
      setRecorderStatus("unsupported");
      setStatusMessage(
        `Grabación audiovisual no disponible en este navegador. La sesión continúa con "${STRUCTURED_REPLAY_LABEL}".`,
      );
      return;
    }

    try {
      const tracks: MediaStreamTrack[] = [];
      const canvas = captureCanvasRef?.current ?? null;
      if (canvas && typeof canvas.captureStream === "function") {
        const canvasStream = canvas.captureStream(15);
        tracks.push(...canvasStream.getVideoTracks());
      }
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }

      if (tracks.length === 0) {
        // Create a controlled lightweight fallback canvas so recording stays explicit and local
        const fallbackCanvas = document.createElement("canvas");
        fallbackCanvas.width = 320;
        fallbackCanvas.height = 180;
        const ctx = fallbackCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#fffaf1";
          ctx.fillRect(0, 0, 320, 180);
        }
        if (typeof fallbackCanvas.captureStream === "function") {
          tracks.push(...fallbackCanvas.captureStream(10).getVideoTracks());
        }
      }

      if (tracks.length === 0) {
        setRecorderStatus("unsupported");
        setStatusMessage(
          `No se pudo capturar lienzo o audio local. Se mantiene "${STRUCTURED_REPLAY_LABEL}".`,
        );
        return;
      }

      const combinedStream = new MediaStream(tracks);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(combinedStream, { mimeType })
        : new MediaRecorder(combinedStream);

      chunksRef.current = [];
      accumulatedMsRef.current = 0;
      setElapsedMs(0);
      setStatusMessage(null);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopTimer();
        const finalDurationMs = accumulatedMsRef.current;
        const blobType = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        const recordingId = `rec-${Date.now().toString(36)}`;

        const saveResult = await saveAvRecordingToIdb({
          id: recordingId,
          sessionId,
          learnerId,
          mimeType: blobType,
          durationMs: finalDurationMs,
          createdAt: new Date().toISOString(),
          blob,
        });

        if (savedRecording?.url) {
          URL.revokeObjectURL(savedRecording.url);
        }

        const url = URL.createObjectURL(blob);
        setSavedRecording({ id: recordingId, url, mimeType: blobType, durationMs: finalDurationMs });
        setRecorderStatus("idle");

        if (saveResult.ok) {
          setStatusMessage("Grabación guardada solo en este dispositivo (IndexedDB).");
          onRecordingSaved?.(recordingId, finalDurationMs);
        } else {
          setStatusMessage(
            saveResult.message ??
              `No se pudo guardar en IndexedDB; se conserva "${STRUCTURED_REPLAY_LABEL}".`,
          );
        }
      };

      recorder.onerror = () => {
        stopTimer();
        setRecorderStatus("error");
        setStatusMessage(
          `Error al grabar. La sesión continúa con "${STRUCTURED_REPLAY_LABEL}".`,
        );
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      setRecorderStatus("recording");
      startTimer();
    } catch {
      setRecorderStatus("unsupported");
      setStatusMessage(
        `No fue posible iniciar la grabación audiovisual. Se mantiene "${STRUCTURED_REPLAY_LABEL}".`,
      );
    }
  };

  const handlePauseRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    accumulatedMsRef.current += Date.now() - startedAtRef.current;
    setElapsedMs(accumulatedMsRef.current);
    stopTimer();
    setRecorderStatus("paused");
  };

  const handleResumeRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    setRecorderStatus("recording");
    startTimer();
  };

  const handleStopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    if (recorder.state === "recording") {
      accumulatedMsRef.current += Date.now() - startedAtRef.current;
      setElapsedMs(accumulatedMsRef.current);
    }
    recorder.stop();
  };

  const handleExportRecording = () => {
    if (!savedRecording) return;
    const anchor = document.createElement("a");
    anchor.href = savedRecording.url;
    anchor.download = `gretel-sesion-${sessionId}-${savedRecording.id}.webm`;
    anchor.click();
  };

  const handleDeleteRecording = async () => {
    if (!savedRecording) return;
    const deletedId = savedRecording.id;
    await deleteAvRecordingFromIdb(deletedId);
    URL.revokeObjectURL(savedRecording.url);
    setSavedRecording(null);
    setReviewOpen(false);
    setElapsedMs(0);
    setStatusMessage("Grabación audiovisual eliminada de este dispositivo.");
    onRecordingDeleted?.(deletedId);
  };

  return (
    <section
      aria-label="Controles de consentimiento y privacidad"
      className={`rounded-3xl border-2 border-[#e8dcc0] bg-white p-5 space-y-4 ${className}`}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-black text-stone-800">
            Consentimiento y controles locales
          </h2>
          <p className="text-xs font-semibold text-stone-500">
            Cada permiso es independiente y opcional. El micrófono y la cámara permanecen apagados
            por defecto y nada se sube automáticamente.
          </p>
        </div>
      </header>

      {/* 4 separate opt-in toggles */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-indigo-700 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-black text-stone-800">Registro de eventos</div>
              <div className="text-[11px] font-semibold text-stone-500">
                Permite «{STRUCTURED_REPLAY_LABEL}»
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={consent.eventLogging}
            onChange={(e) => updateConsent({ eventLogging: e.target.checked })}
            aria-label="Activar registro estructurado de eventos"
            className="h-5 w-5 accent-indigo-700"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 cursor-pointer">
          <div className="flex items-center gap-2.5">
            {consent.audiovisualRecording ? (
              <Video className="h-4 w-4 text-rose-700 shrink-0" aria-hidden="true" />
            ) : (
              <VideoOff className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-black text-stone-800">Grabación audiovisual local</div>
              <div className="text-[11px] font-semibold text-stone-500">
                Opcional · solo en este dispositivo (IndexedDB)
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={consent.audiovisualRecording}
            onChange={(e) => updateConsent({ audiovisualRecording: e.target.checked })}
            aria-label="Activar grabación audiovisual opcional"
            className="h-5 w-5 accent-rose-700"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 cursor-pointer">
          <div className="flex items-center gap-2.5">
            {consent.studentMic ? (
              <Mic className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <MicOff className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-black text-stone-800">Micrófono del estudiante</div>
              <div className="text-[11px] font-semibold text-stone-500">
                Apagado por defecto · solo cuando se autoriza
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={consent.studentMic}
            onChange={(e) => updateConsent({ studentMic: e.target.checked })}
            aria-label="Activar micrófono del estudiante"
            className="h-5 w-5 accent-emerald-700"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 cursor-pointer">
          <div className="flex items-center gap-2.5">
            {consent.studentCamera ? (
              <Camera className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <CameraOff className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
            )}
            <div>
              <div className="text-xs font-black text-stone-800">Cámara del estudiante</div>
              <div className="text-[11px] font-semibold text-stone-500">
                Apagada por defecto · vista local opcional
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={consent.studentCamera}
            onChange={(e) => updateConsent({ studentCamera: e.target.checked })}
            aria-label="Activar cámara del estudiante"
            className="h-5 w-5 accent-emerald-700"
          />
        </label>
      </div>

      {/* Visible audiovisual recorder controls when opted-in */}
      {consent.audiovisualRecording && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  recorderStatus === "recording"
                    ? "bg-rose-600 animate-pulse"
                    : recorderStatus === "paused"
                      ? "bg-amber-500"
                      : "bg-stone-400"
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-black text-stone-800">
                {recorderStatus === "recording"
                  ? "Grabando en este dispositivo"
                  : recorderStatus === "paused"
                    ? "Grabación en pausa"
                    : recorderStatus === "unsupported"
                      ? "Respaldo: repetición estructurada"
                      : "Grabación local lista"}
              </span>
            </div>
            <span className="font-mono text-xs font-black text-stone-700" aria-label="Duración de grabación">
              {formatDurationEs(elapsedMs)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recorderStatus === "idle" || recorderStatus === "error" ? (
              <button
                type="button"
                onClick={handleStartRecording}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 text-xs font-black text-white"
              >
                <Play className="h-3.5 w-3.5" /> Iniciar grabación
              </button>
            ) : null}

            {recorderStatus === "recording" && (
              <button
                type="button"
                onClick={handlePauseRecording}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 text-xs font-black text-amber-900"
              >
                <Pause className="h-3.5 w-3.5" /> Pausar
              </button>
            )}

            {recorderStatus === "paused" && (
              <button
                type="button"
                onClick={handleResumeRecording}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 text-xs font-black text-white"
              >
                <Play className="h-3.5 w-3.5" /> Reanudar
              </button>
            )}

            {(recorderStatus === "recording" || recorderStatus === "paused") && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-stone-800 px-3.5 text-xs font-black text-white"
              >
                <Square className="h-3.5 w-3.5" /> Detener
              </button>
            )}

            {savedRecording && (
              <>
                <button
                  type="button"
                  onClick={() => setReviewOpen((prev) => !prev)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 text-xs font-black text-stone-700"
                >
                  <Video className="h-3.5 w-3.5" /> {reviewOpen ? "Ocultar revisión" : "Revisar"}
                </button>
                <button
                  type="button"
                  onClick={handleExportRecording}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 text-xs font-black text-stone-700"
                >
                  <Download className="h-3.5 w-3.5" /> Exportar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteRecording()}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 text-xs font-black text-rose-800"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </>
            )}
          </div>

          {reviewOpen && savedRecording && (
            <div className="rounded-xl border border-stone-200 bg-white p-3">
              <video
                src={savedRecording.url}
                controls
                className="max-h-56 w-full rounded-lg bg-black"
                aria-label="Revisión local de grabación audiovisual"
              />
            </div>
          )}
        </div>
      )}

      {statusMessage && (
        <p role="status" className="rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
          {statusMessage}
        </p>
      )}
    </section>
  );
}
