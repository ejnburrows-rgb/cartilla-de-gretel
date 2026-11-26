import { Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { AUDIO_POLICY } from "@/content/audio-manifest";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

/** Student-workbook instruction speaker button. Uses approved recorded audio; hides when unavailable and TTS is disabled. */
export function EscucharInstruccionButton({ text, label = "Escuchar instrucción", className = "" }: Props) {
  const { play, playingText, isAvailable } = useAudio();
  const available = typeof isAvailable === "function" ? isAvailable(text) : false;
  if (!AUDIO_POLICY.allowTts && !available) return null;
  const active = playingText === text;
  return (
    <button
      type="button"
      onClick={() => play(text)}
      aria-label={`${label}: ${text}`}
      aria-pressed={active}
      className={`fp-escuchar-btn ${className}`.trim()}
    >
      <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{active ? "Escuchando…" : "Escuchar"}</span>
    </button>
  );
}
