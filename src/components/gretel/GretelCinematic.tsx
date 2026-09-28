import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, SkipForward } from "lucide-react";
import { GretelLiveAvatar, type GretelLiveAvatarRef } from "@/components/gretel/GretelLiveAvatar";
import { isGretelVoiceMuted, setGretelVoiceMuted } from "@/lib/gretel-voice";
import type { GretelCinematic as GretelCinematicSpec } from "@/content/gretel-cinematics";

export function GretelCinematic({
  cinematic,
  onComplete,
}: {
  cinematic: GretelCinematicSpec;
  onComplete: () => void;
}) {
  const avatarRef = useRef<GretelLiveAvatarRef>(null);
  const onCompleteRef = useRef(onComplete);
  const [muted, setMuted] = useState(isGretelVoiceMuted());
  const [run, setRun] = useState(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      await avatarRef.current?.speakMessage(cinematic.script);
      if (!cancelled) onCompleteRef.current();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      avatarRef.current?.cancel();
    };
  }, [cinematic.id, cinematic.script, run]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) avatarRef.current?.cancel();
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
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <GretelLiveAvatar ref={avatarRef} size="lg" managed />
          <div className="rounded-2xl bg-[#fff8e8] px-5 py-4 text-xl font-black leading-relaxed text-stone-800 sm:text-2xl" role="status">
            {cinematic.script}
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
            Voz: {cinematic.voice.primary} · alternativa {cinematic.voice.fallback} · {cinematic.voice.locale}
          </p>
        </div>
      </div>
    </section>
  );
}
