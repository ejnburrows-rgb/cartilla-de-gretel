import { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Check, X, RotateCcw, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { gretelEvent } from "@/lib/gretel-bus";

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
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if SpeechRecognition API is available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "es-ES"; // Set to Spanish

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
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
      rec.onerror = (e: any) => {
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
export function AudioMultipleChoice({
  targetWord,
  options,
  color,
}: {
  targetWord: string;
  options: Word[];
  color: string;
}) {
  const { play, playingText } = useAudio();
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  // Scramble options once
  const scrambled = useRef([...options].sort(() => 0.5 - Math.random())).current;

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
        onClick={() => play(targetWord, true)}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl mb-8 active:scale-95",
          playingText === targetWord ? "animate-pulse ring-8 ring-offset-4" : "hover:scale-105",
        )}
        style={{ backgroundColor: color, "--tw-ring-color": color } as any}
      >
        <Volume2 className="w-12 h-12" />
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {scrambled.map((opt) => (
          <button
            key={opt.word}
            disabled={feedback === "ok"}
            onClick={() => handlePick(opt.word)}
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
