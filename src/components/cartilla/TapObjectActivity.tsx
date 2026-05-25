import type { CSSProperties } from "react";
import { useState } from "react";
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
      const next = new Set(prev);
      next.add(target.id);
      if (next.size >= interaction.targets.length && onComplete) {
        onComplete(interaction.id);
      }
      return next;
    });
  };

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-card p-4 sm:p-5 space-y-4 shadow-xl shadow-primary/5">
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-full min-h-[2.5rem] rounded-full shrink-0"
          style={accentBarStyle(accent)}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">{interaction.title}</h3>
          <p className="text-sm font-semibold text-foreground/65 mt-1 leading-snug">{interaction.prompt}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-black text-foreground/55">
            <Sparkles className="h-3.5 w-3.5" />
            Toca cada respuesta. Puedes escucharla otra vez.
          </p>
        </div>
      </div>

      {verified ? (
        <div className="relative w-full aspect-[4/3] rounded-3xl bg-stone-100 border border-foreground/10 overflow-hidden shadow-inner"
          role="region"
          aria-label="Área de la página con objetos para tocar"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Página fuente del cuaderno"
              className="absolute inset-0 h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-foreground/40 font-semibold select-none">
              Vista de página con coordenadas verificadas
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
                  "flex items-center justify-center rounded-2xl border-[3px] text-xs font-black transition-all shadow-lg backdrop-blur",
                  isTapped
                    ? "border-emerald-400 bg-emerald-100/90 text-emerald-800"
                    : "border-primary/70 bg-white/70 text-primary hover:bg-primary/15 hover:scale-105",
                )}
              >
                {isTapped ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
          {imageSrc && (
            <div className="rounded-3xl border border-foreground/10 bg-[hsl(42,48%,97%)] p-3 shadow-inner">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-foreground/45">
                <ImageIcon className="h-4 w-4" />
                Página fuente
              </div>
              <img
                src={imageSrc}
                alt="Página fuente del cuaderno"
                className="mx-auto max-h-80 w-full rounded-2xl object-contain shadow-md ring-1 ring-foreground/10"
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
                    "flex min-h-20 items-center gap-4 w-full text-left rounded-3xl border-[3px] px-5 py-4 sm:px-6 sm:py-5 font-black text-lg sm:text-2xl transition-all shadow-md",
                    isTapped
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-foreground/12 bg-background hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
                  )}
                  style={isTapped ? undefined : listButtonStyle(accent)}
                >
                  <span
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={circleStyle(isTapped ? "#10b981" : accent)}
                  >
                    {isTapped ? (
                      <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
                    ) : (
                      <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
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
        <p className="text-xs font-bold text-foreground/40 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 shrink-0" />
          Mapeo de objetos en preparación. La actividad de tocar objetos en la página se habilitará
          cuando se verifiquen las coordenadas del libro.
        </p>
      )}

      {complete && (
        <div
          className="rounded-3xl border-2 border-emerald-400 bg-emerald-50 px-4 py-4 flex items-center gap-3 text-base font-black text-emerald-800 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          ¡Excelente! Tocaste todas las respuestas de esta actividad.
        </div>
      )}
    </div>
  );
}
