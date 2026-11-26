/**
 * Persistent Tutor Session Controller (Milestone 6).
 *
 * One instance lives for the entire duration of a `/tutor/$n` call.
 * Switching between Mode A (call), Mode B (split), Mode C (flipchart-pip),
 * and Mode D (practice) updates only layout state — it NEVER tears down or
 * restarts the speech channel, mic session, or avatar instance.
 */
import type {
  TutorLayoutMode,
  TutorPipCorner,
  TutorPipSize,
  TutorPracticeDock,
  TutorProtectedRect,
  TutorSessionControllerOptions,
  TutorSessionSnapshot,
  TutorSessionState,
  TutorTranscriptEntry,
} from "./types";

export const SPLIT_RATIO_MIN = 0.25;
export const SPLIT_RATIO_MAX = 0.72;
export const SPLIT_RATIO_DEFAULT = 0.38;

export const TUTOR_STATE_LABELS: Record<TutorSessionState, string> = {
  preparing: "Preparando sesión…",
  ready: "Lista para comenzar",
  listening: "Escuchando…",
  thinking: "Pensando…",
  speaking: "Hablando",
  presenting: "Mostrando lámina",
  waiting: "Tu turno",
  analyzing: "Revisando respuesta…",
  recovering: "Reconectando…",
  ended: "Sesión terminada",
};

export const TUTOR_LAYOUT_LABELS: Record<TutorLayoutMode, string> = {
  call: "Llamada",
  split: "Pantalla dividida",
  "flipchart-pip": "Rotafolio + ventana",
  practice: "Práctica guiada",
};

/**
 * Choose bottom-left or bottom-right PiP corner with the least overlap
 * against important Flip Chart sheet regions.
 */
export function pickSafePipCorner(
  protectedRegions: readonly TutorProtectedRect[],
  preferred: TutorPipCorner = "bottom-right",
): TutorPipCorner {
  if (protectedRegions.length === 0) return preferred;

  // Approximate normalized PiP footprint in bottom-left vs bottom-right.
  const cornerRects: Record<TutorPipCorner, TutorProtectedRect> = {
    "bottom-left": { x: 0.02, y: 0.66, width: 0.28, height: 0.32 },
    "bottom-right": { x: 0.7, y: 0.66, width: 0.28, height: 0.32 },
  };

  const overlapArea = (a: TutorProtectedRect, b: TutorProtectedRect): number => {
    const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    return xOverlap * yOverlap;
  };

  const scoreCorner = (corner: TutorPipCorner): number =>
    protectedRegions.reduce((sum, region) => sum + overlapArea(cornerRects[corner], region), 0);

  const leftScore = scoreCorner("bottom-left");
  const rightScore = scoreCorner("bottom-right");

  if (Math.abs(leftScore - rightScore) < 1e-4) return preferred;
  return leftScore < rightScore ? "bottom-left" : "bottom-right";
}

export interface DeriveSessionStateInput {
  hasBrain: boolean;
  brainPhase?: string | null;
  micCapturing: boolean;
  linePlaying: boolean;
  presenting: boolean;
  thinking: boolean;
  analyzing: boolean;
  recovering: boolean;
  ended: boolean;
}

/**
 * Pure mapping from real runtime signals to the 10 allowed session states.
 * Never returns a state that is not backed by an actual runtime condition.
 */
export function deriveSessionState(input: DeriveSessionStateInput): TutorSessionState {
  if (input.ended || input.brainPhase === "ENDED") return "ended";
  if (input.recovering) return "recovering";
  if (!input.hasBrain) return "preparing";
  if (input.micCapturing) return "listening";
  if (input.analyzing) return "analyzing";
  if (input.thinking) return "thinking";
  if (input.presenting && input.linePlaying) return "presenting";
  if (input.linePlaying) return "speaking";
  if (input.presenting) return "presenting";
  if (input.brainPhase === "LISTEN") return "waiting";
  return "ready";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export class TutorSessionController {
  private snapshot: TutorSessionSnapshot;
  private listeners = new Set<() => void>();
  private onInterruptCb?: () => void;
  private onMuteChangeCb?: (muted: boolean) => void;
  private onEndSessionCb?: (reason: string) => void;
  private entryCounter = 0;
  private disposed = false;

  constructor(options: TutorSessionControllerOptions) {
    this.onInterruptCb = options.onInterrupt;
    this.onMuteChangeCb = options.onMuteChange;
    this.onEndSessionCb = options.onEndSession;

    this.snapshot = {
      sessionId: options.sessionId,
      lesson: options.lesson,
      layoutMode: options.initialLayoutMode ?? "call",
      state: "preparing",
      splitRatio: SPLIT_RATIO_DEFAULT,
      pip: {
        corner: "bottom-right",
        size: "md",
        minimized: false,
        offsetX: 0,
        offsetY: 0,
        dragged: false,
      },
      practiceDock: "side",
      muted: options.initialMuted ?? false,
      captionsVisible: true,
      transcriptOpen: false,
      cameraEnabled: false,
      recordingActive: false,
      fullscreen: false,
      activeCaption: "",
      silentLine: false,
      viseme: "X",
      playbackTime: 0,
      playbackDuration: 0,
      activeLineId: null,
      activeFlipchartPage: options.initialFlipchartPage ?? null,
      activeWorkbookPage: options.initialWorkbookPage ?? null,
      activeGameId: null,
      protectedRegions: [],
      transcript: [],
      micCapturing: false,
      linePlaying: false,
      endedReason: null,
      layoutSwitchCount: 0,
    };
  }

  getSnapshot = (): TutorSessionSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private commit(partial: Partial<TutorSessionSnapshot>): void {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...partial };
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Switch between Mode A/B/C/D without touching audio playback, mic capture,
   * or session identity.
   */
  setLayoutMode(mode: TutorLayoutMode): void {
    if (this.snapshot.layoutMode === mode) return;
    const nextPip =
      mode === "flipchart-pip" && !this.snapshot.pip.dragged
        ? {
            ...this.snapshot.pip,
            corner: pickSafePipCorner(this.snapshot.protectedRegions, this.snapshot.pip.corner),
          }
        : this.snapshot.pip;

    this.commit({
      layoutMode: mode,
      pip: nextPip,
      layoutSwitchCount: this.snapshot.layoutSwitchCount + 1,
    });
  }

  setSplitRatio(ratio: number): void {
    const next = clamp(Number.isFinite(ratio) ? ratio : SPLIT_RATIO_DEFAULT, SPLIT_RATIO_MIN, SPLIT_RATIO_MAX);
    if (Math.abs(next - this.snapshot.splitRatio) < 0.001) return;
    this.commit({ splitRatio: next });
  }

  setPracticeDock(dock: TutorPracticeDock): void {
    if (this.snapshot.practiceDock === dock) return;
    this.commit({ practiceDock: dock });
  }

  setPipCorner(corner: TutorPipCorner): void {
    this.commit({
      pip: {
        ...this.snapshot.pip,
        corner,
        offsetX: 0,
        offsetY: 0,
        dragged: false,
      },
    });
  }

  setPipSize(size: TutorPipSize): void {
    this.commit({
      pip: {
        ...this.snapshot.pip,
        size,
      },
    });
  }

  togglePipMinimized(): void {
    this.commit({
      pip: {
        ...this.snapshot.pip,
        minimized: !this.snapshot.pip.minimized,
      },
    });
  }

  setPipOffset(offsetX: number, offsetY: number): void {
    this.commit({
      pip: {
        ...this.snapshot.pip,
        offsetX,
        offsetY,
        dragged: true,
      },
    });
  }

  setProtectedRegions(regions: readonly TutorProtectedRect[]): void {
    const nextCorner = this.snapshot.pip.dragged
      ? this.snapshot.pip.corner
      : pickSafePipCorner(regions, this.snapshot.pip.corner);
    this.commit({
      protectedRegions: regions,
      pip: {
        ...this.snapshot.pip,
        corner: nextCorner,
      },
    });
  }

  setMuted(muted: boolean): void {
    if (this.snapshot.muted === muted) return;
    this.commit({ muted });
    this.onMuteChangeCb?.(muted);
  }

  toggleCaptions(): void {
    this.commit({ captionsVisible: !this.snapshot.captionsVisible });
  }

  toggleTranscript(): void {
    this.commit({ transcriptOpen: !this.snapshot.transcriptOpen });
  }

  setCameraEnabled(cameraEnabled: boolean): void {
    if (this.snapshot.cameraEnabled === cameraEnabled) return;
    this.commit({ cameraEnabled });
  }

  setRecordingActive(recordingActive: boolean): void {
    if (this.snapshot.recordingActive === recordingActive) return;
    this.commit({ recordingActive });
  }

  setFullscreen(fullscreen: boolean): void {
    if (this.snapshot.fullscreen === fullscreen) return;
    this.commit({ fullscreen });
  }

  setRealState(state: TutorSessionState): void {
    if (this.snapshot.state === state) return;
    this.commit({ state });
  }

  beginSpeaking(lineId: string, caption: string, silent = false): void {
    this.commit({
      activeLineId: lineId,
      activeCaption: caption,
      silentLine: silent,
      linePlaying: !silent,
    });
    if (caption.trim().length > 0) {
      this.appendTranscript({
        speaker: "gretel",
        text: caption.trim(),
        lineId,
        silent,
      });
    }
  }

  updatePlaybackPosition(
    playbackTime: number,
    playbackDuration: number,
    lineId: string,
    viseme: string,
  ): void {
    this.commit({
      playbackTime,
      playbackDuration,
      activeLineId: lineId,
      viseme,
    });
  }

  endSpeaking(): void {
    this.commit({
      linePlaying: false,
      viseme: "X",
      playbackTime: 0,
      playbackDuration: 0,
    });
  }

  setMicCapturing(micCapturing: boolean): void {
    if (this.snapshot.micCapturing === micCapturing) return;
    this.commit({ micCapturing });
  }

  setFlipchartPage(activeFlipchartPage: number | null): void {
    if (this.snapshot.activeFlipchartPage === activeFlipchartPage) return;
    this.commit({ activeFlipchartPage });
  }

  setWorkbookPage(activeWorkbookPage: number | null): void {
    if (this.snapshot.activeWorkbookPage === activeWorkbookPage) return;
    this.commit({ activeWorkbookPage });
  }

  setGameId(activeGameId: string | null): void {
    if (this.snapshot.activeGameId === activeGameId) return;
    this.commit({ activeGameId });
  }

  appendTranscript(entry: Omit<TutorTranscriptEntry, "id" | "timestamp">): void {
    const next: TutorTranscriptEntry = {
      ...entry,
      id: `tr-${++this.entryCounter}`,
      timestamp: Date.now(),
    };
    const nextList = [...this.snapshot.transcript, next].slice(-120);
    this.commit({ transcript: nextList });
  }

  interrupt(): void {
    this.commit({
      linePlaying: false,
      viseme: "X",
    });
    this.onInterruptCb?.();
  }

  endSession(reason: string): void {
    this.commit({
      state: "ended",
      endedReason: reason,
      linePlaying: false,
      micCapturing: false,
      viseme: "X",
    });
    this.onEndSessionCb?.(reason);
  }

  setCallbacks(callbacks: {
    onInterrupt?: () => void;
    onMuteChange?: (muted: boolean) => void;
    onEndSession?: (reason: string) => void;
  }): void {
    if ("onInterrupt" in callbacks) this.onInterruptCb = callbacks.onInterrupt;
    if ("onMuteChange" in callbacks) this.onMuteChangeCb = callbacks.onMuteChange;
    if ("onEndSession" in callbacks) this.onEndSessionCb = callbacks.onEndSession;
  }

  reconnect(): void {
    this.disposed = false;
  }

  dispose(): void {
    this.disposed = true;
    this.listeners.clear();
  }
}
