import type { CSSProperties } from "react";
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  CheckCircle2,
  BookOpenCheck,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";

import { PdfPage } from "@/components/cartilla/PdfPage";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { getLesson } from "@/content/lesson-meta";
import { exerciseForPage, type ExerciseSeed } from "@/content/exercise-seed";

const BRAND = {
  cream: "#fff8e8",
  teal: "#14343d",
  gold: "#e9bf67",
  brown: "#9a7231",
} as const;

type Props = {
  onComplete?: () => void;
  lessonNumber: number;
  pageNumbers: number[];
  activePageNumber?: number;
  accent?: string;
};

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

function HdPageArt({ pageNumber }: { pageNumber?: number }) {
  if (!pageNumber || pageNumber < 1 || pageNumber > 95) return null;
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200/60 shadow-md mb-4 bg-white">
      <div className="max-h-64 sm:max-h-80 w-full overflow-hidden">
        <PdfPage pageNumber={pageNumber} className="w-full h-64 sm:h-80 object-contain" />
      </div>
    </div>
  );
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.82, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 22, delay: i * 0.055 },
  }),
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0 },
  tap: { scale: [1, 1.55, 1], opacity: [0.55, 0, 0] },
};

function SyllableTapActivity({
  exercise,
  pageNumber,
  accent,
  onComplete,
}: {
  exercise: ExerciseSeed;
  pageNumber: number;
  accent: string;
  onComplete?: () => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const items = exercise.syllables || [];

  const handleTap = useCallback(
    (label: string) => {
      speak(label);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(label);
        if (next.size >= items.length && onComplete) onComplete();
        return next;
      });
    },
    [items.length, onComplete],
  );

  const allDone = items.length > 0 && tapped.size >= items.length;

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">
            {exercise.instructionEs}
          </h3>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />}
      </div>
      <div className="px-4 py-4">
        <HdPageArt pageNumber={pageNumber} />
        <div className="flex flex-wrap gap-3 justify-center">
          {items.map((label, i) => {
            const done = tapped.has(label);
            return (
              <motion.div key={label} custom={i} variants={chipVariants} initial="hidden" animate="visible" className="relative">
                <motion.div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ backgroundColor: done ? "#34d399" : accent }} variants={pulseVariants} initial="initial" animate={done ? "tap" : "initial"} transition={{ duration: 0.5 }} />
                <button type="button" onClick={() => handleTap(label)} className={cn("relative min-w-[5.5rem] min-h-[5.5rem] sm:min-w-[7rem] sm:min-h-[7rem] rounded-3xl border-[3px] font-black text-3xl sm:text-4xl transition-all flex flex-col items-center justify-center gap-2 shadow-md active:scale-95", done ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-foreground/15 bg-white hover:scale-105 text-foreground")}>
                  {label}
                  <Volume2 className={cn("w-3.5 h-3.5", done ? "text-emerald-400" : "text-foreground/25")} />
                </button>
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800">
              ¡Gran trabajo!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WordMatchActivity({
  exercise,
  pageNumber,
  accent,
  onComplete,
}: {
  exercise: ExerciseSeed;
  pageNumber: number;
  accent: string;
  onComplete?: () => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const items = exercise.pairs || [];
  const allDone = items.length > 0 && tapped.size >= items.length;

  const handleTap = useCallback(
    (label: string) => {
      speak(label);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(label);
        if (next.size >= items.length && onComplete) onComplete();
        return next;
      });
    },
    [items.length, onComplete],
  );

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">{exercise.instructionEs}</h3>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      </div>
      <div className="px-4 py-4">
        <HdPageArt pageNumber={pageNumber} />
        <div className="flex flex-wrap gap-3 justify-center">
          {items.map((item, i) => {
            const done = tapped.has(item.word);
            return (
              <motion.div key={item.word} custom={i} variants={chipVariants} initial="hidden" animate="visible">
                <button type="button" onClick={() => handleTap(item.word)} className={cn("min-w-[6rem] min-h-[3.5rem] px-5 py-3 rounded-2xl border-[3px] font-black text-xl transition-all flex items-center gap-2 shadow active:scale-95", done ? "text-white border-transparent" : "border-foreground/15 bg-white hover:scale-105 text-foreground")} style={done ? { backgroundColor: BRAND.gold, borderColor: BRAND.brown } : {}}>
                  {done && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {item.word}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReadAloudActivity({
  exercise,
  pageNumber,
  accent,
  onComplete,
}: {
  exercise: ExerciseSeed;
  pageNumber: number;
  accent: string;
  onComplete?: () => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const items = exercise.words || [];

  const handleTap = useCallback(
    (label: string) => {
      speak(label);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(label);
        if (next.size >= items.length && onComplete) onComplete();
        return next;
      });
    },
    [items.length, onComplete],
  );

  const allDone = items.length > 0 && tapped.size >= items.length;

  return (
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={borderStyle(accent)}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">{exercise.instructionEs}</h3>
        </div>
        {allDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      </div>
      <div className="px-4 py-4">
        <HdPageArt pageNumber={pageNumber} />
        <div className="flex flex-wrap gap-3 justify-center">
          {items.map((item, i) => {
            const done = tapped.has(item);
            return (
              <motion.div key={item} custom={i} variants={chipVariants} initial="hidden" animate="visible">
                <button type="button" onClick={() => handleTap(item)} className={cn("flex items-center gap-3 rounded-2xl border-[3px] font-bold transition-all active:scale-[0.98] text-left shadow-sm px-6 py-4 sm:px-8 sm:py-5 text-2xl sm:text-3xl font-extrabold", done ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-foreground/12 bg-white hover:bg-foreground/4 text-foreground")}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Volume2 className="w-4 h-4 shrink-0 text-foreground/30" />}
                  <span>{item}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  exercise,
  pageNumber,
  accent,
  onComplete,
}: {
  exercise: ExerciseSeed;
  pageNumber: number;
  accent: string;
  onComplete?: () => void;
}) {
  switch (exercise.kind) {
    case "syllable-tap":
      return <SyllableTapActivity exercise={exercise} pageNumber={pageNumber} accent={accent} onComplete={onComplete} />;
    case "word-match":
      return <WordMatchActivity exercise={exercise} pageNumber={pageNumber} accent={accent} onComplete={onComplete} />;
    case "drag-build":
      return (
        <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 p-5 overflow-hidden">
          <DragBuildWord words={exercise.words || []} accent={accent} onComplete={onComplete} />
        </div>
      );
    case "reading":
      return <ReadAloudActivity exercise={exercise} pageNumber={pageNumber} accent={accent} onComplete={onComplete} />;
    case "intro":
      return (
        <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 p-5">
          <h3 className="text-black text-xl text-center text-foreground/90">{exercise.instructionEs}</h3>
        </div>
      );
    default:
      return null;
  }
}

export function InteractiveWorkbookLayer({
  lessonNumber,
  pageNumbers,
  activePageNumber,
  accent = "hsl(var(--primary))",
  onComplete: onLayerComplete,
}: Props) {
  const [completed, setCompleted] = useState(false);

  const activePage = activePageNumber ?? pageNumbers[0];
  const exercise = exerciseForPage(activePage);

  if (!exercise) return null;

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

      <div className="space-y-3">
        <ActivityCard
          exercise={exercise}
          pageNumber={activePage}
          accent={accent}
          onComplete={() => { setCompleted(true); onLayerComplete?.(); }}
        />
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="rounded-[1.75rem] border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center text-emerald-800 shadow-lg shadow-emerald-500/10"
          >
            <Trophy className="mx-auto mb-1 h-6 w-6" />
            <div className="text-base font-black">¡Gran trabajo!</div>
            <p className="text-sm font-semibold text-emerald-700/80">
              Terminaste las actividades de esta página.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

