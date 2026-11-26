import { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";

export interface LessonNarrationPlayerProps {
  audioPath: string;
}

export function LessonNarrationPlayer({ audioPath }: LessonNarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isError, setIsError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when audioPath changes
  useEffect(() => {
    setIsPlaying(false);
    setIsError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioPath]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Handle playback errors (e.g. browser policies blocking autoplay if we added it, or missing file that wasn't caught by onError)
          setIsError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-500">
        <VolumeX className="h-4 w-4" />
        <p>Narración no disponible en este momento.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-white p-2 shadow-sm">
      <audio
        ref={audioRef}
        src={audioPath}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsError(true)}
      />

      <button
        onClick={togglePlay}
        className="flex items-center justify-center rounded-lg border border-amber-300 bg-amber-100 p-2 text-amber-800 transition-colors hover:bg-amber-200"
        aria-label={isPlaying ? "Pausar narración" : "Reproducir narración"}
        title={isPlaying ? "Pausar narración" : "Reproducir narración"}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      <button
        onClick={handleStop}
        disabled={!isPlaying && audioRef.current?.currentTime === 0}
        className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 p-2 text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Detener narración"
        title="Detener narración"
      >
        <Square className="h-5 w-5" />
      </button>

      <button
        onClick={toggleMute}
        className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 p-2 text-stone-700 transition-colors hover:bg-stone-200"
        aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
        title={isMuted ? "Activar audio" : "Silenciar audio"}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <span className="ml-2 text-xs font-bold text-stone-600">Narración</span>
    </div>
  );
}
