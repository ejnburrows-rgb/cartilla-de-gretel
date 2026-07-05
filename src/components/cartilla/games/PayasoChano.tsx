// PayasoChano.tsx — Juego Payaso Chano: drag syllable tiles onto Chano's pizarra to
// build the word, then check with the sombrilla. Reuses the tray→slot @dnd-kit pattern
// from DragBuildWord.tsx at syllable granularity; checking is an explicit button press
// (sombrilla) per the verbatim source instructions, not automatic on drop.
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { RotateCcw, Volume2, Umbrella } from "lucide-react";
import { recordEvent } from "@/lib/student-session";
import { playWord } from "@/lib/games/wordAudio";
import { useGameReactions } from "./useGameReactions";
import { GretelFeedback } from "@/components/cartilla/GretelFeedback";
import type { GameContent } from "@/lib/games/gameContent";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type SlotState = string | null;

interface PayasoState {
  target: string[];
  slots: SlotState[];
  tray: string[];
  usedTrayIdx: Set<number>;
  checkResult: "ok" | "wrong" | null;
  completed: boolean;
  attempts: number;
}

type Action =
  | { type: "PLACE"; slotIdx: number; trayIdx: number }
  | { type: "CHECK" }
  | { type: "CLEAR_CHECK" }
  | { type: "RESET_TILES" }
  | { type: "NEXT_WORD"; target: string[]; tray: string[] };

function initState(target: string[], tray: string[]): PayasoState {
  return {
    target,
    slots: Array<SlotState>(target.length).fill(null),
    tray,
    usedTrayIdx: new Set(),
    checkResult: null,
    completed: false,
    attempts: 0,
  };
}

function reducer(state: PayasoState, action: Action): PayasoState {
  switch (action.type) {
    case "PLACE": {
      const { slotIdx, trayIdx } = action;
      if (state.completed || state.slots[slotIdx] !== null || state.usedTrayIdx.has(trayIdx))
        return state;
      const newSlots = [...state.slots];
      newSlots[slotIdx] = state.tray[trayIdx];
      const newUsed = new Set(state.usedTrayIdx);
      newUsed.add(trayIdx);
      return { ...state, slots: newSlots, usedTrayIdx: newUsed, checkResult: null };
    }
    case "CHECK": {
      if (state.slots.some((s) => s === null)) return state;
      const ok = state.slots.every((s, i) => s === state.target[i]);
      return {
        ...state,
        checkResult: ok ? "ok" : "wrong",
        completed: ok,
        attempts: state.attempts + 1,
      };
    }
    case "CLEAR_CHECK":
      return { ...state, checkResult: null };
    case "RESET_TILES":
      return {
        ...state,
        slots: Array<SlotState>(state.target.length).fill(null),
        usedTrayIdx: new Set(),
        checkResult: null,
        completed: false,
      };
    case "NEXT_WORD":
      return initState(action.target, action.tray);
    default:
      return state;
  }
}

interface PayasoChanoProps {
  content: GameContent;
  lessonId?: string;
  onComplete?: () => void;
}

export function PayasoChano({ content, lessonId, onComplete }: PayasoChanoProps) {
  const reactions = useGameReactions();
  const [wordIdx, setWordIdx] = useState(0);
  const word = content.words[wordIdx];

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initState(word.syllables, shuffle(word.syllables)),
  );
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      reactions.start();
    }
  }, [reactions]);

  useEffect(() => {
    if (state.checkResult === "wrong") {
      reactions.wrong();
      const t = setTimeout(() => dispatch({ type: "CLEAR_CHECK" }), 1200);
      return () => clearTimeout(t);
    }
  }, [state.checkResult, reactions]);

  const hasCelebrated = useRef(false);
  useEffect(() => {
    if (state.completed && !hasCelebrated.current) {
      hasCelebrated.current = true;
      recordEvent({
        lessonId: lessonId ?? content.id,
        kind: "exercise",
        score: 1,
        total: state.attempts,
        meta: { exercise: "payaso_chano", word: word.word, completed: true },
      });
      if (wordIdx === content.words.length - 1) {
        reactions.complete();
        onComplete?.();
      } else {
        reactions.correct();
      }
    }
  }, [
    state.completed,
    state.attempts,
    lessonId,
    content.id,
    content.words.length,
    word.word,
    wordIdx,
    reactions,
    onComplete,
  ]);

  const nextWord = useCallback(() => {
    hasCelebrated.current = false;
    const next = (wordIdx + 1) % content.words.length;
    const nextWordData = content.words[next];
    setWordIdx(next);
    dispatch({
      type: "NEXT_WORD",
      target: nextWordData.syllables,
      tray: shuffle(nextWordData.syllables),
    });
    setSelectedTray(null);
    reactions.clear();
    playWord(nextWordData.audioUrl);
  }, [wordIdx, content.words, reactions]);

  const check = () => dispatch({ type: "CHECK" });
  const resetTiles = () => {
    setSelectedTray(null);
    dispatch({ type: "RESET_TILES" });
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
      dispatch({ type: "PLACE", slotIdx, trayIdx: selectedTray });
      setSelectedTray(null);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.data.current && over.data.current) {
      dispatch({
        type: "PLACE",
        slotIdx: over.data.current.slotIdx as number,
        trayIdx: active.data.current.trayIdx as number,
      });
    }
  };

  const allFilled = state.slots.every((s) => s !== null);

  return (
    <div className="w-full max-w-xl mx-auto p-5 bg-white/60 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/40">
        <div>
          <h3 className="text-lg font-black text-stone-800">Juego Payaso Chano</h3>
          <p className="text-xs font-bold text-stone-500">
            Palabra {wordIdx + 1} de {content.words.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => playWord(word.audioUrl)}
          aria-label={`Escuchar la palabra "${word.word}"`}
          className="lesson-focus-ring p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-all shadow-sm"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {/* Pizarra de Chano */}
        <div
          className="flex gap-3 items-center justify-center p-4 bg-stone-50/70 border border-stone-200/40 rounded-2xl min-h-[88px]"
          role="group"
          aria-label="Pizarra de Chano: casillas de la palabra"
        >
          {state.slots.map((filled, slotIdx) => (
            <DroppableSlot
              key={slotIdx}
              slotIdx={slotIdx}
              filled={filled}
              checkResult={state.checkResult}
              selectedTray={selectedTray}
              onSlotKeyDown={onSlotKeyDown}
            />
          ))}
        </div>

        {/* Tray */}
        <div
          className="mt-4 flex gap-3 items-center justify-center p-4 bg-white/70 border border-stone-200/40 rounded-2xl min-h-[72px]"
          role="group"
          aria-label="Sílabas disponibles"
        >
          {state.tray.map((syllable, trayIdx) => (
            <DraggableSyllable
              key={trayIdx}
              syllable={syllable}
              trayIdx={trayIdx}
              used={state.usedTrayIdx.has(trayIdx)}
              selectedTray={selectedTray}
              onTrayKeyDown={onTrayKeyDown}
            />
          ))}
        </div>
      </DndContext>

      {selectedTray !== null && (
        <p className="text-xs text-stone-500" aria-live="polite">
          Sílaba «{state.tray[selectedTray]}» seleccionada — pulsa Enter/Espacio en una casilla
        </p>
      )}

      {/* Props: sombrilla / resorte / Chano */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={check}
          disabled={!allFilled || state.completed}
          aria-label="Sombrilla: comprobar la palabra"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white shadow-md transition-all hover:brightness-105 active:scale-95 disabled:opacity-40 bg-sky-500"
        >
          <Umbrella className="w-4 h-4" /> Comprobar
        </button>
        <button
          type="button"
          onClick={resetTiles}
          aria-label="Resorte: colocar las sílabas en su lugar otra vez"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-stone-700 bg-stone-100 hover:bg-stone-200 shadow-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Reiniciar
        </button>
        <button
          type="button"
          onClick={nextWord}
          aria-label="Chano: escuchar la próxima palabra"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white bg-orange-500 hover:brightness-105 shadow-md transition-all active:scale-95"
        >
          Siguiente con Chano
        </button>
      </div>

      <GretelFeedback state={reactions.feedback} onRetry={reactions.clear} />
    </div>
  );
}

function DraggableSyllable({
  syllable,
  trayIdx,
  used,
  selectedTray,
  onTrayKeyDown,
}: {
  syllable: string;
  trayIdx: number;
  used: boolean;
  selectedTray: number | null;
  onTrayKeyDown: (e: React.KeyboardEvent, trayIdx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${trayIdx}`,
    data: { trayIdx },
    disabled: used,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    zIndex: isDragging ? 9999 : undefined,
    opacity: isDragging ? 0.4 : used ? 0.2 : 1,
    pointerEvents: used ? "none" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      tabIndex={used ? -1 : 0}
      role="button"
      aria-label={`Sílaba ${syllable}${selectedTray === trayIdx ? " (seleccionada)" : ""}`}
      aria-pressed={selectedTray === trayIdx}
      aria-disabled={used}
      onKeyDown={(e) => onTrayKeyDown(e, trayIdx)}
      className="lesson-focus-ring px-5 py-3 rounded-xl border-2 text-xl font-black select-none cursor-grab active:cursor-grabbing text-stone-800 bg-white border-stone-200 hover:border-stone-400 transition-all"
    >
      {syllable}
    </div>
  );
}

function DroppableSlot({
  slotIdx,
  filled,
  checkResult,
  selectedTray,
  onSlotKeyDown,
}: {
  slotIdx: number;
  filled: SlotState;
  checkResult: "ok" | "wrong" | null;
  selectedTray: number | null;
  onSlotKeyDown: (e: React.KeyboardEvent, slotIdx: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slotIdx}`,
    data: { slotIdx },
  });

  return (
    <div
      ref={setNodeRef}
      tabIndex={selectedTray !== null && filled === null ? 0 : -1}
      onKeyDown={(e) => onSlotKeyDown(e, slotIdx)}
      aria-label={filled ? `Casilla ${slotIdx + 1}: ${filled}` : `Casilla ${slotIdx + 1}: vacía`}
      className={`lesson-focus-ring w-16 h-16 flex items-center justify-center rounded-xl border-2 text-xl font-black transition-all ${
        checkResult === "ok"
          ? "bg-emerald-500 border-emerald-600 text-white"
          : checkResult === "wrong"
            ? "bg-rose-100 border-rose-400 text-rose-700"
            : isOver
              ? "border-dashed border-stone-400 bg-stone-100"
              : filled
                ? "bg-white border-stone-300 text-stone-800"
                : "border-dashed border-stone-300 text-stone-300"
      }`}
    >
      {filled ?? "_"}
    </div>
  );
}
