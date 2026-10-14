import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { availablePageRecordingUrls } from "@/lib/gretel-recorded-clips";
import { playGretelRecordingQueue } from "@/lib/gretel-recorded-playback";
import { isGretelVoiceMuted } from "@/lib/gretel-voice";
import { stopSpeech } from "@/lib/speech-playback";

/** Never advertise a missing, unapproved, or non-audio playback resource. */
export function GretelRecordedPageButton({ pageNumber, disabled = false }: { pageNumber: number; disabled?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [readyUrls, setReadyUrls] = useState<string[]>([]);
  const active = useRef(false);
  const playTicket = useRef(0);
  const urls = availablePageRecordingUrls(pageNumber);
  const urlsKey = urls.join("|");

  useEffect(() => {
    let disposed = false;
    setReadyUrls([]);
    if (urls.length) {
      void Promise.all(urls.map(async (url) => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          const type = response.headers.get("content-type") ?? "";
          return response.ok && /^(audio\/|application\/octet-stream)/i.test(type);
        } catch {
          return false;
        }
      })).then((checks) => {
        if (!disposed && checks.every(Boolean)) setReadyUrls(urls);
      });
    }
    return () => {
      disposed = true;
      playTicket.current++;
      if (active.current) stopSpeech("gretel");
      active.current = false;
    };
  }, [urlsKey]);

  if (!readyUrls.length) return null;
  const onClick = () => {
    if (active.current) {
      playTicket.current++;
      stopSpeech("gretel");
      active.current = false;
      setPlaying(false);
      return;
    }
    if (disabled || isGretelVoiceMuted()) return;
    const ticket = ++playTicket.current;
    active.current = true;
    setPlaying(true);
    void playGretelRecordingQueue(readyUrls).finally(() => {
      if (ticket !== playTicket.current) return;
      active.current = false;
      setPlaying(false);
    });
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
