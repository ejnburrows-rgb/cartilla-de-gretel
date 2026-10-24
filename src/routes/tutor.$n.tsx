/**
 * /tutor/$n — one tutor session (spec §2, §5, §9, §18): the full runtime
 * wiring of the finished lanes.
 *
 * - mounts the recorded-audio voice provider (never a TTS path),
 * - drives the pure brain with reduce() and translates its effects into
 *   UI + voice + progress + memory,
 * - opens the mic ONLY on the child's tap: ears.listen() with the lesson
 *   grammar from buildListenGrammar(); Chrome's on-device recognizer runs
 *   alongside as an extra alternative when it confirms on-device Spanish,
 * - 15 minutes without a tap → IDLE_TIMEOUT; leaving the route → EXIT,
 *   stopping the mic and speech,
 * - returning-child greeting + review round come from tutor-memory,
 * - celebrate at the end of the last (review) item.
 *
 * Runtime-only wiring decision (brain is untouched): the brain keeps
 * `missedItemIds` itself but reads its review queue from `reviewItemIds`,
 * so before each reduce the runtime merges the two the way §18.4 defines
 * (session misses first, then up to 3 carried over from last time). This
 * gives missed items one more try before celebrate without editing the
 * brain lane's module.
 */
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star, VolumeX, Volume2, RotateCcw } from "lucide-react";
import { TutorGretelPuppet } from "@/components/tutor/TutorGretelPuppet";
import { TutorMicButton } from "@/components/tutor/TutorMicButton";
import { TutorStage } from "@/components/tutor/TutorStage";
import { TutorTargetWord } from "@/components/tutor/TutorTargetWord";
import { TutorUnavailable } from "@/components/tutor/TutorUnavailable";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { useGretelAnimation } from "@/components/gretel/useGretelAnimation";
import {
  buildListenGrammar,
  createBrainState,
  currentTargetItem,
  IDLE_TIMEOUT_MS,
  reduce,
  type BrainEvent,
  type BrainState,
  type Effect,
  type ProgressEvent,
} from "@/lib/tutor-brain";
import { ChromeLocalEars } from "@/lib/tutor-ears-chrome-local";
import { createTutorEars, type EarsLang, type EarsProblem, type TutorEars } from "@/lib/tutor-ears";
import { cancelGretelSpeech, isGretelVoiceMuted, setGretelVoiceMuted } from "@/lib/gretel-voice";
import { modelLineIdForItem, SEQUENCE_PAUSE_MS, TUTOR_LINES } from "@/lib/tutor-line-picker";
import { beginSession, noteMissedItem, recordStreak, reviewRoundSet } from "@/lib/tutor-memory";
import { appendTutorProgress, flushTutorProgress, makeSessionId } from "@/lib/tutor-progress";
import { TUTOR_LESSONS } from "@/lib/tutor-content";
import { mountTutorVoice, speakTutorLine, type TutorViseme } from "@/lib/tutor-voice";
import { mulberry32, seedFromStrings } from "@/lib/random-with-seed";

export const Route = createFileRoute("/tutor/$n")({
  validateSearch: (search: Record<string, unknown>): TutorSessionSearch => ({
    code:
      typeof search.code === "string" && search.code.trim().length > 0
        ? search.code.trim()
        : "clase",
    slot:
      typeof search.slot === "number" &&
      Number.isInteger(search.slot) &&
      search.slot >= 1 &&
      search.slot <= 40
        ? search.slot
        : 1,
  }),
  component: TutorSessionScreen,
  head: () => ({
    meta: [
      { title: "Tutor de Gretel — Lección — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Sesión del tutor de voz de Gretel de La Cartilla de Gretel.",
      },
    ],
  }),
});

interface TutorSessionSearch {
  code: string;
  slot: number;
}

/** One-shot listen window (spec §18.3: silence at 6 s → gentle nudge). */
const LISTEN_MAX_MS = 6000;
const EARS_LANG: EarsLang = "es-MX";

/**
 * When a line resolves silent (pending wording, no recording yet) the
 * runtime still gives the karaoke card a short beat so the model step is
 * not skipped visually. Runtime pacing decision; no line is ever voiced.
 */
const SILENT_LINE_HOLD_MS = 1200;

/** lineId → exact manifest text (tutor-voice speaks text, not ids). */
const lineTextById = new Map<string, string>(
  TUTOR_LINES.map((entry) => [entry.lineId, entry.text]),
);

function sleep(ms: number, onRegisterCancel?: (cancel: () => void) => void): Promise<void> {
  return new Promise((resolve) => {
    const id = window.setTimeout(resolve, ms);
    onRegisterCancel?.(() => {
      window.clearTimeout(id);
      resolve();
    });
  });
}

function activeItemOf(state: BrainState) {
  if (!state.inReview) return currentTargetItem(state);
  const id = state.reviewItemIds[state.reviewIndex];
  return state.items.find((item) => item.id === id) ?? null;
}

function TutorSessionScreen() {
  const { n } = Route.useParams();
  const search = Route.useSearch();
  const lesson = Number(n);
  const validLesson = (TUTOR_LESSONS as readonly number[]).includes(lesson);
  const lessonRef = useRef(lesson);
  lessonRef.current = lesson;

  const [brain, setBrain] = useState<BrainState | null>(null);
  const brainRef = useRef<BrainState | null>(null);
  const epochRef = useRef(0);
  const rngRef = useRef<() => number>(() => 0.5);

  const [unavailableProblem, setUnavailableProblem] = useState<EarsProblem | null>(null);
  const [muted, setMuted] = useState(isGretelVoiceMuted);
  const [spokenText, setSpokenText] = useState("");
  const [replaying, setReplaying] = useState(false);
  const [actuallyCapturing, setActuallyCapturing] = useState(false);
  const [linePlaying, setLinePlaying] = useState(false);
  const [effectsRunning, setEffectsRunning] = useState(false);
  const effectsInFlightRef = useRef(0);
  const silentHoldCancelRef = useRef<(() => void) | null>(null);
  const [silentLine, setSilentLine] = useState(false);
  const [viseme, setViseme] = useState("X");
  const [mark, setMark] = useState<{ isCorrect: boolean; key: number; itemId: string } | null>(
    null,
  );

  const markDoneRef = useRef<(() => void) | null>(null);
  const earsRef = useRef<TutorEars | null>(null);
  const chromeRef = useRef<ChromeLocalEars | null>(null);
  const chromeReadyRef = useRef(false);
  const listenInFlightRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const prevMissedRef = useRef<string[]>([]);
  const visemeTimelinesRef = useRef(new Map<string, TutorViseme[]>());
  const visemeTimerRef = useRef<number | null>(null);
  const dispatchRef = useRef<(ev: BrainEvent) => void>(() => {});

  const puppet = useGretelAnimation();
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const item = brain ? activeItemOf(brain) : null;

  // ---------------------------------------------------------------------
  // Voice + visemes
  // ---------------------------------------------------------------------

  function stopVisemePlayer(): void {
    if (visemeTimerRef.current !== null) {
      window.clearTimeout(visemeTimerRef.current);
      visemeTimerRef.current = null;
    }
    silentHoldCancelRef.current?.();
    silentHoldCancelRef.current = null;
    setViseme("X");
    setLinePlaying(false);
  }

  async function playLine(lineId: string): Promise<void> {
    const text = lineTextById.get(lineId);
    if (!text) {
      setSilentLine(true);
      return;
    }
    setSilentLine(false);
    setSpokenText(text.replace(/\[DRAFT[^\]]*\]\s*/g, "").replace(/\s*\(reuse:.*\)$/, ""));
    const result = await speakTutorLine(text, {
      onStart: () => {
        setLinePlaying(true);
      },
      onEnd: () => {
        setLinePlaying(false);
      },
    });
    stopVisemePlayer();
    if (result === "silent" && !isGretelVoiceMuted()) {
      // Gentle pacing for pending lines: the visual model step still runs.
      await sleep(SILENT_LINE_HOLD_MS, (cancel) => {
        silentHoldCancelRef.current = cancel;
      });
      silentHoldCancelRef.current = null;
    }
  }

  // ---------------------------------------------------------------------
  // Progress + memory (on-device only)
  // ---------------------------------------------------------------------

  function logProgressEvent(evt: ProgressEvent): void {
    if (!sessionIdRef.current) return;
    try {
      appendTutorProgress({
        session_id: evt.sessionId,
        lesson_id: evt.lessonId,
        item_id: evt.itemId,
        result: evt.result,
        attempts: evt.attempts,
        created_at: new Date().toISOString(),
      });
    } catch {
      /* logging never breaks the session */
    }
  }

  function writeMemory(state: BrainState | null): void {
    if (!state || !state.started || !sessionIdRef.current) return;
    try {
      for (const itemId of state.missedItemIds) {
        noteMissedItem(window.localStorage, sessionIdRef.current, itemId);
      }
      recordStreak(window.localStorage, sessionIdRef.current, state.streak);
    } catch {
      /* memory is best-effort; progress already flushed separately */
    }
  }

  // ---------------------------------------------------------------------
  // Effects translation (brain Effect[] → UI + voice + progress)
  // ---------------------------------------------------------------------

  function runMark(isCorrect: boolean, state: BrainState): Promise<void> {
    const answered = activeItemOf(state);
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(safetyTimer);
        if (markDoneRef.current === finish) markDoneRef.current = null;
        resolve();
      };
      const safetyTimer = window.setTimeout(finish, isCorrect ? 5000 : 9000);
      markDoneRef.current = finish;
      setMark({
        isCorrect,
        key: Date.now(),
        itemId: answered?.id ?? `tutor-${state.lesson}`,
      });
    });
  }

  function stopMic(): void {
    earsRef.current?.cancel();
    chromeRef.current?.cancel();
    setActuallyCapturing(false);
  }

  async function handleEffects(state: BrainState, effects: Effect[], epoch: number): Promise<void> {
    const alive = () => epoch === epochRef.current;
    const hasBlockingEffects = effects.some(
      (e) => e.type === "playLine" || e.type === "markCorrect" || e.type === "markWrongErase",
    );
    if (hasBlockingEffects) {
      effectsInFlightRef.current += 1;
      setEffectsRunning(true);
    }
    const linePlaybacks: Promise<void>[] = [];
    const markWaiters: Promise<void>[] = [];
    try {

    for (const effect of effects) {
      if (!alive()) return;
      switch (effect.type) {
        case "playLine": {
          // Consecutive playLine effects are a response sequence: whole
          // lines back to back with a 400 ms pause (§18.5).
          const playback =
            linePlaybacks.length > 0
              ? linePlaybacks[linePlaybacks.length - 1]
                  .then(() => sleep(SEQUENCE_PAUSE_MS))
                  .then(() => (alive() ? playLine(effect.lineId) : undefined))
              : playLine(effect.lineId);
          linePlaybacks.push(playback);
          break;
        }
        case "highlight":
          // The card renders the active item from brain state directly.
          break;
        case "markCorrect":
        case "markWrongErase":
          markWaiters.push(runMark(effect.type === "markCorrect", state));
          break;
        case "logProgress":
          logProgressEvent(effect.evt);
          break;
        case "stopMic":
          stopMic();
          break;
        case "showUnavailable":
          setUnavailableProblem(effect.problem);
          break;
        case "cancelSpeech":
          cancelGretelSpeech();
          stopVisemePlayer();
          break;
        case "flushLog":
          flushTutorProgress();
          break;
      }
    }

    await Promise.all([...linePlaybacks, ...markWaiters]);
    if (!alive()) return;

    const after = brainRef.current;
    if (!after) return;

    if (after.phase === "ENDED") {
      if (after.endedReason === "complete" || after.endedReason === "idle") {
        writeMemory(after);
        flushTutorProgress();
      }
      return;
    }

    // LINE_DONE is the runtime's: once the response (lines + marks) is
    // finished, the brain advances GREET → MODEL → LISTEN → RESPOND → …
    if (
      after.phase === "GREET" ||
      after.phase === "MODEL" ||
      after.phase === "RESPOND" ||
      after.phase === "CELEBRATE"
    ) {
      dispatchRef.current({ type: "LINE_DONE" });
      return;
    }

    maybeListen();
    } finally {
      if (hasBlockingEffects) {
        effectsInFlightRef.current = Math.max(0, effectsInFlightRef.current - 1);
        if (epoch === epochRef.current && effectsInFlightRef.current === 0) {
          setEffectsRunning(false);
        }
      }
    }
  }

  function dispatch(ev: BrainEvent): void {
    const current = brainRef.current;
    if (!current) return;
    const epoch = epochRef.current;

    // Runtime wiring for §18.4: keep the brain's review queue in sync with
    // this session's misses (plus up to 3 from last time) outside the
    // review round itself. The brain module stays untouched.
    const base =
      !current.inReview && current.started
        ? {
            ...current,
            reviewItemIds: reviewRoundSet(current.missedItemIds, prevMissedRef.current),
          }
        : current;

    const { state, effects } = reduce(base, ev, rngRef.current);
    brainRef.current = state;
    setBrain(state);
    void handleEffects(state, effects, epoch);
  }
  dispatchRef.current = dispatch;

  // ---------------------------------------------------------------------
  // Ears pump (mic opens only on the child's tap)
  // ---------------------------------------------------------------------

  async function runListen(): Promise<void> {
    const epoch = epochRef.current;
    try {
      const grammar = buildListenGrammar(lessonRef.current);
      const primary = earsRef.current?.listen({
        lang: EARS_LANG,
        maxMs: LISTEN_MAX_MS,
        grammar,
        onCaptureChange: setActuallyCapturing,
      });
      if (!primary) return;
      const chrome = chromeReadyRef.current
        ? chromeRef.current
            ?.listen({ lang: EARS_LANG, maxMs: LISTEN_MAX_MS, grammar })
            .catch(() => null)
        : null;
      const [outcome, chromeOutcome] = await Promise.all([primary, chrome]);
      if (epoch !== epochRef.current) return;
      const state = brainRef.current;
      if (!state || !state.capturing) return; // stopMic / EXIT already settled this attempt

      if (outcome.ok) {
        // Fusion (§18.2): the Chrome on-device opinion joins as an extra
        // alternative; the brain's matcher decides on all of them.
        const alternatives = [...outcome.alternatives];
        if (chromeOutcome?.ok) {
          if (chromeOutcome.transcript && chromeOutcome.transcript !== outcome.transcript) {
            alternatives.push(chromeOutcome.transcript);
          }
          for (const alt of chromeOutcome.alternatives) {
            if (alt !== outcome.transcript && !alternatives.includes(alt)) alternatives.push(alt);
          }
        }
        dispatch({ type: "HEARD", transcript: outcome.transcript, alternatives });
      } else if (outcome.problem === "no-speech") {
        // §18.3 SILENCE: nothing in the window → gentle nudge path.
        dispatch({ type: "HEARD", transcript: "", alternatives: [] });
      } else {
        dispatch({ type: "EARS_PROBLEM", problem: outcome.problem });
      }
    } catch {
      if (epoch === epochRef.current) dispatch({ type: "EARS_PROBLEM", problem: "failed" });
    } finally {
      if (epoch === epochRef.current) {
        listenInFlightRef.current = false;
      }
    }
  }

  function maybeListen(): void {
    const state = brainRef.current;
    if (!state || state.phase !== "LISTEN" || !state.capturing) return;
    if (listenInFlightRef.current) return;
    listenInFlightRef.current = true;
    void runListen();
  }

  function clearIdleTimer(): void {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }

  function resetIdleTimer(): void {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      const state = brainRef.current;
      if (state && state.started && state.phase !== "ENDED") {
        dispatchRef.current({ type: "IDLE_TIMEOUT" });
      }
    }, IDLE_TIMEOUT_MS);
  }

  function finishSession(): void {
    stopMic();
    cancelGretelSpeech();
    stopVisemePlayer();
    clearIdleTimer();
    flushTutorProgress();
    writeMemory(brainRef.current);
  }

  // ---------------------------------------------------------------------
  // Session lifecycle
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (!validLesson) return;
    const epoch = ++epochRef.current;
    setUnavailableProblem(null);
    setBrain(null);
    setReplaying(false);
    setEffectsRunning(false);
    effectsInFlightRef.current = 0;
    brainRef.current = null;

    const disposeVoice = mountTutorVoice({
      onVisemeTimeline: (timeline, lineId) => {
        visemeTimelinesRef.current.set(lineId, timeline);
      },
      onPlaybackPosition: (position) => {
        if (!position) {
          setViseme("X");
          return;
        }
        const timeline = visemeTimelinesRef.current.get(position.lineId) ?? [];
        const cue = timeline.find(
          (segment) => segment.start <= position.currentTime && segment.end > position.currentTime,
        );
        setViseme(cue?.shape ?? "X");
      },
      onSilentLine: () => {
        setSilentLine(true);
      },
    });

    const ears = createTutorEars();
    earsRef.current = ears;
    ears
      .probe()
      .then((result) => {
        if (epoch === epochRef.current && result !== "ready") setUnavailableProblem(result);
      })
      .catch(() => {
        if (epoch === epochRef.current) setUnavailableProblem("failed");
      });

    // Chrome's on-device recognizer: extra opinion only when it confirms
    // on-device processing (spec §18.2). Never cloud, never mid-session.
    const chrome = new ChromeLocalEars();
    chromeRef.current = chrome;
    chrome
      .probe()
      .then((result) => {
        chromeReadyRef.current = result === "ready";
      })
      .catch(() => {
        chromeReadyRef.current = false;
      });

    let cancelled = false;
    void (async () => {
      let sessionId: string;
      try {
        sessionId = await makeSessionId(search.code, search.slot);
      } catch {
        sessionId = crypto.randomUUID();
      }
      if (cancelled || epoch !== epochRef.current) return;
      sessionIdRef.current = sessionId;
      rngRef.current = mulberry32(seedFromStrings(sessionId, String(lessonRef.current)));

      const memory = beginSession(undefined, sessionId, lessonRef.current);
      prevMissedRef.current = memory.previousMissedItemIds;

      const initial = createBrainState({
        lesson: lessonRef.current,
        sessionId,
        returning: memory.returning,
        reviewItemIds: memory.previousMissedItemIds,
      });
      brainRef.current = initial;
      setBrain(initial);
      resetIdleTimer();
      dispatchRef.current({ type: "START" });
    })();

    return () => {
      cancelled = true;
      epochRef.current += 1; // invalidate every in-flight async step
      const state = brainRef.current;
      if (state && state.started && state.phase !== "ENDED") {
        dispatchRef.current({ type: "EXIT" }); // cancelSpeech + stopMic
      }
      finishSession();
      ears.dispose?.();
      markDoneRef.current?.();
      markDoneRef.current = null;
      listenInFlightRef.current = false;
      disposeVoice();
    };
    // The session identity is fixed for the life of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, search.code, search.slot]);

  // Clear the pencil mark whenever the active item changes.
  useEffect(() => {
    setMark(null);
  }, [item?.id]);

  // Puppet states from the brain's phases (talking comes from the
  // gretel:speak_start/stop events the voice layer already dispatches).
  useEffect(() => {
    if (!brain) return;
    if (brain.phase === "ENDED") {
      puppet.send({ type: "EXIT" });
    } else if (brain.phase === "CELEBRATE") {
      puppet.send({ type: "CHEER" });
    } else if (brain.phase === "LISTEN" && brain.capturing) {
      puppet.send({ type: "LISTEN" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- send is stable; phases drive it
  }, [brain?.phase, brain?.capturing]);

  // Focus management on phase change (spec §9): the mic is the one control
  // the child needs in LISTEN; unavailable states take focus themselves.
  useEffect(() => {
    if (brain?.phase === "LISTEN" && !brain.capturing && !unavailableProblem) {
      micButtonRef.current?.focus();
    }
  }, [brain?.phase, brain?.capturing, unavailableProblem]);

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (!validLesson) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
        <Star className="h-12 w-12 text-amber-500" aria-hidden="true" />
        <h1 className="text-2xl font-black">Esta lección todavía no está lista.</h1>
        <Link to="/tutor" className="text-lg font-bold text-foreground/70 underline">
          Volver al tutor
        </Link>
      </main>
    );
  }

  if (brain?.phase === "ENDED") {
    return (
      <main
        data-tutor-ended=""
        data-ended-reason={brain.endedReason ?? undefined}
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[hsl(40_45%_93%)] px-6 text-center text-stone-800"
      >
        <Star className="h-16 w-16 text-amber-500" aria-hidden="true" />
        {brain.endedReason === "idle" ? (
          <h1 className="text-3xl font-black">Sesión en pausa</h1>
        ) : (
          /* Approved praise string from the line bank. */
          <h1 className="text-4xl font-black">¡Muy bien!</h1>
        )}
        <Link
          to="/tutor"
          className="kid-card mt-2 inline-flex items-center gap-2 px-6 py-4 text-lg font-black text-foreground"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          {/* DRAFT wording — owner to approve. */}
          Volver a las lecciones
        </Link>
      </main>
    );
  }

  const simulated = !import.meta.env.PROD && import.meta.env.VITE_TUTOR_EARS === "stub";
  const capturing = simulated ? Boolean(brain?.capturing) : actuallyCapturing;
  const micDisabled =
    unavailableProblem !== null ||
    brain?.phase !== "LISTEN" ||
    replaying ||
    linePlaying ||
    effectsRunning;

  return (
    <TutorStage
      controls={
        <>
          <Link to="/tutor" onClick={finishSession}>
            <ArrowLeft className="h-5 w-5" /> Lecciones
          </Link>
          <button
            type="button"
            aria-pressed={muted}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setGretelVoiceMuted(next);
              if (next) stopVisemePlayer();
              stopMic();
              if (brainRef.current?.capturing) dispatch({ type: "MIC_CANCEL" });
            }}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            {muted ? "Sin sonido" : "Sonido"}
          </button>
        </>
      }
      gretel={<TutorGretelPuppet state={puppet.machineState} viseme={viseme} />}
      card={
        <div
          data-tutor-word-card=""
          className="tutor-word-card relative rounded-[2rem] border-4 border-stone-200/80 bg-[#fffaf0] px-10 py-10 shadow-[0_10px_0_rgba(45,32,20,0.08)]"
        >
          <div className="flex flex-col items-center gap-4">
            {item ? (
              <TutorTargetWord word={item.text} playing={brain?.phase === "MODEL" && linePlaying} />
            ) : (
              <span aria-hidden="true" className="text-6xl font-black text-stone-300">
                ·
              </span>
            )}

            {/* Silent-line indicator (spec §9): a line had no recording.
                Icon-only by design; the aria-label wording is DRAFT. */}
            {silentLine ? (
              <p
                data-tutor-silent-line=""
                className="flex items-center gap-2 text-sm font-bold text-stone-400"
                aria-label="Sin audio en esta línea"
              >
                <VolumeX className="h-5 w-5" aria-hidden="true" />
                <span>Audio pendiente</span>
              </p>
            ) : null}

            <p className="tutor-caption" role="status" aria-live="polite">
              {spokenText}
            </p>
            <button
              type="button"
              className="tutor-replay"
              disabled={
                !item ||
                brain?.phase !== "LISTEN" ||
                capturing ||
                replaying ||
                linePlaying ||
                effectsRunning
              }
              onClick={async () => {
                if (!item) return;
                resetIdleTimer();
                const epoch = epochRef.current;
                setReplaying(true);
                const lineId = modelLineIdForItem(item);
                if (lineId) await playLine(lineId);
                if (epoch === epochRef.current) setReplaying(false);
              }}
            >
              <RotateCcw className="inline h-4 w-4" /> Escuchar otra vez
            </button>

            {/* Shared kernel marks (no tutor-local copy): wooden pencil
                green circle on correct, red + pink eraser on wrong. */}
            {mark ? (
              <WorkbookPencilMark
                key={mark.key}
                markType="circle"
                itemId={mark.itemId}
                isCorrect={mark.isCorrect}
                completeOnSuccess={false}
                onSuccess={() => markDoneRef.current?.()}
                onRetry={() => markDoneRef.current?.()}
              />
            ) : null}
          </div>
        </div>
      }
      mic={
        <TutorMicButton
          ref={micButtonRef}
          capturing={capturing}
          inviting={brain?.phase === "LISTEN" && !capturing}
          disabled={micDisabled}
          label={capturing ? "Escuchando a la niña o al niño" : "Toca para hablar"}
          onTap={() => {
            resetIdleTimer();
            dispatch({ type: brainRef.current?.capturing ? "MIC_CANCEL" : "MIC_TAP" });
          }}
        />
      }
      status={
        <>
          {simulated && <p className="text-sm">Prueba: micrófono simulado</p>}
          <TutorUnavailable problem={unavailableProblem} />
        </>
      }
    />
  );
}
