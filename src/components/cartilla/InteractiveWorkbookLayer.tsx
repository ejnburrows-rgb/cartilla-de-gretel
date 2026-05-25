import { useMemo, useState } from "react";
import { BookOpen, Volume2, CheckCircle2, Hourglass, BookOpenCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
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

function normalizeFallbackItems(blocks: string[]) {
  const lines = blocks
    .flatMap((block) => block.split(/[,/·]/g))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 10);

  return lines.map((line, index) => ({
    id: `auto-${index}-${line.toLowerCase().replace(/[^a-záéíóúñü0-9]+/gi, "-")}`,
    label: line,
  }));
}

function SyllablePractice({
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

  const allDone = tapped.size >= interaction.items.length;

  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/90 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderLeft: `6px solid ${accent}` }}>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground/90 leading-tight">{interaction.title}</h3>
          <p className="text-sm text-foreground/55 mt-0.5 leading-snug">{interaction.prompt}</p>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />}
      </div>
      <div className="px-4 py-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Sílaba ${item.label}${done ? ". Leída." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "min-w-[4.5rem] min-h-[4.5rem] rounded-2xl border-2 font-extrabold text-2xl transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95",
                  done
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                )}
                style={!done ? { borderColor: accent + "60", color: accent } : undefined}
              >
                {item.label}
                <Volume2 aria-hidden className={cn("w-3.5 h-3.5", done ? "text-emerald-400" : "text-foreground/25")} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WordTap({
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

  const allDone = tapped.size >= interaction.items.length;

  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/90 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderLeft: `6px solid ${accent}` }}>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground/90 leading-tight">{interaction.title}</h3>
          <p className="text-sm text-foreground/55 mt-0.5 leading-snug">{interaction.prompt}</p>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />}
      </div>
      <div className="px-4 py-4">
        <div className="flex flex-wrap gap-2.5">
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Palabra ${item.label}${done ? ". Escuchada." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-lg transition-all active:scale-95",
                  done
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                )}
                style={!done ? { borderColor: accent + "60", color: accent } : undefined}
              >
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden /> : <Volume2 className="w-4 h-4 text-foreground/35 shrink-0" aria-hidden />}
                {item.label}
              </button>
            );
          })}
        </div>
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

  const isSentences = interaction.items.some((i) => i.label.length > 10);
  const allDone = tapped.size >= interaction.items.length;

  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/90 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderLeft: `6px solid ${accent}` }}>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground/90 leading-tight">{interaction.title}</h3>
          <p className="text-sm text-foreground/55 mt-0.5 leading-snug">{interaction.prompt}</p>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />}
      </div>
      <div className="px-4 py-4">
        <div className={cn("flex gap-2.5", isSentences ? "flex-col" : "flex-wrap")}>
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Escuchar: ${item.label}${done ? ". Escuchado." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border-2 font-semibold transition-all active:scale-[0.98] text-left",
                  isSentences ? "px-4 py-3 text-base leading-snug" : "px-4 py-2.5 text-xl font-extrabold",
                  done
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-foreground/12 bg-white hover:bg-foreground/4 text-foreground",
                )}
                style={!done ? { color: accent } : undefined}
              >
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden /> : <Volume2 className="w-4 h-4 shrink-0 text-foreground/30" aria-hidden />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStoryCard({ interaction }: { interaction: WorkbookInteraction; accent: string }) {
  const hasText = interaction.items.length > 0;

  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 shadow-sm overflow-hidden" role="complementary" aria-label="Mini-cuento del cuaderno">
      <div className="px-4 py-3 flex items-center gap-3 bg-amber-100/60 border-b border-amber-200/50">
        <BookOpen className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-amber-900 leading-tight">{interaction.title}</h3>
          <p className="text-sm text-amber-700/80 mt-0.5 leading-snug">{interaction.prompt}</p>
        </div>
      </div>
      <div className="px-4 py-4">
        {hasText ? (
          <div className="space-y-2">
            {interaction.items.map((item) => (
              <p key={item.id} className="text-base leading-relaxed text-amber-950 font-medium">
                {item.label}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm text-amber-800/80">
            <Hourglass className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" aria-hidden />
            <span className="leading-snug font-medium">{interaction.studentFacingStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AutoScanActivity({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; label: string }>;
  accent: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 bg-white/70" style={{ borderLeft: `6px solid ${accent}` }}>
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <div>
          <h3 className="font-black text-indigo-950">{title}</h3>
          <p className="text-sm font-semibold text-indigo-800/70">Actividad generada desde texto verificado o escaneo conectado.</p>
        </div>
      </div>
      <div className="px-4 py-4 flex flex-wrap gap-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => speak(item.label)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-4 py-2.5 text-base font-black text-indigo-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300"
          >
            <Volume2 className="h-4 w-4 text-indigo-500" /> {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
      return <DragWordReveal interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "tap-object":
      return <TapObjectActivity interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "drag-syllable-to-slot":
      return <SyllablePractice interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "listen-and-tap":
      return <WordTap interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "read-aloud":
      return <ReadAloud interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "mini-story":
      return <MiniStoryCard interaction={interaction} accent={accent} />;
    default:
      return null;
  }
}

export function InteractiveWorkbookLayer({
  lessonNumber,
  pageNumbers,
  activePageNumber,
  accent = "hsl(var(--primary))",
}: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const activePage = activePageNumber ?? pageNumbers[0];
  const { interactions } = getPageInteractionSet(lessonNumber, activePage);
  const workbookPage = useMemo(
    () => getWorkbookPagesForLesson(lessonNumber).find((page) => page.pageNumber === activePage),
    [lessonNumber, activePage],
  );

  const ready = interactions.filter(
    (i) => i.sourceStatus === "verified" || i.sourceStatus === "book-derived",
  );
  const storyPlaceholders = interactions.filter(
    (i) => i.kind === "mini-story" && i.sourceStatus === "needs-transcription",
  );
  const visibleInteractions = [...ready, ...storyPlaceholders];
  const autoItems = visibleInteractions.length === 0 ? normalizeFallbackItems(workbookPage?.verifiedTextBlocks ?? []) : [];

  const allInteractionsForLesson = pageNumbers.flatMap((pn) => getInteractionsForPage(lessonNumber, pn));
  const hasAnyScanText = Boolean(workbookPage?.verifiedTextBlocks.length);

  if (allInteractionsForLesson.length === 0 && !hasAnyScanText) return null;

  const handleComplete = (id: string) => setCompletedIds((prev) => new Set([...prev, id]));
  const completedCount = visibleInteractions.filter((i) => completedIds.has(i.id)).length;
  const totalVisible = visibleInteractions.length;

  return (
    <section className="mt-6 space-y-3" aria-label="Actividades interactivas del cuaderno">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent}50, transparent)` }} />
        <div className="flex items-center gap-2 px-1">
          <BookOpenCheck className="w-4 h-4" style= color: accent  aria-hidden />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-foreground/50">Actividades del cuaderno</h2>
        </div>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${accent}50, transparent)` }} />
      </div>

      {visibleInteractions.length === 0 ? (
        <AutoScanActivity title={`Página ${activePage}: leer y escuchar`} items={autoItems} accent={accent} />
      ) : (
        <div className="space-y-3">
          {visibleInteractions.map((interaction) => (
            <ActivityCard key={interaction.id} interaction={interaction} accent={accent} onComplete={handleComplete} />
          ))}
          {totalVisible > 1 && completedCount > 0 && (
            <div className="flex items-center gap-2 justify-end pt-1">
              <div className="h-1.5 flex-1 max-w-24 bg-foreground/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(completedCount / totalVisible) * 100}%`, backgroundColor: accent }} />
              </div>
              <span className="text-[10px] font-bold text-foreground/35 tabular-nums">{completedCount}/{totalVisible}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
