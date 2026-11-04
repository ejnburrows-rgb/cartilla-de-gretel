import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "@/lib/speech-recognition-types";
import { useEffect, useState, useRef, useMemo } from "react";
import { Mic, MicOff, Check, X, RotateCcw, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { gretelEvent } from "@/lib/gretel-bus";
import { CATALOG } from "@/lib/lesson-catalog";

type Word = { word: string; emoji?: string };

// --- 1. Speech Recognition (Microphone) ---
export function SpeechRecognitionExercise({
  targetWord,
  emoji,
  color,
}: {
  targetWord: string;
  emoji?: string;
  color: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    // Check if SpeechRecognition API is available
    const SpeechRecognition = getSpeechRecognitionCtor();

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "es-ES"; // Set to Spanish

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: SpeechRecognitionEventLike) => {
        const current = event.resultIndex;
        const result = event.results[current]?.[0]?.transcript ?? "";
        setTranscript(result);

        // Simple fuzzy match: check if the target word is within the recognized string
        const cleanTarget = targetWord.toLowerCase().trim();
        const cleanResult = result.toLowerCase().trim();
        if (cleanResult.includes(cleanTarget)) {
          setFeedback("ok");
          gretelEvent("answer:correct");
        } else {
          setFeedback("no");
          gretelEvent("answer:wrong");
        }
      };
      rec.onerror = (e: SpeechRecognitionErrorEventLike) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [targetWord]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setFeedback(null);
      recognitionRef.current?.start();
    }
  };

  // Debug simulation for environments without microphone access
  const simulate = (success: boolean) => {
    setTranscript(success ? targetWord : "otra palabra");
    setFeedback(success ? "ok" : "no");
    if (success) gretelEvent("answer:correct");
    else gretelEvent("answer:wrong");
  };

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6 flex flex-col items-center">
      <h3 className="font-bold text-xl mb-6 text-center">Di la palabra en voz alta</h3>

      <div className="text-6xl mb-4 drop-shadow-md">{emoji}</div>
      <div className="text-4xl font-black mb-8" style={{ color }}>
        {targetWord}
      </div>

      <button
        onClick={toggleListen}
        aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl mb-4",
          isListening
            ? "animate-pulse scale-110 bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
            : "hover:scale-105",
          feedback === "ok" ? "bg-success scale-110" : feedback === "no" ? "bg-destructive" : "",
        )}
        style={{ backgroundColor: !isListening && !feedback ? color : undefined }}
      >
        {feedback === "ok" ? (
          <Check className="w-12 h-12" />
        ) : feedback === "no" ? (
          <X className="w-12 h-12" />
        ) : isListening ? (
          <Mic className="w-12 h-12" />
        ) : (
          <MicOff className="w-12 h-12" />
        )}
      </button>

      <div className="h-8 flex items-center justify-center text-sm font-bold text-foreground/60">
        {isListening
          ? "Escuchando..."
          : transcript
            ? `Escuché: "${transcript}"`
            : "Toca el micrófono y habla"}
      </div>

      {!recognitionRef.current && (
        <div className="mt-4 text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg">
          El micrófono no está disponible en este navegador.
        </div>
      )}

      {/* Debug Buttons - Remove in strict production */}
      {import.meta.env.DEV && (
        <div className="mt-8 flex gap-2 border-t pt-4 border-foreground/10 w-full justify-center opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold uppercase mr-2 self-center text-foreground/50">
            Debug Mode:
          </span>
          <button
            onClick={() => simulate(true)}
            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-bold hover:bg-green-200"
          >
            Simulate Success
          </button>
          <button
            onClick={() => simulate(false)}
            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md font-bold hover:bg-red-200"
          >
            Simulate Fail
          </button>
        </div>
      )}
    </div>
  );
}

// --- 2. Canvas Letter Tracing ---
export function LetterTracing({ letter, color }: { letter: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the background faint letter
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 200px 'Comic Sans MS', 'Chalkboard SE', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    // Prepare line style for drawing
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 24;
    ctx.strokeStyle = color;
  }, [letter, color]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Scale coordinates if css width !== canvas width
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setProgress((p) => Math.min(p + 1, 100));
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (progress > 50) {
      gretelEvent("answer:correct");
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw faint letter
    ctx.font = "bold 200px 'Comic Sans MS', 'Chalkboard SE', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    // Reset path style
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 24;
    ctx.strokeStyle = color;
    setProgress(0);
  };

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="font-bold text-xl">Traza la letra</h3>
        <button
          onClick={clearCanvas}
          className="text-xs font-bold text-foreground/50 hover:text-foreground inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Borrar
        </button>
      </div>

      <div
        className="relative border-4 border-dashed rounded-3xl overflow-hidden bg-white touch-none"
        style={{ borderColor: color }}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full max-w-[300px] h-auto cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          onTouchCancel={endDrawing}
        />
        {progress > 50 && (
          <div className="absolute inset-0 bg-success/20 flex flex-col items-center justify-center animate-in fade-in zoom-in pointer-events-none">
            <Check className="w-24 h-24 text-success drop-shadow-md" />
            <span className="font-black text-success text-2xl drop-shadow-sm mt-2">
              ¡Excelente!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 3. Audio Multiple Choice ---

function secureShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const j = Math.floor((randomBuffer[0] / (0xffffffff + 1)) * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

export function AudioMultipleChoice({
  targetWord,
  options,
  color,
}: {
  targetWord: string;
  options: Word[];
  color: string;
}) {
  const { play, playingText, isAvailable } = useAudio();
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  // Scramble options once
  const scrambled = useRef(secureShuffle(options)).current;

  if (!isAvailable(targetWord)) {
    return (
      <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6" role="status">
        Esta actividad de escucha no está disponible porque falta una grabación aprobada.
      </div>
    );
  }

  const handlePick = (word: string) => {
    setPicked(word);
    if (word === targetWord) {
      setFeedback("ok");
      gretelEvent("answer:correct");
    } else {
      setFeedback("no");
      gretelEvent("answer:wrong");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6 flex flex-col items-center">
      <h3 className="font-bold text-xl mb-6">Escucha y selecciona la imagen correcta</h3>

      <button
        onClick={() => play(targetWord)}
        aria-label="Escuchar palabra"
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl mb-8 active:scale-95",
          playingText === targetWord ? "animate-pulse ring-8 ring-offset-4" : "hover:scale-105",
        )}
        style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}
      >
        <Volume2 className="w-12 h-12" />
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {scrambled.map((opt) => (
          <button
            key={opt.word}
            disabled={feedback === "ok"}
            onClick={() => handlePick(opt.word)}
            aria-label={`Seleccionar ${opt.word}`}
            className={cn(
              "aspect-square rounded-2xl flex items-center justify-center text-6xl bg-white border-4 transition-all hover:scale-[1.02]",
              picked === opt.word && feedback === "no"
                ? "border-destructive bg-destructive/10 grayscale"
                : "border-foreground/10 shadow-sm",
              picked === opt.word && feedback === "ok"
                ? "border-success bg-success/10 scale-105 shadow-xl"
                : "",
            )}
          >
            {opt.emoji || "?"}
          </button>
        ))}
      </div>

      {feedback === "ok" && (
        <div className="mt-6 text-success font-black text-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-8 h-8" /> ¡Es {targetWord}!
        </div>
      )}
      {feedback === "no" && (
        <div className="mt-6 text-destructive font-black text-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <X className="w-8 h-8" /> Inténtalo de nuevo
        </div>
      )}
    </div>
  );
}

// --- 4. Drag & Drop Matching ---
export function DragDropMatch({ words, color }: { words: Word[]; color: string }) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedWord(word);
    e.dataTransfer.setData("text/plain", word);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetWord: string) => {
    e.preventDefault();
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (droppedWord === targetWord) {
      setMatches((prev) => ({ ...prev, [targetWord]: targetWord }));
      gretelEvent("answer:correct");
    } else {
      gretelEvent("answer:wrong");
    }
    setDraggedWord(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const allMatched = Object.keys(matches).length === words.length;

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-6">
        <h3 className="font-bold text-xl">Arrastra la palabra a su dibujo</h3>
        <button
          onClick={() => setMatches({})}
          className="text-xs font-bold text-foreground/50 hover:text-foreground inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
        </button>
      </div>

      <div className="flex w-full gap-8">
        {/* Left Column: Draggable Words */}
        <div className="flex-1 space-y-4">
          {words.map((w) => {
            const isMatched = matches[w.word] === w.word;
            return (
              <div
                key={`drag-${w.word}`}
                draggable={!isMatched}
                onDragStart={(e) => handleDragStart(e, w.word)}
                onDragEnd={() => setDraggedWord(null)}
                className={cn(
                  "p-4 rounded-xl border-2 font-black text-center text-xl transition-all select-none",
                  isMatched
                    ? "opacity-0 pointer-events-none"
                    : "cursor-grab active:cursor-grabbing hover:scale-[1.02] bg-white shadow-sm",
                )}
                style={{
                  borderColor: !isMatched ? color : "transparent",
                  color: !isMatched ? color : "transparent",
                }}
              >
                {w.word}
              </div>
            );
          })}
        </div>

        {/* Right Column: Drop Targets */}
        <div className="flex-1 space-y-4">
          {words.map((w) => {
            const isMatched = matches[w.word] === w.word;
            return (
              <div
                key={`drop-${w.word}`}
                onDrop={(e) => handleDrop(e, w.word)}
                onDragOver={handleDragOver}
                className={cn(
                  "p-4 rounded-xl border-4 border-dashed flex items-center justify-center transition-all min-h-[4rem] text-4xl",
                  isMatched
                    ? "bg-success/10 border-success/30 shadow-inner"
                    : "bg-stone-50 border-stone-200",
                  draggedWord === w.word && !isMatched ? "bg-blue-50 border-blue-300" : "", // Slight hint
                )}
              >
                {isMatched ? (
                  <span className="animate-in zoom-in font-black text-2xl text-success flex items-center gap-2">
                    {w.emoji} {w.word} <Check className="w-6 h-6" />
                  </span>
                ) : (
                  <span className="opacity-80 grayscale">{w.emoji}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <div className="mt-8 text-success font-black text-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Check className="w-8 h-8" /> ¡Completaste todos los pares!
        </div>
      )}
    </div>
  );
}

type MiniGameProps = {
  lessonNumber?: number;
  onComplete?: () => void;
};

type MiniWord = { word: string; emoji?: string; illustrationSrc?: string };
type MiniGameContent = { syllables: string[]; words: MiniWord[]; color: string };

const INTRO_VOWELS = ["a", "e", "i", "o", "u"];

function contentForLesson(lessonNumber: number): MiniGameContent {
  const entry = CATALOG.find((item) => item.n === lessonNumber) ?? CATALOG[0]!;
  if (entry.kind === "consonant") {
    return {
      syllables: [...new Set(entry.data.syllables.filter((item) => item.trim()))],
      words: entry.data.vocab.filter((item) => item.word.trim()),
      color: entry.color,
    };
  }
  if (entry.kind === "vowel") {
    return {
      syllables: [entry.vowel],
      words: entry.lesson.vocab.filter((item) => item.word.trim()),
      color: entry.color,
    };
  }
  return { syllables: INTRO_VOWELS, words: [], color: entry.color };
}

function cumulativeSyllables(lessonNumber: number): string[] {
  return CATALOG.filter((entry) => entry.n <= lessonNumber).flatMap((entry) => {
    if (entry.kind === "consonant") return entry.data.syllables;
    if (entry.kind === "vowel") return [entry.vowel];
    return INTRO_VOWELS;
  }).filter((item, index, all) => item.trim() && all.indexOf(item) === index);
}

function completeActivity(onComplete?: () => void) {
  gretelEvent("activity:complete");
  onComplete?.();
}

function shuffleItems<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Silent syllable choice practice using only the selected lesson's canonical syllables. */
export function SyllableTrain({ lessonNumber = 1, onComplete }: MiniGameProps) {
  const { syllables, color } = useMemo(() => contentForLesson(lessonNumber), [lessonNumber]);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "try-again" | null>(null);
  const completed = useRef(false);
  const target = syllables[round];
  const choices = useMemo(() => shuffleItems(syllables), [syllables, round]);

  const answer = (value: string) => {
    if (!target || completed.current || feedback === "correct") return;
    const correct = value === target;
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    if (!correct) {
      setFeedback("try-again");
      return;
    }
    setFeedback("correct");
    if (round === syllables.length - 1) {
      completed.current = true;
      completeActivity(onComplete);
    }
  };

  const next = () => {
    setRound((current) => Math.min(current + 1, syllables.length - 1));
    setFeedback(null);
  };

  if (!target) return <p role="status">No hay sílabas disponibles para esta lección.</p>;
  return (
    <section className="rounded-2xl border-2 border-foreground/10 bg-card p-4 sm:p-6" aria-label="Tren de sílabas">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Tren de sílabas</h3>
        <span role="status" aria-live="polite" className="text-sm font-bold">{round + 1} de {syllables.length}</span>
      </header>
      <p className="mb-4 text-center text-sm font-semibold">Encuentra esta sílaba:</p>
      <p className="mb-5 text-center text-5xl font-black" aria-label={`Sílaba ${target}`} style={{ color }}>{target}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {choices.map((syllable, index) => (
          <button key={`${syllable}-${index}`} type="button" disabled={feedback === "correct"}
            onClick={() => answer(syllable)} aria-label={`Elegir sílaba ${syllable}`}
            className="min-h-12 rounded-xl border-2 bg-white px-4 py-3 text-xl font-bold focus-visible:outline focus-visible:outline-2"
            style={{ borderColor: color }}>{syllable}</button>
        ))}
      </div>
      {feedback === "try-again" && <p className="mt-4 text-center font-bold text-destructive" role="status">Inténtalo de nuevo.</p>}
      {feedback === "correct" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3" role="status">
          <span className="font-bold text-success">¡Correcto!</span>
          {round < syllables.length - 1 && <button type="button" onClick={next} className="min-h-11 rounded-lg px-4 font-bold text-white" style={{ backgroundColor: color }}>Siguiente</button>}
          {round === syllables.length - 1 && <span className="font-bold text-success">¡Tren completo!</span>}
        </div>
      )}
    </section>
  );
}

/** Letter-bank puzzle over words authored in the current lesson catalog entry. */
export function WordPuzzle({ lessonNumber = 1, onComplete }: MiniGameProps) {
  const { words, color } = useMemo(() => contentForLesson(lessonNumber), [lessonNumber]);
  const rounds = useMemo(() => words.slice(0, 8), [words]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "try-again" | null>(null);
  const completed = useRef(false);
  const target = rounds[round]?.word ?? "";
  const letters = useMemo(() => shuffleItems(Array.from(target)), [target]);

  const submit = () => {
    if (!target || completed.current) return;
    const guess = picked.map((index) => letters[index]).join("");
    const correct = guess.toLocaleLowerCase("es") === target.toLocaleLowerCase("es");
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    setFeedback(correct ? "correct" : "try-again");
    if (correct && round === rounds.length - 1) {
      completed.current = true;
      completeActivity(onComplete);
    }
  };

  const next = () => {
    setRound((current) => current + 1);
    setPicked([]);
    setFeedback(null);
  };

  if (rounds.length === 0) return <p role="status">No hay palabras de esta lección para armar.</p>;
  return (
    <section className="rounded-2xl border-2 border-foreground/10 bg-card p-4 sm:p-6" aria-label="Rompecabezas de palabras">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Rompecabezas de palabras</h3>
        <span role="status" className="text-sm font-bold">{round + 1} de {rounds.length}</span>
      </header>
      <p className="mb-4 text-center text-sm font-semibold">Forma la palabra con sus letras:</p>
      <p className="mb-5 min-h-12 text-center text-3xl font-black tracking-widest" aria-label="Letras seleccionadas" style={{ color }}>{picked.map((index) => letters[index]).join("") || "· · ·"}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((letter, index) => (
          <button key={`${letter}-${index}`} type="button" disabled={picked.includes(index) || feedback === "correct"}
            onClick={() => { setPicked((current) => [...current, index]); setFeedback(null); }}
            aria-label={`Añadir letra ${letter}`} className="min-h-12 min-w-12 rounded-xl border-2 bg-white px-3 text-xl font-bold disabled:opacity-40"
            style={{ borderColor: color }}>{letter}</button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" disabled={picked.length !== letters.length || feedback === "correct"} onClick={submit}
          className="min-h-11 rounded-lg px-4 font-bold text-white disabled:opacity-50" style={{ backgroundColor: color }}>Comprobar</button>
        <button type="button" disabled={picked.length === 0 || feedback === "correct"} onClick={() => { setPicked([]); setFeedback(null); }}
          className="min-h-11 rounded-lg border px-4 font-bold disabled:opacity-50">Borrar letras</button>
      </div>
      {feedback === "try-again" && <p className="mt-4 text-center font-bold text-destructive" role="status">Revisa el orden e inténtalo otra vez.</p>}
      {feedback === "correct" && <div className="mt-4 text-center font-bold text-success" role="status">¡Palabra completa!{round < rounds.length - 1 && <button type="button" onClick={next} className="ml-3 min-h-11 rounded-lg px-4 text-white" style={{ backgroundColor: color }}>Siguiente</button>}</div>}
    </section>
  );
}

type MemoryCard = { id: string; pair: number; face: "word" | "emoji"; value: string };

/** Pairs source-backed lesson words with their curriculum emoji labels. */
export function MemoryMatch({ lessonNumber = 1, onComplete }: MiniGameProps) {
  const { words, color } = useMemo(() => contentForLesson(lessonNumber), [lessonNumber]);
  const pairs = useMemo(() => words.filter((word, index) => (word.emoji || word.illustrationSrc) && words.findIndex((other) => other.word === word.word) === index).slice(0, 6), [words]);
  const cards = useMemo(() => shuffleItems(pairs.flatMap((item, pair): MemoryCard[] => [
    { id: `${pair}-word`, pair, face: "word", value: item.word },
    { id: `${pair}-emoji`, pair, face: "emoji", value: item.emoji ?? item.illustrationSrc! },
  ])), [pairs]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const timer = useRef<number | null>(null);
  const completed = useRef(false);

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const choose = (card: MemoryCard) => {
    if (matched.includes(card.pair) || open.includes(card.id) || open.length === 2) return;
    const nextOpen = [...open, card.id];
    setOpen(nextOpen);
    if (nextOpen.length !== 2) return;
    const first = cards.find((item) => item.id === nextOpen[0]);
    const second = cards.find((item) => item.id === nextOpen[1]);
    if (!first || !second) return;
    const correct = first.pair === second.pair && first.face !== second.face;
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    if (correct) {
      const nextMatched = [...matched, first.pair];
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.length === pairs.length && !completed.current) {
        completed.current = true;
        completeActivity(onComplete);
      }
    } else {
      timer.current = window.setTimeout(() => { setOpen([]); timer.current = null; }, 700);
    }
  };

  if (pairs.length < 2) return <p role="status">Esta lección necesita más palabras para jugar memoria.</p>;
  return (
    <section className="rounded-2xl border-2 border-foreground/10 bg-card p-4 sm:p-6" aria-label="Memoria de palabras">
      <header className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Memoria de palabras</h3><span role="status">Parejas: {matched.length} de {pairs.length}</span></header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const visible = open.includes(card.id) || matched.includes(card.pair);
          return <button key={card.id} type="button" onClick={() => choose(card)} disabled={matched.includes(card.pair)}
            aria-label={visible ? `Carta ${card.face === "word" ? card.value : `dibujo ${pairs[card.pair]?.word}`}` : "Carta oculta"}
            aria-pressed={visible} className="min-h-16 rounded-xl border-2 bg-white p-3 text-lg font-bold disabled:bg-success/10"
            style={{ borderColor: matched.includes(card.pair) ? "#16a34a" : color }}>
              {visible && card.face === "emoji" && pairs[card.pair]?.illustrationSrc ? <img src={pairs[card.pair]!.illustrationSrc} alt="" className="mx-auto h-12 w-12 object-contain" /> : visible ? card.value : "?"}
            </button>;
        })}
      </div>
      {matched.length === pairs.length && <p className="mt-4 text-center font-bold text-success" role="status">¡Todas las parejas encontradas!</p>}
    </section>
  );
}

/** Ten quick multiple-choice rounds drawn from taught canonical syllables. */
export function RapidFire({ lessonNumber = 1, onComplete }: MiniGameProps) {
  const pool = useMemo(() => cumulativeSyllables(lessonNumber), [lessonNumber]);
  const { color } = useMemo(() => contentForLesson(lessonNumber), [lessonNumber]);
  const rounds = 10;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "try-again" | null>(null);
  const completed = useRef(false);
  const target = pool[round % Math.max(1, pool.length)];
  const choices = useMemo(() => {
    if (!target) return [];
    return shuffleItems([target, ...shuffleItems(pool.filter((item) => item !== target)).slice(0, 3)]);
  }, [pool, target]);

  const answer = (value: string) => {
    if (!target || feedback) return;
    const correct = value === target;
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    setFeedback(correct ? "correct" : "try-again");
    if (correct) setScore((current) => current + 1);
    if (round === rounds - 1 && correct && !completed.current) {
      completed.current = true;
      completeActivity(onComplete);
    }
  };
  const next = () => { setRound((current) => current + 1); setFeedback(null); };

  if (!target) return <p role="status">No hay sílabas disponibles para esta lección.</p>;
  return (
    <section className="rounded-2xl border-2 border-foreground/10 bg-card p-4 sm:p-6" aria-label="Rápido y atento">
      <header className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Rápido y atento</h3><span role="status">Aciertos: {score} · {round + 1} de {rounds}</span></header>
      <p className="mb-2 text-center text-sm font-semibold">Busca esta sílaba:</p>
      <p className="mb-5 text-center text-5xl font-black" aria-label={`Sílaba ${target}`} style={{ color }}>{target}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map((choice, index) => <button key={`${choice}-${index}`} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}
          aria-label={`Elegir ${choice}`} className="min-h-12 rounded-xl border-2 bg-white p-3 text-xl font-bold disabled:opacity-60" style={{ borderColor: color }}>{choice}</button>)}
      </div>
      {feedback === "try-again" && <p className="mt-4 text-center font-bold text-destructive" role="status">Inténtalo de nuevo.</p>}
      {feedback === "correct" && <div className="mt-4 text-center font-bold text-success" role="status">¡Bien!{round < rounds - 1 && <button type="button" onClick={next} className="ml-3 min-h-11 rounded-lg px-4 text-white" style={{ backgroundColor: color }}>Siguiente</button>}{round === rounds - 1 && <span> Ronda terminada.</span>}</div>}
    </section>
  );
}
