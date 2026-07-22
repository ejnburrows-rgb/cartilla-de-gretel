import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, CheckCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { playNote, playCorrectChord, playWrongBuzz, NOTE_FREQS } from "@/lib/piano-audio";
import { matchesSyllablePhonetically } from "@/lib/phoneme-matcher";
import { speak } from "@/lib/speak";
import { recordEvent } from "@/lib/student-session";
import { cn } from "@/lib/utils";

interface PianoPronunciationProps {
  syllables: string[];
  lessonId?: string;
  color?: string;
  onComplete?: () => void;
  locale?: string;
}

const PIANO_NOTES = [
  NOTE_FREQS.C,
  NOTE_FREQS.D,
  NOTE_FREQS.E,
  NOTE_FREQS.F,
  NOTE_FREQS.G,
  NOTE_FREQS.A,
  NOTE_FREQS.B,
  NOTE_FREQS.C5,
];

// A real toy piano isn't all-white keys — give each one its own bright color.
const KEY_COLORS = [
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // amber
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function PianoPronunciation({
  syllables,
  lessonId = "demo",
  color = "#f97316",
  onComplete,
  locale = "es-MX",
}: PianoPronunciationProps) {
  const { isListening, transcript, startListening, stopListening, isSupported, error } =
    useSpeechRecognition({ lang: locale });

  const [activeKeyIdx, setActiveKeyIdx] = useState<number | null>(null);
  const [keyStates, setKeyStates] = useState<Record<number, "idle" | "correct" | "incorrect">>({});
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [helperText, setHelperText] = useState(
    "Toca 'Escuchar' y luego el micrófono para repetir.",
  );

  // Map each syllable to a piano key index/frequency
  const pianoKeys = useMemo(
    () =>
      syllables.slice(0, 8).map((syllable, index) => ({
        syllable,
        frequency: PIANO_NOTES[index % PIANO_NOTES.length],
      })),
    [syllables],
  );

  // Match mic transcript to syllables. Guarded by lastProcessedTranscript so
  // the full dependency list can't re-process a transcript when completedSet
  // updates — matching the original run-once-per-new-transcript semantics.
  const lastProcessedTranscript = useRef<string | null>(null);
  useEffect(() => {
    if (!transcript || lastProcessedTranscript.current === transcript) return;
    lastProcessedTranscript.current = transcript;
    // Find matching syllable using phonetic fuzzing
    let matchIdx = -1;
    for (let i = 0; i < pianoKeys.length; i++) {
      if (matchesSyllablePhonetically(pianoKeys[i].syllable, transcript)) {
        matchIdx = i;
        break;
      }
    }

    if (matchIdx !== -1) {
      const matchSyllable = pianoKeys[matchIdx].syllable;
      // Success!
      playNote(pianoKeys[matchIdx].frequency, 1.0);
      setKeyStates((prev) => ({ ...prev, [matchIdx]: "correct" }));
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(matchSyllable);
        return next;
      });
      setHelperText(`¡Excelente! Dijiste: "${transcript}"`);

      // Dispatch Gretel live celebration
      window.dispatchEvent(
        new CustomEvent("gretel:celebrate", {
          detail: { text: `¡Muy bien pronunciado! Dijiste "${matchSyllable}"` },
        }),
      );

      // Log progress
      recordEvent({
        lessonId,
        kind: "exercise",
        score: completedSet.size + 1,
        total: pianoKeys.length,
        meta: { exercise: "piano_pronunciation", syllable: matchSyllable, completed: true },
      });

      setTimeout(() => {
        setKeyStates((prev) => ({ ...prev, [matchIdx]: "idle" }));
      }, 1500);
    } else {
      // No match, flash keys red
      playWrongBuzz();
      setHelperText(`Escuché: "${transcript}". ¡Intenta otra vez!`);
      // Shake all non-completed keys briefly
      const updatedStates: Record<number, "idle" | "correct" | "incorrect"> = {};
      pianoKeys.forEach((key, idx) => {
        if (!completedSet.has(key.syllable)) {
          updatedStates[idx] = "incorrect";
        }
      });
      setKeyStates(updatedStates);

      setTimeout(() => {
        setKeyStates({});
      }, 1000);
    }
  }, [transcript, completedSet, lessonId, pianoKeys]);

  // Check if all syllables are done
  useEffect(() => {
    if (completedSet.size > 0 && completedSet.size === pianoKeys.length) {
      playCorrectChord();
      setHelperText("¡Felicidades! Completaste todo el piano.");
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    }
  }, [completedSet, pianoKeys.length, onComplete]);

  const listenToSyllable = async (syllable: string, index: number) => {
    setActiveKeyIdx(index);
    playNote(pianoKeys[index].frequency, 0.6);

    // Prevent speech synthesis audio from feeding back into the active microphone
    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }

    await speak(syllable);
    setActiveKeyIdx(null);

    if (wasListening) {
      setTimeout(() => {
        startListening();
      }, 300);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setHelperText("Escuchando... ¡Habla ahora!");
      startListening();
    }
  };

  return (
    <div className="w-full p-6 bg-gradient-to-b from-stone-100 to-stone-200 rounded-3xl border border-stone-300 shadow-xl my-6 max-w-2xl mx-auto flex flex-col items-center">
      {/* Title */}
      <h3 className="text-2xl font-black text-stone-800 mb-2 font-display">El Piano Hablador</h3>
      <p className="text-xs text-stone-500 font-bold mb-4 uppercase tracking-wider">
        Pronuncia las sílabas para tocar las notas
      </p>

      {/* Helper text display */}
      <div className="w-full bg-white/80 backdrop-blur border border-stone-200/50 rounded-2xl p-3 text-center mb-6 min-h-[50px] flex items-center justify-center">
        <span className="text-sm font-bold text-stone-700 leading-relaxed">{helperText}</span>
      </div>

      {/* Piano Wooden Cabinet Frame */}
      <div className="w-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 p-4 pb-2 rounded-2xl shadow-inner border border-amber-950 flex flex-col items-center relative">
        {/* Brass bar */}
        <div className="w-[calc(100%-8px)] h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-full mb-3 shadow-md" />

        {/* Keyboard Bed */}
        <div className="w-full flex justify-between bg-stone-900 p-1.5 rounded-lg overflow-hidden shadow-2xl relative">
          {pianoKeys.map((key, index) => {
            const isCompleted = completedSet.has(key.syllable);
            const isActive = activeKeyIdx === index;
            const state = keyStates[index] || "idle";
            const keyColor = KEY_COLORS[index % KEY_COLORS.length];

            return (
              <motion.div
                key={index}
                animate={
                  state === "incorrect"
                    ? { x: [-3, 3, -3, 3, 0] }
                    : state === "correct"
                      ? { y: [0, 10, 0], scaleY: [1, 0.93, 1] }
                      : {}
                }
                transition={{ duration: state === "correct" ? 0.3 : 0.4 }}
                style={{ flex: "1 1 0%", transformOrigin: "top" }}
                className={cn(
                  "mx-[2px] first:ml-0 last:mr-0 h-72 rounded-b-xl relative select-none cursor-pointer group",
                  state === "correct" && "key-bounce",
                  state === "incorrect" && "key-shake",
                )}
                onClick={() => listenToSyllable(key.syllable, index)}
              >
                {/* Colorful Key Core — a real toy piano isn't all-white */}
                <div
                  className={cn(
                    "absolute inset-0 border-2 rounded-b-xl shadow-md transition-all duration-150 flex flex-col justify-end items-center pb-4",
                    "group-active:pt-2 group-active:pb-2 group-active:shadow-sm",
                    isActive && "scale-y-[0.98]",
                    state === "correct" && "shadow-[0_0_18px_rgba(16,185,129,0.7)]",
                    state === "incorrect" &&
                      "bg-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                  )}
                  style={
                    state === "incorrect"
                      ? undefined
                      : {
                          backgroundColor:
                            state === "correct" || isCompleted
                              ? "#34d399"
                              : `color-mix(in srgb, ${keyColor} 24%, white)`,
                          borderColor: state === "correct" || isCompleted ? "#10b981" : keyColor,
                        }
                  }
                >
                  {/* Visual key bottom indent */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-2 rounded-b-xl group-active:h-0.5 transition-all"
                    style={{ backgroundColor: `color-mix(in srgb, ${keyColor} 45%, white)` }}
                  />

                  {/* Syllable tag */}
                  <span
                    className="text-2xl font-black font-display group-hover:scale-110 transition-transform"
                    style={{
                      color:
                        state === "correct" || state === "incorrect" || isCompleted
                          ? "#fff"
                          : keyColor,
                    }}
                  >
                    {key.syllable}
                  </span>

                  {/* Escuchar micro button */}
                  <button
                    type="button"
                    className="mt-3 p-1.5 bg-white/70 hover:bg-white text-stone-600 rounded-full border border-white/80 transition-colors shadow-sm cursor-pointer"
                    aria-label={`Escuchar ${key.syllable}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      listenToSyllable(key.syllable, index);
                    }}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Completed star indicator */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-white animate-fade-in">
                      <CheckCircle className="w-5 h-5 fill-emerald-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Speech Control & Mic Panel */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {!isSupported ? (
          <div className="text-xs font-bold text-red-500 text-center bg-red-50 p-2.5 rounded-xl border border-red-200">
            ⚠️ La entrada de micrófono no es compatible con este navegador.
            <br />
            Prueba con Google Chrome o Safari.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleMicClick}
              type="button"
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 cursor-pointer",
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse focus:ring-red-400"
                  : "bg-primary hover:bg-primary-hover focus:ring-amber-300",
              )}
              style={!isListening ? { backgroundColor: color } : {}}
              title={isListening ? "Detener micrófono" : "Comenzar micrófono"}
            >
              {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </button>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              {isListening ? "Escuchando... Habla ahora" : "Toca el micrófono para hablar"}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-56 mt-2 flex flex-col items-center gap-1.5">
          <div className="flex justify-between w-full text-xs font-bold text-stone-600">
            <span>Progreso</span>
            <span>
              {completedSet.size} de {pianoKeys.length}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-300/60 border border-stone-400/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSet.size / pianoKeys.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PianoPronunciation;
