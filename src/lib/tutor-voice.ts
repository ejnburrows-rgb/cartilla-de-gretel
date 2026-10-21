/**
 * Tutor voice — recorded line bank only (spec §6, milestone 4 voice part).
 *
 * The tutor never reaches a TTS path:
 *  - `speakTutorLine()` refuses to call `speakAsGretel` unless the active
 *    provider config is the tutor's own "recorded-audio" config.
 *  - the `speakFn` installed on mount plays approved recordings through an
 *    HTMLAudioElement (with a viseme-timeline callback) and never touches
 *    `speechSynthesis`.
 *  - a line with no approved recording resolves to gentle silence — no error,
 *    no fallback voice, session keeps running (§18.5).
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
  speakAsGretel,
  type GretelVoiceHandlers,
} from "./gretel-voice";

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
}

/** One at a time; the tutor owns the speech channel while mounted. */
let activeAudio: HTMLAudioElement | null = null;

/**
 * Outcome of the most recent speakFn run ("spoken" = approved audio started).
 * speakTutorLine reads it after speakAsGretel resolves so callers get the
 * real result — speakAsGretel itself cannot report it.
 */
let lastSpeakOutcome: TutorSpeakResult = "silent";

function stopActiveAudio(): void {
  if (!activeAudio) return;
  const audio = activeAudio;
  activeAudio = null;
  try {
    audio.pause();
  } catch {
    /* nothing to stop */
  }
}

async function loadVisemeTimeline(entry: TutorLineEntry): Promise<TutorViseme[]> {
  if (!entry.visemes || typeof fetch !== "function") return [];
  try {
    const response = await fetch(entry.visemes);
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as TutorViseme[]) : [];
  } catch {
    return [];
  }
}

function isPlayableEntry(entry: TutorLineEntry | undefined): entry is TutorLineEntry {
  return Boolean(entry && typeof entry.src === "string" && entry.src.length > 0);
}

function buildTutorSpeakFn(
  options: TutorVoiceOptions,
): (text: string, handlers: GretelVoiceHandlers) => Promise<void> {
  return async (text, handlers) => {
    const finish = () => handlers.onEnd?.();
    lastSpeakOutcome = "silent";

    // Mute is authoritative everywhere (cartilla.gretel.voice.muted).
    if (isGretelVoiceMuted() || !text?.trim()) {
      finish();
      return;
    }

    const entry = findTutorLineByText(text);
    if (!isPlayableEntry(entry) || !entry) {
      // Gentle silence state: pending line, unknown text, or no src.
      options.onSilentLine?.(text);
      finish();
      return;
    }

    let audio: HTMLAudioElement;
    try {
      audio = new Audio(entry.src);
    } catch {
      options.onSilentLine?.(text);
      finish();
      return;
    }

    const timeline = await loadVisemeTimeline(entry);
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        if (activeAudio === audio) activeAudio = null;
        resolve();
      };
      audio.addEventListener("ended", done);
      audio.addEventListener("error", () => {
        // Missing or unreadable file → silent, never an error for the child.
        options.onSilentLine?.(text);
        done();
      });
      activeAudio = audio;
      lastSpeakOutcome = "spoken";
      handlers.onStart?.();
      options.onVisemeTimeline?.(timeline, entry.lineId);
      try {
        const playResult = audio.play() as unknown;
        if (playResult && typeof (playResult as Promise<void>).catch === "function") {
          (playResult as Promise<void>).catch(() => {
            options.onSilentLine?.(text);
            done();
          });
        }
      } catch {
        options.onSilentLine?.(text);
        done();
      }
    });
    finish();
  };
}

/**
 * Install the tutor's recorded-audio provider. Call on tutor mount; call the
 * returned disposer on unmount to restore the previous provider config and
 * stop any line still playing.
 */
export function mountTutorVoice(options: TutorVoiceOptions = {}): () => void {
  const previousConfig = getGretelVoiceProviderConfig();
  setGretelVoiceProviderConfig({
    type: "recorded-audio",
    name: TUTOR_VOICE_PROVIDER_NAME,
    speakFn: buildTutorSpeakFn(options),
  });
  return () => {
    stopActiveAudio();
    setGretelVoiceProviderConfig(previousConfig);
  };
}

export type TutorSpeakResult = "spoken" | "silent";

/**
 * Speak one tutor line through the recorded line bank.
 *
 * Guard: refuses to call `speakAsGretel` unless the active provider config is
 * the tutor's own "recorded-audio" config — a misconfigured provider could
 * otherwise fall back to browser TTS inside speakAsGretel (spec §6).
 * Honors the global Gretel mute. Unknown/pending text resolves silently.
 */
export async function speakTutorLine(
  text: string,
  handlers: GretelVoiceHandlers = {},
): Promise<TutorSpeakResult> {
  if (getGretelVoiceProviderConfig().type !== "recorded-audio") {
    handlers.onEnd?.();
    return "silent";
  }
  if (isGretelVoiceMuted() || !text?.trim()) {
    handlers.onEnd?.();
    return "silent";
  }
  await speakAsGretel(text, handlers);
  // The speakFn already reported the real outcome (silent for pending,
  // unknown, or missing-file lines; spoken once approved audio starts).
  return lastSpeakOutcome;
}
