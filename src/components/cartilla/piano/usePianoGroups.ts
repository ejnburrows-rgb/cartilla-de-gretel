/**
 * Piano Hablador — design A ("Piano") session: nine keys in three groups of
 * three, one group per syllable (owner-approved 2026-10-23).
 *
 * For the group being practiced, left to right:
 *   1. the microphone picks up sound → the group's first key presses RED;
 *   2. the voice continues (or the recognizer starts hearing words) → the
 *      second key presses YELLOW;
 *   3. the recognizer's FINAL text is exactly this syllable → the third key
 *      presses GREEN, all three keys turn green and stay green, one small
 *      sparkle plays, and «¡Muy bien!» — then the next group starts.
 * A final result that is not this syllable says «Tratemos otra vez» and only
 * this group starts again; completed groups stay green.
 *
 * Red and yellow are listening feedback only. Sound never counts as a correct
 * pronunciation, nothing grades musical pitch, and nothing is recorded or
 * stored except the outcome. Two practice modes share this sequence:
 *   • "palabras" — a verified book word, one group per syllable (pa | le | ta);
 *   • "silabas"  — the lesson's own syllables, three at a time (pa | pe | pi).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePianoListening } from "@/hooks/usePianoListening";
import { playNote, playCorrectChord } from "@/lib/piano-audio";
import { advanceSyllables } from "@/lib/piano-word-tracker";
import type { PianoWord } from "@/lib/piano-words";
import { approvedPictureRecording } from "@/lib/picture-vocabulary";
import { stopSpeech } from "@/lib/speech-playback";
import { speak } from "@/lib/speak";
import { recordEvent } from "@/lib/student-session";
import type { GretelLiveAvatarRef } from "@/components/gretel/GretelLiveAvatar";
import {
  MELODY_STEP_MS,
  PROBLEM_MESSAGE,
  SPARKLE_MS,
  playExample,
  type PianoDesignProps,
} from "./usePianoSession";
import { GROUP_COUNT, GROUP_SIZE, NINE_WHITE, type GroupKeyState } from "./piano-keyboard";

export type PianoMode = "palabras" | "silabas";
type Phase = "idle" | "red" | "yellow";

/** Sound must last this long before the second key turns yellow. */
export const YELLOW_AFTER_MS = 450;
/** After the sound stops with no result, the keys lift again. */
export const RELEASE_AFTER_MS = 1200;
/** Results heard while the piano itself is speaking are ignored, plus this. */
export const FEEDBACK_GUARD_MS = 400;

export const TRY_AGAIN = "Tratemos otra vez";
export const WELL_DONE = "¡Muy bien!";

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < list.length; index += size) out.push(list.slice(index, index + size));
  return out;
}

export function usePianoGroups({
  syllables,
  words,
  lessonId,
  onComplete,
  locale = "es-MX",
}: PianoDesignProps) {
  const wordRounds: PianoWord[] = useMemo(
    () =>
      (words ?? []).filter(
        (entry) => entry.syllables.length > 0 && entry.syllables.length <= GROUP_COUNT,
      ),
    [words],
  );
  const syllableRounds: PianoWord[] = useMemo(
    () =>
      chunk(syllables.map((syllable) => syllable.trim()).filter(Boolean), GROUP_COUNT).map(
        (group) => ({ word: group.join(" "), syllables: group }),
      ),
    [syllables],
  );
  const modes: PianoMode[] = useMemo(
    () => [
      ...(wordRounds.length ? (["palabras"] as const) : []),
      ...(syllableRounds.length ? (["silabas"] as const) : []),
    ],
    [wordRounds.length, syllableRounds.length],
  );
  const [chosenMode, setChosenMode] = useState<PianoMode | null>(null);
  const mode: PianoMode | undefined =
    chosenMode && modes.includes(chosenMode) ? chosenMode : modes[0];
  const items = useMemo(
    () => (mode === "palabras" ? wordRounds : mode === "silabas" ? syllableRounds : []),
    [mode, wordRounds, syllableRounds],
  );
  const wordMode = mode === "palabras";
  const itemsKey = useMemo(
    () => `${mode}|${items.map((item) => `${item.word}:${item.syllables.join("-")}`).join("|")}`,
    [items, mode],
  );

  const [itemIndex, setItemIndex] = useState(0);
  const item = items[itemIndex];
  const keys = useMemo(() => item?.syllables ?? [], [item]);
  const [confirmed, setConfirmed] = useState(0);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [exampleActive, setExampleActive] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [flash, setFlash] = useState<{ key: number; n: number } | null>(null);
  const [sparkle, setSparkle] = useState<{ group: number; n: number } | null>(null);

  const confirmedRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const keysRef = useRef(keys);
  keysRef.current = keys;
  const feedbackUntilRef = useRef(0);
  const feedbackRunRef = useRef(0);
  const yellowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const melodyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gretelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exampleRunRef = useRef(0);
  const flashCountRef = useRef(0);
  const sparkleCountRef = useRef(0);
  const celebratedRef = useRef<string | null>(null);
  const hasTriggeredCompleteRef = useRef(false);
  const gretelRef = useRef<GretelLiveAvatarRef>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const done = keys.length > 0 && confirmed >= keys.length;
  const isLastItem = itemIndex >= items.length - 1;

  const clearListenTimers = () => {
    if (yellowTimerRef.current) clearTimeout(yellowTimerRef.current);
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    yellowTimerRef.current = null;
    releaseTimerRef.current = null;
  };
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);
  /** Lift the current group's keys back up. */
  const release = useCallback(() => {
    clearListenTimers();
    setPhase("idle");
  }, [setPhase]);

  const speaking = () => Date.now() < feedbackUntilRef.current;
  const listeningClosed = () =>
    !keysRef.current.length || confirmedRef.current >= keysRef.current.length || speaking();

  /** The piano speaks; the microphone's results are ignored meanwhile. */
  const sayFeedback = useCallback((text: string) => {
    const run = ++feedbackRunRef.current;
    feedbackUntilRef.current = Date.now() + 4000;
    void Promise.race([
      speak(text),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]).then(() => {
      if (feedbackRunRef.current !== run) return;
      feedbackUntilRef.current = Date.now() + FEEDBACK_GUARD_MS;
    });
  }, []);

  /** Any sound or voice: first key red now, second key yellow if it lasts. */
  const onVoice = useCallback(() => {
    if (listeningClosed()) return;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    if (phaseRef.current !== "idle") return;
    setPhase("red");
    yellowTimerRef.current = setTimeout(() => {
      if (phaseRef.current === "red") setPhase("yellow");
    }, YELLOW_AFTER_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPhase]);

  /** Recognizer text is arriving: both listening keys are down. */
  const onWords = useCallback(() => {
    if (listeningClosed()) return;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    if (yellowTimerRef.current) clearTimeout(yellowTimerRef.current);
    yellowTimerRef.current = null;
    if (phaseRef.current !== "yellow") setPhase("yellow");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPhase]);

  const onQuiet = useCallback(() => {
    if (phaseRef.current === "idle") return;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(() => {
      if (yellowTimerRef.current) clearTimeout(yellowTimerRef.current);
      yellowTimerRef.current = null;
      setPhase("idle");
    }, RELEASE_AFTER_MS);
  }, [setPhase]);

  const promptFor = useCallback(
    (count: number) => (keys[count] ? `Di «${keys[count]}».` : ""),
    [keys],
  );

  /** The group's three keys press in order with their notes (only on success). */
  const playGroup = useCallback((group: number) => {
    melodyTimersRef.current.forEach(clearTimeout);
    melodyTimersRef.current = [];
    for (let step = 0; step < GROUP_SIZE; step++) {
      const key = group * GROUP_SIZE + step;
      const play = () => {
        playNote(NINE_WHITE[key].freq, 0.7);
        flashCountRef.current += 1;
        setFlash({ key, n: flashCountRef.current });
      };
      if (step === 0) play();
      else melodyTimersRef.current.push(setTimeout(play, step * MELODY_STEP_MS));
    }
  }, []);
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(timer);
  }, [flash]);
  useEffect(() => {
    if (!sparkle) return;
    const timer = setTimeout(() => setSparkle(null), SPARKLE_MS);
    return () => clearTimeout(timer);
  }, [sparkle]);

  const handleFinal = useCallback(
    (transcript: string) => {
      if (listeningClosed()) return;
      const heard = transcript.trim();
      const group = confirmedRef.current;
      const target = keysRef.current[group];
      if (!heard || !target) {
        release();
        return;
      }
      // Only this group's syllable, said as its own word, turns the keys green.
      const correct = advanceSyllables([target], 0, heard) === 1;
      release();
      if (!correct) {
        setMessage(`Oí «${heard}». ${TRY_AGAIN}: di «${target}».`);
        sayFeedback(TRY_AGAIN);
        return;
      }
      const next = group + 1;
      confirmedRef.current = next;
      setConfirmed(next);
      playGroup(group);
      sparkleCountRef.current += 1;
      setSparkle({ group, n: sparkleCountRef.current });
      if (next < keysRef.current.length) {
        setMessage(`${WELL_DONE} Dijiste «${target}». Ahora di «${keysRef.current[next]}».`);
        sayFeedback(WELL_DONE);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playGroup, release, sayFeedback],
  );

  const listening = usePianoListening({
    lang: locale,
    maxSessionMs: 30000,
    onFinal: handleFinal,
    onInterim: (transcript) => {
      if (transcript) onWords();
    },
    onSound: (active) => {
      if (active) onVoice();
      else onQuiet();
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

  // The browser's speech-start also counts as voice (some never send sound events).
  useEffect(() => {
    if (status === "hearing") onVoice();
  }, [status, onVoice]);

  const resetRound = useCallback(() => {
    cancelListening();
    exampleRunRef.current += 1;
    feedbackRunRef.current += 1;
    feedbackUntilRef.current = 0;
    setExampleActive(false);
    confirmedRef.current = 0;
    setConfirmed(0);
    release();
    setCelebrating(false);
    setSparkle(null);
    celebratedRef.current = null;
    melodyTimersRef.current.forEach(clearTimeout);
    melodyTimersRef.current = [];
    if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
    gretelRef.current?.cancel();
  }, [cancelListening, release]);

  useEffect(() => {
    setItemIndex(0);
    hasTriggeredCompleteRef.current = false;
  }, [itemsKey]);

  useEffect(() => {
    resetRound();
    setMessage("Toca «Escuchar» y luego el micrófono.");
    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, itemIndex]);

  useEffect(
    () => () => {
      clearListenTimers();
      if (gretelTimerRef.current) clearTimeout(gretelTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
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
    if (problem || confirmedRef.current >= keys.length) return;
    if (previous === "starting" && status === "listening")
      setMessage(`Te escucho… ${promptFor(confirmedRef.current)}`);
    if (previous !== "idle" && status === "idle") {
      release();
      setMessage(`Toca el micrófono para seguir. ${promptFor(confirmedRef.current)}`);
    }
  }, [status, keys.length, promptFor, problem, release]);

  // Whole word / round finished: exactly one celebration.
  useEffect(() => {
    if (!done || !item) return;
    const celebrationKey = `${itemsKey}#${itemIndex}`;
    if (celebratedRef.current === celebrationKey) return;
    celebratedRef.current = celebrationKey;
    cancelListening();
    setCelebrating(true);
    playCorrectChord();
    setMessage(`${WELL_DONE} Dijiste «${wordMode ? item.word : keys.join(", ")}».`);
    gretelTimerRef.current = setTimeout(() => {
      void gretelRef.current?.speakMessage(wordMode ? `${WELL_DONE} ${item.word}.` : WELL_DONE);
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
          mode,
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

  const listenToWord = () => {
    if (!item) return;
    const recording = wordMode ? approvedPictureRecording(item.word) : undefined;
    const text = wordMode ? item.word : keys.join(", ");
    setMessage(`Escucha: «${text}».`);
    void runExample(text, recording).then(() => {
      if (confirmedRef.current < keys.length)
        setMessage(`Ahora toca el micrófono. ${promptFor(confirmedRef.current)}`);
    });
  };

  const listenToSyllable = (group: number) => {
    const syllable = keys[group];
    if (syllable) void runExample(syllable);
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
        resetRound();
        setMessage("Toca «Escuchar» y luego el micrófono.");
      }
      return;
    }
    setItemIndex((current) => Math.min(current + 1, items.length - 1));
  };

  const restartWord = () => {
    resetRound();
    setMessage("Empecemos otra vez. Toca el micrófono.");
  };

  const chooseMode = (next: PianoMode) => {
    if (next === mode || !modes.includes(next)) return;
    setChosenMode(next);
  };

  /** State of syllable group `group` (0..2). */
  const groupStateFor = (group: number): GroupKeyState => {
    if (group < confirmed) return "confirmed";
    if (group > confirmed || done) return "pending";
    return phase === "idle" ? "next" : phase;
  };

  /** State of white key `key` (0..8); "free" when its group carries no syllable. */
  const keyStateFor = (key: number): GroupKeyState | "free" => {
    const group = Math.floor(key / GROUP_SIZE);
    if (group >= keys.length) return "free";
    const state = groupStateFor(group);
    if (state === "red" || state === "yellow") {
      const step = key % GROUP_SIZE;
      if (step === 0) return "red";
      if (step === 1 && state === "yellow") return "yellow";
      return "next";
    }
    return state;
  };

  return {
    modes,
    mode,
    chooseMode,
    items,
    item,
    itemIndex,
    keys,
    wordMode,
    confirmed,
    done,
    isLastItem,
    message,
    celebrating,
    flash,
    sparkle,
    status,
    problem,
    processing,
    supported,
    micOpen,
    micDisabled: done || exampleActive || !supported,
    exampleActive,
    gretelRef,
    listenToWord,
    listenToSyllable,
    toggleMic,
    nextWord,
    restartWord,
    groupStateFor,
    keyStateFor,
  };
}

export type PianoGroups = ReturnType<typeof usePianoGroups>;
