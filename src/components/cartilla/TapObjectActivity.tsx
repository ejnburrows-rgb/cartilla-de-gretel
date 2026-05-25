import type { CSSProperties } from "react";
import { useState } from "react";
import { MapPin, CheckCircle2, Volume2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { hasVerifiedHotspots } from "@/lib/workbook-interactions";
import type { WorkbookInteraction, InteractionTarget } from "@/lib/workbook-interactions";

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
    <div className="rounded-2xl border border-foreground/10 bg-card p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-full min-h-[2rem] rounded-full shrink-0"
          style={accentBarStyle(accent)}
        />
        <div>
          <h3 className="font-bold text-base text-foreground/90">{interaction.title}</h3>
          <p className="text-sm text-foreground/65 mt-0.5">{interaction.prompt}</p>
        </div>
      </div>

      {verified ? (
        <div className="relative w-full aspect-[4/3] rounded-xl bg-stone-100 border border-foreground/10 overflow-hidden"
          role="region"
          aria-label="Área de la página con objetos para tocar"
        >
          <span className="absolute inset-0 flex items-center justify-center text-sm text-foreground/40 font-semibold select-none">
            Vista de página con coordenadas verificadas
          </span>
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
                  "flex items-center justify-center rounded-lg border-2 text-xs font-bold transition-all",
                  isTapped
                    ? "border-emerald-400 bg-emerald-100/80 text-emerald-800"
                    : "border-primary/60 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105",
                )}
              >
                {isTapped ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div role="list" aria-label="Objetos para tocar" className="flex flex-col gap-2">
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
                  "flex items-center gap-3 w-full text-left rounded-xl border-2 px-4 py-3 font-bold text-sm transition-all",
                  isTapped
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/12 bg-background hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
                )}
                style={isTapped ? undefined : listButtonStyle(accent)}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                  style={circleStyle(isTapped ? "#10b981" : accent)}
                >
                  {isTapped ? (
                    <CheckCircle2 className="w-4 h-4" aria-hidden />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden />
                  )}
                </span>
                <span className={isTapped ? "line-through opacity-60" : ""}>{target.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {!verified && interaction.sourceStatus === "needs-art-mapping" && (
        <p className="text-xs font-bold text-foreground/40 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 shrink-0" />
          Mapeo de objetos en preparación. La actividad de tocar objetos en la página se habilitará
          cuando se verifiquen las coordenadas del libro.
        </p>
      )}

      {tapped.size >= interaction.targets.length && interaction.targets.length > 0 && (
        <div
          className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3 flex items-center gap-2 text-sm font-bold text-emerald-800 animate-in fade-in"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          ¡Muy bien! Tocaste todos los objetos.
        </div>
      )}
    </div>
  );
}
