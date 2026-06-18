// Free Spanish TTS using the browser's SpeechSynthesis API.
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;
let lastOnLine: boolean | null = null;

const PREFERRED_NAMES = [
  "Google español",
  "Google español de Estados Unidos",
  "Microsoft Sabina Online (Natural)",
  "Microsoft Dalia Online (Natural)",
  "Microsoft Elvira Online (Natural)",
  "Microsoft Ximena Online (Natural)",
  "Microsoft Helena",
  "Microsoft Sabina",
  "Paulina",
  "Mónica",
  "Monica",
];

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name;
  const lang = (v.lang || "").toLowerCase();
  if (!lang.startsWith("es")) return -1;
  let score = 0;
  const idx = PREFERRED_NAMES.findIndex((n) => name.includes(n));
  if (idx >= 0) score += 1000 - idx;
  if (/natural|neural|online|premium|enhanced/i.test(name)) score += 200;
  if (/google/i.test(name)) score += 150;
  if (/microsoft/i.test(name)) score += 100;
  if (/(sabina|dalia|elvira|ximena|helena|paulina|mónica|monica|lucia|laura|sara)/i.test(name))
    score += 50;
  if (lang === "es-mx") score += 30;
  else if (lang === "es-us") score += 25;
  else if (lang === "es-es") score += 20;

  // Boost local voices when offline to ensure SpeechSynthesis functions without network calls
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  if (isOffline) {
    if (v.localService) {
      score += 5000;
    } else {
      score -= 2000; // Penalize online-only voices when offline
    }
  } else {
    if (v.localService) score += 5;
  }
  return score;
}

function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const ranked = voices
    .map((v) => ({ v, s: scoreVoice(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.v ?? null;
}

function getVoice(): SpeechSynthesisVoice | null {
  const currentOnLine = typeof navigator !== "undefined" ? navigator.onLine : true;
  if (lastOnLine !== currentOnLine) {
    cachedVoice = null;
    lastOnLine = currentOnLine;
  }
  if (!cachedVoice) {
    cachedVoice = pickBestVoice();
  }
  return cachedVoice;
}

function ensureVoices(): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  if (voicesReady) return voicesReady;
  voicesReady = new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;
    const tryPick = () => {
      cachedVoice = pickBestVoice();
      if (cachedVoice) resolve();
    };
    tryPick();
    if (cachedVoice) return;
    synth.addEventListener("voiceschanged", function once() {
      tryPick();
      synth.removeEventListener("voiceschanged", once);
      resolve();
    });
    setTimeout(() => resolve(), 1500);
  });
  return voicesReady;
}

export async function speak(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  await ensureVoices();
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      
      // Dispatch events for Gretel Mascot
      u.onstart = () => window.dispatchEvent(new CustomEvent("gretel:speak_start"));
      u.onend = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };
      u.onerror = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };

      const voice = getVoice();
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = "es-ES";
      }
      u.rate = 0.88;
      u.pitch = 1.05;
      u.volume = 1;
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}

export async function speakVowel(v: string): Promise<void> {
  const lower = v.toLowerCase();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  await ensureVoices();
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(lower.repeat(5));

      // Dispatch events for Gretel Mascot
      u.onstart = () => window.dispatchEvent(new CustomEvent("gretel:speak_start"));
      u.onend = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };
      u.onerror = () => { window.dispatchEvent(new CustomEvent("gretel:speak_stop")); resolve(); };

      const voice = getVoice();
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = "es-ES";
      }
      u.rate = 0.7;
      u.pitch = 1.1;
      u.volume = 1;
      synth.speak(u);
    } catch {
      resolve();
    }
  });
}
