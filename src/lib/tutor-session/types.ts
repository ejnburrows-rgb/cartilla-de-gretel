/**
 * Shared types for the persistent Gretel Tutor video-call session controller
 * and 4-mode presentation shell (Milestone 6).
 */

export type TutorLayoutMode = "call" | "split" | "flipchart-pip" | "practice";

/**
 * Real session states — ONLY displayed when backed by actual runtime signals
 * (never simulated or faked).
 */
export type TutorSessionState =
  | "preparing"
  | "ready"
  | "listening"
  | "thinking"
  | "speaking"
  | "presenting"
  | "waiting"
  | "analyzing"
  | "recovering"
  | "ended";

export type TutorPipCorner = "bottom-left" | "bottom-right";

export type TutorPipSize = "sm" | "md" | "lg";

export type TutorPracticeDock = "side" | "pip";

/**
 * Normalized region (0..1 relative to the Flip Chart viewport) that the PiP
 * window should avoid covering when auto-snapping.
 */
export interface TutorProtectedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface TutorTranscriptEntry {
  id: string;
  speaker: "gretel" | "student" | "system";
  text: string;
  timestamp: number;
  lineId?: string;
  silent?: boolean;
}

export interface TutorPipState {
  corner: TutorPipCorner;
  size: TutorPipSize;
  minimized: boolean;
  offsetX: number;
  offsetY: number;
  dragged: boolean;
}

export interface TutorSessionSnapshot {
  sessionId: string;
  lesson: number;
  layoutMode: TutorLayoutMode;
  state: TutorSessionState;
  /** Gretel pane proportion in split mode (0.25..0.72). */
  splitRatio: number;
  pip: TutorPipState;
  practiceDock: TutorPracticeDock;
  muted: boolean;
  captionsVisible: boolean;
  transcriptOpen: boolean;
  /** Student camera is strictly OFF by default. */
  cameraEnabled: boolean;
  /** Recording indicator is strictly OFF by default. */
  recordingActive: boolean;
  fullscreen: boolean;
  activeCaption: string;
  silentLine: boolean;
  viseme: string;
  playbackTime: number;
  playbackDuration: number;
  activeLineId: string | null;
  activeFlipchartPage: number | null;
  activeWorkbookPage: number | null;
  activeGameId: string | null;
  protectedRegions: readonly TutorProtectedRect[];
  transcript: readonly TutorTranscriptEntry[];
  micCapturing: boolean;
  linePlaying: boolean;
  endedReason: string | null;
  /** Increments on every layout mode switch without recreating the session. */
  layoutSwitchCount: number;
}

export interface TutorSessionControllerOptions {
  sessionId: string;
  lesson: number;
  initialLayoutMode?: TutorLayoutMode;
  initialMuted?: boolean;
  initialFlipchartPage?: number | null;
  initialWorkbookPage?: number | null;
  onInterrupt?: () => void;
  onMuteChange?: (muted: boolean) => void;
  onEndSession?: (reason: string) => void;
}
