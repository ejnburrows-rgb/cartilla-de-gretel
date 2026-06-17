/**
 * DragMatchWords.tsx — Lane A
 *
 * Drag-and-drop counterpart to WordMatch (Ejercicios.tsx, tap-to-select).
 * Drag word tiles from a tray onto picture/emoji slots.
 * Wrong drops snap back with shake animation; correct drops lock in place.
 * On full completion, plays a celebration tone via AudioContext.
 * Full keyboard navigation: Tab moves between tiles, Enter/Space drops.
 */
import { useEffect, useMemo, useReducer, useRef, useState, useCallback } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";
import { feelBus } from "@/lib/feel-bus";
import { GretelFeedback } from "@/components/cartilla/GretelFeedback";
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

type Word = { word: string; emoji?: string };

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

// ── State ────────────────────────────────────────────────────────
interface DragMatchState {
  items: Word[];
  tray: number[]; // shuffled indices into items, representing the draggable word tiles
  slots: (number | null)[]; // per slot (emoji order), the tray index placed there, or null
  usedTrayIdx: Set<number>;
  wrongSlot: number | null;
  completed: boolean;
  attempts: number;
}

type Action =
  | { type: "DROP"; slotIdx: number; trayIdx: number }
  | { type: "CLEAR_WRONG" }
  | { type: "RESET"; items: Word[] };

function initState(items: Word[]): DragMatchState {
  return {
    items,
    tray: shuffle(items.map((_, i) => i)),
    slots: Array<number | null>(items.length).fill(null),
    usedTrayIdx: new Set(),
    wrongSlot: null,
    completed: false,
    attempts: 0,
  };
}

function reducer(state: DragMatchState, action: Action): DragMatchState {
  switch (action.type) {
    case "DROP": {
      const { slotIdx, trayIdx } = action;
      if (state.slots[slotIdx] !== null || state.usedTrayIdx.has(trayIdx)) return state;
      const wordIdx = state.tray[trayIdx];
      const correct = wordIdx === slotIdx;
      const newSlots = [...state.slots];
      if (correct) newSlots[slotIdx] = trayIdx;
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
      return initState(action.items);
    default:
      return state;
  }
}

// ── Subcomponents ───────────────────────────────────────────────
function DraggableWord({ word, trayIdx, used, accent, disabled, selectedTray, onTrayKeyDown }: {
  word: string;
  trayIdx: number;
  used: boolean;
  accent: string;
  disabled: boolean;
  selectedTray: number | null;
  onTrayKeyDown: (e: React.KeyboardEvent, trayIdx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `word-tray-${trayIdx}`,
    data: { trayIdx },
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
      className="drag-match-words__word lesson-focus-ring"
      style={style}
      tabIndex={used || disabled ? -1 : 0}
      role="button"
      aria-label={`Palabra ${word}${selectedTray === trayIdx ? " (seleccionada)" : ""}`}
      aria-pressed={selectedTray === trayIdx}
      onKeyDown={(e) => onTrayKeyDown(e, trayIdx)}
      aria-disabled={used}
    >
      {word}
    </div>
  );
}

function DroppableEmojiSlot({ slotIdx, emoji, filledWord, accent, wrongSlot, selectedTray, onSlotKeyDown }: {
  slotIdx: number;
  emoji?: string;
  filledWord: string | null;
  accent: string;
  wrongSlot: number | null;
  selectedTray: number | null;
  onSlotKeyDown: (e: React.KeyboardEvent, slotIdx: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `emoji-slot-${slotIdx}`,
    data: { slotIdx },
  });

  return (
    <div
      ref={setNodeRef}
      data-slot-idx={slotIdx}
      data-filled={filledWord !== null ? "true" : "false"}
      data-over={isOver ? "true" : "false"}
      data-correct={filledWord !== null ? "true" : "false"}
      data-wrong={wrongSlot === slotIdx ? "true" : "false"}
      className="drag-match-words__slot lesson-focus-ring"
      style={{ color: accent, borderColor: filledWord ? accent : undefined }}
      tabIndex={selectedTray !== null && filledWord === null ? 0 : -1}
      onKeyDown={(e) => onSlotKeyDown(e, slotIdx)}
      aria-label={
        filledWord
          ? `Dibujo ${emoji ?? ""}: emparejado con ${filledWord}`
          : `Dibujo ${emoji ?? ""}: vacío`
      }
    >
      <span className="drag-match-words__emoji">{emoji}</span>
      {filledWord && <span className="drag-match-words__filled-word">{filledWord}</span>}
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────
interface DragMatchWordsProps {
  words: Word[];
  accent: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function DragMatchWords({ words, accent, lessonId, onComplete }: DragMatchWordsProps) {
  const { play, playingText } = useAudio();
  const items = useMemo(() => words.filter((w) => w.emoji).slice(0, 4), [words]);

  const [state, dispatch] = useReducer(reducer, items, initState);
  const [feedbackState, setFeedbackState] = useState<"ok" | "x" | null>(null);
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // Clear wrong animation after 1s
  useEffect(() => {
    if (state.wrongSlot !== null) {
      const t = setTimeout(() => {
        dispatch({ type: "CLEAR_WRONG" });
        setFeedbackState(null);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [state.wrongSlot]);

  // On completion
  const hasCalledComplete = useRef(false);
  useEffect(() => {
    if (state.completed && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) playCelebrationTone();
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: items.length,
          total: state.attempts,
          meta: { exercise: "word_match_drag", completed: true, items: items.length },
        });
      }
      gretelEvent("lesson:complete");
      setFeedbackState("ok");
      onComplete?.();
    }
  }, [state.completed, state.attempts, items.length, lessonId, onComplete]);

  const handleDrop = useCallback(
    (slotIdx: number, trayIdx: number) => {
      const wordIdx = state.tray[trayIdx];
      const correct = wordIdx === slotIdx;
      if (correct) {
        feelBus.emit("success");
        gretelEvent("answer:correct");
        play(items[slotIdx].word);
      } else {
        feelBus.emit("error");
        gretelEvent("answer:wrong");
        setFeedbackState("x");
      }
      dispatch({ type: "DROP", slotIdx, trayIdx });
    },
    [state.tray, items, play],
  );

  const reset = () => {
    hasCalledComplete.current = false;
    dispatch({ type: "RESET", items });
    setSelectedTray(null);
    setFeedbackState(null);
  };

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

  if (items.length < 2) return null;

  return (
    <div
      className="drag-match-words"
      style={{ "--lesson-accent": accent } as React.CSSProperties}
      aria-label="Arrastra cada palabra hasta su dibujo"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Arrastra la palabra hasta su dibujo</h3>
        <button
          onClick={reset}
          aria-label="Reiniciar"
          className="lesson-focus-ring inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border border-foreground/10 hover:bg-secondary"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="drag-match-words__slots" role="group" aria-label="Dibujos">
          {items.map((item, slotIdx) => (
            <DroppableEmojiSlot
              key={item.word}
              slotIdx={slotIdx}
              emoji={item.emoji}
              filledWord={state.slots[slotIdx] !== null ? items[state.tray[state.slots[slotIdx]!]].word : null}
              accent={accent}
              wrongSlot={state.wrongSlot}
              selectedTray={selectedTray}
              onSlotKeyDown={onSlotKeyDown}
            />
          ))}
        </div>

        <GretelFeedback
          state={feedbackState}
          onRetry={() => setFeedbackState(null)}
        />

        <div className="drag-match-words__tray" role="group" aria-label="Palabras disponibles">
          {state.tray.map((wordIdx, trayIdx) => (
            <DraggableWord
              key={trayIdx}
              word={items[wordIdx].word}
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

      <div className="mt-2 flex items-center justify-between text-xs text-foreground/50">
        {selectedTray !== null && (
          <p aria-live="polite">
            Palabra «{items[state.tray[selectedTray]].word}» seleccionada — pulsa Enter/Espacio en un dibujo
          </p>
        )}
        <button
          onClick={() => play(items[0]?.word ?? "")}
          aria-label="Escuchar ejemplo"
          className={`ml-auto inline-flex items-center gap-1 font-bold ${playingText ? "animate-pulse" : ""}`}
        >
          <Volume2 className="w-3.5 h-3.5" /> Escuchar
        </button>
      </div>
    </div>
  );
}
