import { useState, useRef } from "react";
import { Volume2, RotateCcw } from "lucide-react";
import { RIMA_MM_VERSES, RIMA_MM_WORDS } from "@/content/games/rima-mm";
import { recordEvent } from "@/lib/student-session";

/**
 * RimaMmGame — "Vamos a rimar" (Lectura de la rima, Mm).
 *
 * Layout matches the owner's chosen mockup (issue #877):
 * - Title "Vamos a rimar", speaker button, mother-and-child picture
 * - Word bank: Mami / mímame / amo / ámame
 * - Four verse lines with blanks: "___ me ama", "___ a mamá", "___ mami", "___ más."
 *
 * Animations: bee moves in place, mom+baby breathe, leaves sway.
 *
 * IMPORTANT: The teacher file has NO answer key. Blanks are placeholders.
 * The answer key needs owner confirmation — do NOT invent or prefill answers.
 * Drag-and-drop places words; correctness validation is DISABLED until the
 * owner confirms the answer key.
 */

const WORD_COLORS: Record<string, string> = {
  "Mami": "border-sky-400 bg-sky-50",
  "mímame": "border-rose-400 bg-rose-50",
  "amo": "border-emerald-400 bg-emerald-50",
  "ámame": "border-amber-400 bg-amber-50",
};

function LetterPickerEntrance({ onPick }: { onPick: (letter: string) => void }) {
  const letters = ["Mm", "Pp", "Ss", "Ll", "Nn"];
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-3xl font-black text-center text-stone-800">
        Elige una letra
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {letters.map((letter, i) => (
          <button
            key={letter}
            onClick={() => onPick(letter)}
            disabled={i !== 0}
            aria-label={`Letra ${letter}`}
            className={`
              w-20 h-20 rounded-2xl text-2xl font-black border-4
              ${i === 0
                ? "border-teal-500 bg-teal-50 text-teal-800 hover:bg-teal-100 active:scale-95 cursor-pointer"
                : "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-50"
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>
      <p className="text-sm font-bold text-stone-500 text-center">
        Toca Mm para empezar
      </p>
    </div>
  );
}

export function RimaMmGame() {
  const [letterPicked, setLetterPicked] = useState(false);
  // placed[i] = word placed in blank i, or null
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const dragFromRef = useRef<{ type: "bank" | "blank"; index: number } | null>(null);

  const usedWords = new Set(placed.filter(Boolean) as string[]);
  const availableWords = RIMA_MM_WORDS.filter((w) => !usedWords.has(w));
  const allFilled = placed.every(Boolean);

  const reset = () => {
    setPlaced([null, null, null, null]);
    setDraggedWord(null);
    dragFromRef.current = null;
  };

  if (!letterPicked) {
    return <LetterPickerEntrance onPick={() => setLetterPicked(true)} />;
  }

  const handleDragStart = (word: string, from: { type: "bank" | "blank"; index: number }) => {
    setDraggedWord(word);
    dragFromRef.current = from;
  };

  const handleDragEnd = () => {
    setDraggedWord(null);
    dragFromRef.current = null;
  };

  const handleDropOnBlank = (blankIndex: number) => {
    if (!draggedWord || !dragFromRef.current) return;
    const from = dragFromRef.current;

    setPlaced((prev) => {
      const next = [...prev];
      // If dragging from another blank, clear that blank
      if (from.type === "blank") {
        next[from.index] = null;
      }
      // If target blank had a word, it goes back to bank (just clear)
      next[blankIndex] = draggedWord;
      return next;
    });
    setDraggedWord(null);
    dragFromRef.current = null;
  };

  const handleDropOnBank = () => {
    if (!draggedWord || !dragFromRef.current) return;
    const from = dragFromRef.current;
    if (from.type === "blank") {
      setPlaced((prev) => {
        const next = [...prev];
        next[from.index] = null;
        return next;
      });
    }
    setDraggedWord(null);
    dragFromRef.current = null;
  };

  const playInstructionAudio = () => {
    // Placeholder: owner's recording pending. Never use generated/TTS voice.
    // TODO: wire owner's recording when available.
  };

  return (
    <div className="rima-mm-game relative min-h-screen overflow-hidden">
      {/* Garden background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #B8E6B8 40%, #90EE90 100%)",
        }}
        aria-hidden
      />

      {/* Swaying leaves (top corners) */}
      <div className="absolute top-0 left-0 -z-0 pointer-events-none" aria-hidden>
        <div className="rima-leaf-sway text-6xl">🌿</div>
      </div>
      <div className="absolute top-0 right-16 -z-0 pointer-events-none" aria-hidden>
        <div className="rima-leaf-sway text-5xl" style={{ animationDelay: "-1.5s" }}>🌿</div>
      </div>
      <div className="absolute bottom-0 left-4 -z-0 pointer-events-none" aria-hidden>
        <div className="rima-leaf-sway text-7xl" style={{ animationDelay: "-3s" }}>🌿</div>
      </div>
      <div className="absolute bottom-0 right-4 -z-0 pointer-events-none" aria-hidden>
        <div className="rima-leaf-sway text-6xl" style={{ animationDelay: "-0.8s" }}>🌿</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1
            className="inline-block text-4xl sm:text-5xl font-black px-8 py-3 rounded-2xl border-4 border-amber-700 bg-amber-50 shadow-lg"
            style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
          >
            <span className="text-blue-600">V</span>
            <span className="text-red-500">a</span>
            <span className="text-green-600">m</span>
            <span className="text-purple-600">o</span>
            <span className="text-orange-500">s</span>
            <span> </span>
            <span className="text-teal-600">a</span>
            <span> </span>
            <span className="text-pink-600">r</span>
            <span className="text-indigo-600">i</span>
            <span className="text-green-600">m</span>
            <span className="text-red-500">a</span>
            <span className="text-blue-600">r</span>
            <span className="text-red-500"> ♥</span>
          </h1>
        </div>

        {/* Speaker button */}
        <div className="flex justify-end">
          <button
            onClick={playInstructionAudio}
            aria-label="Escuchar instrucciones (audio pendiente)"
            title="Audio pendiente — grabación del dueño"
            className="w-14 h-14 rounded-full bg-blue-500 border-4 border-amber-400 flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95"
          >
            <Volume2 className="w-7 h-7 text-white" aria-hidden />
          </button>
        </div>

        {/* Mother and child (breathe animation) */}
        <div className="flex justify-center">
          <div className="rima-breathe">
            <img
              src="/games/rima-mm/madre-hijo.png"
              alt="Mamá abrazando a su bebé"
              className="w-64 h-auto sm:w-80 rounded-2xl"
              draggable={false}
            />
          </div>
        </div>

        {/* Word bank */}
        <div
          className="flex flex-wrap justify-center gap-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnBank}
          aria-label="Banco de palabras"
        >
          {availableWords.map((word) => (
            <div
              key={word}
              draggable
              onDragStart={() => handleDragStart(word, { type: "bank", index: -1 })}
              onDragEnd={handleDragEnd}
              role="button"
              tabIndex={0}
              aria-label={`Palabra ${word}`}
              className={`
                px-6 py-3 rounded-xl border-4 text-2xl font-black cursor-grab
                active:cursor-grabbing select-none min-w-[44px] min-h-[44px]
                flex items-center justify-center
                ${WORD_COLORS[word] ?? "border-stone-300 bg-white"}
                ${draggedWord === word ? "opacity-50" : ""}
              `}
            >
              {word}
            </div>
          ))}
          {availableWords.length === 0 && (
            <p className="text-sm font-bold text-stone-500">
              Todas las palabras están en los versos
            </p>
          )}
        </div>

        {/* Verse panel */}
        <div className="bg-amber-50 border-4 border-amber-400 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex gap-4">
            {/* Bee (moves in place) */}
            <div className="shrink-0 flex items-start pt-2" aria-hidden>
              <div className="rima-bee-hover">
                <img
                  src="/cartilla/art/faithful/vocal-a/abeja.webp"
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  draggable={false}
                />
              </div>
            </div>

            {/* Verses */}
            <div className="flex-1 space-y-3">
              {RIMA_MM_VERSES.map((verse, i) => (
                <div key={verse.id} className="flex items-center gap-3">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnBlank(i)}
                    aria-label={`Espacio en blanco ${i + 1}`}
                    className={`
                      flex-1 min-h-[48px] rounded-xl border-3 border-dashed
                      flex items-center justify-center px-4 py-2
                      text-xl font-black
                      ${placed[i]
                        ? "border-solid border-teal-500 bg-teal-50 text-teal-900"
                        : "border-blue-300 bg-blue-50 text-stone-400"
                      }
                    `}
                    style={{ borderWidth: "3px" }}
                  >
                    {placed[i] ? (
                      <span
                        draggable
                        onDragStart={() => handleDragStart(placed[i]!, { type: "blank", index: i })}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing select-none"
                      >
                        {placed[i]}
                      </span>
                    ) : (
                      <span className="text-stone-300">________</span>
                    )}
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-indigo-900 whitespace-nowrap">
                    {verse.ending}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Answer-key notice */}
          <div className="mt-4 p-3 rounded-xl bg-amber-100 border-2 border-amber-300">
            <p className="text-sm font-bold text-amber-800 text-center">
              ⚠️ Clave de respuestas pendiente — el archivo del maestro no la incluye.
              Las respuestas se confirmarán con el dueño.
            </p>
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-200 font-bold text-stone-700 hover:bg-stone-300 active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            Empezar de nuevo
          </button>
        </div>

        {allFilled && (
          <div className="text-center p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300">
            <p className="text-lg font-black text-emerald-800">
              ¡Completaste los versos! 🎉
            </p>
            <p className="text-sm font-bold text-emerald-600">
              La verificación de respuestas se activará cuando el dueño confirme la clave.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .rima-breathe {
          animation: rima-breathe 4s ease-in-out infinite;
        }
        @keyframes rima-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .rima-bee-hover {
          animation: rima-bee-hover 2s ease-in-out infinite;
        }
        @keyframes rima-bee-hover {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .rima-leaf-sway {
          animation: rima-leaf-sway 5s ease-in-out infinite;
          transform-origin: top center;
        }
        @keyframes rima-leaf-sway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rima-breathe, .rima-bee-hover, .rima-leaf-sway {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
