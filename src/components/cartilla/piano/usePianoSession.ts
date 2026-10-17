/**
 * Shared Piano Hablador session logic for both designs ("Piano" and
 * "Cancionero"): verified book words / lesson syllables, on-device-only
 * microphone (`usePianoListening`), conservative syllable matching
 * (`advanceSyllables`), Escuchar examples (approved recording, else the
 * existing voice), word progression, one celebration per word, outcome-only
 * progress logging and the 2 s completion callback.
 *
 * Every key confirmed by one utterance plays its note in order (so a whole
 * word plays its little melody), then the chord.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePianoListening, type PianoListenProblem } from "@/hooks/usePianoListening";
import { playNote, playCorrectChord } from "@/lib/piano-audio";
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
import { getGretelVoiceProviderConfig } from "@/lib/gretel-voice";
import { recordEvent } from "@/lib/student-session";
import type { GretelLiveAvatarRef } from "@/components/gretel/GretelLiveAvatar";

export type KeyState = "pending" | "next" | "hearing" | "provisional" | "confirmed";

export const PROBLEM_MESSAGE: Record<PianoListenProblem, string> = {
  unsupported: "Este navegador no permite usar el micrófono para reconocer la voz.",
  "no-local":
    "Este navegador no tiene reconocimiento local compatible. Necesitas un dispositivo que pueda escuchar las vocales.",
  denied:
    "El micrófono no tiene permiso. Un adulto puede permitirlo en el navegador.",
  "no-microphone": "No encuentro un micrófono. Necesitas uno para jugar.",
  network: "El reconocimiento de voz no está disponible ahora. Prueba otra vez.",
  "no-speech": "No te oí. Toca el micrófono y habla cerca.",
  failed: "No pude escuchar esta vez. Toca el micrófono para probar otra vez.",
};

export const PRIVACY_NOTE = {
  "on-device":
    "La Cartilla no graba ni guarda la voz. El micrófono solo funciona con el reconocimiento de voz de este dispositivo; La Cartilla nunca usa un servicio de voz por internet.",
  unavailable:
    "La Cartilla no graba ni guarda la voz. Aquí no hay reconocimiento de voz dentro del dispositivo, así que el micrófono está apagado y no se usa ningún servicio de voz por internet.",
  checking:
    "La Cartilla no graba ni guarda la voz. Comprobando si este dispositivo puede reconocer la voz por sí mismo…",
} as const;

/** Gap between the notes of a word's melody. */
export const MELODY_STEP_MS = 170;

/** One example at a time; resolves when it finishes or is interrupted. */
function playExample(text: string, recording: string | undefined): Promise<void> {
  // One character voice throughout the reading curriculum, including Piano examples.
  if (getGretelVoiceProviderConfig().type === "custom") return speak(text);
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
      if (speechIsCurrent(token)) void speak(text);
    };
    const playing = audio.play() as Promise<void> | undefined;
    if (playing !== undefined) {
      playing.catch(() => {
        releaseSpeech(token);
        finish();
      });
    }
  });
}

export interface PianoSessionOptions {
  syllables: string[];
  words?: PianoWord[];
  lessonId?: string;
  onComplete?: () => void;
  locale?: string;
  /** Note frequency for the key that carries syllable `index`. */
  noteFor: (index: number) => number;
  /** Most syllables this keyboard can carry. */
  maxSyllables: number;
}

export function usePianoSession({
  syllables,
  words,
  lessonId,
  onComplete,
  locale = "es-MX",
  noteFor,
  maxSyllables,
}: PianoSessionOptions) {
  const items: PianoWord[] = useMemo(() => {
    const verified = (words ?? []).filter((entry) => entry.syllables.length > 0);
    if (verified.length > 0)
      return verified.map((entry) => ({
        ...entry,
        syllables: entry.syllables.slice(0, maxSyllables),
      }));
    const lessonSyllables = syllables.slice(0, maxSyllables);
    return lessonSyllables.length
      ? [{ word: lessonSyllables.join(" "), syllables: lessonSyllables }]
      : [];
  }, [syllables, words, maxSyllables]);
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
  const [exampleActive, setExampleActive] = useState(false);
  const [message, setMessage] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const [flash, setFlash] = useState<{ key: string; n: number } | null>(null);
  const confirmedRef = useRef(0);
  const celebratedRef = useRef<string | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gretelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const melodyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const exampleRunRef = useRef(0);
  const flashCountRef = useRef(0);
  const gretelRef = useRef<GretelLiveAvatarRef>(null);
  const onCompleteRef = useRef(onComplete);
  const hasTriggeredCompleteRef = useRef(false);
  const noteForRef = useRef(noteFor);
  noteForRef.current = noteFor;
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const done = keys.length > 0 && confirmed >= keys.length;
  const isLastItem = itemIndex >= items.length - 1;

  /** Light a key for a moment (`key` is a design-specific key id). */
  const flashKey = useCallback((key: string) => {
    flashCountRef.current += 1;
    setFlash({ key, n: flashCountRef.current });
  }, []);
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(timer);
  }, [flash]);

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

  /** Each newly lit key plays its own note, in order (first one right away). */
  const playMelody = useCallback(
    (from: number, to: number) => {
      melodyTimersRef.current.forEach(clearTimeout);
      melodyTimersRef.current = [];
      for (let index = from; index < to; index++) {
        const play = () => {
          playNote(noteForRef.current(index), 0.7);
          flashKey(`s${index}`);
        };
        if (index === from) play();
        else melodyTimersRef.current.push(setTimeout(play, (index - from) * MELODY_STEP_MS));
      }
    },
    [flashKey],
  );

  const applyProgress = useCallback(
    (next: number, heard?: string) => {
      const previous = confirmedRef.current;
      if (next <= previous) return false;
      confirmedRef.current = next;
      setConfirmed(next);
      setProvisional(next);
      playMelody(previous, next);
      if (next < keys.length) {
        setMessage(
          `${heard ? `¡Bien! Oí «${heard}». ` : "¡Bien! "}${promptFor(next)}`,
        );
      }
      return true;
    },
    [keys.length, promptFor, playMelody],
  );

  const handleFinal = useCallback(
    (transcript: string) => {
      if (!item || confirmedRef.current >= keys.length) return;
      const next = advanceSyllables(keys, confirmedRef.current, transcript);
      if (!applyProgress(next, transcript.trim())) {
        setProvisional(confirmedRef.current);
        const expected = keys[confirmedRef.current];
        setMessage(
          transcript.trim()
            ? `Oí «${transcript.trim()}». No estoy segura de que sea «${expected}». Escucha y prueba otra vez.`
            : `No estoy segura de haber oído «${expected}». Prueba otra vez.`,
        );
      }
    },
    [applyProgress, item, keys],
  );

  const listening = usePianoListening({
    lang: locale,
    onFinal: handleFinal,
    onInterim: (transcript) => {
      if (!transcript) {
        setProvisional(confirmedRef.current);
        return;
      }
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

  const resetWord = useCallback(() => {
    cancelListening();
    exampleRunRef.current += 1;
    setExampleActive(false);
    confirmedRef.current = 0;
    setConfirmed(0);
    setProvisional(0);
    setCelebrating(false);
    celebratedRef.current = null;
    melodyTimersRef.current.forEach(clearTimeout);
    melodyTimersRef.current = [];
    if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
    gretelRef.current?.cancel();
  }, [cancelListening]);

  useEffect(() => {
    setItemIndex(0);
    hasTriggeredCompleteRef.current = false;
  }, [itemsKey]);

  useEffect(() => {
    resetWord();
    setMessage("Toca «Escuchar» y luego el micrófono para decir la palabra.");
    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, itemIndex]);

  useEffect(
    () => () => {
      if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
      melodyTimersRef.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    if (problem) setMessage(PROBLEM_MESSAGE[problem]);
  }, [problem]);

  const previousStatusRef = useRef(status);
  useEffect(() => {
    const previous = previousStatusRef.current;
    previousStatusRef.current = status;
    if (
      previous === "starting" &&
      status === "listening" &&
      !problem &&
      confirmedRef.current < keys.length
    )
      setMessage(`Te escucho… ${promptFor(confirmedRef.current)}`);
  }, [status, keys.length, promptFor, problem]);

  // Word finished: exactly one celebration per word.
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
          by: "voice",
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
      await Promise.race([
        playExample(text, recording),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);
    } finally {
      setTimeout(() => {
        if (exampleRunRef.current === run) setExampleActive(false);
      }, 350);
    }
  };

  /** Escuchar: hear the whole word (or the syllable row). */
  const listenToWord = () => {
    if (!item) return;
    const recording = wordMode ? approvedPictureRecording(item.word) : undefined;
    setMessage(wordMode ? `Escucha: «${item.word}».` : `Escucha: «${keys.join(", ")}».`);
    void runExample(wordMode ? item.word : keys.join(", "), recording).then(() => {
      if (confirmedRef.current < keys.length)
        setMessage(`Ahora toca el micrófono. ${promptFor(confirmedRef.current)}`);
    });
  };

  /** Hear one syllable (the small Escuchar on a learning note). */
  const listenToSyllable = (index: number) => {
    const syllable = keys[index];
    if (!syllable) return;
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
    setMessage("Empecemos otra vez. Toca el micrófono.");
  };

  const keyStateFor = (index: number): KeyState => {
    if (index < confirmed) return "confirmed";
    if (index < provisional) return "provisional";
    if (index === confirmed && !done) return status === "hearing" ? "hearing" : "next";
    return "pending";
  };

  const micDisabled = done || exampleActive || !supported;

  return {
    items,
    item,
    itemIndex,
    keys,
    wordMode,
    confirmed,
    provisional,
    done,
    isLastItem,
    message,
    celebrating,
    flash,
    status,
    problem,
    processing,
    supported,
    micOpen,
    micDisabled,
    exampleActive,
    gretelRef,
    listenToWord,
    listenToSyllable,
    toggleMic,
    nextWord,
    restartWord,
    keyStateFor,
  };
}

export type PianoSession = ReturnType<typeof usePianoSession>;

export interface PianoDesignProps {
  syllables: string[];
  words?: PianoWord[];
  lessonId?: string;
  onComplete?: () => void;
  locale?: string;
}
