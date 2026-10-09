import { speakAsGretel, isGretelVoiceMuted } from "./gretel-voice";

/**
 * gretel-tts.ts — speaks Gretel's short feedback phrases aloud using the
 * centralized Gretel voice pipeline (speakAsGretel).
 *
 * All Gretel speech entry points route through speakAsGretel in gretel-voice.ts,
 * guaranteeing single-owner playback via speech-playback.ts, event dispatch
 * ("gretel:speak_start" and "gretel:speak_stop"), and mute/cancel cleanup.
 */

export function speakGretelPhrase(phrase: string): void {
  if (typeof window === "undefined") return;
  if (isGretelVoiceMuted()) return;
  void speakAsGretel(phrase);
}
