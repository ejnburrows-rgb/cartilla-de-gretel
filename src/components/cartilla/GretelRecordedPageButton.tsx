import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { availablePageRecordingUrls } from "@/lib/gretel-recorded-clips";
import { playGretelRecordingQueue } from "@/lib/gretel-recorded-playback";
import { isGretelVoiceMuted } from "@/lib/gretel-voice";
import { stopSpeech } from "@/lib/speech-playback";
/** Shown only after verified page recordings actually exist in the built app. */
export function GretelRecordedPageButton({ pageNumber, disabled = false }: { pageNumber: number; disabled?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const active = useRef(false);
  const urls = availablePageRecordingUrls(pageNumber);
  useEffect(() => () => { if (active.current) stopSpeech("gretel"); }, [pageNumber]);
  if (!urls.length) return null;
  const onClick = () => {
    if (active.current) { stopSpeech("gretel"); active.current = false; setPlaying(false); return; }
    if (disabled || isGretelVoiceMuted()) return;
    active.current = true;
    setPlaying(true);
    void playGretelRecordingQueue(urls).finally(() => { active.current = false; setPlaying(false); });
  };
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-950 disabled:opacity-40"
      aria-label={playing ? "Detener audio de página "+pageNumber : "Escuchar página "+pageNumber+" con Gretel"}
      aria-pressed={playing}>
      {playing ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-4 w-4" />}
      {playing ? "Detener" : "Escuchar"}
    </button>
  );
}
