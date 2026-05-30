import type { CSSProperties } from "react";
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  CheckCircle2,
  Hourglass,
  BookOpen,
  BookOpenCheck,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getInteractionsForPage, getPageInteractionSet } from "@/lib/workbook-interactions";
import type { WorkbookInteraction } from "@/lib/workbook-interactions";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { GretelMascot, type GretelState } from "@/components/cartilla/GretelMascot";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { CATALOG } from "@/lib/lesson-catalog";


// ---------------------------------------------------------------------------
// Brand palette (UI controls only — never alter book art)
// ---------------------------------------------------------------------------
const BRAND = {
  cream: "#fff8e8",
  teal: "#14343d",
  gold: "#e9bf67",
  brown: "#9a7231",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// HD art panel: uses PdfPage (HD .jpg, raw fallback) — never the raw/ folder
// ---------------------------------------------------------------------------
function HdPageArt({ pageNumber }: { pageNumber?: number }) {
  if (!pageNumber || pageNumber < 1 || pageNumber > 92) return null;
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200/60 shadow-md mb-4 bg-white">
      <div className="max-h-64 sm:max-h-80 w-full overflow-hidden">
        <PdfPage pageNumber={pageNumber} className="w-full h-64 sm:h-80 object-contain" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip entrance animation
// ---------------------------------------------------------------------------
const chipVariants = {
  hidden: { opacity: 0, scale: 0.82, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 22, delay: i * 0.055 },
  }),
};

// Pulse ring on tap
const pulseVariants = {
  initial: { scale: 1, opacity: 0 },
  tap: { scale: [1, 1.55, 1], opacity: [0.55, 0, 0] },
};

// ---------------------------------------------------------------------------
// SyllablePractice — listen-and-tap / read-aloud / drag-syllable-to-slot
// Used for single-tap-to-mark kinds.
// ---------------------------------------------------------------------------
function SyllablePractice({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  const handleTap = useCallback(
    (id: string, label: string) => {
      speak(label);
      onGretelState("cheering");
      setTimeout(() => onGretelState("idle"), 1400);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
        return next;
      });
    },
    [interaction.items.length, interaction.id, onComplete, onGretelState],
  );

  const allDone = tapped.size >= interaction.items.length;

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
        <HdPageArt pageNumber={interaction.pageNumber} />
        <div className="flex flex-wrap gap-3 justify-center">
          {interaction.items.map((item, i) => {
            const done = tapped.has(item.id);
            return (
              <motion.div
                key={item.id}
                custom={i}
                variants={chipVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ backgroundColor: done ? "#34d399" : accent }}
                  variants={pulseVariants}
                  initial="initial"
                  animate={done ? "tap" : "initial"}
                  transition={{ duration: 0.5 }}
                />
                <button
                  type="button"
                  aria-label={`${item.label}${done ? ". Completado." : ""}`}
                  onClick={() => handleTap(item.id, item.label)}
                  className={cn(
                    "relative min-w-[5.5rem] min-h-[5.5rem] sm:min-w-[7rem] sm:min-h-[7rem] rounded-3xl border-[3px] font-black text-3xl sm:text-4xl transition-all flex flex-col items-center justify-center gap-2 shadow-md active:scale-95",
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
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
            >
              ¡Gran trabajo! Leíste todas las sílabas.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WordTap — listen-and-tap (words / sight words)
// ---------------------------------------------------------------------------
function WordTap({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  const handleTap = useCallback(
    (id: string, label: string) => {
      speak(label);
      onGretelState("cheering");
      setTimeout(() => onGretelState("idle"), 1400);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
        return next;
      });
    },
    [interaction.items.length, interaction.id, onComplete, onGretelState],
  );

  const allDone = tapped.size >= interaction.items.length;

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
        <HdPageArt pageNumber={interaction.pageNumber} />
        <div className="flex flex-wrap gap-3">
          {interaction.items.map((item, i) => {
            const done = tapped.has(item.id);
            return (
              <motion.div
                key={item.id}
                custom={i}
                variants={chipVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <button
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
                  {item.label}
                </button>
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
            >
              ¡Muy bien! Escuchaste todas las palabras.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReadAloud — read-aloud (syllables / sentences)
// ---------------------------------------------------------------------------
function ReadAloud({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());

  const handleTap = useCallback(
    (id: string, label: string) => {
      speak(label);
      onGretelState("cheering");
      setTimeout(() => onGretelState("idle"), 1400);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
        return next;
      });
    },
    [interaction.items.length, interaction.id, onComplete, onGretelState],
  );

  const isSentences = interaction.items.some((i) => i.label.length > 10);
  const allDone = tapped.size >= interaction.items.length;

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
        <HdPageArt pageNumber={interaction.pageNumber} />
        <div className={cn("flex gap-3", isSentences ? "flex-col" : "flex-wrap")}>
          {interaction.items.map((item, i) => {
            const done = tapped.has(item.id);
            return (
              <motion.div
                key={item.id}
                custom={i}
                variants={chipVariants}
                initial="hidden"
                animate="visible"
              >
                <button
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
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
            >
              ¡Excelente lectura! Ya escuchaste todo.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SyllableSlot — drag-syllable-to-slot (tap-to-select + tap-to-place on mobile)
// ---------------------------------------------------------------------------
function SyllableSlot({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  // Map: targetId → placed itemId
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);

  const allPlaced = interaction.targets.length > 0 &&
    Object.keys(placed).length >= interaction.targets.length;

  const handleItemTap = useCallback(
    (itemId: string, label: string) => {
      // If already placed, re-speak
      const alreadyPlaced = Object.values(placed).includes(itemId);
      if (alreadyPlaced) { speak(label); return; }
      speak(label);
      setSelected((prev) => (prev === itemId ? null : itemId));
    },
    [placed],
  );

  const handleSlotTap = useCallback(
    (targetId: string, targetLabel: string) => {
      if (placed[targetId]) {
        // Slot already filled — speak it
        speak(targetLabel);
        return;
      }
      if (!selected) return;

      // Find the target to see what item it accepts
      const target = interaction.targets.find((t) => t.id === targetId);
      const correctItemId = target?.acceptsItemId;

      if (correctItemId && correctItemId === selected) {
        // Correct placement
        speak(targetLabel);
        onGretelState("cheering");
        setTimeout(() => onGretelState("idle"), 1400);
        setPlaced((prev) => {
          const next = { ...prev, [targetId]: selected };
          if (
            Object.keys(next).length >= interaction.targets.length &&
            onComplete
          ) {
            onComplete(interaction.id);
          }
          return next;
        });
        setSelected(null);
      } else {
        // Wrong
        onGretelState("pointing");
        setTimeout(() => onGretelState("idle"), 1200);
        setWrongSlot(targetId);
        setTimeout(() => setWrongSlot(null), 600);
      }
    },
    [selected, placed, interaction.targets, interaction.id, onComplete, onGretelState],
  );

  // If no targets defined (some items only have items), fall back to simple tap mode
  if (!interaction.targets.length) {
    return (
      <SyllablePractice
        interaction={interaction}
        accent={accent}
        onComplete={onComplete}
        onGretelState={onGretelState}
      />
    );
  }

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
        {allPlaced && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completado" />
        )}
      </div>
      <div className="px-4 py-4 space-y-4">
        <HdPageArt pageNumber={interaction.pageNumber} />

        {/* Item chips — tap to select */}
        <div>
          <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: BRAND.brown }}>
            Toca para seleccionar
          </p>
          <div className="flex flex-wrap gap-3">
            {interaction.items.map((item, i) => {
              const isPlaced = Object.values(placed).includes(item.id);
              const isSelected = selected === item.id;
              return (
                <motion.div
                  key={item.id}
                  custom={i}
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    type="button"
                    aria-label={`Sílaba ${item.label}${isPlaced ? ". Colocada." : isSelected ? ". Seleccionada." : ""}`}
                    onClick={() => handleItemTap(item.id, item.label)}
                    disabled={isPlaced}
                    className={cn(
                      "min-w-[4.5rem] min-h-[4.5rem] rounded-2xl border-[3px] font-black text-2xl transition-all flex items-center justify-center shadow active:scale-95",
                      isPlaced
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60"
                        : isSelected
                        ? "border-4 scale-105 shadow-lg text-white"
                        : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                    )}
                    style={isSelected ? { borderColor: BRAND.gold, backgroundColor: BRAND.gold } : {}}
                  >
                    {item.label}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Target slots — tap to place */}
        <div>
          <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: BRAND.teal }}>
            Toca la casilla para colocar
          </p>
          <div className="flex flex-wrap gap-3">
            {interaction.targets.map((target, i) => {
              const placedItemId = placed[target.id];
              const placedItem = interaction.items.find((it) => it.id === placedItemId);
              const isWrong = wrongSlot === target.id;
              return (
                <motion.div
                  key={target.id}
                  custom={i}
                  variants={chipVariants}
                  initial="hidden"
                  animate={isWrong ? { x: [-6, 6, -4, 4, 0] } : "visible"}
                  transition={isWrong ? { duration: 0.35 } : undefined}
                >
                  <button
                    type="button"
                    aria-label={`Casilla ${target.label}${placedItem ? ". Contiene: " + placedItem.label : ". Vacía."}`}
                    onClick={() => handleSlotTap(target.id, target.label)}
                    className={cn(
                      "min-w-[4.5rem] min-h-[4.5rem] rounded-2xl border-[3px] font-black text-2xl transition-all flex items-center justify-center shadow active:scale-95",
                      placedItem
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-dashed hover:bg-foreground/4 text-foreground/40",
                    )}
                    style={!placedItem && !isWrong ? { borderColor: BRAND.teal } : {}}
                  >
                    {placedItem ? placedItem.label : (
                      <span className="text-xs font-bold opacity-50">{target.label}</span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {allPlaced && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
            >
              ¡Excelente! Colocaste todas las sílabas correctamente.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MiniStory — sequential line-by-line reveal + TTS
// ---------------------------------------------------------------------------
function MiniStoryCard({
  interaction,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onGretelState: (s: GretelState) => void;
}) {
  const hasText = interaction.items.length > 0;
  const [revealedLines, setRevealedLines] = useState(hasText ? 1 : 0);
  const allRevealed = !hasText || revealedLines >= interaction.items.length;

  const handleNext = useCallback(() => {
    const nextIdx = revealedLines; // 0-based: next line to reveal
    const item = interaction.items[nextIdx];
    if (item) {
      speak(item.label);
      onGretelState("cheering");
      setTimeout(() => onGretelState("idle"), 1400);
    }
    setRevealedLines((prev) => Math.min(prev + 1, interaction.items.length));
    if (revealedLines + 1 >= interaction.items.length) {
      // All revealed — speak last then celebrate
      setTimeout(() => onGretelState("cheering"), 600);
    }
  }, [revealedLines, interaction.items, onGretelState]);

  // Speak the first line on mount
  const firstLabel = interaction.items[0]?.label;
  useMemo(() => {
    if (firstLabel) setTimeout(() => speak(firstLabel), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction.id]);

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
        <HdPageArt pageNumber={interaction.pageNumber} />
        {hasText ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {interaction.items.slice(0, revealedLines).map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -12, y: 6 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  onClick={() => speak(item.label)}
                  className="flex items-start gap-2 text-left w-full group"
                  aria-label={`Leer: ${item.label}`}
                >
                  <Volume2 className="w-4 h-4 mt-1 shrink-0 text-amber-500 opacity-0 group-hover:opacity-100 transition" aria-hidden />
                  <p className="text-base leading-relaxed text-amber-950 font-semibold">{item.label}</p>
                </motion.button>
              ))}
            </AnimatePresence>
            {!allRevealed && (
              <motion.button
                type="button"
                onClick={handleNext}
                whileTap={{ scale: 0.95 }}
                className="mt-2 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-black text-sm text-white shadow-md transition hover:-translate-y-0.5"
                style={{ backgroundColor: BRAND.teal }}
                aria-label="Ver siguiente línea"
              >
                Siguiente <ChevronRight className="w-4 h-4" aria-hidden />
              </motion.button>
            )}
            {allRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 rounded-2xl border-2 border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm font-black text-amber-900"
              >
                ¡Terminaste el cuento! ¡Muy bien!
              </motion.div>
            )}
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

// ---------------------------------------------------------------------------
// TapObject / WordReveal — tap-object and drag-word-to-image
// Both rendered as "tap to reveal + speak" on mobile
// ---------------------------------------------------------------------------
function TapObject({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const allDone = tapped.size >= interaction.items.length && interaction.items.length > 0;

  const handleTap = useCallback(
    (id: string, label: string) => {
      speak(label);
      onGretelState("cheering");
      setTimeout(() => onGretelState("idle"), 1400);
      setTapped((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (next.size >= interaction.items.length && onComplete) onComplete(interaction.id);
        return next;
      });
    },
    [interaction.items.length, interaction.id, onComplete, onGretelState],
  );

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
        <HdPageArt pageNumber={interaction.pageNumber} />
        <div className="flex flex-wrap gap-3 justify-center">
          {interaction.items.map((item, i) => {
            const done = tapped.has(item.id);
            return (
              <motion.div
                key={item.id}
                custom={i}
                variants={chipVariants}
                initial="hidden"
                animate="visible"
              >
                <button
                  type="button"
                  aria-label={`${item.label}${done ? ". Tocado." : ""}`}
                  onClick={() => handleTap(item.id, item.label)}
                  className={cn(
                    "min-w-[6rem] min-h-[3.5rem] px-5 py-3 rounded-2xl border-[3px] font-black text-xl transition-all flex items-center gap-2 shadow active:scale-95",
                    done
                      ? "text-white border-transparent"
                      : "border-foreground/15 bg-white hover:scale-105 text-foreground",
                  )}
                  style={done ? { backgroundColor: BRAND.gold, borderColor: BRAND.brown } : {}}
                >
                  {done && <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />}
                  {item.label}
                </button>
              </motion.div>
            );
          })}
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800"
            >
              ¡Muy bien! Tocaste todos los objetos.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto scan fallback
// ---------------------------------------------------------------------------
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
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-5 py-3 text-lg font-black text-indigo-900 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 active:scale-95"
          >
            <Volume2 className="h-4 w-4 text-indigo-500" /> {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActivityCard dispatcher
// ---------------------------------------------------------------------------
function ActivityCard({
  interaction,
  accent,
  onComplete,
  onGretelState,
}: {
  interaction: WorkbookInteraction;
  accent: string;
  onComplete?: (id: string) => void;
  onGretelState: (s: GretelState) => void;
}) {
  switch (interaction.kind) {
    case "drag-build-word": {
      const entry = CATALOG.find((e) => e.n === interaction.lessonNumber);
      if (!entry) return null;
      return (
        <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-white/90 shadow-xl shadow-primary/5 p-5 overflow-hidden">
          <DragBuildWord
            entry={entry}
            accent={accent}
            lessonId={String(interaction.lessonNumber)}
            onComplete={() => onComplete?.(interaction.id)}
          />
        </div>
      );
    }
    case "drag-syllable-to-slot":
      return (
        <SyllableSlot
          interaction={interaction}
          accent={accent}
          onComplete={onComplete}
          onGretelState={onGretelState}
        />
      );
    case "listen-and-tap":
      return (
        <WordTap
          interaction={interaction}
          accent={accent}
          onComplete={onComplete}
          onGretelState={onGretelState}
        />
      );
    case "read-aloud":
      return (
        <ReadAloud
          interaction={interaction}
          accent={accent}
          onComplete={onComplete}
          onGretelState={onGretelState}
        />
      );
    case "mini-story":
      return (
        <MiniStoryCard
          interaction={interaction}
          accent={accent}
          onGretelState={onGretelState}
        />
      );
    case "tap-object":
    case "drag-word-to-image":
      return (
        <TapObject
          interaction={interaction}
          accent={accent}
          onComplete={onComplete}
          onGretelState={onGretelState}
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// InteractiveWorkbookLayer — main export
// ---------------------------------------------------------------------------
export function InteractiveWorkbookLayer({
  lessonNumber,
  pageNumbers,
  activePageNumber,
  accent = "hsl(var(--primary))",
}: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [gretelState, setGretelState] = useState<GretelState>("idle");

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

  if (allInteractionsForLesson.length === 0 && !hasAnyScanText) return null;

  const handleComplete = (id: string) => setCompletedIds((prev) => new Set([...prev, id]));
  const completedCount = visibleInteractions.filter((i) => completedIds.has(i.id)).length;
  const totalVisible = visibleInteractions.length;

  return (
    <section className="mt-6 space-y-4" aria-label="Actividades interactivas del cuaderno">
      {/* Section header */}
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

      {/* Gretel mascot — reactive to activity state */}
      <div className="flex justify-center">
        <GretelMascot state={gretelState} />
      </div>

      {/* Activity cards or fallback */}
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
              onGretelState={setGretelState}
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
      )}
    </section>
  );
}
