import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { AUDIO_POLICY } from "@/content/audio-manifest";
import {
  instructionAudioMuted,
  instructionRecordings,
  playInstruction,
  stopInstructionAudio,
} from "@/lib/instruction-audio";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

/** Student-workbook instruction speaker button. Plays the owner's recorded
 * instruction when the printed text is mapped; otherwise uses approved
 * recorded audio and hides when unavailable (never device TTS). */
export function EscucharInstruccionButton({
  text,
  label = "Escuchar instrucción",
  className = "",
}: Props) {
  const { play, playingText, isAvailable } = useAudio();
  const [instructionPlaying, setInstructionPlaying] = useState(false);
  const active = useRef(false);
  const hasInstruction = instructionRecordings(text).length > 0;

  useEffect(() => {
    if (!hasInstruction) return;
    const stop = () => {
      if (active.current) stopInstructionAudio();
      active.current = false;
      setInstructionPlaying(false);
    };
    const mute = () => {
      if (instructionAudioMuted()) stop();
    };
    const pageTurn = (event: Event) => {
      if ((event as CustomEvent).detail?.type === "page-turn:start") stop();
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener("cartilla:audio-settings", mute);
    window.addEventListener("storage", mute);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", stop);
    window.addEventListener("gretel:bus", pageTurn);
    return () => {
      if (active.current) stopInstructionAudio();
      window.removeEventListener("cartilla:audio-settings", mute);
      window.removeEventListener("storage", mute);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("gretel:bus", pageTurn);
    };
  }, [text, hasInstruction]);

  const available =
    hasInstruction || (typeof isAvailable === "function" ? isAvailable(text) : false);
  if (!AUDIO_POLICY.allowTts && !available) return null;
  const playing = hasInstruction ? instructionPlaying : playingText === text;

  const onClick = async () => {
    if (!hasInstruction) {
      play(text);
      return;
    }
    if (instructionPlaying) {
      stopInstructionAudio();
      return;
    }
    active.current = true;
    setInstructionPlaying(true);
    try {
      await playInstruction(text);
    } finally {
      active.current = false;
      setInstructionPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void onClick();
      }}
      aria-label={`${label}: ${text}`}
      aria-pressed={playing}
      className={`fp-escuchar-btn ${className}`.trim()}
    >
      <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{playing ? "Escuchando…" : "Escuchar"}</span>
    </button>
  );
}
