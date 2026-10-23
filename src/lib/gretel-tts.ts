
/**
 * gretel-tts.ts — speaks Gretel's short feedback phrases aloud using the
 * centralized Gretel voice pipeline (speakAsGretel).
 *
 * All Gretel speech entry points route through speakAsGretel in gretel-voice.ts,
 * guaranteeing single-owner playback via speech-playback.ts, event dispatch
 * ("gretel:speak_start" and "gretel:speak_stop"), and mute/cancel cleanup.
 */

export function speakGretelPhrase(_phrase: string): void {
  // Owner rule 2026-10-18: his own recordings only, never device/browser voice.
  // Robot voice killed — this is now a no-op until wired to his recordings.
  return;
}
