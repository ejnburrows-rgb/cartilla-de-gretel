import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Hand, Mic, MicOff, RotateCcw, Volume2, ArrowRight } from "lucide-react";
import { usePianoListening, type PianoListenProblem } from "@/hooks/usePianoListening";
import { playNote, playCorrectChord, NOTE_FREQS } from "@/lib/piano-audio";
import { advanceSyllables } from "@/lib/piano-word-tracker";
import type { PianoWord } from "@/lib/piano-words";
import { approvedPictureRecording } from "@/lib/picture-vocabulary";
import { audioEngine } from "@/lib/audio-engine";
import {
  claimSpeech,
  registerSpeechCleanup,
  releaseSpeech,
  speechIsCurrent,
  stopSpeech,
} from "@/lib/speech-playback";
import { speak } from "@/lib/speak";
import { recordEvent } from "@/lib/student-session";
import { GretelLiveAvatar, type GretelLiveAvatarRef } from "@/components/gretel/GretelLiveAvatar";
import { cn } from "@/lib/utils";
import "@/styles/piano-hablador.css";

interface PianoPronunciationProps {
  /** Lesson syllables; used as one syllable-by-syllable item when no words are given. */
  syllables: string[];
  /** Verified book words (see src/lib/piano-words.ts). Enables the word piano. */
  words?: PianoWord[];
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

type KeyState = "pending" | "next" | "hearing" | "provisional" | "confirmed";

const KEY_STATE_LABEL: Record<KeyState, string> = {
  pending: "por decir",
  next: "por decir",
  hearing: "escuchando",
  provisional: "casi",
  confirmed: "lista",
};

const PROBLEM_MESSAGE: Record<PianoListenProblem, string> = {
  unsupported: "Este navegador no puede escuchar la voz. Puedes tocar las teclas en orden.",
  denied:
    "El micrófono no tiene permiso. Un adulto puede permitirlo en el navegador, o puedes tocar las teclas en orden.",
  "no-microphone": "No encuentro un micrófono. Puedes tocar las teclas en orden.",
  network: "El reconocimiento de voz no está disponible ahora. Puedes tocar las teclas en orden.",
  "no-speech": "No te oí. Toca el micrófono y habla cerca.",
  failed: "No pude escuchar esta vez. Toca el micrófono para probar otra vez.",
};

/** One example at a time; resolves when it finishes or is interrupted. */
function playExample(text: string, recording: string | undefined): Promise<void> {
  if (!recording || typeof Audio === "undefined") return speak(text);
  return new Promise<void>((resolve) => {
    const token = claimSpeech("reading");
    let done = false;
    const audio = new Audio(recording);
    const finish = () => {
      if (done) return;
      done = true;
      audio.onended = null;
      audio.onerror = null;
      try {
        audio.pause();
      } catch {
        /* jsdom */
      }
      resolve();
    };
    registerSpeechCleanup(token, finish);
    try {
      audio.volume = audioEngine.isMuted() ? 0 : audioEngine.getVolume();
    } catch {
      /* default volume */
    }
    audio.onended = () => {
      releaseSpeech(token);
      finish();
    };
    audio.onerror = () => {
      releaseSpeech(token);
      finish();
      // Recording missing: fall back to the existing browser voice once.
      if (speechIsCurrent(token)) void speak(text);
    };
    const playing = audio.play();
    if (playing && typeof playing.catch === "function") {
      playing.catch(() => {
        releaseSpeech(token);
        finish();
      });
    }
  });
}

export function PianoPronunciation({
  syllables,
  words,
  lessonId,
  color = "#b45309",
  onComplete,
  locale = "es-MX",
}: PianoPronunciationProps) {
  const items: PianoWord[] = useMemo(() => {
    const verified = (words ?? []).filter((entry) => entry.syllables.length > 0);
    if (verified.length > 0)
      return verified.map((entry) => ({ ...entry, syllables: entry.syllables.slice(0, 8) }));
    const lessonSyllables = syllables.slice(0, 8);
    return lessonSyllables.length
      ? [{ word: lessonSyllables.join(" "), syllables: lessonSyllables }]
      : [];
  }, [syllables, words]);
  const wordMode = Boolean(words && words.length > 0);
  const itemsKey = useMemo(
    () => items.map((item) => `${item.word}:${item.syllables.join("-")}`).join("|"),
    [items],
  );

  const [itemIndex, setItemIndex] = useState(0);
  const item = items[itemIndex];
  const keys = useMemo(() => item?.syllables ?? [], [item]);
  const [confirmed, setConfirmed] = useState(0);
  const [provisional, setProvisional] = useState(0);
  const [confirmedBy, setConfirmedBy] = useState<"voice" | "touch" | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const [exampleActive, setExampleActive] = useState(false);
  const [message, setMessage] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const confirmedRef = useRef(0);
  const celebratedRef = useRef<string | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gretelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exampleRunRef = useRef(0);
  const gretelRef = useRef<GretelLiveAvatarRef>(null);
  const onCompleteRef = useRef(onComplete);
  const hasTriggeredCompleteRef = useRef(false);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const done = keys.length > 0 && confirmed >= keys.length;
  const isLastItem = itemIndex >= items.length - 1;

  const promptFor = useCallback(
    (count: number) => {
      const next = keys[count];
      if (!next) return "";
      return count === 0 && keys.length > 1 && wordMode
        ? `Di «${keys.join(" … ")}» o la palabra «${item?.word}».`
        : `Ahora di «${next}».`;
    },
    [item?.word, keys, wordMode],
  );

  const applyProgress = useCallback(
    (next: number, by: "voice" | "touch", heard?: string) => {
      const previous = confirmedRef.current;
      if (next <= previous) return false;
      confirmedRef.current = next;
      setConfirmed(next);
      setProvisional(next);
      setConfirmedBy(by);
      // A gentle note for each key that just turned green.
      playNote(PIANO_NOTES[(next - 1) % PIANO_NOTES.length], 0.7);
      if (next < keys.length) {
        setMessage(
          `${by === "voice" && heard ? `¡Bien! Oí «${heard}». ` : "¡Bien! "}${promptFor(next)}`,
        );
      }
      return true;
    },
    [keys.length, promptFor],
  );

  const listening = usePianoListening({
    lang: locale,
    onFinal: (transcript) => {
      if (!item || confirmedRef.current >= keys.length) return;
      const next = advanceSyllables(keys, confirmedRef.current, transcript);
      if (!applyProgress(next, "voice", transcript.trim())) {
        setProvisional(confirmedRef.current);
        const expected = keys[confirmedRef.current];
        setMessage(
          transcript.trim()
            ? `Oí «${transcript.trim()}». No estoy segura de que sea «${expected}». Escucha y prueba otra vez.`
            : `No estoy segura de haber oído «${expected}». Prueba otra vez.`,
        );
      }
    },
    onInterim: (transcript) => {
      if (!transcript) {
        setProvisional(confirmedRef.current);
        return;
      }
      // Provisional only: lighter keys, never green, never progress.
      setProvisional(
        Math.max(confirmedRef.current, advanceSyllables(keys, confirmedRef.current, transcript)),
      );
    },
  });
  const {
    cancel: cancelListening,
    start: startListening,
    stop: stopListening,
    status,
    problem,
    processing,
    supported,
  } = listening;
  const micOpen = status !== "idle";

  // New word / new lesson / unmount: release the microphone, stop examples and
  // pending celebrations, then start the word fresh.
  const resetWord = useCallback(() => {
    cancelListening();
    exampleRunRef.current += 1;
    setExampleActive(false);
    confirmedRef.current = 0;
    setConfirmed(0);
    setProvisional(0);
    setConfirmedBy(null);
    setCelebrating(false);
    celebratedRef.current = null;
    if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
    gretelRef.current?.cancel();
  }, [cancelListening]);

  useEffect(() => {
    setItemIndex(0);
    hasTriggeredCompleteRef.current = false;
  }, [itemsKey]);

  useEffect(() => {
    resetWord();
    setMessage(
      touchMode
        ? "Toca las teclas en orden."
        : "Toca «Escuchar» y luego el micrófono para decir la palabra.",
    );
    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, itemIndex]);

  useEffect(
    () => () => {
      if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (problem && problem !== "no-speech" && problem !== "failed") setTouchMode(true);
    if (problem) setMessage(PROBLEM_MESSAGE[problem]);
  }, [problem]);

  const previousStatusRef = useRef(status);
  useEffect(() => {
    const previous = previousStatusRef.current;
    previousStatusRef.current = status;
    // A permission/device problem reported in the same moment always wins.
    if (
      previous === "starting" &&
      status === "listening" &&
      !problem &&
      confirmedRef.current < keys.length
    )
      setMessage(`Te escucho… ${promptFor(confirmedRef.current)}`);
  }, [status, keys.length, promptFor, problem]);

  // Word finished: exactly one small celebration per word.
  useEffect(() => {
    if (!done || !item) return;
    const celebrationKey = `${itemsKey}#${itemIndex}`;
    if (celebratedRef.current === celebrationKey) return;
    celebratedRef.current = celebrationKey;
    cancelListening();
    setCelebrating(true);
    playCorrectChord();
    const said = wordMode ? item.word : keys.join(", ");
    setMessage(`¡Muy bien! Dijiste «${said}».`);
    gretelTimerRef.current = setTimeout(() => {
      void gretelRef.current?.speakMessage(wordMode ? `¡Muy bien! ${item.word}.` : "¡Muy bien!");
    }, 650);
    if (lessonId) {
      // Only the outcome is recorded — never audio or transcripts.
      recordEvent({
        lessonId,
        kind: "exercise",
        score: itemIndex + 1,
        total: items.length,
        meta: {
          exercise: "piano_pronunciation",
          word: item.word,
          completed: true,
          by: confirmedBy ?? "voice",
        },
      });
    }
    if (isLastItem && !hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(() => onCompleteRef.current?.(), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Leaving the exercise (new lesson words, unmount) cancels a pending completion.
  useEffect(
    () => () => {
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    },
    [itemsKey],
  );

  const runExample = async (text: string, recording?: string) => {
    cancelListening();
    const run = ++exampleRunRef.current;
    setExampleActive(true);
    try {
      // Some devices never report the end of browser speech; never leave the
      // microphone blocked because of that.
      await Promise.race([
        playExample(text, recording),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);
    } finally {
      // Small gap so the tail of the example can never reach the microphone.
      setTimeout(() => {
        if (exampleRunRef.current === run) setExampleActive(false);
      }, 350);
    }
  };

  const listenToWord = () => {
    if (!item) return;
    const recording = wordMode ? approvedPictureRecording(item.word) : undefined;
    setMessage(wordMode ? `Escucha: «${item.word}».` : `Escucha: «${keys.join(", ")}».`);
    void runExample(wordMode ? item.word : keys.join(", "), recording).then(() => {
      if (confirmedRef.current < keys.length)
        setMessage(
          touchMode
            ? "Toca las teclas en orden."
            : `Ahora toca el micrófono. ${promptFor(confirmedRef.current)}`,
        );
    });
  };

  const pressKey = (index: number) => {
    const syllable = keys[index];
    if (!syllable) return;
    if (touchMode && index === confirmedRef.current && !done) {
      cancelListening();
      applyProgress(index + 1, "touch");
      void runExample(syllable);
      return;
    }
    playNote(PIANO_NOTES[index % PIANO_NOTES.length], 0.6);
    void runExample(syllable);
  };

  const toggleMic = () => {
    if (done || exampleActive) return;
    if (micOpen) {
      stopListening();
      return;
    }
    stopSpeech();
    startListening();
  };

  const nextWord = () => {
    if (isLastItem) {
      setItemIndex(0);
      if (items.length === 1) {
        resetWord();
        setMessage("Toca «Escuchar» y luego el micrófono para decir la palabra.");
      }
      return;
    }
    setItemIndex((current) => Math.min(current + 1, items.length - 1));
  };

  const restartWord = () => {
    resetWord();
    setMessage(touchMode ? "Toca las teclas en orden." : "Empecemos otra vez. Toca el micrófono.");
  };

  const keyStateFor = (index: number): KeyState => {
    if (index < confirmed) return "confirmed";
    if (index < provisional) return "provisional";
    if (index === confirmed && !done) return status === "hearing" ? "hearing" : "next";
    return "pending";
  };

  if (!item) return null;

  const micDisabled = done || exampleActive || !supported || touchMode;

  return (
    <div
      className="piano-hablador w-full p-5 sm:p-6 bg-gradient-to-b from-stone-100 to-stone-200 rounded-3xl border border-stone-300 shadow-xl my-6 max-w-2xl mx-auto flex flex-col items-center"
      data-piano-mode={wordMode ? "word" : "syllables"}
      data-piano-word={item.word}
      data-confirmed={confirmed}
      data-done={done ? "true" : "false"}
      data-mic-status={status}
      data-recognition-processing={processing}
    >
      <h3 className="text-2xl font-black text-stone-800 mb-1 font-display">El Piano Hablador</h3>
      <p className="text-xs text-stone-500 font-bold mb-3 uppercase tracking-wider">
        {wordMode
          ? "Di las sílabas y las teclas se ponen verdes"
          : "Pronuncia las sílabas para tocar las notas"}
      </p>

      {wordMode && (
        <div
          className="mb-3 flex flex-col items-center"
          aria-label={`Palabra ${itemIndex + 1} de ${items.length}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
            Palabra {itemIndex + 1} de {items.length}
          </span>
          <span
            className="piano-hablador__word font-display text-4xl font-black text-stone-800"
            lang="es"
          >
            {item.word}
          </span>
        </div>
      )}

      <div
        className="w-full bg-white/80 border border-stone-200/50 rounded-2xl p-3 text-center mb-4 min-h-[50px] flex items-center justify-center"
        role="status"
        aria-live="polite"
        data-testid="piano-message"
      >
        <span className="text-sm font-bold text-stone-700 leading-relaxed">{message}</span>
      </div>

      {/* Wooden cabinet with brass bar — the existing instrument. */}
      <div className="piano-hablador__cabinet bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 p-4 pb-2 rounded-2xl shadow-inner border border-amber-950 flex flex-col items-center relative">
        <div className="w-[calc(100%-8px)] h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-full mb-3 shadow-md" />
        {celebrating && (
          <svg
            key={`sparkle-${itemIndex}`}
            className="piano-hablador__sparkle"
            viewBox="0 0 24 24"
            aria-hidden="true"
            data-testid="piano-sparkle"
          >
            <path d="M12 1.5c.7 4.6 2.4 7.6 9 10.5-6.6 2.9-8.3 5.9-9 10.5-.7-4.6-2.4-7.6-9-10.5 6.6-2.9 8.3-5.9 9-10.5z" />
          </svg>
        )}
        <div className="piano-hablador__bed w-full flex justify-center bg-stone-900 p-1.5 rounded-lg overflow-hidden shadow-2xl relative">
          {keys.map((syllable, index) => {
            const state = keyStateFor(index);
            return (
              <div
                key={`${itemIndex}-${index}`}
                className="piano-hablador__slot relative"
                data-key-state={state}
              >
                <button
                  type="button"
                  aria-label={`Tecla ${syllable}, ${KEY_STATE_LABEL[state]}`}
                  aria-pressed={state === "confirmed"}
                  onClick={() => pressKey(index)}
                  className={cn(
                    "piano-hablador__key focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 focus:z-10",
                    `piano-hablador__key--${state}`,
                  )}
                  data-testid={`piano-key-${index}`}
                >
                  <span className="piano-hablador__label font-display" lang="es">
                    {syllable}
                  </span>
                  <span className="piano-hablador__mark" aria-hidden="true">
                    {state === "confirmed" ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : state === "hearing" || state === "provisional" ? (
                      <span className="piano-hablador__dots">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : null}
                  </span>
                </button>
                <button
                  type="button"
                  className="piano-hablador__listen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  aria-label={`Escuchar ${syllable}`}
                  onClick={() => {
                    playNote(PIANO_NOTES[index % PIANO_NOTES.length], 0.6);
                    void runExample(syllable);
                  }}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex w-full flex-wrap items-start justify-center gap-4">
        <button
          type="button"
          onClick={listenToWord}
          disabled={exampleActive}
          className="piano-hablador__control"
          data-testid="piano-escuchar"
        >
          <Volume2 className="h-5 w-5" /> Escuchar
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMic}
            disabled={micDisabled}
            aria-pressed={micOpen}
            aria-label={micOpen ? "Detener micrófono" : "Comenzar micrófono"}
            className={cn("piano-hablador__mic", micOpen && "piano-hablador__mic--open")}
            style={!micOpen && !micDisabled ? { backgroundColor: color } : undefined}
            data-testid="piano-mic"
          >
            {micOpen ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>
          <span
            className="text-[11px] font-bold text-stone-500 uppercase tracking-wide"
            data-testid="piano-mic-label"
          >
            {touchMode
              ? "Modo tocar"
              : status === "hearing"
                ? "Te oigo…"
                : micOpen
                  ? "Escuchando…"
                  : exampleActive
                    ? "Escucha el ejemplo"
                    : "Toca para hablar"}
          </span>
        </div>

        <button
          type="button"
          onClick={restartWord}
          className="piano-hablador__control"
          data-testid="piano-reset"
        >
          <RotateCcw className="h-5 w-5" /> Otra vez
        </button>
      </div>

      {done && (
        <div
          className="mt-5 flex w-full items-center justify-center gap-4"
          data-testid="piano-success"
        >
          <GretelLiveAvatar ref={gretelRef} managed size="sm" bubblePosition="right" />
          <button
            type="button"
            onClick={nextWord}
            className="piano-hablador__next"
            data-testid="piano-next"
          >
            {isLastItem
              ? items.length > 1
                ? "Empezar de nuevo"
                : "Otra vez"
              : "Siguiente palabra"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <button
          type="button"
          onClick={() => {
            cancelListening();
            setTouchMode((value) => !value);
            setMessage(
              !touchMode ? "Toca las teclas en orden." : "Toca el micrófono para decir la palabra.",
            );
          }}
          aria-pressed={touchMode}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-black text-stone-600 hover:bg-white/70"
          data-testid="piano-touch-mode"
        >
          <Hand className="h-4 w-4" /> {touchMode ? "Usar el micrófono" : "Tocar sin micrófono"}
        </button>
        <p
          className="max-w-sm text-[11px] font-semibold leading-snug text-stone-500"
          data-testid="piano-privacy"
        >
          La voz no se graba ni se guarda.{" "}
          {processing === "on-device"
            ? "El navegador la reconoce en este dispositivo."
            : "El navegador la reconoce con su propio servicio de voz."}
        </p>
      </div>
    </div>
  );
}

export default PianoPronunciation;
