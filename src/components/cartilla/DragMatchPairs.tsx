import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { playNote, playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { recordEvent } from "@/lib/student-session";
import { RotateCcw } from "lucide-react";
import "@/styles/interactive-exercises.css";

export interface Pair {
  word: string;
  emoji: string;
  illustrationSrc?: string;
}

interface DragMatchPairsProps {
  pairs: Pair[];
  lessonId?: string;
  color?: string;
  onComplete?: () => void;
}

// Simple shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DragMatchPairs({ pairs, lessonId, color = "#f97316", onComplete }: DragMatchPairsProps) {
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [shuffledEmojis, setShuffledEmojis] = useState<Pair[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // word -> emoji
  const [wrongMatch, setWrongMatch] = useState<{ word: string; emoji: string } | null>(null);
  const [attempts, setAttempts] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } })
  );

  // Initialize and shuffle
  const resetGame = useCallback(() => {
    setShuffledWords(shuffle(pairs.map((p) => p.word)));
    setShuffledEmojis(shuffle([...pairs]));
    setMatches({});
    setWrongMatch(null);
    setAttempts(0);
  }, [pairs]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Handle successful match completion
  useEffect(() => {
    if (pairs.length > 0 && Object.keys(matches).length === pairs.length) {
      playCorrectChord();
      window.dispatchEvent(
        new CustomEvent("gretel:celebrate", {
          detail: { text: "¡Excelente! Has emparejado todo correctamente." },
        })
      );
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: attempts,
          meta: { exercise: "drag_match_pairs", completed: true },
        });
      }
      onComplete?.();
    }
  }, [matches, pairs, attempts, lessonId, onComplete]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeWord = active.data.current?.word as string;
    const overEmoji = over.data.current?.emoji as string;

    if (!activeWord || !overEmoji) return;

    // Check if correct
    const targetPair = pairs.find((p) => p.word === activeWord);
    const isCorrect = targetPair?.emoji === overEmoji;

    if (isCorrect) {
      setMatches((prev) => ({ ...prev, [activeWord]: overEmoji }));
      playNote(392.0, 0.4); // Play G note
      setAttempts((a) => a + 1);
    } else {
      setWrongMatch({ word: activeWord, emoji: overEmoji });
      playWrongBuzz();
      setAttempts((a) => a + 1);
      setTimeout(() => {
        setWrongMatch(null);
      }, 600);
    }
  };

  const isCompleted = Object.keys(matches).length === pairs.length;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/40">
        <div>
          <h3 className="text-lg font-black text-stone-800">Emparejar Palabras</h3>
          <p className="text-xs font-bold text-stone-500">Arrastra la palabra hasta su dibujo correspondiente.</p>
        </div>
        <button
          onClick={resetGame}
          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-all shadow-sm"
          title="Reiniciar Juego"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-8 items-start">
          {/* Left Column: Words */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-wider text-stone-400 uppercase text-center">Palabras</h4>
            <div className="space-y-3">
              {shuffledWords.map((word) => {
                const isMatched = !!matches[word];
                return (
                  <DraggableWordCard
                    key={word}
                    word={word}
                    isMatched={isMatched}
                    color={color}
                    isWrong={wrongMatch?.word === word}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Emojis */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-wider text-stone-400 uppercase text-center">Dibujos</h4>
            <div className="space-y-3">
              {shuffledEmojis.map((pair, i) => {
                // Find if a word has matched this emoji
                const matchedWord = Object.keys(matches).find((k) => matches[k] === pair.emoji);
                return (
                  <DroppableEmojiCard
                    key={pair.emoji}
                    pair={pair}
                    matchedWord={matchedWord}
                    color={color}
                    isWrong={wrongMatch?.emoji === pair.emoji}
                    floatDelay={((i * 37) % 47) / 10}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center"
        >
          <span className="text-sm font-black text-emerald-800">¡Completado con éxito! 🎉</span>
        </motion.div>
      )}
    </div>
  );
}

// Draggable word card component
function DraggableWordCard({ word, isMatched, color, isWrong }: { word: string; isMatched: boolean; color: string; isWrong: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `word-${word}`,
    data: { word },
    disabled: isMatched,
  });

  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="relative select-none">
      <motion.div
        animate={isWrong ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`px-4 py-4 rounded-xl border-2 text-center font-black text-base cursor-grab active:cursor-grabbing transition-all ${
          isMatched
            ? "bg-stone-100 border-stone-200 text-stone-300 pointer-events-none line-through"
            : isDragging
            ? "shadow-lg scale-105 z-50 border-dashed"
            : "bg-white shadow-sm border-stone-200 hover:border-stone-400 hover:scale-[1.02]"
        }`}
        style={{
          borderColor: isDragging ? color : undefined,
          color: !isMatched && !isDragging ? "#292524" : undefined,
        }}
      >
        {word}
      </motion.div>
    </div>
  );
}

// Droppable emoji target card component
function DroppableEmojiCard({
  pair,
  matchedWord,
  color,
  isWrong,
  floatDelay = 0,
}: {
  pair: Pair;
  matchedWord?: string;
  color: string;
  isWrong: boolean;
  floatDelay?: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `target-${pair.emoji}`,
    data: { emoji: pair.emoji },
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 transition-all min-h-[72px] ${
        matchedWord
          ? "bg-emerald-50/50 border-emerald-500 shadow-sm"
          : isOver
          ? "bg-stone-50 border-dashed"
          : "bg-white border-stone-200 shadow-sm"
      }`}
      style={{
        borderColor: isOver ? color : matchedWord ? undefined : undefined,
        boxShadow: isOver ? `0 0 12px ${color}22` : undefined,
      }}
    >
      {/* Picture display */}
      {pair.illustrationSrc ? (
        <img
          src={pair.illustrationSrc}
          alt={pair.word}
          className="w-10 h-10 object-contain select-none game-pic-float"
          style={{ ["--float-delay" as string]: `${floatDelay}s` }}
          loading="lazy"
        />
      ) : (
        <span className="text-3xl select-none" role="img" aria-label="dibujo">
          {pair.emoji}
        </span>
      )}

      {/* Drop slot zone */}
      <div className="flex-1 max-w-[150px]">
        <AnimatePresence mode="wait">
          {matchedWord ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="px-3 py-2 bg-emerald-500 text-white rounded-lg font-black text-sm text-center shadow-sm select-none"
            >
              {matchedWord}
            </motion.div>
          ) : (
            <motion.div
              animate={isWrong ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              className={`py-2 px-3 rounded-lg border-2 border-dashed text-center text-xs font-bold select-none ${
                isWrong
                  ? "bg-rose-50 border-rose-300 text-rose-500"
                  : isOver
                  ? "bg-stone-50 border-stone-400 text-stone-600"
                  : "bg-stone-50/50 border-stone-200 text-stone-400"
              }`}
            >
              Soltar aquí
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
