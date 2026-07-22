import { Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";

export function EscucharInstruccionButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { play, playingText } = useAudio();
  const isPlaying = playingText === text;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        play(text);
      }}
      className={`inline-flex items-center justify-center p-1.5 rounded-full text-amber-600 hover:bg-amber-100 transition shadow-sm bg-amber-50 border border-amber-200 ${isPlaying ? "opacity-50" : ""} ${className || ""}`}
      aria-label={`Escuchar instrucciones: ${text}`}
      title="Escuchar instrucciones"
    >
      <Volume2 className="w-4 h-4" />
    </button>
  );
}
