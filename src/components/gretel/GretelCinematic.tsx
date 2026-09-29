import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, SkipForward } from "lucide-react";
import { cancelGretelSpeech, isGretelVoiceMuted, setGretelVoiceMuted, speakAsGretel } from "@/lib/gretel-voice";
import type { GretelCinematic as GretelCinematicSpec } from "@/content/gretel-cinematics";

/** Canonical full-body portrait of the authentic Gretel (EJN-confirmed reference). */
export const GRETEL_AUTHENTIC_PORTRAIT_SRC = "/cartilla/images/gretel/gretel-autentica.png";

export function GretelCinematic({
  cinematic,
  onComplete,
}: {
  cinematic: GretelCinematicSpec;
  onComplete: () => void;
}) {
  const onCompleteRef = useRef(onComplete);
  const [muted, setMuted] = useState(isGretelVoiceMuted());
  const [run, setRun] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setElapsedMs(0);
    const started = performance.now();
    const progressTimer = window.setInterval(() => {
      setElapsedMs(performance.now() - started);
    }, 120);

    let cancelled = false;
    const timers = new Set<number>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, ms);
        timers.add(timer);
      });

    const dwellFor = (action: string) =>
      action === "enter" ? 320 :
      action === "wave" ? 650 :
      action.startsWith("point") ? 620 :
      action === "listen" ? 520 :
      action === "teach" ? 620 :
      action === "help" ? 620 :
      action === "gentle-error" ? 560 :
      action === "celebrate" ? 760 :
      action === "exit" ? 360 : 220;

    const timer = window.setTimeout(async () => {
      for (const action of cinematic.actions) {
        if (cancelled) return;
        if (action === "talk") {
          // Voice-over carries the spoken line; the caption card carries the text.
          await speakAsGretel(cinematic.script);
        } else {
          await wait(dwellFor(action));
        }
      }
      if (!cancelled) onCompleteRef.current();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      timers.forEach((item) => window.clearTimeout(item));
      window.clearInterval(progressTimer);
      cancelGretelSpeech();
    };
  }, [cinematic.actions, cinematic.id, cinematic.script, run]);

  const progress = Math.min(1, elapsedMs / Math.max(1000, cinematic.durationSeconds * 1000));
  const captionIndex = useMemo(
    () => Math.min(cinematic.captions.length - 1, Math.floor(progress * cinematic.captions.length)),
    [cinematic.captions.length, progress],
  );
  const activeCaption = cinematic.captions[Math.max(0, captionIndex)] ?? cinematic.script;

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) cancelGretelSpeech();
    else setRun((value) => value + 1);
  };

  return (
    <section
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#f7f2e8]/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Introducción de Gretel"
      data-gretel-cinematic={cinematic.id}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border-4 border-[#c98c4f]/30 bg-white px-6 py-8 shadow-2xl sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,206,120,.24),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(79,165,121,.16),transparent_36%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-stone-100" aria-hidden>
          <div className="h-full bg-[#c98c4f] transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <div className="rounded-full border border-[#c98c4f]/25 bg-[#fff8e8]/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9a612b]">
            {cinematic.kind === "lesson" ? `Lección ${cinematic.lesson}` : cinematic.kind === "welcome" ? "Bienvenida" : cinematic.kind === "how-to" ? "Cómo aprender con Gretel" : cinematic.kind === "final" ? "Celebración final" : "Momento especial"}
          </div>
          {/* The authentic book-cover Gretel. No floating bubble: the caption card
              below carries the spoken line, and a bubble would cover her face. */}
          <img
            src={GRETEL_AUTHENTIC_PORTRAIT_SRC}
            alt="Gretel, la niña de la cartilla"
            className="gretel-cinematic-portrait"
            draggable={false}
          />
          <div className="min-h-[5.6rem] rounded-2xl border border-amber-200/70 bg-[#fff8e8]/95 px-5 py-4 text-xl font-black leading-relaxed text-stone-800 shadow-sm sm:text-2xl" role="status" aria-live="polite">
            {activeCaption}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={toggleMute} className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black text-stone-700">
              {muted ? <VolumeX className="mr-2 inline h-4 w-4" /> : <Volume2 className="mr-2 inline h-4 w-4" />}
              {muted ? "Activar voz" : "Silenciar"}
            </button>
            <button type="button" onClick={() => setRun((value) => value + 1)} className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black text-stone-700">
              <RotateCcw className="mr-2 inline h-4 w-4" /> Repetir
            </button>
            <button type="button" onClick={onComplete} className="rounded-xl bg-[#356b43] px-4 py-2 text-sm font-black text-white">
              <SkipForward className="mr-2 inline h-4 w-4" /> Comenzar
            </button>
          </div>
          <p className="text-xs font-bold text-stone-500">
            Voz canónica: {cinematic.voice.primary} · {cinematic.voice.locale}
          </p>
        </div>
      </div>
    </section>
  );
}
