/**
 * TutorCameraPanel — local-only student camera preview & workbook snapshot tool
 * (Milestone 9).
 *
 * Privacy & honesty invariants:
 * - Camera is ALWAYS OFF by default; `getUserMedia` is never called on mount.
 * - Video stays 100% local in memory; nothing is uploaded or streamed.
 * - Explicit snapshot capture and manual image upload only (never silent capture).
 * - Honest fallback notice whenever local vision analysis is unavailable.
 * - NEVER infers emotion, intelligence, disability, attention, or engagement from faces.
 */
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ImageUp,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";

export type CameraFacingMode = "user" | "environment";

export type CameraPermissionState =
  | "off"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export interface CameraSnapshot {
  readonly id: string;
  readonly dataUrl: string;
  readonly source: "camera-snapshot" | "image-upload";
  readonly capturedAt: number;
  readonly width: number;
  readonly height: number;
  readonly facingMode?: CameraFacingMode;
  readonly fileName?: string;
}

export interface TutorCameraPanelProps {
  /** Controlled enabled state. Camera is OFF by default (`false`). */
  enabled?: boolean;
  /** Fires when the user toggles the camera on or off. */
  onEnabledChange?: (enabled: boolean) => void;
  /** Starting camera lens (`"user"` front or `"environment"` rear). */
  initialFacingMode?: CameraFacingMode;
  /** Fires whenever permission or hardware availability changes. */
  onPermissionChange?: (state: CameraPermissionState) => void;
  /** Fires when the user explicitly captures a snapshot or uploads an image. */
  onSnapshot?: (snapshot: CameraSnapshot) => void;
  /**
   * True only if a verified on-device vision analyzer is actually active.
   * Defaults to `false`, displaying an honest local-vision-unavailable notice.
   */
  localVisionAvailable?: boolean;
  /** Compact variant for call-shell sidebar or mobile slot. */
  compact?: boolean;
  className?: string;
}

/** Explicit non-negotiable privacy contract for this panel. */
export const CAMERA_PRIVACY_POLICY = {
  cameraOffByDefault: true,
  localOnlyPreview: true,
  explicitCaptureOnly: true,
  forbiddenFaceInferences: [
    "emotion",
    "intelligence",
    "disability",
    "attention",
    "engagement",
  ] as const,
} as const;

const PERMISSION_LABELS: Readonly<
  Record<CameraPermissionState, { label: string; tone: string }>
> = {
  off: { label: "Cámara apagada", tone: "bg-stone-100 text-stone-700 border-stone-200" },
  requesting: {
    label: "Solicitando permiso…",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  granted: {
    label: "Permiso activo (local)",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  denied: {
    label: "Permiso denegado",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
  },
  unavailable: {
    label: "Cámara no disponible",
    tone: "bg-stone-100 text-stone-700 border-stone-300",
  },
};

function classifyCameraError(error: unknown): {
  permission: CameraPermissionState;
  message: string;
} {
  const name = (error as { name?: string } | null | undefined)?.name ?? "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      permission: "denied",
      message:
        "No hay permiso para usar la cámara. Puedes habilitarlo en tu navegador o subir una foto de tu cuaderno.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return {
      permission: "unavailable",
      message:
        "No encontramos una cámara disponible en este dispositivo. Puedes subir una imagen desde tu dispositivo.",
    };
  }
  return {
    permission: "unavailable",
    message:
      "La cámara no pudo iniciarse en este momento. Puedes seguir la clase sin cámara o subir una foto.",
  };
}

export function TutorCameraPanel({
  enabled: controlledEnabled,
  onEnabledChange,
  initialFacingMode = "user",
  onPermissionChange,
  onSnapshot,
  localVisionAvailable = false,
  compact = false,
  className = "",
}: TutorCameraPanelProps) {
  const [internalEnabled, setInternalEnabled] = useState(false);
  const isControlled = controlledEnabled !== undefined;
  const isEnabled = isControlled ? controlledEnabled : internalEnabled;

  const [facingMode, setFacingMode] = useState<CameraFacingMode>(initialFacingMode);
  const [permission, setPermission] = useState<CameraPermissionState>("off");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CameraSnapshot | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);
  const uploadInputId = useId();

  const updatePermission = useCallback(
    (next: CameraPermissionState) => {
      setPermission(next);
      onPermissionChange?.(next);
    },
    [onPermissionChange],
  );

  const stopStream = useCallback(() => {
    const active = streamRef.current;
    if (active) {
      for (const track of active.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const setEnabled = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalEnabled(next);
      }
      onEnabledChange?.(next);
    },
    [isControlled, onEnabledChange],
  );

  useEffect(() => {
    const currentReq = ++requestIdRef.current;

    if (!isEnabled) {
      stopStream();
      setErrorMessage(null);
      updatePermission("off");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      stopStream();
      setErrorMessage(
        "Este navegador no admite vista previa de cámara local. Puedes subir una imagen de tu cuaderno.",
      );
      updatePermission("unavailable");
      return;
    }

    setErrorMessage(null);
    updatePermission("requesting");

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      .then((mediaStream) => {
        if (requestIdRef.current !== currentReq) {
          for (const track of mediaStream.getTracks()) track.stop();
          return;
        }
        stopStream();
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          try {
            const playResult = videoRef.current.play?.();
            if (playResult && typeof playResult.catch === "function") {
              playResult.catch(() => {});
            }
          } catch {
            // Headless / jsdom environments may not implement HTMLMediaElement.play().
          }
        }
        updatePermission("granted");
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== currentReq) return;
        stopStream();
        const classified = classifyCameraError(err);
        setErrorMessage(classified.message);
        updatePermission(classified.permission);
      });

    return () => {
      stopStream();
    };
  }, [isEnabled, facingMode, stopStream, updatePermission]);

  const handleToggleCamera = () => {
    setEnabled(!isEnabled);
  };

  const handleToggleFacing = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCaptureSnapshot = () => {
    const video = videoRef.current;
    if (!video || permission !== "granted") return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext?.("2d");
    if (ctx) {
      try {
        ctx.drawImage(video, 0, 0, width, height);
      } catch {
        // Headless / jsdom canvas implementations may not accept HTMLVideoElement.
      }
    }
    const dataUrl =
      typeof canvas.toDataURL === "function" ? canvas.toDataURL("image/png") : "data:image/png;base64,";

    const nextSnapshot: CameraSnapshot = {
      id: `snap-${Date.now()}`,
      dataUrl,
      source: "camera-snapshot",
      capturedAt: Date.now(),
      width,
      height,
      facingMode,
    };
    setSnapshot(nextSnapshot);
    onSnapshot?.(nextSnapshot);
  };

  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Selecciona un archivo de imagen (PNG o JPG) para mostrar tu cuaderno.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      const nextSnapshot: CameraSnapshot = {
        id: `upload-${Date.now()}`,
        dataUrl,
        source: "image-upload",
        capturedAt: Date.now(),
        width: 0,
        height: 0,
        fileName: file.name,
      };
      setErrorMessage(null);
      setSnapshot(nextSnapshot);
      onSnapshot?.(nextSnapshot);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleClearSnapshot = () => {
    setSnapshot(null);
  };

  const badge = PERMISSION_LABELS[permission];

  return (
    <section
      data-tutor-camera-panel=""
      data-permission={permission}
      data-facing={facingMode}
      data-local-vision={localVisionAvailable ? "available" : "unavailable"}
      aria-label="Cámara local del estudiante"
      className={`rounded-2xl border border-stone-200 bg-white/95 shadow-sm ${
        compact ? "p-3" : "p-4"
      } ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isEnabled && permission === "granted" ? (
            <Camera className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          ) : (
            <CameraOff className="h-4 w-4 text-stone-500" aria-hidden="true" />
          )}
          <h3 className="text-sm font-semibold text-stone-800">Cámara local</h3>
        </div>
        <span
          data-camera-permission-badge=""
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.tone}`}
        >
          {permission === "granted" ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : permission === "denied" || permission === "unavailable" ? (
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          ) : null}
          {badge.label}
        </span>
      </div>

      {/* Preview container */}
      <div
        className={`relative mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-900/90 ${
          compact ? "aspect-[4/3]" : "aspect-video"
        }`}
      >
        {isEnabled ? (
          <video
            ref={videoRef}
            data-camera-preview=""
            playsInline
            muted
            autoPlay
            className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-stone-300">
            <CameraOff className="h-7 w-7 text-stone-400" aria-hidden="true" />
            <p className="text-xs font-medium">
              La cámara está apagada por defecto. Enciéndela solo si quieres mostrar tu cuaderno.
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-camera-toggle=""
          onClick={handleToggleCamera}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            isEnabled
              ? "bg-stone-800 text-white hover:bg-stone-700"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          {isEnabled ? (
            <>
              <CameraOff className="h-3.5 w-3.5" aria-hidden="true" />
              Apagar cámara
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              Encender cámara
            </>
          )}
        </button>

        <button
          type="button"
          data-camera-facing-toggle=""
          onClick={handleToggleFacing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
          title="Cambiar entre cámara frontal y trasera"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {facingMode === "user" ? "Frontal" : "Trasera"}
        </button>

        <button
          type="button"
          data-camera-snapshot-btn=""
          onClick={handleCaptureSnapshot}
          disabled={!isEnabled || permission !== "granted"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Tomar foto
        </button>

        <label
          htmlFor={uploadInputId}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
          <ImageUp className="h-3.5 w-3.5" aria-hidden="true" />
          Subir imagen
        </label>
        <input
          ref={fileInputRef}
          id={uploadInputId}
          data-camera-upload-input=""
          type="file"
          accept="image/*"
          onChange={handleUploadChange}
          className="sr-only"
        />
      </div>

      {errorMessage ? (
        <p
          data-camera-error=""
          role="alert"
          className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
        >
          {errorMessage}
        </p>
      ) : null}

      {/* Snapshot / uploaded image preview */}
      {snapshot ? (
        <div
          data-camera-snapshot-preview=""
          className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-700">
              {snapshot.source === "camera-snapshot"
                ? "Captura local lista"
                : `Imagen cargada${snapshot.fileName ? `: ${snapshot.fileName}` : ""}`}
            </span>
            <button
              type="button"
              data-camera-clear-snapshot=""
              onClick={handleClearSnapshot}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200/70"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Quitar
            </button>
          </div>
          <img
            src={snapshot.dataUrl}
            alt="Vista previa de la imagen del cuaderno"
            className="mt-2 max-h-36 w-full rounded-lg object-contain bg-white"
          />
        </div>
      ) : null}

      {/* Honest fallback when local vision analysis is unavailable */}
      {!localVisionAvailable ? (
        <div
          data-camera-vision-fallback=""
          className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900"
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
          <p>
            La lectura automática por cámara no está activa en este dispositivo. La vista previa y
            las fotos son solo referencia visual local y no se evalúan automáticamente.
          </p>
        </div>
      ) : null}

      {/* Explicit privacy guarantee */}
      <p data-camera-privacy-note="" className="mt-2 text-[11px] leading-relaxed text-stone-500">
        Vista previa local en tu dispositivo. Esta cámara nunca analiza emociones, atención,
        inteligencia ni rasgos faciales.
      </p>
    </section>
  );
}

export default TutorCameraPanel;
