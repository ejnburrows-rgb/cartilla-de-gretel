import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { isGretelVoiceMuted } from "@/lib/gretel-voice";
import { approvedPictureRecording } from "@/lib/picture-vocabulary";
import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, stopSpeech } from "@/lib/speech-playback";

/** Teaching emphasis only; preserve source letters, accents and capitalization. */
export function Lesson24Syllable({ text }: { text: string }) {
  return <>{Array.from(text).map((letter, i) =>
    /[aeiouáéíóú]/i.test(letter)
      ? <span className="l24-vowel" key={i}>{letter}</span>
      : letter,
  )}</>;
}

// Exact word/file matches present in public/audio/voz/vocabulario at intake.
// No instruction, syllable, reward or synthesized fallback is supplied here.
const WORD_CLIPS: Readonly<Record<string, string>> = {
  zapato: "/audio/voz/vocabulario/zapato.mp3",
  taza: "/audio/voz/vocabulario/taza.mp3",
  zorro: "/audio/voz/vocabulario/zorro.mp3",
  "zig-zag": "/audio/voz/vocabulario/zig-zag.mp3",
  Zulema: "/audio/voz/vocabulario/zulema.mp3",
};

export function Lesson24Word({ word }: { word: string }) {
  const [state, setState] = useState<"idle" | "playing" | "failed">("idle");
  const active = useRef<number | null>(null);
  const candidate = WORD_CLIPS[word];
  const clip = candidate && approvedPictureRecording(word.toLocaleLowerCase("es")) === candidate
    ? candidate : undefined;

  useEffect(() => () => {
    if (active.current !== null && speechIsCurrent(active.current)) stopSpeech("picture");
  }, []);

  if (!clip) return <span data-lesson24-audio="missing">{word}</span>;

  const play = () => {
    if (active.current !== null && speechIsCurrent(active.current)) {
      stopSpeech("picture");
      return;
    }
    if (audioEngine.isMuted() || audioEngine.getVolume() <= 0 || isGretelVoiceMuted()) return;
    const token = claimSpeech("picture");
    active.current = token;
    const audio = new Audio(clip);
    audio.volume = audioEngine.getVolume();
    registerSpeechCleanup(token, () => {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      active.current = null;
      setState("idle");
    });
    const finish = (failed: boolean) => {
      if (!speechIsCurrent(token)) return;
      stopSpeech("picture");
      releaseSpeech(token);
      if (failed) setState("failed");
    };
    audio.onended = () => finish(false);
    audio.onerror = () => finish(true);
    setState("playing");
    void audio.play().catch(() => finish(true));
  };

  return <button type="button" className="l24-word-audio" onClick={play}
    data-lesson24-audio={state} aria-pressed={state === "playing"}
    aria-label={`${state === "playing" ? "Detener" : "Escuchar"}: ${word}`}>
    {word}<Volume2 size={20} aria-hidden="true" />
    {state === "failed" && <span role="status" className="l24-audio-error">Audio no disponible</span>}
  </button>;
}
