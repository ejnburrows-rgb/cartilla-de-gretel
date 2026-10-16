import { audioEngine } from "@/lib/audio-engine";
import { isGretelVoiceMuted } from "@/lib/gretel-voice";
import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, stopSpeech } from "@/lib/speech-playback";

/** Owner-authorized synthetic Spanish files; no change to global TTS policy. */
export function playLesson3Audio(key: string): void {
  if (typeof window === "undefined" || !/^(muy-bien|p7-instr|p8-instr|p9-instr[12])$/.test(key)) return;
  if (audioEngine.isMuted() || audioEngine.getVolume() <= 0 || isGretelVoiceMuted()) return;
  const token = claimSpeech("gretel");
  const audio = new Audio(`/audio/lesson-3-tts/${key}.mp3`);
  audio.volume = audioEngine.getVolume();
  const stop = () => {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    window.removeEventListener("cartilla:audio-settings", mute);
    window.removeEventListener("storage", mute);
    window.removeEventListener("pagehide", cancel);
    document.removeEventListener("visibilitychange", hidden);
  };
  const finish = () => { stop(); releaseSpeech(token); };
  const cancel = () => { if (speechIsCurrent(token)) stopSpeech("gretel"); };
  const mute = () => { if (audioEngine.isMuted() || audioEngine.getVolume() <= 0 || isGretelVoiceMuted()) cancel(); };
  const hidden = () => { if (document.hidden) cancel(); };
  registerSpeechCleanup(token, stop);
  window.addEventListener("cartilla:audio-settings", mute);
  window.addEventListener("storage", mute);
  window.addEventListener("pagehide", cancel);
  document.addEventListener("visibilitychange", hidden);
  audio.onended = audio.onerror = finish;
  void audio.play().catch(finish);
}

export function Lesson3InstructionAudio({ instructionKey, text }: { instructionKey: string; text: string }) {
  return <button type="button" className="lesson-3-instruction-audio" aria-label={`Escuchar instrucciones: ${text}`} onClick={(event) => {
    event.preventDefault(); event.stopPropagation(); playLesson3Audio(instructionKey);
  }}>Escuchar</button>;
}
