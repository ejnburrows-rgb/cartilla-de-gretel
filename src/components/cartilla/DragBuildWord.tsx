/**
 * DragBuildWord.tsx  — Lane A
 *
 * Drag (@dnd-kit/core with PointerSensor) letter tiles from a tray onto word slots.
 * Works on TOUCH + mobile (Galaxy Z Fold tested).
 * Tap-to-place fallback: tap a letter, tap the slot.
 * Wrong drops snap back with shake animation.
 * Correct drops lock in place.
 * On full word completion, plays a celebration tone via AudioContext.
 * Full keyboard navigation: Tab moves between tiles, Enter/Space drops.
 * Respects prefers-reduced-motion for celebration.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Check, RotateCcw, Volume2 } from "lucide-react";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { speak } from "@/lib/speak";
import { recordEvent } from "@/lib/student-session";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { GretelFeedback } from "@/components/gretel/GretelFeedback";
import { feelBus } from "@/lib/feel-bus";

// ── Audio ──────────────────────────────────────────────────────────
function playCelebrationTone() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.28);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {
    /* no AudioContext support */
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Types ──────────────────────────────────────────────────────────
type SlotState = string | null; // null = empty, string = letter placed

interface DragBuildWordState {
  target: string;
  slots: SlotState[];
  tray: string[]; // shuffled letters (with duplicates preserved)
  usedTrayIdx: Set<number>;
  wrongSlot: number | null;
  completed: boolean;
  attempts: number;
}

type Action =
  | { type: "DROP"; slotIdx: number; trayIdx: number }
  | { type: "CLEAR_WRONG" }
  | { type: "RESET" }
  | { type: "NEXT_WORD"; word: string };

function buildTray(word: string): string[] {
  // Add 1–3 distractor letters
  const alpha = "aeioumsptdlnbvrfgjcyz";
  const extras = shuffle(
    alpha.split("").filter((c) => !word.includes(c)),
  ).slice(0, Math.min(3, Math.max(1, 4 - word.length)));
  return shuffle([...word.split(""), ...extras]);
}

function initState(word: string): DragBuildWordState {
  return {
    target: word,
    slots: Array<SlotState>(word.length).fill(null),
    tray: buildTray(word),
    usedTrayIdx: new Set(),
    wrongSlot: null,
    completed: false,
    attempts: 0,
  };
}

function reducer(state: DragBuildWordState, action: Action): DragBuildWordState {
  switch (action.type) {
    case "DROP": {
      const { slotIdx, trayIdx } = action;
      if (state.slots[slotIdx] !== null || state.usedTrayIdx.has(trayIdx)) return state;
      const letter = state.tray[trayIdx];
      const correct = letter === state.target[slotIdx];
      const newSlots = [...state.slots];
      if (correct) {
        newSlots[slotIdx] = letter;
      }
      const newUsed = new Set(state.usedTrayIdx);
      if (correct) newUsed.add(trayIdx);
      const completed = correct && newSlots.every((s) => s !== null);
      return {
        ...state,
        slots: newSlots,
        usedTrayIdx: newUsed,
        wrongSlot: correct ? null : slotIdx,
        completed,
        attempts: state.attempts + 1,
      };
    }
    case "CLEAR_WRONG":
      return { ...state, wrongSlot: null };
    case "RESET":
      return initState(state.target);
    case "NEXT_WORD":
      return initState(action.word);
    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────
interface DragBuildWordProps {
  entry: CatalogEntry;
  accent: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function DragBuildWord({ entry, accent, lessonId, onComplete }: DragBuildWordProps) {
  // Pick a target word from the lesson's data
  const words = useMemo<string[]>(() => {
    if (entry.kind === "consonant") {
      const examples = Object.values(entry.data.examples).flat();
      return examples.filter((w) => w.length >= 2 && w.length <= 7);
    }
    if (entry.kind === "vowel") {
      return entry.lesson.vocab.map((v) => v.word).filter((w) => w.length >= 2 && w.length <= 7);
    }
    return ["ala", "oso", "uva", "ojo", "era"];
  }, [entry]);

  const [wordIdx, setWordIdx] = useState(0);
  const currentWord = words[wordIdx % words.length] ?? "ola";

  const [state, dispatch] = useReducer(reducer, currentWord, initState);

  // Tap-to-place state
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  // @dnd-kit/core sensors for touch/mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small movement before drag starts to distinguish from tap
      },
    })
  );

  // Clear wrong animation after 400ms
  useEffect(() => {
    if (state.wrongSlot !== null) {
      const t = setTimeout(() => dispatch({ type: "CLEAR_WRONG" }), 400);
      return () => clearTimeout(t);
    }
  }, [state.wrongSlot]);

  // Show immediate feedback for wrong drops
  const showWrongFeedback = state.wrongSlot !== null && !state.completed;

  // On completion
  const hasCalledComplete = useRef(false);
  useEffect(() => {
    if (state.completed && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      speak(state.target);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) playCelebrationTone();
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: state.attempts,
          meta: { exercise: "drag_build_word", word: state.target, completed: true },
        });
      }
      onComplete?.();
    }
  }, [state.completed, state.target, state.attempts, lessonId, onComplete]);

  const handleDrop = useCallback(
    (slotIdx: number, trayIdx: number) => {
      const letter = state.tray[trayIdx];
      const correct = letter === state.target[slotIdx];
      if (correct) {
        feelBus.emit("success");
      } else {
        feelBus.emit("error");
      }
      dispatch({ type: "DROP", slotIdx, trayIdx });
    },
    [state.tray, state.target],
  );

  // @dnd-kit/core drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const trayIdx = Number(active.id);
      const slotIdx = Number(over.id);

      if (!state.usedTrayIdx.has(trayIdx) && !state.completed) {
        handleDrop(slotIdx, trayIdx);
      }
    },
    [state.usedTrayIdx, state.completed, handleDrop],
  );

  // Tap-to-place: tap letter then tap slot
  const handleTrayTap = useCallback(
    (trayIdx: number) => {
      if (state.usedTrayIdx.has(trayIdx) || state.completed) return;
      setSelectedTray(trayIdx === selectedTray ? null : trayIdx);
      feelBus.emit("drag-pick");
    },
    [state.usedTrayIdx, state.completed, selectedTray],
  );

  const handleSlotTap = useCallback(
    (slotIdx: number) => {
      if (selectedTray !== null && !state.completed) {
        handleDrop(slotIdx, selectedTray);
        setSelectedTray(null);
      }
    },
    [selectedTray, state.completed, handleDrop],
  );

  const nextWord = () => {
    hasCalledComplete.current = false;
    const next = (wordIdx + 1) % words.length;
    setWordIdx(next);
    dispatch({ type: "NEXT_WORD", word: words[next] ?? "ola" });
    setSelectedTray(null);
  };

  const reset = () => {
    hasCalledComplete.current = false;
    dispatch({ type: "RESET" });
    setSelectedTray(null);
  };

  // ── Keyboard ─────────────────────────────────────────────────────
  const onTrayKeyDown = (e: React.KeyboardEvent, trayIdx: number) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setSelectedTray(trayIdx === selectedTray ? null : trayIdx);
    }
  };

  const onSlotKeyDown = (e: React.KeyboardEvent, slotIdx: number) => {
    if ((e.key === " " || e.key === "Enter") && selectedTray !== null) {
      e.preventDefault();
      handleDrop(slotIdx, selectedTray);
      setSelectedTray(null);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="drag-build-word"
        style={{ "--lesson-accent": accent } as React.CSSProperties}
        aria-label="Arrastra las letras para formar la palabra"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Forma la palabra</h3>
          <div className="flex gap-2">
            <button
              onClick={() => speak(state.target)}
              aria-label={`Escuchar "${state.target}"`}
              className="lesson-focus-ring inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border border-foreground/10 hover:bg-secondary"
            >
              <Volume2 className="w-3.5 h-3.5" /> Escuchar
            </button>
            <button
              onClick={reset}
              aria-label="Reiniciar palabra"
              className="lesson-focus-ring inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border border-foreground/10 hover:bg-secondary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slots */}
        <div
          className="drag-build-word__slots"
          role="group"
          aria-label="Casillas de la palabra"
        >
          {state.slots.map((filled, slotIdx) => {
            const { setNodeRef, isOver } = useDroppable({
              id: slotIdx.toString(),
              disabled: filled !== null || state.completed,
            });

            return (
              <div
                key={slotIdx}
                ref={setNodeRef}
                data-slot-idx={slotIdx}
                data-filled={filled !== null ? "true" : "false"}
                data-over={isOver ? "true" : "false"}
                data-correct={filled !== null ? "true" : "false"}
                data-wrong={state.wrongSlot === slotIdx ? "true" : "false"}
                className="drag-build-word__slot lesson-focus-ring"
                style={{ color: accent, borderColor: filled ? accent : undefined }}
                tabIndex={selectedTray !== null && filled === null ? 0 : -1}
                onClick={() => handleSlotTap(slotIdx)}
                onKeyDown={(e) => onSlotKeyDown(e, slotIdx)}
                aria-label={
                  filled
                    ? `Casilla ${slotIdx + 1}: ${filled}`
                    : `Casilla ${slotIdx + 1}: vacía`
                }
              >
                {filled ?? <span className="text-foreground/20 text-sm">_</span>}
              </div>
            );
          })}
        </div>

        {/* Wrong drop feedback */}
        {showWrongFeedback && (
          <GretelFeedback
            isCorrect={false}
            message="Inténtalo otra vez"
          />
        )}

        {/* Completion */}
        {state.completed && (
          <GretelFeedback
            isCorrect={true}
            message="¡Muy bien!"
          >
            {words.length > 1 && (
              <button
                onClick={nextWord}
                className="lesson-focus-ring text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                style={{ backgroundColor: accent }}
              >
                Siguiente →
              </button>
            )}
          </GretelFeedback>
        )}

        {/* Tray */}
        <div
          className="drag-build-word__tray"
          role="group"
          aria-label="Letras disponibles"
        >
          {state.tray.map((letter, trayIdx) => {
            const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
              id: trayIdx.toString(),
              disabled: state.usedTrayIdx.has(trayIdx) || state.completed,
            });

            return (
              <div
                key={trayIdx}
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                data-used={state.usedTrayIdx.has(trayIdx) ? "true" : "false"}
                data-dragging={isDragging ? "true" : "false"}
                className="drag-build-word__letter lesson-focus-ring"
                style={{
                  color: accent,
                  borderColor: accent,
                  backgroundColor: `${accent}12`,
                  opacity: isDragging ? 0.5 : 1,
                }}
                tabIndex={state.usedTrayIdx.has(trayIdx) || state.completed ? -1 : 0}
                role="button"
                aria-label={`Letra ${letter}${selectedTray === trayIdx ? " (seleccionada)" : ""}`}
                aria-pressed={selectedTray === trayIdx}
                onClick={() => handleTrayTap(trayIdx)}
                onKeyDown={(e) => onTrayKeyDown(e, trayIdx)}
                aria-disabled={state.usedTrayIdx.has(trayIdx)}
              >
                {letter}
              </div>
            );
          })}
        </div>

        {selectedTray !== null && (
          <p className="mt-2 text-xs text-foreground/50" aria-live="polite">
            Letra «{state.tray[selectedTray]}» seleccionada — toca una casilla para colocar
          </p>
        )}
      </div>
    </DndContext>
  );
}
