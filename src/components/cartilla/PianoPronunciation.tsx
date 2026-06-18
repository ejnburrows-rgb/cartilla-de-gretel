import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, CheckCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { playNote, playCorrectChord, playWrongBuzz, NOTE_FREQS } from "@/lib/piano-audio";
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

export function PianoPronunciation({
  syllables,
  lessonId = "demo",
  color = "#f97316",
  onComplete,
  locale = "es-MX",
}: PianoPronunciationProps) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition({ lang: locale });

  const [activeKeyIdx, setActiveKeyIdx] = useState<number | null>(null);
  const [keyStates, setKeyStates] = useState<Record<number, "idle" | "correct" | "incorrect">>({});
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [helperText, setHelperText] = useState("Toca 'Escuchar' y luego el micrófono para repetir.");

  // Map each syllable to a piano key index/frequency
  const pianoKeys = syllables.slice(0, 8).map((syllable, index) => ({
    syllable,
    frequency: PIANO_NOTES[index % PIANO_NOTES.length],
  }));

  // Match mic transcript to syllables
  useEffect(() => {
    if (!transcript) return;
    const cleanTranscript = transcript.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    // Find matching syllable
    let matchIdx = -1;
    for (let i = 0; i < pianoKeys.length; i++) {
      if (cleanTranscript.includes(pianoKeys[i].syllable.toLowerCase())) {
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
      window.dispatchEvent(new CustomEvent("gretel:celebrate", {
        detail: { text: `¡Muy bien pronunciado! Dijiste "${matchSyllable}"` }
      }));

      // Log progress
      recordEvent({
        lessonId,
        kind: "exercise",
        score: completedSet.size + 1,
        total: pianoKeys.length,
        meta: { exercise: "piano_pronunciation", syllable: matchSyllable, completed: true }
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
  }, [transcript]);

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
      <p className="text-xs text-stone-500 font-bold mb-4 uppercase tracking-wider">Pronuncia las sílabas para tocar las notas</p>

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

            return (
              <motion.div
                key={index}
                animate={state === "incorrect" ? { x: [-3, 3, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                style={{ flex: "1 1 0%" }}
                className="mx-[2px] first:ml-0 last:mr-0 h-44 rounded-b-xl relative select-none cursor-pointer group"
                onClick={() => listenToSyllable(key.syllable, index)}
              >
                {/* White Key Core */}
                <div
                  className={cn(
                    "absolute inset-0 bg-white border border-stone-200 rounded-b-xl shadow-md transition-all duration-150 flex flex-col justify-end items-center pb-4",
                    "group-active:pt-2 group-active:pb-2 group-active:shadow-sm",
                    isCompleted && "bg-emerald-50/50 border-emerald-200",
                    isActive && "bg-amber-100 scale-y-[0.98]",
                    state === "correct" && "bg-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]",
                    state === "incorrect" && "bg-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  )}
                >
                  {/* Visual key bottom indent */}
                  <div className="absolute bottom-0 inset-x-0 h-2 bg-stone-200 rounded-b-xl group-active:h-0.5 transition-all" />

                  {/* Syllable tag */}
                  <span className={cn(
                    "text-xl font-black font-display group-hover:scale-110 transition-transform",
                    (state === "correct" || state === "incorrect") ? "text-white" : "text-stone-800"
                  )}>
                    {key.syllable}
                  </span>

                  {/* Escuchar micro button */}
                  <button
                    type="button"
                    className="mt-3 p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full border border-stone-300 transition-colors shadow-sm cursor-pointer"
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
                    <div className="absolute top-2 right-2 text-emerald-600 animate-fade-in">
                      <CheckCircle className="w-4 h-4 fill-emerald-100" />
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
            ⚠️ La entrada de micrófono no es compatible con este navegador.<br />Prueba con Google Chrome o Safari.
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
                  : "bg-primary hover:bg-primary-hover focus:ring-amber-300"
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
            <span>{completedSet.size} de {pianoKeys.length}</span>
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
