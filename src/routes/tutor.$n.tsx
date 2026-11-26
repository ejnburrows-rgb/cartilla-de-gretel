/**
 * /tutor/$n — persistent video-call tutor session for Lessons 1–24
 * (spec §2, §5, §9, §18 + Milestone 6).
 *
 * Guarantees:
 * - ONE persistent TutorSessionController per session
 * - ONE persistent TutorGretelPuppet instance (never remounted across layout switches)
 * - ONE recorded-audio speech channel (never TTS)
 * - ONE mic session (never restarted by layout switches)
 * - Real states ONLY (preparing, ready, listening, thinking, speaking,
 *   presenting, waiting, analyzing, recovering, ended)
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Star, VolumeX } from "lucide-react";
import { TutorCallShell } from "@/components/tutor/TutorCallShell";
import { TutorCameraPanel } from "@/components/tutor/TutorCameraPanel";
import {
  DEFAULT_TUTOR_CONSENT,
  TutorConsentControls,
  type TutorConsentState,
} from "@/components/tutor/TutorConsentControls";
import {
  TutorFlipchartPresenter,
  getFlipchartImportantRects,
} from "@/components/tutor/TutorFlipchartPresenter";
import { TutorGretelPuppet } from "@/components/tutor/TutorGretelPuppet";
import { TutorMicButton } from "@/components/tutor/TutorMicButton";
import {
  TutorPracticeHost,
  type TutorPracticeTarget,
} from "@/components/tutor/TutorPracticeHost";
import { TutorReplay } from "@/components/tutor/TutorReplay";
import { TutorTargetWord } from "@/components/tutor/TutorTargetWord";
import { TutorUnavailable } from "@/components/tutor/TutorUnavailable";
import { createSessionLog, type TutorSessionLog } from "@/lib/tutor-session-log";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { useGretelAnimation } from "@/components/gretel/useGretelAnimation";
import { CATALOG } from "@/lib/lesson-catalog";
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
import { ALL_CURRICULUM_LESSONS, lessonGraphFor } from "@/lib/tutor-content";
import {
  deriveSessionState,
  TutorSessionController,
} from "@/lib/tutor-session";
import {
  mountTutorVoice,
  speakTutorLine,
  type TutorPlaybackPosition,
  type TutorViseme,
} from "@/lib/tutor-voice";
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
        content: "Sesión del tutor interactivo de Gretel de La Cartilla de Gretel.",
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
  const validLesson = (ALL_CURRICULUM_LESSONS as readonly number[]).includes(lesson);
  const lessonRef = useRef(lesson);
  lessonRef.current = lesson;

  const lessonGraph = useMemo(() => lessonGraphFor(lesson), [lesson]);
  const catalogEntry = useMemo(
    () => CATALOG.find((candidate) => candidate.n === lesson),
    [lesson],
  );
  const defaultFlipchartPage = lessonGraph?.flipchartPages[0] ?? 1;
  const defaultWorkbookPage = lessonGraph?.printedWorkbookPages.start ?? 1;

  // ONE persistent session controller for the lifetime of this route identity
  const controller = useMemo(
    () =>
      new TutorSessionController({
        sessionId: `${search.code}-${search.slot}-l${lesson}`,
        lesson,
        initialLayoutMode: "call",
        initialMuted: isGretelVoiceMuted(),
        initialFlipchartPage: defaultFlipchartPage,
        initialWorkbookPage: defaultWorkbookPage,
      }),
    [lesson, search.code, search.slot, defaultFlipchartPage, defaultWorkbookPage],
  );

  useEffect(() => {
    controller.reconnect();
    return () => controller.dispose();
  }, [controller]);

  const shellSnapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

  const [brain, setBrain] = useState<BrainState | null>(null);
  const brainRef = useRef<BrainState | null>(null);
  const epochRef = useRef(0);
  const rngRef = useRef<() => number>(() => 0.5);

  const [unavailableProblem, setUnavailableProblem] = useState<EarsProblem | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [replaying, setReplaying] = useState(false);
  const [actuallyCapturing, setActuallyCapturing] = useState(false);
  const [linePlaying, setLinePlaying] = useState(false);
  const [effectsRunning, setEffectsRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<TutorPlaybackPosition | null>(null);
  const effectsInFlightRef = useRef(0);
  const silentHoldCancelRef = useRef<(() => void) | null>(null);
  const [silentLine, setSilentLine] = useState(false);
  const [viseme, setViseme] = useState("X");
  const [mark, setMark] = useState<{ isCorrect: boolean; key: number; itemId: string } | null>(
    null,
  );
  const [practiceTarget, setPracticeTarget] = useState<TutorPracticeTarget>({
    kind: "workbook",
    printedPage: defaultWorkbookPage,
    lesson,
  });
  const [consent, setConsent] = useState<TutorConsentState>(DEFAULT_TUTOR_CONSENT);
  const sessionLog = useMemo<TutorSessionLog>(
    () =>
      createSessionLog({
        sessionId: `${search.code}-${search.slot}-l${lesson}`,
        learnerId: `${search.code}:${search.slot}`,
        lesson,
        curriculumVersion: lessonGraph?.schemaVersion ?? "cartilla-24-v1",
      }),
    [search.code, search.slot, lesson, lessonGraph?.schemaVersion],
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

  // Keep practice target aligned when lesson changes
  useEffect(() => {
    setPracticeTarget({
      kind: "workbook",
      printedPage: defaultWorkbookPage,
      lesson,
    });
  }, [defaultWorkbookPage, lesson]);

  // Keep Mode C PiP protected regions synced with the active Flip Chart sheet
  useEffect(() => {
    const sheet = shellSnapshot.activeFlipchartPage ?? defaultFlipchartPage;
    const rects = getFlipchartImportantRects(sheet).map((r) => ({
      x: r.xPct / 100,
      y: r.yPct / 100,
      width: r.wPct / 100,
      height: r.hPct / 100,
      label: r.regionId,
    }));
    controller.setProtectedRegions(rects);
  }, [controller, shellSnapshot.activeFlipchartPage, defaultFlipchartPage]);

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
    setPlaybackPosition(null);
    controller.endSpeaking();
  }

  async function playLine(lineId: string): Promise<void> {
    const text = lineTextById.get(lineId);
    if (!text) {
      setSilentLine(true);
      return;
    }
    setSilentLine(false);
    const cleanedCaption = text
      .replace(/\[DRAFT[^\]]*\]\s*/g, "")
      .replace(/\s*\(reuse:.*\)$/, "");
    setSpokenText(cleanedCaption);
    controller.beginSpeaking(lineId, cleanedCaption, false);

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
      setSilentLine(true);
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
    controller.setMicCapturing(false);
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
        onCaptureChange: (cap) => {
          setActuallyCapturing(cap);
          controller.setMicCapturing(cap);
        },
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
      if (!state || !state.capturing) return;

      setAnalyzing(true);
      if (outcome.ok) {
        const alternatives = [...outcome.alternatives];
        if (chromeOutcome?.ok) {
          if (chromeOutcome.transcript && chromeOutcome.transcript !== outcome.transcript) {
            alternatives.push(chromeOutcome.transcript);
          }
          for (const alt of chromeOutcome.alternatives) {
            if (alt !== outcome.transcript && !alternatives.includes(alt)) alternatives.push(alt);
          }
        }
        if (outcome.transcript.trim()) {
          controller.appendTranscript({ speaker: "student", text: outcome.transcript.trim() });
        }
        dispatch({ type: "HEARD", transcript: outcome.transcript, alternatives });
      } else if (outcome.problem === "no-speech") {
        dispatch({ type: "HEARD", transcript: "", alternatives: [] });
      } else {
        dispatch({ type: "EARS_PROBLEM", problem: outcome.problem });
      }
      setAnalyzing(false);
    } catch {
      setAnalyzing(false);
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

  // Register controller callbacks so shell mute/interrupt/end drive real runtime
  useEffect(() => {
    controller.setCallbacks({
      onMuteChange: (nextMuted) => {
        setGretelVoiceMuted(nextMuted);
        if (nextMuted) stopVisemePlayer();
        stopMic();
        if (brainRef.current?.capturing) dispatchRef.current({ type: "MIC_CANCEL" });
      },
      onInterrupt: () => {
        resetIdleTimer();
        cancelGretelSpeech();
        stopVisemePlayer();
        stopMic();
        if (brainRef.current?.capturing) dispatchRef.current({ type: "MIC_CANCEL" });
      },
      onEndSession: () => {
        finishSession();
        const state = brainRef.current;
        if (state && state.started && state.phase !== "ENDED") {
          dispatchRef.current({ type: "EXIT" });
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller]);

  // ---------------------------------------------------------------------
  // Session lifecycle (ONE persistent voice + ears mount per lesson)
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
        setPlaybackPosition(position);
        if (!position) {
          setViseme("X");
          return;
        }
        const timeline = visemeTimelinesRef.current.get(position.lineId) ?? [];
        const cue = timeline.find(
          (segment) => segment.start <= position.currentTime && segment.end > position.currentTime,
        );
        const shape = cue?.shape ?? "X";
        setViseme(shape);
        controller.updatePlaybackPosition(
          position.currentTime,
          position.duration,
          position.lineId,
          shape,
        );
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
      epochRef.current += 1;
      const state = brainRef.current;
      if (state && state.started && state.phase !== "ENDED") {
        dispatchRef.current({ type: "EXIT" });
      }
      finishSession();
      ears.dispose?.();
      markDoneRef.current?.();
      markDoneRef.current = null;
      listenInFlightRef.current = false;
      disposeVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, search.code, search.slot]);

  // Clear the pencil mark whenever the active item changes.
  useEffect(() => {
    setMark(null);
  }, [item?.id]);

  // Puppet states from the brain's phases.
  useEffect(() => {
    if (!brain) return;
    if (brain.phase === "ENDED") {
      puppet.send({ type: "EXIT" });
    } else if (brain.phase === "CELEBRATE") {
      puppet.send({ type: "CHEER" });
    } else if (brain.phase === "LISTEN" && brain.capturing) {
      puppet.send({ type: "LISTEN" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brain?.phase, brain?.capturing]);

  // Derive ONLY real session states from actual runtime signals.
  const simulated = !import.meta.env.PROD && import.meta.env.VITE_TUTOR_EARS === "stub";
  const capturing = simulated ? Boolean(brain?.capturing) : actuallyCapturing;

  useEffect(() => {
    const presenting =
      shellSnapshot.layoutMode === "split" || shellSnapshot.layoutMode === "flipchart-pip";
    const nextState = deriveSessionState({
      hasBrain: brain !== null,
      brainPhase: brain?.phase ?? null,
      micCapturing: capturing,
      linePlaying,
      presenting: presenting && (linePlaying || brain?.phase === "MODEL"),
      thinking: effectsRunning && !linePlaying && !analyzing,
      analyzing,
      recovering: unavailableProblem !== null,
      ended: brain?.phase === "ENDED",
    });
    controller.setRealState(nextState);
  }, [
    controller,
    brain,
    capturing,
    linePlaying,
    effectsRunning,
    analyzing,
    unavailableProblem,
    shellSnapshot.layoutMode,
  ]);

  // Focus management on phase change.
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
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f6efe2] px-6 text-center text-[#2a211b]">
        <Star className="h-12 w-12 text-[#b88228]" aria-hidden="true" />
        <h1 className="text-2xl font-black">Esta lección todavía no está lista.</h1>
        <Link to="/tutor" className="text-lg font-bold text-[#1e4b82] underline">
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
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f6efe2] px-6 text-center text-[#2a211b]"
      >
        <Star className="h-16 w-16 text-[#b88228]" aria-hidden="true" />
        {brain.endedReason === "idle" ? (
          <h1 className="text-3xl font-black">Sesión en pausa</h1>
        ) : (
          <h1 className="text-4xl font-black">¡Muy bien!</h1>
        )}
        <Link
          to="/tutor"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#5c3d28]/20 bg-[#fffaf0] px-6 py-3 text-lg font-black text-[#2a211b] shadow-[0_6px_18px_rgba(42,33,27,0.1)]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Volver a las lecciones
        </Link>
      </main>
    );
  }

  const micDisabled =
    unavailableProblem !== null ||
    brain?.phase !== "LISTEN" ||
    replaying ||
    linePlaying ||
    effectsRunning;

  const replayDisabled =
    !item ||
    brain?.phase !== "LISTEN" ||
    capturing ||
    replaying ||
    linePlaying ||
    effectsRunning;

  const handleReplayLast = async () => {
    if (!item) return;
    resetIdleTimer();
    const epoch = epochRef.current;
    setReplaying(true);
    const lineId = modelLineIdForItem(item);
    if (lineId) await playLine(lineId);
    if (epoch === epochRef.current) setReplaying(false);
  };

  const activeSheet = shellSnapshot.activeFlipchartPage ?? defaultFlipchartPage;
  const lessonTitle = catalogEntry
    ? `Lección ${lesson} · ${catalogEntry.title}`
    : lessonGraph
      ? `Lección ${lesson} · ${lessonGraph.title}`
      : `Lección ${lesson}`;

  return (
    <TutorCallShell
      controller={controller}
      lessonTitle={lessonTitle}
      lessonSubtitle={catalogEntry?.subtitle ?? lessonGraph?.focus}
      backLink={
        <Link to="/tutor" onClick={finishSession} className="tutor-call-back">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Lecciones</span>
        </Link>
      }
      avatar={
        <TutorGretelPuppet
          state={puppet.machineState}
          viseme={viseme}
          playbackTime={playbackPosition?.currentTime ?? null}
          isSpeaking={linePlaying}
          isMuted={shellSnapshot.muted}
        />
      }
      card={
        <div
          data-tutor-word-card=""
          className="tutor-word-card w-full max-w-md"
        >
          <div className="flex flex-col items-center gap-4">
            {item ? (
              <TutorTargetWord
                word={item.text}
                playing={linePlaying && (brain?.phase === "MODEL" || replaying)}
              />
            ) : (
              <span aria-hidden="true" className="text-6xl font-black text-stone-300">
                ·
              </span>
            )}

            {silentLine ? (
              <p
                data-tutor-silent-line=""
                className="flex items-center gap-2 text-sm font-bold text-[#635145]"
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
              className="tutor-replay border border-[#5c3d28]/20 bg-[#f6efe2] text-[#2a211b] hover:bg-[#efe5d3] disabled:opacity-45"
              disabled={replayDisabled}
              onClick={() => void handleReplayLast()}
            >
              <RotateCcw className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
              Escuchar otra vez
            </button>

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
          {simulated && (
            <p className="text-xs font-semibold text-[#635145]">Prueba: micrófono simulado</p>
          )}
          <TutorUnavailable problem={unavailableProblem} />
        </>
      }
      flipchartSlot={
        <TutorFlipchartPresenter
          sheetNumber={activeSheet}
          lesson={lesson}
          playbackPosition={playbackPosition}
          isSpeaking={linePlaying}
          onSheetChange={(sheet) => controller.setFlipchartPage(sheet)}
        />
      }
      practiceSlot={
        <TutorPracticeHost
          target={practiceTarget}
          onWorkbookPageChange={(printedPage) => {
            controller.setWorkbookPage(printedPage);
            setPracticeTarget({ kind: "workbook", printedPage, lesson });
          }}
          onGameChange={(gameId) => {
            controller.setGameId(gameId);
            setPracticeTarget({ kind: "game", gameId, lesson });
          }}
          onRequestHint={() => void handleReplayLast()}
          onExitPractice={() => controller.setLayoutMode("call")}
        />
      }
      cameraSlot={
        <TutorCameraPanel
          enabled={shellSnapshot.cameraEnabled}
          onEnabledChange={(enabled) => {
            controller.setCameraEnabled(enabled);
            setConsent((prev) => ({ ...prev, studentCamera: enabled }));
          }}
          compact
        />
      }
      consentSlot={
        <TutorConsentControls
          consent={consent}
          onConsentChange={(next) => {
            setConsent(next);
            controller.setCameraEnabled(next.studentCamera);
            controller.setRecordingActive(next.audiovisualRecording);
          }}
          sessionId={sessionIdRef.current ?? shellSnapshot.sessionId}
          learnerId={`${search.code}:${search.slot}`}
          onRecordingSaved={() => controller.setRecordingActive(false)}
        />
      }
      replaySlot={<TutorReplay session={sessionLog} />}
      onReplayLast={() => void handleReplayLast()}
      replayDisabled={replayDisabled}
      textInputDisabled={!brain}
      onTextSubmit={(text) => {
        resetIdleTimer();
        if (brainRef.current?.phase === "LISTEN") {
          dispatch({ type: "HEARD", transcript: text, alternatives: [] });
        }
      }}
      onEndCall={() => {
        finishSession();
        const state = brainRef.current;
        if (state && state.started && state.phase !== "ENDED") {
          dispatch({ type: "EXIT" });
        }
      }}
    />
  );
}
