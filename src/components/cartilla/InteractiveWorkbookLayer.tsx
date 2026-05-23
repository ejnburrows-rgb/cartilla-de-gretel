import { useState } from "react";
import { BookOpen, Volume2, CheckCircle2, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import {
  getInteractionsForPage,
  getPageInteractionSet,
} from "@/lib/workbook-interactions";
import { DragWordReveal } from "@/components/cartilla/DragWordReveal";
import { TapObjectActivity } from "@/components/cartilla/TapObjectActivity";
import type { WorkbookInteraction } from "@/lib/workbook-interactions";

type Props = {
  lessonNumber: number;
  pageNumbers: number[];
  activePageNumber?: number;
  accent?: string;
};

// ---------------------------------------------------------------------------
// Shared mini components
// ---------------------------------------------------------------------------

function ListenAndTap({
  interaction,
  accent,
  onComplete,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  const handleTap = (id: string, label: string) => {
    speak(label);
    setTapped((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-2 min-h-[2rem] rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <div>
          <h3 className="font-bold text-base text-foreground/90">{interaction.title}</h3>
          <p className="text-sm text-foreground/60 mt-0.5">{interaction.prompt}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {interaction.items.map((item) => {
          const done = tapped.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Escuchar y tocar: ${item.label}${done ? ". Tocado." : ""}`}
              onClick={() => handleTap(item.id, item.label)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-base border-2 transition-all",
                done
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : "border-foreground/15 bg-background hover:scale-105 active:scale-95",
              )}
              style={{ borderColor: done ? undefined : accent + "40" }}
            >
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-foreground/40" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReadAloud({
  interaction,
  accent,
  onComplete,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  const handleTap = (id: string, label: string) => {
    speak(label);
    setTapped((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-2 min-h-[2rem] rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <div>
          <h3 className="font-bold text-base text-foreground/90">{interaction.title}</h3>
          <p className="text-sm text-foreground/60 mt-0.5">{interaction.prompt}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {interaction.items.map((item) => {
          const done = tapped.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Escuchar ${item.label}${done ? ". Escuchado." : ""}`}
              onClick={() => handleTap(item.id, item.label)}
              className={cn(
                "px-5 py-3 rounded-2xl font-extrabold text-xl border-2 transition-all",
                done
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-foreground/12 bg-background text-foreground hover:scale-105 active:scale-95",
              )}
              style={{ color: done ? undefined : accent }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStoryMarker({
  interaction,
  accent,
}: {
  interaction: WorkbookInteraction;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border-l-4 bg-amber-50 border border-amber-200 p-4 space-y-2"
      style={{ borderLeftColor: accent }}
      role="complementary"
      aria-label="Marcador de mini-cuento"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
        <h3 className="font-bold text-base text-amber-900">{interaction.title}</h3>
      </div>
      <p className="text-sm text-amber-800 leading-relaxed">{interaction.prompt}</p>
      {interaction.sourceStatus === "needs-transcription" && (
        <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
          <Hourglass className="w-3 h-3" />
          {interaction.studentFacingStatus}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slot drag-syllable fallback
// ---------------------------------------------------------------------------

function SyllableSlots({
  interaction,
  accent,
  onComplete,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
}) {
  const [filled, setFilled] = useState<Set<string>>(new Set());

  const handleTap = (id: string, label: string) => {
    speak(label);
    setFilled((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-2 min-h-[2rem] rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <div>
          <h3 className="font-bold text-base text-foreground/90">{interaction.title}</h3>
          <p className="text-sm text-foreground/60 mt-0.5">{interaction.prompt}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {interaction.items.map((item) => {
          const done = filled.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Sílaba ${item.label}${done ? ". Escuchada." : ""}`}
              onClick={() => handleTap(item.id, item.label)}
              className={cn(
                "px-4 py-2 rounded-xl border-2 font-bold text-lg transition-all",
                done
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-foreground/15 bg-background hover:scale-105 active:scale-95 text-foreground",
              )}
              style={{ borderColor: done ? undefined : accent }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity router
// ---------------------------------------------------------------------------

function ActivityCard({
  interaction,
  accent,
  onComplete,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
}) {
  switch (interaction.kind) {
    case "drag-word-to-image":
      return (
        <DragWordReveal interaction={interaction} accent={accent} onComplete={onComplete} />
      );
    case "tap-object":
      return (
        <TapObjectActivity interaction={interaction} accent={accent} onComplete={onComplete} />
      );
    case "drag-syllable-to-slot":
      return (
        <SyllableSlots interaction={interaction} accent={accent} onComplete={onComplete} />
      );
    case "listen-and-tap":
      return (
        <ListenAndTap interaction={interaction} accent={accent} onComplete={onComplete} />
      );
    case "read-aloud":
      return (
        <ReadAloud interaction={interaction} accent={accent} onComplete={onComplete} />
      );
    case "mini-story":
      return <MiniStoryMarker interaction={interaction} accent={accent} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InteractiveWorkbookLayer({
  lessonNumber,
  pageNumbers,
  activePageNumber,
  accent = "hsl(var(--primary))",
}: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const activePage =
    activePageNumber ?? pageNumbers[0];

  const { interactions, pendingArtCount, pendingTranscriptionCount } = getPageInteractionSet(
    lessonNumber,
    activePage,
  );

  const ready = interactions.filter(
    (i) => i.sourceStatus === "verified" || i.sourceStatus === "book-derived",
  );

  const pendingArt = interactions.filter((i) => i.sourceStatus === "needs-art-mapping");
  const pendingTranscription = interactions.filter(
    (i) => i.sourceStatus === "needs-transcription",
  );

  // Verify activePage is even covered
  const allInteractionsForLesson = pageNumbers.flatMap((pn) =>
    getInteractionsForPage(lessonNumber, pn),
  );

  if (allInteractionsForLesson.length === 0) return null;

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]));
  };

  return (
    <section
      className="mt-6 space-y-4"
      aria-label="Actividades interactivas del cuaderno"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }}
        />
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground/55 px-2">
          Actividades interactivas del cuaderno
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(to left, ${accent}40, transparent)` }}
        />
      </div>

      {interactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/15 bg-secondary/20 px-5 py-6 text-center text-sm text-foreground/50 font-semibold">
          Actividades de esta página en preparación.
        </div>
      ) : (
        <>
          {/* Ready interactions */}
          {ready.length > 0 && (
            <div className="space-y-3">
              {ready.map((interaction) => (
                <ActivityCard
                  key={interaction.id}
                  interaction={interaction}
                  accent={accent}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}

          {/* Pending art mapping */}
          {pendingArt.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wide">
                Imágenes pendientes de mapeo
              </p>
              {pendingArt.map((interaction) => (
                <ActivityCard
                  key={interaction.id}
                  interaction={interaction}
                  accent={accent}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}

          {/* Pending transcription */}
          {pendingTranscription.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wide">
                Contenido pendiente de transcripción
              </p>
              {pendingTranscription.map((interaction) => (
                <ActivityCard
                  key={interaction.id}
                  interaction={interaction}
                  accent={accent}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}

          {/* Summary counters for teacher context */}
          {(pendingArtCount > 0 || pendingTranscriptionCount > 0) && (
            <p className="text-[10px] font-bold text-foreground/30 text-right">
              {pendingArtCount > 0 && `${pendingArtCount} pendiente${pendingArtCount !== 1 ? "s" : ""} de mapeo de arte`}
              {pendingArtCount > 0 && pendingTranscriptionCount > 0 && " · "}
              {pendingTranscriptionCount > 0 &&
                `${pendingTranscriptionCount} pendiente${pendingTranscriptionCount !== 1 ? "s" : ""} de transcripción`}
            </p>
          )}
        </>
      )}
    </section>
  );
}
