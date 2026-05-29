import { useState, useRef, useEffect, useMemo } from "react";
import { Volume2, RotateCcw, Search, Check } from "lucide-react";
import { speak } from "@/lib/speak";
import { feelBus } from "@/lib/feel-bus";
import { recordEvent } from "@/lib/student-session";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { cn } from "@/lib/utils";
import { MonochromeDrawing } from "./MonochromeDrawings";

interface DragWordRevealProps {
  entry: CatalogEntry;
  accent: string;
  lessonId?: string;
  onComplete?: () => void;
}

type RevealWord = {
  word: string;
  distractors: string[];
};

export function DragWordReveal({ entry, accent, lessonId, onComplete }: DragWordRevealProps) {
  // Generate vocabulary words based on current lesson
  const gameWords = useMemo<RevealWord[]>(() => {
    if (entry.kind === "vowel") {
      const v = entry.vowel.toLowerCase();
      if (v === "a") {
        return [
          { word: "ala", distractors: ["oso", "uvas"] },
          { word: "árbol", distractors: ["espejo", "iglú"] }
        ];
      }
      if (v === "o") {
        return [
          { word: "oso", distractors: ["ala", "uvas"] },
          { word: "ojo", distractors: ["iglú", "estrella"] }
        ];
      }
      if (v === "e") {
        return [
          { word: "elefante", distractors: ["oso", "abeja"] },
          { word: "estrella", distractors: ["espejo", "escoba"] }
        ];
      }
      if (v === "i") {
        return [
          { word: "isla", distractors: ["árbol", "uvas"] },
          { word: "iguana", distractors: ["elefante", "oso"] }
        ];
      }
      if (v === "u") {
        return [
          { word: "uvas", distractors: ["árbol", "oso"] },
          { word: "uno", distractors: ["espejo", "iglú"] }
        ];
      }
    }
    if (entry.kind === "consonant") {
      const examples = Object.values(entry.data.examples).flat();
      const first = examples[0] ?? "sol";
      const second = examples[1] ?? "sal";
      return [
        { word: first, distractors: ["oso", "uvas"] },
        { word: second, distractors: ["mesa", "mono"] }
      ];
    }
    return [
      { word: "ala", distractors: ["oso", "uvas"] },
      { word: "oso", distractors: ["ala", "uvas"] }
    ];
  }, [entry]);

  const [wordIdx, setWordIdx] = useState(0);
  const currentItem = gameWords[wordIdx % gameWords.length] ?? gameWords[0];

  const [revealed, setRevealed] = useState<boolean[]>(() =>
    Array(currentItem.word.length).fill(false)
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongSelection, setWrongSelection] = useState<string | null>(null);
  const [isLensDragging, setIsLensDragging] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Re-initialize state when moving to a new word
  useEffect(() => {
    setRevealed(Array(currentItem.word.length).fill(false));
    setSelectedWord(null);
    setWrongSelection(null);
    setSuccess(false);
    setAttempts(0);
  }, [currentItem]);

  // Merge target word and distractors in shuffled order
  const wordChoices = useMemo(() => {
    const list = [currentItem.word, ...currentItem.distractors];
    return list.sort();
  }, [currentItem]);

  const isWordFullyRevealed = revealed.every((r) => r);

  // Drag handlers for magnifying glass
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsLensDragging(true);
    feelBus.emit("drag-pick");
    updateLensPosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isLensDragging) return;
    updateLensPosition(e);
    checkLetterCollisions(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isLensDragging) {
      setIsLensDragging(false);
      feelBus.emit("drag-drop");
    }
  };

  const updateLensPosition = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLensPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const checkLetterCollisions = (pointerX: number, pointerY: number) => {
    letterRefs.current.forEach((ref, idx) => {
      if (!ref || revealed[idx]) return;
      const rect = ref.getBoundingClientRect();
      const padding = 20; // larger scan radius
      if (
        pointerX >= rect.left - padding &&
        pointerX <= rect.right + padding &&
        pointerY >= rect.top - padding &&
        pointerY <= rect.bottom + padding
      ) {
        setRevealed((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
        feelBus.emit("tap"); // light click as letters reveal
      }
    });
  };

  const handleWordClick = (choiceWord: string) => {
    if (!isWordFullyRevealed || success) return;
    setAttempts((a) => a + 1);

    if (choiceWord === currentItem.word) {
      setSelectedWord(choiceWord);
      setSuccess(true);
      speak(currentItem.word);
      feelBus.emit("success");

      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: attempts + 1,
          meta: { exercise: "drag_word_reveal", word: currentItem.word, completed: true },
        });
      }

      if (wordIdx === gameWords.length - 1 && onComplete) {
        setTimeout(onComplete, 1600);
      }
    } else {
      setWrongSelection(choiceWord);
      feelBus.emit("error");
      setTimeout(() => setWrongSelection(null), 800);
    }
  };

  const handleNextWord = () => {
    setWordIdx((prev) => (prev + 1) % gameWords.length);
  };

  const handleReset = () => {
    setRevealed(Array(currentItem.word.length).fill(false));
    setSelectedWord(null);
    setWrongSelection(null);
    setSuccess(false);
    setAttempts(0);
    feelBus.emit("tap");
  };

  // Hoisted styles for strict JSX double-brace styling compliance
  const containerStyle: React.CSSProperties = useMemo(() => ({
    "--accent-color": accent
  } as React.CSSProperties), [accent]);

  const lensStyle: React.CSSProperties = useMemo(() => ({
    borderColor: accent,
    left: isLensDragging ? `${lensPos.x - 32}px` : "calc(50% - 32px)",
    top: isLensDragging ? `${lensPos.y - 32}px` : "160px",
  }), [accent, isLensDragging, lensPos.x, lensPos.y]);

  const nextBtnStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: accent
  }), [accent]);

  return (
    <div
      ref={containerRef}
      className="p-5 rounded-3xl border-2 border-foreground/10 bg-card select-none relative overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={containerStyle}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-foreground font-fredoka flex items-center gap-1.5">
          <Search className="w-4 h-4 text-primary" /> Lupa Mágica: ¡Revela la palabra!
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => speak(currentItem.word)}
            aria-label="Escuchar palabra"
            className="p-1.5 rounded-xl border-2 border-foreground/10 hover:bg-secondary transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reiniciar palabra"
            className="p-1.5 rounded-xl border-2 border-foreground/10 hover:bg-secondary transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-foreground/60 mb-6 text-center">
        Arrastra la lupa sobre las casillas para revelar las letras mágicas, luego escoge el dibujo.
      </p>

      {/* Target Word Letters Grid */}
      <div className="flex justify-center gap-3 mb-8">
        {currentItem.word.split("").map((letter, idx) => {
          const letterStyle: React.CSSProperties = {
            borderColor: revealed[idx] ? accent : "transparent",
            color: revealed[idx] ? accent : undefined,
          };
          return (
            <div
              key={idx}
              ref={(el) => {
                letterRefs.current[idx] = el;
              }}
              className={cn(
                "w-12 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl border-3 transition-all duration-300",
                revealed[idx]
                  ? "bg-white dark:bg-neutral-800 scale-100 shadow-md"
                  : "bg-secondary/40 border-dashed border-foreground/20 text-transparent"
              )}
              style={letterStyle}
            >
              {revealed[idx] ? letter : "?"}
            </div>
          );
        })}
      </div>

      {/* Interactive Magnifying Glass Lens */}
      {!isWordFullyRevealed && (
        <div
          onPointerDown={handlePointerDown}
          className="absolute cursor-grab active:cursor-grabbing w-16 h-16 rounded-full border-4 flex items-center justify-center bg-white/20 backdrop-blur-sm z-20 shadow-lg active:scale-105 transition-transform"
          style={lensStyle}
        >
          <div className="w-10 h-10 rounded-full bg-white/40 border border-white/50 flex items-center justify-center">
            <Search className="w-5 h-5 text-foreground/80" />
          </div>
        </div>
      )}

      {/* Drawing Match Panel */}
      {isWordFullyRevealed && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-center font-bold text-success text-sm flex items-center gap-1 mb-2">
            <Check className="w-4 h-4" /> ¡Palabra revelada! Lee y elige su dibujo:
          </div>

          <div className="flex justify-center gap-4">
            {wordChoices.map((choiceWord, idx) => {
              const isWrong = wrongSelection === choiceWord;
              const isSelected = selectedWord === choiceWord;

              const choiceBtnStyle: React.CSSProperties = {
                borderColor: isSelected ? "var(--success)" : isWrong ? "var(--destructive)" : undefined,
              };

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(choiceWord)}
                  disabled={success}
                  className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center border-4 bg-secondary/20 hover:bg-secondary/40 transition active:scale-95 duration-200 p-2.5",
                    isWrong && "border-destructive bg-destructive/10 animate-shake",
                    isSelected && "border-success bg-success/10 scale-105"
                  )}
                  style={choiceBtnStyle}
                  aria-label={`Dibujo de ${choiceWord}`}
                >
                  <MonochromeDrawing word={choiceWord} size={48} />
                </button>
              );
            })}
          </div>

          {success && (
            <div className="mt-4 flex flex-col items-center">
<div className="text-base font-bold text-success flex items-center gap-1.5">
                 ¡Fantástico! Es <strong>«{currentItem.word}»</strong>.
               </div>
              {wordIdx < gameWords.length - 1 && (
                <button
                  onClick={handleNextWord}
                  className="mt-3 px-5 py-2.5 rounded-2xl font-bold text-sm text-white transition hover:-translate-y-0.5 active:scale-95"
                  style={nextBtnStyle}
                >
                  Siguiente Palabra →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
