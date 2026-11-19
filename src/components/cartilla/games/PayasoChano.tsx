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
import { RotateCcw, Star, Umbrella, Volume2 } from "lucide-react";
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
  | { type: "TAP_PLACE"; trayIdx: number }
  | { type: "RETURN_SLOT"; slotIdx: number }
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
    case "TAP_PLACE": {
      const { trayIdx } = action;
      const emptyIdx = state.slots.indexOf(null);
      if (state.completed || emptyIdx === -1 || state.usedTrayIdx.has(trayIdx)) return state;
      const newSlots = [...state.slots];
      newSlots[emptyIdx] = state.tray[trayIdx];
      const newUsed = new Set(state.usedTrayIdx);
      newUsed.add(trayIdx);
      return { ...state, slots: newSlots, usedTrayIdx: newUsed, checkResult: null };
    }
    case "RETURN_SLOT": {
      const { slotIdx } = action;
      if (state.completed || state.slots[slotIdx] === null) return state;
      const syllable = state.slots[slotIdx];
      const trayIdx = state.tray.findIndex((t, i) => t === syllable && state.usedTrayIdx.has(i));
      const newSlots = [...state.slots];
      newSlots[slotIdx] = null;
      const newUsed = new Set(state.usedTrayIdx);
      if (trayIdx !== -1) newUsed.delete(trayIdx);
      return { ...state, slots: newSlots, usedTrayIdx: newUsed, checkResult: null };
    }
    case "CHECK": {
      if (state.slots.some((s) => s === null) || state.checkResult !== null) return state;
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
  const completedWordsRef = useRef<Set<number>>(new Set());
  const globalCelebratedRef = useRef(false);

  useEffect(() => {
    if (state.completed && !hasCelebrated.current) {
      hasCelebrated.current = true;
      completedWordsRef.current.add(wordIdx);
      
      recordEvent({
        lessonId: lessonId ?? content.id,
        kind: "exercise",
        score: 1,
        total: state.attempts,
        meta: { exercise: "payaso_chano", word: word.word, completed: true },
      });
      
      if (completedWordsRef.current.size === content.words.length) {
        if (!globalCelebratedRef.current) {
          globalCelebratedRef.current = true;
          reactions.complete();
          onComplete?.();
        }
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
    <div className="game-wood-frame">
      <div className="game-paper-board w-full p-5 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E6DCC8]">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#25313A]">Juego Payaso Chano</h3>
            <p className="text-sm font-bold text-[#25313A]/75">
              Palabra {wordIdx + 1} de {content.words.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/games/payaso-chano.html"
              className="lesson-focus-ring inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-[#D99B1E] bg-[#FFF6D6] px-4 py-2 text-sm font-black text-[#25313A] shadow-[0_3px_0_#B87E14] hover:bg-[#FDE79C] active:translate-y-[2px] active:shadow-none"
            >
              Chano animado
            </a>
            <button
              type="button"
              onClick={() => playWord(word.audioUrl)}
              aria-label={`Escuchar la palabra "${word.word}"`}
              className="lesson-focus-ring inline-flex min-h-14 min-w-14 items-center justify-center bg-[#167A72] hover:brightness-105 text-white rounded-2xl shadow-[0_3px_0_#0F544E] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Volume2 className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          {/* Pizarra de Chano */}
          <div
            className="game-chalkboard flex flex-wrap gap-3 items-center justify-center p-5 sm:p-7 min-h-[120px]"
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
                onSlotClick={(idx) => dispatch({ type: "RETURN_SLOT", slotIdx: idx })}
              />
            ))}
          </div>

          {/* Tray */}
          <div
            className="mt-4 flex flex-wrap gap-3 items-center justify-center p-4 bg-[#F5F1E8] border border-[#E6DCC8] rounded-2xl min-h-[84px]"
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
                onTrayClick={(idx) => dispatch({ type: "TAP_PLACE", trayIdx: idx })}
              />
            ))}
          </div>
        </DndContext>

        {selectedTray !== null && (
          <p className="text-sm font-bold text-[#167A72] text-center" aria-live="polite">
            Sílaba «{state.tray[selectedTray]}» seleccionada — pulsa Enter/Espacio en una casilla
          </p>
        )}

        {state.checkResult === "ok" && (
          <div
            role="status"
            className="game-correct-glow flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2F7D4A] bg-[#ECF9F0] px-5 py-3 text-lg font-black text-[#1D5631]"
          >
            <span className="game-star-pop">
              <Star className="h-5 w-5 fill-[#F2B632] text-[#D99B1E]" aria-hidden />
            </span>
            ¡Excelente! Palabra «{word.word}» completa.
          </div>
        )}

        {state.checkResult === "wrong" && (
          <div
            role="status"
            className="game-wrong-nudge flex items-center justify-center rounded-2xl border-2 border-[#C2413A] bg-[#FDF0EF] px-5 py-3 text-base font-black text-[#8E2620]"
          >
            Casi — intenta ordenar las sílabas de nuevo.
          </div>
        )}

        {/* Props: sombrilla / resorte / Chano */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={check}
            disabled={!allFilled || state.completed || state.checkResult !== null}
            aria-label="Sombrilla: comprobar la palabra"
            className="flex min-h-14 items-center gap-2 px-6 py-3 rounded-2xl text-base font-black text-white shadow-[0_4px_0_#0F544E] transition-all hover:brightness-105 active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:shadow-none bg-[#167A72]"
          >
            <Umbrella className="w-5 h-5" aria-hidden /> Comprobar
          </button>
          <button
            type="button"
            onClick={resetTiles}
            aria-label="Resorte: colocar las sílabas en su lugar otra vez"
            className="flex min-h-14 items-center gap-2 px-5 py-3 rounded-2xl text-base font-black text-[#25313A] bg-[#F5F1E8] border-2 border-[#D4C4A8] hover:border-[#167A72] shadow-[0_3px_0_#C9B798] transition-all active:translate-y-[2px] active:shadow-none"
          >
            <RotateCcw className="w-5 h-5" aria-hidden /> Reiniciar
          </button>
          <button
            type="button"
            onClick={nextWord}
            aria-label="Chano: escuchar la próxima palabra"
            className="flex min-h-14 items-center gap-2 px-6 py-3 rounded-2xl text-base font-black text-[#25313A] bg-[#F2B632] border-2 border-[#D99B1E] hover:brightness-105 shadow-[0_4px_0_#B87E14] transition-all active:translate-y-[2px] active:shadow-none"
          >
            Siguiente con Chano
          </button>
        </div>

        <GretelFeedback state={reactions.feedback} onRetry={reactions.clear} />
      </div>
    </div>
  );
}

function DraggableSyllable({
  syllable,
  trayIdx,
  used,
  selectedTray,
  onTrayKeyDown,
  onTrayClick,
}: {
  syllable: string;
  trayIdx: number;
  used: boolean;
  selectedTray: number | null;
  onTrayKeyDown: (e: React.KeyboardEvent, trayIdx: number) => void;
  onTrayClick: (trayIdx: number) => void;
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
      onClick={() => !used && onTrayClick(trayIdx)}
      onKeyDown={(e) => onTrayKeyDown(e, trayIdx)}
      className="lesson-focus-ring game-tactile-tile min-h-14 min-w-16 flex items-center justify-center px-5 py-3 rounded-2xl text-xl font-black select-none cursor-grab active:cursor-grabbing"
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
  onSlotClick,
}: {
  slotIdx: number;
  filled: SlotState;
  checkResult: "ok" | "wrong" | null;
  selectedTray: number | null;
  onSlotKeyDown: (e: React.KeyboardEvent, slotIdx: number) => void;
  onSlotClick: (slotIdx: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slotIdx}`,
    data: { slotIdx },
  });

  return (
    <div
      ref={setNodeRef}
      tabIndex={selectedTray !== null && filled === null ? 0 : -1}
      onClick={() => filled !== null && onSlotClick(slotIdx)}
      onKeyDown={(e) => onSlotKeyDown(e, slotIdx)}
      aria-label={filled ? `Casilla ${slotIdx + 1}: ${filled}` : `Casilla ${slotIdx + 1}: vacía`}
      className={`lesson-focus-ring min-w-18 min-h-18 w-18 h-18 flex items-center justify-center rounded-2xl border-2 text-2xl font-black transition-all ${
        checkResult === "ok"
          ? "game-correct-glow border-[#2F7D4A] text-[#1D5631]"
          : checkResult === "wrong"
            ? "game-wrong-nudge border-[#C2413A] text-[#8E2620]"
            : isOver
              ? "border-dashed border-[#F2B632] bg-[#FFF6D6]/20 text-white"
              : filled
                ? "bg-[#FFFDF8] border-[#D99B1E] text-[#25313A] cursor-pointer shadow-md"
                : "border-dashed border-white/45 bg-white/10 text-white/45"
      }`}
    >
      {filled ?? "_"}
    </div>
  );
}
