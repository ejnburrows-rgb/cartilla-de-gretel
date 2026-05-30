import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Hourglass,
  BookOpenCheck,
  Sparkles,
  Image as ImageIcon,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/assets";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getInteractionsForPage, getPageInteractionSet } from "@/lib/workbook-interactions";
import type { WorkbookInteraction } from "@/lib/workbook-interactions";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { CATALOG } from "@/lib/lesson-catalog";
import { speak } from "@/lib/speak";
import { gretelSpeak } from "@/lib/gretel-speak";

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

function borderStyle(accent: string): CSSProperties {
  return { borderLeft: `6px solid ${accent}` };
}

function gradientRight(accent: string): CSSProperties {
  return { background: `linear-gradient(to right, ${accent}50, transparent)` };
}

function gradientLeft(accent: string): CSSProperties {
  return { background: `linear-gradient(to left, ${accent}50, transparent)` };
}

function progressStyle(width: number, accent: string): CSSProperties {
  return { width: `${width}%`, backgroundColor: accent };
}

// Speak Gretel's celebration aloud shortly after the activity finishes, so the
// final tapped label isn't cut off by the celebration utterance.
function useGretelCelebration(
  done: boolean,
  outcome: "correct" | "lesson-complete",
  extras: { lessonN?: number; pageNumber?: number },
  delayMs = 550,
) {
  const fired = useRef(false);
  const lessonN = extras.lessonN;
  const pageNumber = extras.pageNumber;
  useEffect(() => {
    if (!done || fired.current) return;
    fired.current = true;
    const detail = gretelSpeak(outcome, { lessonN, pageNumber });
    const t = setTimeout(() => speak(detail.phrase), delayMs);
    return () => clearTimeout(t);
  }, [done, outcome, lessonN, pageNumber, delayMs]);
}

function SourceImageCard({ assetRef }: { assetRef?: string }) {
  if (!assetRef) return null;

  return (
    <div className="rounded-3xl border border-foreground/10 bg-[hsl(42,48%,97%)] p-3 shadow-inner">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-foreground/45">
        <ImageIcon className="h-4 w-4" />
        Página fuente
      </div>
      <img
        src={assetPath(assetRef)}
        alt="Página fuente del cuaderno"
        className="mx-auto max-h-72 w-full rounded-2xl object-contain shadow-md ring-1 ring-foreground/10"
        loading="lazy"
      />
    </div>
  );
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
  useGretelCelebration(allDone, "correct", { lessonN: interaction.lessonNumber });

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">
            {interaction.title}
          </h3>
          <p className="text-sm font-semibold text-foreground/55 mt-1 leading-snug">
            {interaction.prompt}
          </p>
        </div>
        {allDone && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />
        )}
      </div>
      <div className="px-4 py-4">
        <SourceImageCard assetRef={interaction.assetRef} />
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Sílaba ${item.label}${done ? ". Leída." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "min-w-[5.5rem] min-h-[5.5rem] sm:min-w-[7rem] sm:min-h-[7rem] rounded-3xl border-[3px] font-black text-3xl sm:text-4xl transition-all flex flex-col items-center justify-center gap-2 shadow-md active:scale-95",
                  done
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                )}
              >
                {item.label}
                <Volume2
                  aria-hidden
                  className={cn("w-3.5 h-3.5", done ? "text-emerald-400" : "text-foreground/25")}
                />
              </button>
            );
          })}
        </div>
        {allDone && (
          <div className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800">
            ¡Gran trabajo! Leíste todas las sílabas.
          </div>
        )}
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
  useGretelCelebration(allDone, "correct", { lessonN: interaction.lessonNumber });

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">
            {interaction.title}
          </h3>
          <p className="text-sm font-semibold text-foreground/55 mt-1 leading-snug">
            {interaction.prompt}
          </p>
        </div>
        {allDone && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />
        )}
      </div>
      <div className="px-4 py-4">
        <SourceImageCard assetRef={interaction.assetRef} />
        <div className="mt-4 flex flex-wrap gap-3">
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            const itemImageSrc = item.assetRef ? assetPath(item.assetRef) : undefined;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Palabra ${item.label}${done ? ". Escuchada." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "inline-flex items-center gap-3 px-6 py-4 sm:px-8 sm:py-5 rounded-2xl border-[3px] font-extrabold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm",
                  done
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
                ) : (
                  <Volume2 className="w-4 h-4 text-foreground/35 shrink-0" aria-hidden />
                )}
                {itemImageSrc && (
                  <img
                    src={itemImageSrc}
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-foreground/10"
                    loading="lazy"
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
        {allDone && (
          <div className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800">
            ¡Muy bien! Escuchaste todas las palabras.
          </div>
        )}
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
  useGretelCelebration(allDone, "correct", { lessonN: interaction.lessonNumber });

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">
            {interaction.title}
          </h3>
          <p className="text-sm font-semibold text-foreground/55 mt-1 leading-snug">
            {interaction.prompt}
          </p>
        </div>
        {allDone && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />
        )}
      </div>
      <div className="px-4 py-4">
        <SourceImageCard assetRef={interaction.assetRef} />
        <div className={cn("mt-4 flex gap-3", isSentences ? "flex-col" : "flex-wrap")}>
          {interaction.items.map((item) => {
            const done = tapped.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Escuchar: ${item.label}${done ? ". Escuchado." : ""}`}
                onClick={() => handleTap(item.id, item.label)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-[3px] font-bold transition-all active:scale-[0.98] text-left shadow-sm",
                  isSentences
                    ? "px-5 py-4 sm:px-6 sm:py-5 text-lg sm:text-xl leading-snug"
                    : "px-6 py-4 sm:px-8 sm:py-5 text-2xl sm:text-3xl font-extrabold",
                  done
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-foreground/12 bg-white hover:bg-foreground/4 text-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
                ) : (
                  <Volume2 className="w-4 h-4 shrink-0 text-foreground/30" aria-hidden />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {allDone && (
          <div className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800">
            ¡Excelente lectura! Ya escuchaste todo.
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStoryCard({ interaction }: { interaction: WorkbookInteraction; accent: string }) {
  const hasText = interaction.items.length > 0;

  return (
    <div
      className="rounded-[1.75rem] border-2 border-amber-200/70 bg-amber-50/80 shadow-xl shadow-amber-500/5 overflow-hidden"
      role="complementary"
      aria-label="Mini-cuento del cuaderno"
    >
      <div className="px-4 py-3 flex items-center gap-3 bg-amber-100/60 border-b border-amber-200/50">
        <BookOpen className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-amber-900 leading-tight">{interaction.title}</h3>
          <p className="text-sm text-amber-700/80 mt-0.5 leading-snug">{interaction.prompt}</p>
        </div>
      </div>
      <div className="px-4 py-4">
        <SourceImageCard assetRef={interaction.assetRef} />
        {hasText ? (
          <div className="mt-4 space-y-2">
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
    <div className="rounded-[1.75rem] border-2 border-indigo-200 bg-indigo-50/80 shadow-xl shadow-indigo-500/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 bg-white/70" style={borderStyle(accent)}>
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <div>
          <h3 className="font-black text-indigo-950">{title}</h3>
          <p className="text-sm font-semibold text-indigo-800/70">
            Actividad generada desde texto verificado o escaneo conectado.
          </p>
        </div>
      </div>
      <div className="px-4 py-4 flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => speak(item.label)}
            aria-label={`Escuchar ${item.label}`}
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-5 py-3 text-lg font-black text-indigo-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 active:scale-95"
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
    case "drag-syllable-to-slot":
      return <SyllablePractice interaction={interaction} accent={accent} onComplete={onComplete} />;
    case "drag-build-word":
      const entry = CATALOG.find((e) => e.n === interaction.lessonNumber);
      if (!entry) return null;
      return (
        <DragBuildWord
          entry={entry}
          accent={accent}
          lessonId={`lesson-${interaction.lessonNumber}`}
          onComplete={() => onComplete?.(interaction.id)}
        />
      );
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
  const autoItems =
    visibleInteractions.length === 0
      ? normalizeFallbackItems(workbookPage?.verifiedTextBlocks ?? [])
      : [];

  const allInteractionsForLesson = pageNumbers.flatMap((pn) =>
    getInteractionsForPage(lessonNumber, pn),
  );
  const hasAnyScanText = Boolean(workbookPage?.verifiedTextBlocks.length);

  const completedCount = visibleInteractions.filter((i) => completedIds.has(i.id)).length;
  const totalVisible = visibleInteractions.length;
  const allActivitiesDone = totalVisible > 1 && completedCount === totalVisible;
  useGretelCelebration(allActivitiesDone, "lesson-complete", {
    lessonN: lessonNumber,
    pageNumber: activePage,
  }, 400);

  if (allInteractionsForLesson.length === 0 && !hasAnyScanText) return null;

  const handleComplete = (id: string) => setCompletedIds((prev) => new Set([...prev, id]));

  return (
    <section className="mt-6 space-y-4" aria-label="Actividades interactivas del cuaderno">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={gradientRight(accent)} />
        <div className="flex items-center gap-2 px-1">
          <BookOpenCheck className="w-4 h-4 text-primary" aria-hidden />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-foreground/50">
            Actividades del cuaderno
          </h2>
        </div>
        <div className="h-px flex-1" style={gradientLeft(accent)} />
      </div>

      {visibleInteractions.length === 0 ? (
        <AutoScanActivity
          title={`Página ${activePage}: leer y escuchar`}
          items={autoItems}
          accent={accent}
        />
      ) : (
        <div className="space-y-3">
          {visibleInteractions.map((interaction) => (
            <ActivityCard
              key={interaction.id}
              interaction={interaction}
              accent={accent}
              onComplete={handleComplete}
            />
          ))}
          {totalVisible > 1 && completedCount > 0 && (
            <div className="flex items-center gap-3 justify-end rounded-full bg-white/70 px-3 py-2 shadow-sm">
              <div className="h-1.5 flex-1 max-w-24 bg-foreground/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={progressStyle((completedCount / totalVisible) * 100, accent)}
                />
              </div>
              <span className="text-[10px] font-bold text-foreground/35 tabular-nums">
                {completedCount}/{totalVisible}
              </span>
            </div>
          )}
          {totalVisible > 1 && completedCount === totalVisible && (
            <div className="rounded-[1.75rem] border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center text-emerald-800 shadow-lg shadow-emerald-500/10">
              <Trophy className="mx-auto mb-1 h-6 w-6" />
              <div className="text-base font-black">¡Gran trabajo!</div>
              <p className="text-sm font-semibold text-emerald-700/80">
                Terminaste las actividades de esta página.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
