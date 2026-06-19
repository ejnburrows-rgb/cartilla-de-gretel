import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { playNote, playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { recordEvent } from "@/lib/student-session";
import { RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";

export interface DragSyllableWord {
  word: string;
  emoji?: string;
}

interface DragSyllableOrderProps {
  words: DragSyllableWord[];
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

// Spanish syllable splitter
function splitIntoSyllables(word: string): string[] {
  const lowercase = word.toLowerCase().trim();
  const dict: Record<string, string[]> = {
    mamá: ["ma", "má"],
    papá: ["pa", "pá"],
    nene: ["ne", "ne"],
    sapo: ["sa", "po"],
    pelota: ["pe", "lo", "ta"],
    mesa: ["me", "sa"],
    mimo: ["mi", "mo"],
    puma: ["pu", "ma"],
    lupa: ["lu", "pa"],
    sopa: ["so", "pa"],
    taza: ["ta", "za"],
    gato: ["ga", "to"],
    perro: ["pe", "rro"],
    casa: ["ca", "sa"],
    rosa: ["ro", "sa"],
    tapa: ["ta", "pa"],
    pelo: ["pe", "lo"],
    mapa: ["ma", "pa"],
    pipa: ["pi", "pa"],
    pomo: ["po", "mo"],
    mula: ["mu", "la"],
    sala: ["sa", "la"],
    loma: ["lo", "ma"],
    pila: ["pi", "la"],
    lima: ["li", "ma"],
    paloma: ["pa", "lo", "ma"],
    pala: ["pa", "la"],
    solo: ["so", "lo"],
    sola: ["so", "la"],
    lila: ["li", "la"],
    malo: ["ma", "lo"],
    misa: ["mi", "sa"],
    peso: ["pe", "so"],
    piso: ["pi", "so"],
    paso: ["pa", "so"],
    suma: ["su", "ma"],
    asno: ["as", "no"],
    isla: ["is", "la"],
    susto: ["sus", "to"],
    pasta: ["pas", "ta"],
    pista: ["pis", "ta"],
  };

  if (dict[lowercase]) {
    // Keep case
    const sy = dict[lowercase];
    let charIdx = 0;
    return sy.map((s) => {
      const part = word.substring(charIdx, charIdx + s.length);
      charIdx += s.length;
      return part;
    });
  }

  // Basic Spanish split rules (CV / CVC)
  const vowels = "aeiouáéíóúüAEIOUÁÉÍÓÚÜ";
  const syllables: string[] = [];
  let current = "";

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const nextChar = word[i + 1];
    const nextNextChar = word[i + 2];

    current += char;

    const isVowel = vowels.includes(char);
    const isNextVowel = nextChar ? vowels.includes(nextChar) : false;

    if (isVowel && nextChar && !isNextVowel) {
      const isNextNextVowel = nextNextChar ? vowels.includes(nextNextChar) : false;
      const isDoubleConsonant =
        nextChar &&
        nextNextChar &&
        (("rl".includes(nextChar) && "bcdfghjklmnpqrstvwxyz".includes(nextNextChar)) ||
          "rr ll ch".includes(nextChar + nextNextChar));

      if (nextNextChar && !isNextNextVowel && !isDoubleConsonant) {
        current += nextChar;
        syllables.push(current);
        current = "";
        i++;
      } else {
        syllables.push(current);
        current = "";
      }
    }
  }

  if (current) {
    syllables.push(current);
  }

  return syllables;
}

interface SyllableItem {
  id: string;
  text: string;
}

export function DragSyllableOrder({ words, lessonId, color = "#f97316", onComplete }: DragSyllableOrderProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [items, setItems] = useState<SyllableItem[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentWordData = words[wordIdx % words.length];
  const targetWord = currentWordData?.word || "";
  const targetSyllables = splitIntoSyllables(targetWord);

  const initWord = useCallback((word: string) => {
    const syllables = splitIntoSyllables(word);
    
    // Scramble until they don't match the target order
    let scrambled = shuffle(syllables);
    if (syllables.length > 1) {
      while (scrambled.join("") === word) {
        scrambled = shuffle(syllables);
      }
    }

    const syllableItems = scrambled.map((text, idx) => ({
      id: `syl-${idx}-${text}`,
      text,
    }));

    setItems(syllableItems);
    setIsCorrect(false);
  }, []);

  useEffect(() => {
    if (targetWord) {
      initWord(targetWord);
    }
  }, [targetWord, initWord]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        const currentSpelling = newItems.map((item) => item.text).join("");
        if (currentSpelling.toLowerCase() === targetWord.toLowerCase()) {
          setIsCorrect(true);
          playCorrectChord();
          window.dispatchEvent(
            new CustomEvent("gretel:celebrate", {
              detail: { text: `¡Fantástico! Formaste la palabra: ${targetWord}` },
            })
          );
        } else {
          // Play a intermediate movement note
          playNote(329.63, 0.1); // Short E note
        }
        return newItems;
      });
      setAttempts((a) => a + 1);
    }
  };

  const handleNext = () => {
    if (wordIdx < words.length - 1) {
      setWordIdx((prev) => prev + 1);
    } else {
      // Game fully completed
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: attempts,
          meta: { exercise: "drag_syllable_order", completed: true },
        });
      }
      onComplete?.();
    }
  };

  const restartGame = () => {
    setWordIdx(0);
    setAttempts(0);
    if (words[0]) initWord(words[0].word);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-5 bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/40">
        <div>
          <h3 className="text-lg font-black text-stone-800">Ordenar Sílabas</h3>
          <p className="text-xs font-bold text-stone-500">
            Ordena las sílabas arrastrándolas para formar la palabra correcta.
          </p>
        </div>
        <button
          onClick={restartGame}
          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-all shadow-sm"
          title="Reiniciar Juego"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {/* Emoji Picture */}
        {currentWordData?.emoji && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-white/80 rounded-2xl border border-stone-200/60 flex items-center justify-center text-5xl shadow-sm select-none"
          >
            {currentWordData.emoji}
          </motion.div>
        )}

        {/* Sortable Area */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 items-center justify-center p-4 bg-stone-50/50 border border-stone-200/40 rounded-2xl min-w-[280px]">
              {items.map((item) => (
                <SortableSyllableTile key={item.id} id={item.id} text={item.text} isCorrect={isCorrect} color={color} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Action panel */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>¡Palabra completa! {targetWord}</span>
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-white font-black rounded-xl text-sm shadow-md transition-all hover:brightness-105 active:scale-95"
              style={{ backgroundColor: color }}
            >
              {wordIdx < words.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                "Finalizar"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sortable tile component
function SortableSyllableTile({
  id,
  text,
  isCorrect,
  color,
}: {
  id: string;
  text: string;
  isCorrect: boolean;
  color: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        animate={
          isCorrect
            ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0px rgba(16,185,129,0)",
                  "0 0 15px rgba(245,158,11,0.5)",
                  "0 0 15px rgba(59,130,246,0.5)",
                  "0 0 15px rgba(236,72,153,0.5)",
                  "0 0 15px rgba(16,185,129,0.5)",
                  "0 0 0px rgba(16,185,129,0)",
                ],
              }
            : {}
        }
        transition={{
          repeat: isCorrect ? Infinity : 0,
          duration: 2,
        }}
        className={`px-6 py-4 rounded-xl border-2 text-2xl font-black select-none cursor-grab active:cursor-grabbing text-stone-800 transition-all ${
          isCorrect
            ? "bg-emerald-500 border-emerald-600 text-white"
            : isDragging
            ? "bg-white border-dashed shadow-lg scale-105 z-50"
            : "bg-white border-stone-200 hover:border-stone-400 hover:scale-[1.02]"
        }`}
        style={{
          borderColor: isDragging ? color : isCorrect ? undefined : undefined,
          color: isCorrect ? "#ffffff" : undefined,
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}
