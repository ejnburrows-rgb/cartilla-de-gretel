import { useState, useRef, useEffect, useMemo, type CSSProperties, type PointerEvent } from "react";
import { Volume2, RotateCcw, Search, Check, HandPointer } from "lucide-react";
import { speak } from "@/lib/speak";
import { feelBus } from "@/lib/feel-bus";
import { recordEvent } from "@/lib/student-session";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { cn } from "@/lib/utils";
import { ColorizedDrawing } from "./ColorizedDrawing";

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

const successMessageClass = "text-base font-bold text-success flex items-center gap-1.5";
const drawingGridClass = "grid w-full max-w-sm grid-cols-3 gap-3 sm:max-w-md";
const cuePillClass = "mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/12 px-4 py-2 text-xs font-black uppercase tracking-wide text-warning-foreground shadow-sm";

export function DragWordReveal({ entry, accent, lessonId, onComplete }: DragWordRevealProps) {
  const gameWords = useMemo<RevealWord[]>(() => {
    if (entry.kind === "vowel") {
      const v = entry.vowel.toLowerCase();
      if (v === "a") {
        return [
          { word: "ala", distractors: ["oso", "uvas"] },
          { word: "árbol", distractors: ["espejo", "iglú"] },
        ];
      }
      if (v === "o") {
        return [
          { word: "oso", distractors: ["ala", "uvas"] },
          { word: "ojo", distractors: ["iglú", "estrella"] },
        ];
      }
      if (v === "e") {
        return [
          { word: "elefante", distractors: ["oso", "abeja"] },
          { word: "estrella", distractors: ["espejo", "escoba"] },
        ];
      }
      if (v === "i") {
        return [
          { word: "isla", distractors: ["árbol", "uvas"] },
          { word: "iguana", distractors: ["elefante", "oso"] },
        ];
      }
      if (v === "u") {
        return [
          { word: "uvas", distractors: ["árbol", "oso"] },
          { word: "uno", distractors: ["espejo", "iglú"] },
        ];
      }
    }
    if (entry.kind === "consonant") {
      const examples = Object.values(entry.data.examples).flat();
      const first = examples[0] ?? "sol";
      const second = examples[1] ?? "sal";
      return [
        { word: first, distractors: ["oso", "uvas"] },
        { word: second, distractors: ["mesa", "mono"] },
      ];
    }
    return [
      { word: "ala", distractors: ["oso", "uvas"] },
      { word: "oso", distractors: ["ala", "uvas"] },
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

  useEffect(() => {
    setRevealed(Array(currentItem.word.length).fill(false));
    setSelectedWord(null);
    setWrongSelection(null);
    setSuccess(false);
    setAttempts(0);
  }, [currentItem]);

  const wordChoices = useMemo(() => {
    const list = [currentItem.word, ...currentItem.distractors];
    return list.sort();
  }, [currentItem]);

  const isWordFullyRevealed = revealed.every((r) => r);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLensDragging(true);
    feelBus.emit("drag-pick");
    updateLensPosition(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
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

  const updateLensPosition = (e: PointerEvent<HTMLDivElement>) => {
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
      const padding = 20;
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
        feelBus.emit("tap");
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

  const containerStyle: CSSProperties = useMemo(() => ({
    "--accent-color": accent,
  } as CSSProperties), [accent]);

  const lensStyle: CSSProperties = useMemo(() => ({
    borderColor: accent,
    left: isLensDragging ? `${lensPos.x - 32}px` : "calc(50% - 32px)",
    top: isLensDragging ? `${lensPos.y - 32}px` : "160px",
  }), [accent, isLensDragging, lensPos.x, lensPos.y]);

  const nextBtnStyle: CSSProperties = useMemo(() => ({
    backgroundColor: accent,
  }), [accent]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[2rem] border-2 border-foreground/10 bg-[linear-gradient(180deg,#fffdf8,#fff8ed)] p-5 shadow-xl shadow-primary/8 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={containerStyle}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-warning/12 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-warning">
            Presione aquí y arrastre
          </p>
          <h3 className="mt-1 flex items-center gap-1.5 font-bold text-base text-foreground font-fredoka">
            <Search className="w-4 h-4 text-primary" /> Lupa Mágica: ¡Revela la palabra!
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => speak(currentItem.word)}
            aria-label="Escuchar palabra"
            className="tap-target rounded-2xl border-2 border-foreground/10 bg-white/75 p-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reiniciar palabra"
            className="tap-target rounded-2xl border-2 border-foreground/10 bg-white/75 p-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={cuePillClass}>
        <HandPointer className="h-3.5 w-3.5" />
        Arrastra la lupa sobre cada casilla.
      </div>

      <div className="relative z-10 flex justify-center gap-3 mb-8">
        {currentItem.word.split("").map((letter, idx) => {
          const letterStyle: CSSProperties = {
            borderColor: revealed[idx] ? accent : "rgba(28, 25, 23, 0.12)",
            color: revealed[idx] ? accent : "transparent",
          };
          return (
            <div
              key={idx}
              ref={(el) => {
                letterRefs.current[idx] = el;
              }}
              className={cn(
                "flex h-14 w-12 items-center justify-center rounded-2xl border-3 text-2xl font-black shadow-sm transition-all duration-300",
                revealed[idx]
                  ? "scale-105 bg-white shadow-lg"
                  : "border-dashed bg-white/58 text-transparent"
              )}
              style={letterStyle}
            >
              {revealed[idx] ? letter : "?"}
            </div>
          );
        })}
      </div>

      {!isWordFullyRevealed && (
        <div
          onPointerDown={handlePointerDown}
          className="absolute z-20 flex h-16 w-16 cursor-grab items-center justify-center rounded-full border-4 bg-white/40 shadow-2xl backdrop-blur-md transition-transform active:scale-105 active:cursor-grabbing"
          style={lensStyle}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/60">
            <Search className="w-5 h-5 text-foreground/80" />
          </div>
        </div>
      )}

      {isWordFullyRevealed && (
        <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-center text-sm font-black text-success">
            <Check className="w-4 h-4" /> ¡Palabra revelada! Presione aquí y elige su dibujo:
          </div>

          <div className={drawingGridClass}>
            {wordChoices.map((choiceWord, idx) => {
              const isWrong = wrongSelection === choiceWord;
              const isSelected = selectedWord === choiceWord;

              const choiceBtnStyle: CSSProperties = {
                borderColor: isSelected ? "hsl(var(--success))" : isWrong ? "hsl(var(--destructive))" : "rgba(28, 25, 23, 0.1)",
              };

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(choiceWord)}
                  disabled={success}
                  className={cn(
                    "h-28 rounded-[1.35rem] border-2 bg-white/80 p-1.5 shadow-lg shadow-primary/8 transition duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 disabled:cursor-default",
                    isWrong && "border-destructive bg-destructive/10 animate-shake",
                    isSelected && "border-success bg-success/10 scale-105"
                  )}
                  style={choiceBtnStyle}
                  aria-label={`Dibujo de ${choiceWord}`}
                >
                  <ColorizedDrawing word={choiceWord} selected={isSelected} muted={success && !isSelected} />
                </button>
              );
            })}
          </div>

          {success && (
            <div className="mt-4 flex flex-col items-center">
              <div className={successMessageClass}>
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
