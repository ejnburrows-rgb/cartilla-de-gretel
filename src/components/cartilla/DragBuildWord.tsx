/**
 * DragBuildWord.tsx  â€" Lane A
 *
 * Drag (pointer-events API via @dnd-kit) letter tiles from a tray onto word slots.
 * Wrong drops snap back with shake animation.
 * Correct drops lock in place.
 * On full word completion, plays a celebration tone via AudioContext.
 * Full keyboard navigation: Tab moves between tiles, Enter/Space drops.
 * Respects prefers-reduced-motion for celebration.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { recordEvent } from "@/lib/student-session";

import { GretelFeedback } from "@/components/cartilla/GretelFeedback";
import { feelBus } from "@/lib/feel-bus";
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

// â"€â"€ Audio â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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

// â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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
  // Add 1â€"3 distractor letters
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

// â"€â"€ Subcomponents â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function DraggableLetter({ letter, trayIdx, used, accent, disabled, selectedTray, onTrayKeyDown }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${trayIdx}`,
    data: { trayIdx, letter },
    disabled: used || disabled,
  });

  const style: React.CSSProperties = {
    color: accent,
    borderColor: accent,
    backgroundColor: `${accent}12`,
    transform: transform ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)` : undefined,
    zIndex: isDragging ? 9999 : undefined,
    opacity: isDragging ? 0.35 : used ? 0.18 : 1,
    scale: isDragging ? 0.9 : 1,
    pointerEvents: used ? "none" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-used={used ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      className="drag-build-word__letter lesson-focus-ring"
      style={style}
      tabIndex={used || disabled ? -1 : 0}
      role="button"
      aria-label={`Letra ${letter}${selectedTray === trayIdx ? " (seleccionada)" : ""}`}
      aria-pressed={selectedTray === trayIdx}
      onKeyDown={(e) => onTrayKeyDown(e, trayIdx)}
      aria-disabled={used}
    >
      {letter}
    </div>
  );
}

function DroppableSlot({ slotIdx, filled, accent, wrongSlot, selectedTray, onSlotKeyDown }: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slotIdx}`,
    data: { slotIdx },
  });

  return (
    <div
      ref={setNodeRef}
      data-slot-idx={slotIdx}
      data-filled={filled !== null ? "true" : "false"}
      data-over={isOver ? "true" : "false"}
      data-correct={filled !== null ? "true" : "false"}
      data-wrong={wrongSlot === slotIdx ? "true" : "false"}
      className="drag-build-word__slot lesson-focus-ring"
      style={{ color: accent, borderColor: filled ? accent : undefined }}
      tabIndex={selectedTray !== null && filled === null ? 0 : -1}
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
}

// â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
interface DragBuildWordProps {
  words: string[];
  accent: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function DragBuildWord({ words, accent, lessonId, onComplete }: DragBuildWordProps) {
  const { play, playingText } = useAudio();
  // If no words provided, fallback
  const safeWords = words.length > 0 ? words : ["ola"];

  const [wordIdx, setWordIdx] = useState(0);
  const currentWord = safeWords[wordIdx % safeWords.length] ?? "ola";

  const [state, dispatch] = useReducer(reducer, currentWord, initState);
  const [feedbackState, setFeedbackState] = useState<"ok" | "x" | null>(null);

  // Keyboard drag state
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Clear wrong animation after 400ms
  useEffect(() => {
    if (state.wrongSlot !== null) {
      const t = setTimeout(() => {
        dispatch({ type: "CLEAR_WRONG" });
        setFeedbackState(null);
      }, 1000); // 1s to show "X" feedback
      return () => clearTimeout(t);
    }
  }, [state.wrongSlot]);

  // On completion
  const hasCalledComplete = useRef(false);
  useEffect(() => {
    if (state.completed && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      play(state.target);
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
      setFeedbackState("ok");
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
        setFeedbackState("x");
      }
      dispatch({ type: "DROP", slotIdx, trayIdx });
    },
    [state.tray, state.target],
  );

  const nextWord = () => {
    hasCalledComplete.current = false;
    const next = (wordIdx + 1) % words.length;
    setWordIdx(next);
    dispatch({ type: "NEXT_WORD", word: words[next] ?? "ola" });
    setSelectedTray(null);
    setFeedbackState(null);
  };

  const reset = () => {
    hasCalledComplete.current = false;
    dispatch({ type: "RESET" });
    setSelectedTray(null);
    setFeedbackState(null);
  };

  // â"€â"€ Keyboard â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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

  // â"€â"€ @dnd-kit Handlers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const onDragStart = () => {
    feelBus.emit("drag-pick");
  };

  const onDragEnd = (e: DragEndEvent) => {
    feelBus.emit("drag-drop");
    const { active, over } = e;
    if (over && active.data.current && over.data.current) {
      handleDrop(over.data.current.slotIdx, active.data.current.trayIdx);
    }
  };

  return (
    <div
      className="drag-build-word"
      style={{ "--lesson-accent": accent } as React.CSSProperties}
      aria-label="Arrastra las letras para formar la palabra"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Forma la palabra</h3>
        <div className="flex gap-2">
          <button
            onClick={() => play(state.target)}
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

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Slots */}
        <div
          className="drag-build-word__slots"
          role="group"
          aria-label="Casillas de la palabra"
        >
          {state.slots.map((filled, slotIdx) => (
            <DroppableSlot
              key={slotIdx}
              slotIdx={slotIdx}
              filled={filled}
              accent={accent}
              wrongSlot={state.wrongSlot}
              selectedTray={selectedTray}
              onSlotKeyDown={onSlotKeyDown}
            />
          ))}
        </div>

        {/* Completion Feedback */}
        <GretelFeedback
          state={feedbackState}
          onRetry={feedbackState === "ok" ? nextWord : () => setFeedbackState(null)}
        />

        {/* Tray */}
        <div
          className="drag-build-word__tray"
          role="group"
          aria-label="Letras disponibles"
        >
          {state.tray.map((letter, trayIdx) => (
            <DraggableLetter
              key={trayIdx}
              letter={letter}
              trayIdx={trayIdx}
              used={state.usedTrayIdx.has(trayIdx)}
              accent={accent}
              disabled={state.completed}
              selectedTray={selectedTray}
              onTrayKeyDown={onTrayKeyDown}
            />
          ))}
        </div>
      </DndContext>

      {selectedTray !== null && (
        <p className="mt-2 text-xs text-foreground/50" aria-live="polite">
          Letra «{state.tray[selectedTray]}» seleccionada — pulsa Enter/Espacio en una casilla
        </p>
      )}
    </div>
  );
}

