// gretel-tts.ts — speaks Gretel's short feedback phrases aloud using the
// browser's built-in speech synthesis, instead of showing them as on-screen
// text. Real recorded voice clips can replace this later without changing
// any call sites (see useGretelEvents.ts).

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("es")) ?? null;
  return cachedVoice;
}

export function speakGretelPhrase(phrase: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = "es-ES";
  utterance.rate = 0.95;
  utterance.pitch = 1.15;
  const voice = pickSpanishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
