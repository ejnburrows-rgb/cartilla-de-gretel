// PayasoChano.tsx — Full Big-Top Circus Theater for Juego Payaso Chano.
// Drag syllable tiles onto Chano's chalkboard easel to build the word,
// then check with the sombrilla lever or reset with the brass spring.
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
import { Star, Trophy, Sparkles } from "lucide-react";
import { recordEvent } from "@/lib/student-session";
import { playWord } from "@/lib/games/wordAudio";
import { useGameReactions } from "./useGameReactions";
import { GretelFeedback } from "@/components/cartilla/GretelFeedback";
import type { GameContent } from "@/lib/games/gameContent";
import "@/styles/payaso-chano.css";

const CHANO_ART = "/cartilla/art/payaso-chano/";
const CHANO_IMG = `${CHANO_ART}chano.png`;
const JUGGLE_BALL_IMG = `${CHANO_ART}juggling-ball.png`;
const HORN_IMG = `${CHANO_ART}horn.png`;
const SOMBRILLA_IMG = `${CHANO_ART}sombrilla.png`;
const CHANO_MINI_IMG = `${CHANO_ART}chano-mini.png`;

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
  const [showFinaleModal, setShowFinaleModal] = useState(false);

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
          setShowFinaleModal(true);
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
    <div className="chano-theater-root" role="main" aria-label="Teatro del Payaso Chano">
      {/* 1. Circus Tent Canopy Arch */}
      <header className="chano-tent-canopy">
        <div className="chano-marquee-plaque">
          <Sparkles className="w-5 h-5 text-[#B87B14]" aria-hidden />
          <h3 className="chano-marquee-title">Juego Payaso Chano</h3>
        </div>
        <div className="chano-counter-badge" aria-live="polite">
          Palabra {wordIdx + 1} de {content.words.length}
        </div>
        <div className="chano-canopy-valance" aria-hidden />
      </header>

      {/* 2. Main Stage Arena */}
      <div className="chano-stage-arena">
        {/* Left Column: Chano Performer Pod with Floor Shadows and Juggling Cascade */}
        <div className="chano-performer-pod" aria-label="Chano el payaso maestro en escena">
          <div className="chano-spotlight-cone" aria-hidden />

          {/* Juggling Balls & Moving Floor Shadows */}
          <div className="chano-juggle-orbit" aria-hidden>
            <img src={JUGGLE_BALL_IMG} alt="" className="chano-juggle-ball chano-ball-1" />
            <img src={JUGGLE_BALL_IMG} alt="" className="chano-juggle-ball chano-ball-2" />
            <img src={JUGGLE_BALL_IMG} alt="" className="chano-juggle-ball chano-ball-3" />
          </div>

          <div className="chano-juggle-shadow chano-ball-shadow-1" aria-hidden />
          <div className="chano-juggle-shadow chano-ball-shadow-2" aria-hidden />
          <div className="chano-juggle-shadow chano-ball-shadow-3" aria-hidden />

          {/* Ground Contact Floor Shadow under Chano */}
          <div className="chano-floor-shadow" aria-hidden />

          {/* Illustrated Clown Performer */}
          <div className="chano-figure-wrap">
            <img
              src={CHANO_IMG}
              alt="Chano el payaso maestro"
              className={`chano-figure-img ${
                state.checkResult === "ok" ? "laughing" : state.checkResult === "wrong" ? "wrong" : ""
              }`}
            />
          </div>
        </div>

        {/* Right Column: Chalkboard Easel, Syllable Tray & Theatrical Feedback */}
        <div className="chano-easel-container">
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            {/* Chano's Chalkboard Easel */}
            <div
              className="chano-chalkboard"
              role="group"
              aria-label="Pizarra de Chano: casillas de la palabra"
            >
              <div className="chano-word-label">¡Forma la palabra!</div>

              <div className="chano-slots-row">
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
            </div>

            {/* Prop Chest Tray with Wooden Syllable Blocks */}
            <div className="chano-prop-chest" role="group" aria-label="Sílabas disponibles">
              <div className="flex items-center justify-between px-2 text-xs font-black tracking-wider text-[#F2D796] uppercase">
                <span>Cofre de sílabas</span>
                <span className="opacity-75">Toca o arrastra a la pizarra</span>
              </div>
              <div className="chano-chest-inner">
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
            </div>
          </DndContext>

          {/* Keyboard Selection Helper */}
          {selectedTray !== null && (
            <p className="text-sm font-bold text-[#F2D796] text-center" aria-live="polite">
              Sílaba «{state.tray[selectedTray]}» seleccionada — pulsa Enter/Espacio en una casilla
            </p>
          )}

          {/* Theatrical Feedback Banners */}
          {state.checkResult === "ok" && (
            <div role="status" className="chano-feedback-toast chano-feedback-correct">
              <Star className="h-6 w-6 fill-[#F2B632] text-[#B87E14]" aria-hidden />
              <span>¡Excelente! Palabra «{word.word}» completa.</span>
            </div>
          )}

          {state.checkResult === "wrong" && (
            <div role="status" className="chano-feedback-toast chano-feedback-wrong">
              <span>Casi — intenta ordenar las sílabas de nuevo.</span>
            </div>
          )}

          <GretelFeedback state={reactions.feedback} onRetry={reactions.clear} />
        </div>
      </div>

      {/* 3. Brass Controls & Physical Props Switchboard along Stage Apron */}
      <footer className="chano-brass-switchboard">
        {/* Listen Audio Prop */}
        <button
          type="button"
          onClick={() => playWord(word.audioUrl)}
          aria-label={`Escuchar la palabra "${word.word}"`}
          className="chano-prop-lever chano-lever-audio lesson-focus-ring"
        >
          <img src={HORN_IMG} alt="" className="chano-prop-icon" />
          <span>Escuchar</span>
        </button>

        {/* Sombrilla Check Prop */}
        <button
          type="button"
          onClick={check}
          disabled={!allFilled || state.completed || state.checkResult !== null}
          aria-label="Sombrilla: comprobar la palabra"
          className="chano-prop-lever chano-lever-umbrella lesson-focus-ring"
        >
          <img src={SOMBRILLA_IMG} alt="" className="chano-prop-icon" />
          <span>Comprobar</span>
        </button>

        {/* Resorte Reset Prop */}
        <button
          type="button"
          onClick={resetTiles}
          aria-label="Resorte: colocar las sílabas en su lugar otra vez"
          className="chano-prop-lever chano-lever-spring lesson-focus-ring"
        >
          <svg className="chano-prop-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path
              d="M9 12 C37 3 38 18 11 23 C-1 28 40 14 37 28 C35 39 19 38 12 41"
              stroke="#BD391D"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path d="M6 11 L14 10 M9 7 L9 15" stroke="#F6D447" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span>Reiniciar</span>
        </button>

        {/* Next with Chano Prop */}
        <button
          type="button"
          onClick={nextWord}
          aria-label="Chano: escuchar la próxima palabra"
          className="chano-prop-lever chano-lever-next lesson-focus-ring"
        >
          <img src={CHANO_MINI_IMG} alt="" className="chano-prop-icon" />
          <span>Siguiente con Chano</span>
        </button>
      </footer>

      {/* 4. Glowing Brass Footlights Apron */}
      <div className="chano-footlights-apron" aria-hidden>
        <div className="chano-footlight" />
        <div className="chano-footlight" />
        <div className="chano-footlight" />
        <div className="chano-footlight" />
        <div className="chano-footlight" />
        <div className="chano-footlight" />
        <div className="chano-footlight" />
      </div>

      {/* Grand Finale Circus Celebration Modal */}
      {showFinaleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="¡Función completada!"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="relative max-w-md w-full bg-gradient-to-b from-[#FFFDF8] to-[#F5E6BE] border-4 border-[#B87B14] rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#F2B632] border-2 border-[#B87B14] flex items-center justify-center text-[#421F06] shadow-lg">
              <Trophy className="w-9 h-9" aria-hidden />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#25313A] font-serif">
              ¡Gran Función Circense!
            </h3>
            <p className="text-base font-bold text-[#421F06]/85">
              Has armado todas las palabras con Chano el payaso maestro. ¡El público aplaude de pie!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowFinaleModal(false);
                  nextWord();
                }}
                className="lesson-focus-ring min-h-14 px-6 py-3 rounded-2xl bg-[#167A72] text-white font-black shadow-[0_4px_0_#0E524D] hover:brightness-105 active:translate-y-1 active:shadow-none"
              >
                Volver a jugar
              </button>
              <button
                type="button"
                onClick={() => setShowFinaleModal(false)}
                className="lesson-focus-ring min-h-14 px-6 py-3 rounded-2xl bg-[#FFF6D6] border-2 border-[#D99B1E] text-[#25313A] font-black shadow-[0_3px_0_#B87E14] hover:bg-[#FDE79C] active:translate-y-1 active:shadow-none"
              >
                Cerrar telón
              </button>
            </div>
          </div>
        </div>
      )}
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
    opacity: isDragging ? 0.4 : used ? 0.22 : 1,
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
      className={`lesson-focus-ring chano-syllable-block ${selectedTray === trayIdx ? "selected" : ""} ${
        used ? "used" : ""
      }`}
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
      className={`lesson-focus-ring chano-slot-well ${
        checkResult === "ok"
          ? "border-[#2F7D4A] !bg-[#ECF9F0] !text-[#1D5631] shadow-[0_0_20px_rgba(47,125,74,0.4)]"
          : checkResult === "wrong"
            ? "border-[#C2413A] !bg-[#FDF0EF] !text-[#8E2620]"
            : isOver
              ? "over"
              : filled
                ? "filled"
                : ""
      }`}
    >
      {filled ?? "_"}
    </div>
  );
}
