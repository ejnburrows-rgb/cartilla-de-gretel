import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";

/**
 * Play button for the owner's own voice recordings.
 *
 * Plays the MP3 file directly — no TTS, no synthesis, no fallback voice.
 * If the file is missing or fails, the button quietly stops; the line simply
 * stays silent (owner rule: a missing recording is never synthesized).
 */
export function OwnerVoiceButton({ src, label }: { src: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlaying(true);
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlaying(false);
      }
    };
    audio.onerror = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlaying(false);
      }
    };
    void audio.play().catch(() => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlaying(false);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={playing}
      className={`l3w-voice-btn${playing ? " is-playing" : ""}`}
    >
      <Volume2 className="l3w-voice-btn__icon" aria-hidden="true" />
      <span className="l3w-voice-btn__text">{playing ? "Escuchando…" : "Escuchar"}</span>
    </button>
  );
}
