import {
  claimSpeech,
  registerSpeechCleanup,
  releaseSpeech,
  stopSpeech,
} from "@/lib/speech-playback";
import recordings from "@/content/picture-name-recordings.json";

const key = (text: string) => text.normalize("NFC").trim().toLocaleLowerCase("es");
export function recordedWordUrl(text: string): string | undefined {
  return recordings.approved.find((item) => item.key === key(text) && item.approval)?.src;
}
// Exact-text slots only: no clip stitching, synthesis or generated fallback.
export const GAME_INSTRUCTION_RECORDINGS: Record<string, string | undefined> = {};
export const GAME_REWARD_RECORDINGS: Record<string, string | undefined> = {};
type Status = "recorded" | "missing-recording" | "failed" | "muted" | "stopped";
let active: HTMLAudioElement | undefined;
let activeKey = "";
let activeToken: number | undefined;
let removeSettingsListener: (() => void) | undefined;
function report(status: Status, text = "", src?: string) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("cartilla:recorded-speech-status", {
        detail: { status, key: text, src, source: "game" },
      }),
    );
}
export function stopGameAudio(): void {
  const previous = active;
  const token = activeToken;
  activeToken = undefined;
  const text = activeKey;
  active = undefined;
  activeKey = "";
  if (token !== undefined) releaseSpeech(token);
  removeSettingsListener?.();
  removeSettingsListener = undefined;
  if (previous) {
    previous.onended = null;
    previous.onerror = null;
    previous.pause();
    report("stopped", text, previous.src);
  }
}
function playUrl(url: string | undefined, text = ""): void {
  // A new voice request owns silence too: pending/muted cues stop every prior voice.
  stopSpeech();
  stopGameAudio();
  if (typeof window === "undefined") return;
  if (!url) {
    report("missing-recording", text);
    return;
  }
  const settings = () => ({
    muted: localStorage.getItem("cartilla:audio:muted") === "true",
    volume: Number(localStorage.getItem("cartilla:audio:volume") ?? "0.8"),
  });
  try {
    const { muted, volume } = settings();
    if (muted || volume <= 0) {
      report("muted", text, url);
      return;
    }
    const token = claimSpeech("reading");
    activeToken = token;
    const audio = new Audio(url);
    audio.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.8;
    active = audio;
    activeKey = text;
    registerSpeechCleanup(token, stopGameAudio);
    const finish = (status: Status) => {
      if (active !== audio) return;
      stopGameAudio();
      report(status, text, url);
    };
    audio.onended = () => finish("stopped");
    // A 404, invalid media or decoder error is not a functioning recording.
    audio.onerror = () => finish("failed");
    const settingsChanged = () => {
      if (active !== audio) return;
      try {
        const next = settings();
        if (next.muted || next.volume <= 0) finish("muted");
        else
          audio.volume = Number.isFinite(next.volume) ? Math.max(0, Math.min(1, next.volume)) : 0.8;
      } catch {
        finish("failed");
      }
    };
    window.addEventListener("cartilla:audio-settings", settingsChanged);
    window.addEventListener("storage", settingsChanged);
    removeSettingsListener = () => {
      window.removeEventListener("cartilla:audio-settings", settingsChanged);
      window.removeEventListener("storage", settingsChanged);
    };
    void audio
      .play()
      .then(() => {
        if (active === audio) report("recorded", text, url);
      })
      .catch(() => finish("failed"));
  } catch {
    stopGameAudio();
    report("failed", text, url);
  }
}
export function playWord(url?: string, text?: string): void {
  playUrl(url || (text ? recordedWordUrl(text) : undefined), text);
}
export function playInstruction(url?: string, text?: string): void {
  playUrl(url || (text ? GAME_INSTRUCTION_RECORDINGS[text] : undefined), text);
}
export function playReward(text: string): void {
  playUrl(GAME_REWARD_RECORDINGS[text], text);
}
