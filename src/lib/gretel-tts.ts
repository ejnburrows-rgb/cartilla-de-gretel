// gretel-tts.ts — speaks Gretel's short feedback phrases aloud using the
// browser's built-in speech synthesis, instead of showing them as on-screen
// text. Real recorded voice clips can replace this later without changing
// any call sites (see useGretelEvents.ts).
//
// Reuses speak.ts's voice picker (neutral Latin American Spanish preferred,
// es-MX/es-US/es-419, with a logged — never silent — fallback) instead of a
// separate, weaker "any es-* voice" picker, so both TTS paths honor the
// same voice requirement.

import { getVoice } from "@/lib/speak";

export function speakGretelPhrase(phrase: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.rate = 0.95;
  utterance.pitch = 1.15;
  const voice = getVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "es-MX";
  }
  window.speechSynthesis.speak(utterance);
}
