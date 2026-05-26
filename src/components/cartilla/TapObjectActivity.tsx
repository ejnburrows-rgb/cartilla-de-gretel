import type { CSSProperties } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, Volume2, BookOpen, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { hasVerifiedHotspots } from "@/lib/workbook-interactions";
import type { WorkbookInteraction, InteractionTarget } from "@/lib/workbook-interactions";
import { assetPath } from "@/lib/assets";

type Props = {
  interaction: WorkbookInteraction;
  accent?: string;
  onComplete?: (interactionId: string) => void;
};

const panelPop = { scale: [1, 1.01, 1], y: [0, -2, 0] };
const completePop = { opacity: 1, y: 0, scale: 1 };
const completeInitial = { opacity: 0, y: 8, scale: 0.98 };

function accentBarStyle(accent: string): CSSProperties {
  return { backgroundColor: accent };
}

function listButtonStyle(accent: string): CSSProperties {
  return { borderColor: `${accent}33` };
}

function circleStyle(accent: string): CSSProperties {
  return { backgroundColor: accent };
}

function hotspotStyle(target: InteractionTarget): CSSProperties {
  return {
    position: "absolute",
    left: `${target.xPercent ?? 0}%`,
    top: `${target.yPercent ?? 0}%`,
    width: `${target.widthPercent ?? 10}%`,
    height: `${target.heightPercent ?? 8}%`,
  };
}

/**
 * If coordinates ARE verified for the target, we render a hotspot overlay
 * (position: absolute, %).
 * If coordinates are NOT verified, we render a list/tap activity instead.
 */
export function TapObjectActivity({ interaction, accent = "hsl(var(--primary))", onComplete }: Props) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const verified = hasVerifiedHotspots(interaction);
  const imageSrc = interaction.assetRef ? assetPath(interaction.assetRef) : undefined;
  const complete = tapped.size >= interaction.targets.length && interaction.targets.length > 0;

  const handleTap = (target: InteractionTarget) => {
    speak(target.label);
    setTapped((prev) => {
      if (prev.has(target.id)) return prev;
      const next = new Set(prev);
      next.add(target.id);
      if (next.size >= interaction.targets.length && onComplete) {
        onComplete(interaction.id);
      }
      return next;
    });
  };

  return (
    <motion.div
      className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#fff7ed)] p-5 sm:p-6 space-y-5 shadow-[0_20px_50px_rgba(50,30,10,0.07)]"
      animate={complete ? panelPop : undefined}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-full min-h-[2.75rem] rounded-full shrink-0"
          style={accentBarStyle(accent)}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-[#3A281E] leading-tight">{interaction.title}</h3>
          <p className="text-sm font-semibold text-stone-600 mt-1 leading-snug">{interaction.prompt}</p>
          <p className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-black text-amber-900/70 shadow-sm ring-1 ring-amber-900/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Toca cada respuesta. Puedes escucharla otra vez.
          </p>
        </div>
      </div>

      {verified ? (
        <div
          className="relative w-full aspect-[4/3] rounded-3xl bg-stone-100 border border-stone-200 overflow-hidden shadow-inner"
          role="region"
          aria-label="Area de la pagina con objetos para tocar"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Pagina fuente del cuaderno"
              className="absolute inset-0 h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-stone-400 font-semibold select-none">
              Vista de pagina con coordenadas verificadas
            </span>
          )}
          {interaction.targets.map((target) => {
            const isTapped = tapped.has(target.id);
            return (
              <button
                key={target.id}
                type="button"
                aria-label={`Toca ${target.label}${isTapped ? ". Tocado." : ""}`}
                onClick={() => handleTap(target)}
                style={hotspotStyle(target)}
                className={cn(
                  "flex min-h-12 min-w-12 items-center justify-center rounded-2xl border-[3px] text-xs font-black transition-all shadow-lg backdrop-blur active:scale-95",
                  isTapped
                    ? "border-emerald-300 bg-emerald-100/90 text-emerald-800 ring-4 ring-emerald-200/50"
                    : "border-amber-300 bg-white/80 text-amber-900 hover:bg-amber-100/80 hover:scale-105 ring-4 ring-white/50",
                )}
              >
                {isTapped ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
          {imageSrc && (
            <div className="rounded-3xl border border-stone-200 bg-[#fffdfa] p-3 shadow-inner">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-stone-500/80">
                <ImageIcon className="h-4 w-4" />
                Pagina fuente
              </div>
              <img
                src={imageSrc}
                alt="Pagina fuente del cuaderno"
                className="mx-auto max-h-80 w-full rounded-2xl object-contain shadow-md ring-1 ring-stone-200"
                loading="lazy"
              />
            </div>
          )}
          <div role="list" aria-label="Objetos para tocar" className="flex flex-col gap-3">
            {interaction.targets.map((target) => {
              const isTapped = tapped.has(target.id);
              return (
                <button
                  key={target.id}
                  type="button"
                  role="listitem"
                  aria-label={`Toca ${target.label}${isTapped ? ". Tocado." : ""}`}
                  onClick={() => handleTap(target)}
                  className={cn(
                    "flex min-h-24 items-center gap-4 w-full text-left rounded-3xl border-[3px] px-5 py-4 sm:px-6 sm:py-5 font-black text-lg sm:text-2xl transition-all shadow-md active:scale-[0.98]",
                    isTapped
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 ring-4 ring-emerald-100"
                      : "border-stone-200 bg-white text-[#3A281E] hover:border-amber-300 hover:bg-amber-50/70 hover:-translate-y-0.5",
                  )}
                  style={isTapped ? undefined : listButtonStyle(accent)}
                >
                  <span
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={circleStyle(isTapped ? "#10b981" : accent)}
                  >
                    {isTapped ? (
                      <CheckCircle2 className="w-7 h-7" aria-hidden />
                    ) : (
                      <Volume2 className="w-7 h-7" aria-hidden />
                    )}
                  </span>
                  <span className={isTapped ? "line-through opacity-60" : ""}>{target.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!verified && interaction.sourceStatus === "needs-art-mapping" && (
        <p className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 shrink-0" />
          Mapeo de objetos en preparacion. La actividad de tocar objetos en la pagina se habilitara
          cuando se verifiquen las coordenadas del libro.
        </p>
      )}

      {complete && (
        <motion.div
          className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 px-4 py-4 flex items-center gap-3 text-base font-black text-emerald-800 shadow-lg shadow-emerald-500/10"
          role="status"
          aria-live="polite"
          initial={completeInitial}
          animate={completePop}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
          Excelente. Tocaste todas las respuestas de esta actividad.
        </motion.div>
      )}
    </motion.div>
  );
}
