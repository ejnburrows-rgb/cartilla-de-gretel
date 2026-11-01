/**
 * Tutor voice — recorded line bank only (spec §6, milestone 4 voice part).
 *
 * A mounted provider identity gates each request. The recorded player owns
 * the shared speech channel, and cancellation settles both pending resource
 * loads and active media. Only the real `playing` event starts speaking UI.
 * Unknown/pending recordings remain explicitly silent; there is no TTS path.
 *
 * Audio sources: only entries of src/content/tutor-lines.json whose `src`
 * points at an owner-approved file (today: the 43 picture-name recordings).
 * Never the 67-clip ZIP / rec_gretel_* material (AGENTS.md 2026-10-15).
 */
import tutorLinesJson from "../content/tutor-lines.json";
import {
  getGretelVoiceProviderConfig,
  isGretelVoiceMuted,
  setGretelVoiceProviderConfig,
  type GretelVoiceHandlers,
} from "./gretel-voice";
import { claimSpeech, registerSpeechCleanup, releaseSpeech } from "./speech-playback";

export interface TutorViseme {
  /** seconds from playback start */
  start: number;
  end: number;
  /** Rhubarb shape A–H or X (rest); empty timeline means "use amplitude fallback" */
  shape: string;
}

export interface TutorLineEntry {
  lineId: string;
  /** 0 = shared across lessons */
  lesson: number;
  role: string;
  text: string;
  src?: string;
  visemes?: string;
  emotion: string;
  approval?: string;
}

export interface TutorLinesManifest {
  approved: TutorLineEntry[];
  pending: TutorLineEntry[];
}

export const tutorLines = tutorLinesJson as TutorLinesManifest;

export const TUTOR_VOICE_PROVIDER_NAME = "Tutor line bank";

/** Trailing reuse note used on pending lines whose wording is copied verbatim from the repo. */
const REUSE_NOTE = /\s*\(reuse: [A-Za-zÀ-ÿ_ -]+\)$/;

const lineByText = new Map<string, TutorLineEntry>();
function registerText(text: string, entry: TutorLineEntry): void {
  const key = text.trim();
  if (key && !lineByText.has(key)) lineByText.set(key, entry);
}
for (const entry of [...tutorLines.approved, ...tutorLines.pending]) {
  registerText(entry.text, entry);
  // Also resolve the clean spoken wording of reused-but-unrecorded lines so
  // callers can pass the plain repo wording (pending → silence either way).
  if (REUSE_NOTE.test(entry.text)) registerText(entry.text.replace(REUSE_NOTE, ""), entry);
}

/** Resolve a line by the exact text a caller would speak. */
export function findTutorLineByText(text: string): TutorLineEntry | undefined {
  return lineByText.get((text ?? "").trim());
}

/** All lineIds of approved (playable) lines. */
export function approvedLineIds(): string[] {
  return tutorLines.approved.map((entry) => entry.lineId);
}

export interface TutorVoiceOptions {
  /**
   * Fired when an approved recording starts playing, with that line's viseme
   * timeline (empty = no viseme data yet; the puppet should fall back to the
   * amplitude-driven "talking" state) and its lineId.
   */
  onVisemeTimeline?: (timeline: TutorViseme[], lineId: string) => void;
  /** Fired whenever a line resolves to gentle silence (pending, unknown text, or missing file). */
  onSilentLine?: (text: string) => void;
  onPlaybackPosition?: (position: TutorPlaybackPosition | null) => void;
}

/** Media time drives both visemes and the word cue; never a wall-clock guess. */
export interface TutorPlaybackPosition {
  currentTime: number;
  duration: number;
  lineId: string;
}

let mountedPlayback:
  | ((text: string, handlers: GretelVoiceHandlers) => Promise<TutorSpeakResult>)
  | null = null;
let mountedProvider: ReturnType<typeof getGretelVoiceProviderConfig> | null = null;
let stopActive: (() => void) | null = null;

async function loadVisemeTimeline(
  entry: TutorLineEntry,
  signal: AbortSignal,
): Promise<TutorViseme[]> {
  if (!entry.visemes || typeof fetch !== "function") return [];
  try {
    const response = await fetch(entry.visemes, { signal });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    const cues = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "mouthCues" in data
        ? (data as { mouthCues: unknown }).mouthCues
        : null;
    if (!Array.isArray(cues)) return [];
    return cues
      .map((cue) => ({ start: cue?.start, end: cue?.end, shape: cue?.shape ?? cue?.value }))
      .filter(
        (cue): cue is TutorViseme =>
          Number.isFinite(cue.start) &&
          Number.isFinite(cue.end) &&
          cue.start >= 0 &&
          cue.end >= cue.start &&
          /^[A-HX]$/.test(cue.shape),
      );
  } catch {
    return [];
  }
}

export type TutorSpeakResult = "spoken" | "silent" | "cancelled";

function buildPlayback(options: TutorVoiceOptions) {
  return (text: string, handlers: GretelVoiceHandlers): Promise<TutorSpeakResult> => {
    stopActive?.();
    const token = claimSpeech("gretel");
    return new Promise((resolve) => {
      const controller = new AbortController();
      let audio: HTMLAudioElement | null = null;
      let settled = false;
      let started = false;
      let outcome: TutorSpeakResult = "silent";
      let timer: ReturnType<typeof setTimeout> | undefined;
      const entry = findTutorLineByText(text);
      const finish = (result: TutorSpeakResult) => {
        if (settled) return;
        settled = true;
        controller.abort();
        clearTimeout(timer);
        if (audio) {
          audio.removeEventListener("playing", playing);
          audio.removeEventListener("timeupdate", position);
          audio.removeEventListener("ended", ended);
          audio.removeEventListener("error", failed);
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        }
        if (stopActive === cancel) stopActive = null;
        releaseSpeech(token);
        if (started) window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
        options.onPlaybackPosition?.(null);
        handlers.onEnd?.();
        resolve(result);
      };
      const cancel = () => finish("cancelled");
      const position = () => {
        if (audio && entry && !settled)
          options.onPlaybackPosition?.({
            currentTime: audio.currentTime,
            duration: Number.isFinite(audio.duration) ? audio.duration : 0,
            lineId: entry.lineId,
          });
      };
      let timeline: TutorViseme[] = [];
      const playing = () => {
        if (settled || started) return;
        started = true;
        outcome = "spoken";
        clearTimeout(timer);
        // Bound a corrupt/stalled recording; normal clips are much shorter.
        timer = setTimeout(failed, 120_000);
        options.onVisemeTimeline?.(timeline, entry!.lineId);
        window.dispatchEvent(new CustomEvent("gretel:speak_start"));
        handlers.onStart?.();
        position();
      };
      const ended = () => finish(outcome);
      const failed = () => {
        if (settled) return;
        options.onSilentLine?.(text);
        finish("silent");
      };
      stopActive = cancel;
      registerSpeechCleanup(token, cancel);
      if (isGretelVoiceMuted() || !text?.trim()) {
        finish("silent");
        return;
      }
      if (!entry?.src || !tutorLines.approved.includes(entry)) {
        failed();
        return;
      }
      // Cancellation is registered BEFORE either async resource starts.
      timer = setTimeout(failed, 15_000);
      void (async () => {
        timeline = await loadVisemeTimeline(entry, controller.signal);
        if (settled || isGretelVoiceMuted()) return;
        try {
          audio = new Audio(entry.src);
          audio.addEventListener("playing", playing);
          audio.addEventListener("timeupdate", position);
          audio.addEventListener("ended", ended);
          audio.addEventListener("error", failed);
          await audio.play();
        } catch {
          failed();
        }
      })();
    });
  };
}

/** Restore only this mount's provider; disposal also settles pending callers. */
export function mountTutorVoice(options: TutorVoiceOptions = {}): () => void {
  stopActive?.();
  const previousConfig = getGretelVoiceProviderConfig();
  const playback = buildPlayback(options);
  const provider = {
    type: "recorded-audio" as const,
    name: TUTOR_VOICE_PROVIDER_NAME,
    speakFn: async (text: string, handlers: GretelVoiceHandlers) => {
      await playback(text, handlers);
    },
  };
  mountedPlayback = playback;
  mountedProvider = provider;
  setGretelVoiceProviderConfig(provider);
  return () => {
    if (mountedPlayback !== playback) return;
    stopActive?.();
    mountedPlayback = null;
    mountedProvider = null;
    setGretelVoiceProviderConfig(previousConfig);
  };
}

/** Exact provider identity, per-call result, and actual media-start events. */
export async function speakTutorLine(
  text: string,
  handlers: GretelVoiceHandlers = {},
): Promise<TutorSpeakResult> {
  const provider = getGretelVoiceProviderConfig();
  if (
    !mountedPlayback ||
    !mountedProvider ||
    provider.type !== "recorded-audio" ||
    provider.speakFn !== mountedProvider.speakFn
  ) {
    handlers.onEnd?.();
    return "silent";
  }
  return mountedPlayback(text, handlers);
}
