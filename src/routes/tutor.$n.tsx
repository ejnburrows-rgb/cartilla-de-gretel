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
import { TutorPracticeHost, type TutorPracticeTarget } from "@/components/tutor/TutorPracticeHost";
import { TutorReplay } from "@/components/tutor/TutorReplay";
import { TutorTargetWord } from "@/components/tutor/TutorTargetWord";
import { TutorUnavailable } from "@/components/tutor/TutorUnavailable";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { useGretelAnimation } from "@/components/gretel/useGretelAnimation";
import { CATALOG } from "@/lib/lesson-catalog";
import {
  buildListenGrammar,
  createBrainState,
  currentTargetItem,
  IDLE_TIMEOUT_MS,
  recommendedEarsMode,
  reduce,
  type BrainEvent,
  type BrainState,
  type Effect,
  type ProgressEvent,
} from "@/lib/tutor-brain";
import { ChromeLocalEars } from "@/lib/tutor-ears-chrome-local";
import { createTutorEars, type EarsLang, type EarsProblem, type TutorEars } from "@/lib/tutor-ears";
import { cancelGretelSpeech, isGretelVoiceMuted, setGretelVoiceMuted } from "@/lib/gretel-voice";
import {
  ALL_TUTOR_LINES,
  TEXT_ONLY_FALLBACK_LABEL,
  modelDeliveryForItem,
  resolveLineDelivery,
  SEQUENCE_PAUSE_MS,
  type UtteranceChainStep,
} from "@/lib/tutor-line-picker";
import {
  beginSession,
  noteMissedItem,
  recordConversationTurn,
  recordStreak,
  reviewRoundSet,
} from "@/lib/tutor-memory";
import {
  appendTutorProgress,
  flushTutorProgress,
  makeSessionId,
  readTutorProgressForLearner,
} from "@/lib/tutor-progress";
import { ALL_CURRICULUM_LESSONS, lessonGraphFor, type TutorItem } from "@/lib/tutor-content";
import {
  createSessionLog,
  appendSessionEvent,
  finalizeSessionLog,
  generateTeacherSessionReport,
  saveSessionLog,
  type NewSessionEventInput,
  type TutorSessionLog,
} from "@/lib/tutor-session-log";
import {
  findVerifiedFlipchartRegion,
  getTutorGamesForLesson,
  resolveVerifiedFlipchartRegions,
  type FlipchartChoreographyCue,
} from "@/lib/tutor-tools";
import {
  deriveSessionState,
  TutorSessionController,
  type TutorLayoutMode,
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

/** lineId → exact manifest text across legacy + v2 24-lesson banks. */
const lineTextById = new Map<string, string>(
  ALL_TUTOR_LINES.map((entry) => [entry.lineId, entry.text]),
);

function cleanDisplayCaption(text: string): string {
  const withoutDraft = text.startsWith("[DRAFT")
    ? text.replace(/^\[DRAFT[^\]]{0,120}\]\s*/, "")
    : text;
  const reuseIdx = withoutDraft.lastIndexOf("(reuse:");
  if (reuseIdx >= 0 && withoutDraft.endsWith(")")) {
    return withoutDraft.slice(0, reuseIdx).trimEnd();
  }
  return withoutDraft;
}

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
  const catalogEntry = useMemo(() => CATALOG.find((candidate) => candidate.n === lesson), [lesson]);
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
  const [processingTurn, setProcessingTurn] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<TutorPlaybackPosition | null>(null);
  const effectsInFlightRef = useRef(0);
  const silentHoldCancelRef = useRef<(() => void) | null>(null);
  const [silentLine, setSilentLine] = useState(false);
  const [viseme, setViseme] = useState("X");
  const [highlightedRegionId, setHighlightedRegionId] = useState<string | null>(null);
  const [flipchartCues, setFlipchartCues] = useState<FlipchartChoreographyCue[]>([]);
  const [mark, setMark] = useState<{ isCorrect: boolean; key: number; itemId: string } | null>(
    null,
  );
  const [practiceTarget, setPracticeTarget] = useState<TutorPracticeTarget>({
    kind: "workbook",
    printedPage: defaultWorkbookPage,
    lesson,
  });
  const [consent, setConsent] = useState<TutorConsentState>(DEFAULT_TUTOR_CONSENT);
  const initialLog = useMemo<TutorSessionLog>(
    () =>
      createSessionLog({
        sessionId: `${search.code}-${search.slot}-l${lesson}`,
        learnerId: `${search.code}:${search.slot}`,
        lesson,
        objective: lessonGraph?.focus ?? catalogEntry?.subtitle ?? `Lección ${lesson}`,
        curriculumVersion: lessonGraph?.schemaVersion ?? "cartilla-24-v1",
      }),
    [
      search.code,
      search.slot,
      lesson,
      lessonGraph?.schemaVersion,
      lessonGraph?.focus,
      catalogEntry?.subtitle,
    ],
  );
  const [sessionLog, setSessionLog] = useState<TutorSessionLog>(initialLog);
  const sessionLogRef = useRef<TutorSessionLog>(initialLog);

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
  const autoLayoutSwitchCountRef = useRef(0);
  const userOverrodeLayoutRef = useRef(false);

  const puppet = useGretelAnimation();
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const item = brain ? activeItemOf(brain) : null;

  useEffect(() => {
    sessionLogRef.current = initialLog;
    setSessionLog(initialLog);
  }, [initialLog]);

  function appendLogEvent(rawInput: NewSessionEventInput, persist = true): void {
    const next = appendSessionEvent(sessionLogRef.current, rawInput);
    sessionLogRef.current = next;
    setSessionLog(next);
    if (persist) {
      try {
        saveSessionLog(next);
      } catch {
        /* localStorage best-effort */
      }
    }
  }

  function finalizeAndSaveLog(): TutorSessionLog {
    const current = sessionLogRef.current;
    if (current.endedAt) {
      try {
        saveSessionLog(current);
      } catch {
        /* localStorage best-effort */
      }
      return current;
    }
    const finalized = finalizeSessionLog(current);
    sessionLogRef.current = finalized;
    setSessionLog(finalized);
    try {
      saveSessionLog(finalized);
    } catch {
      /* localStorage best-effort */
    }
    return finalized;
  }

  function applyAutoLayout(mode: TutorLayoutMode, force = false): void {
    const snap = controller.getSnapshot();
    if (!force && userOverrodeLayoutRef.current) return;
    if (snap.layoutMode === mode) return;
    autoLayoutSwitchCountRef.current = snap.layoutSwitchCount + 1;
    controller.setLayoutMode(mode);
  }

  useEffect(() => {
    if (shellSnapshot.layoutSwitchCount > autoLayoutSwitchCountRef.current) {
      userOverrodeLayoutRef.current = true;
    }
  }, [shellSnapshot.layoutSwitchCount]);

  function syncFlipchartHighlight(preferredSheet: number, targetItem?: TutorItem | null): void {
    const candidateSheets = [
      preferredSheet,
      ...(lessonGraph?.flipchartPages.filter((p) => p !== preferredSheet) ?? []),
    ];
    for (const sheetNum of candidateSheets) {
      const region = targetItem
        ? findVerifiedFlipchartRegion(sheetNum, {
            word: targetItem.text,
            letter: targetItem.kind === "vowel" ? targetItem.text : lessonGraph?.focus,
          })
        : (findVerifiedFlipchartRegion(sheetNum, { letter: lessonGraph?.focus }) ??
          resolveVerifiedFlipchartRegions(sheetNum).find(
            (r) => r.kind === "art" || r.kind === "scene" || r.kind === "letter",
          ) ??
          null);
      if (region) {
        controller.setFlipchartPage(region.sheetNumber);
        setHighlightedRegionId(region.regionId);
        setFlipchartCues([
          {
            cueId: `${region.regionId}@before`,
            sheetNumber: region.sheetNumber,
            regionId: region.regionId,
            cueTiming: "before",
            label: region.label,
          },
        ]);
        return;
      }
    }
    const fallbackRegion =
      resolveVerifiedFlipchartRegions(preferredSheet).find(
        (r) => r.kind === "art" || r.kind === "scene" || r.kind === "letter",
      ) ?? null;
    if (fallbackRegion) {
      controller.setFlipchartPage(preferredSheet);
      setHighlightedRegionId(fallbackRegion.regionId);
      setFlipchartCues([
        {
          cueId: `${fallbackRegion.regionId}@before`,
          sheetNumber: preferredSheet,
          regionId: fallbackRegion.regionId,
          cueTiming: "before",
          label: fallbackRegion.label,
        },
      ]);
    } else {
      controller.setFlipchartPage(preferredSheet);
      setHighlightedRegionId(null);
      setFlipchartCues([]);
    }
  }

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

  async function playTextFallback(
    text: string,
    lineId: string | null = null,
    _label: string = TEXT_ONLY_FALLBACK_LABEL,
  ): Promise<void> {
    const cleanedCaption = cleanDisplayCaption(text);
    setSpokenText(cleanedCaption);
    setSilentLine(true);
    controller.beginSpeaking(lineId ?? "text-fallback", cleanedCaption, true);
    if (!isGretelVoiceMuted()) {
      await sleep(SILENT_LINE_HOLD_MS, (cancel) => {
        silentHoldCancelRef.current = cancel;
      });
      silentHoldCancelRef.current = null;
    }
    stopVisemePlayer();
  }

  async function playLine(lineId: string): Promise<void> {
    const delivery = resolveLineDelivery(lineId);
    const rawText = delivery?.text ?? lineTextById.get(lineId);
    if (!rawText) {
      setSilentLine(true);
      return;
    }
    const cleanedCaption = cleanDisplayCaption(rawText);
    if (delivery && !delivery.isSpeech) {
      await playTextFallback(
        cleanedCaption,
        lineId,
        delivery.fallbackLabel ?? TEXT_ONLY_FALLBACK_LABEL,
      );
      return;
    }

    setSilentLine(false);
    setSpokenText(cleanedCaption);
    controller.beginSpeaking(lineId, cleanedCaption, false);

    const result = await speakTutorLine(rawText, {
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

  async function playChain(steps: readonly UtteranceChainStep[]): Promise<void> {
    for (let i = 0; i < steps.length; i += 1) {
      if (i > 0) await sleep(SEQUENCE_PAUSE_MS);
      const step = steps[i];
      if (step.lineId) {
        await playLine(step.lineId);
      } else {
        await playTextFallback(step.text, null, step.fallbackLabel ?? TEXT_ONLY_FALLBACK_LABEL);
      }
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
      const target = brainRef.current?.items.find((it) => it.id === evt.itemId);
      recordConversationTurn(undefined, evt.sessionId, {
        lesson: Number(evt.lessonId) || lessonRef.current,
        itemId: evt.itemId,
        outcome: evt.result,
        hintUsed: (brainRef.current?.hintLevel ?? 0) > 0,
        attempts: evt.attempts,
      });
      appendLogEvent({
        kind: "outcome",
        summary:
          evt.result === "correct"
            ? `Logró "${target?.text ?? evt.itemId}" en el primer intento`
            : evt.result === "correct_after_retry"
              ? `Logró "${target?.text ?? evt.itemId}" tras reintento (${evt.attempts} intentos)`
              : `Requiere refuerzo en "${target?.text ?? evt.itemId}" (${evt.attempts} intentos)`,
        itemId: evt.itemId,
        itemText: target?.text,
        outcome: evt.result,
        attemptNumber: evt.attempts,
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
      (e) =>
        e.type === "playLine" ||
        e.type === "showTextFallback" ||
        e.type === "presentChain" ||
        e.type === "markCorrect" ||
        e.type === "markWrongErase",
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
          case "showTextFallback": {
            const playback =
              linePlaybacks.length > 0
                ? linePlaybacks[linePlaybacks.length - 1]
                    .then(() => sleep(SEQUENCE_PAUSE_MS))
                    .then(() =>
                      alive()
                        ? playTextFallback(effect.text, effect.lineId, effect.label)
                        : undefined,
                    )
                : playTextFallback(effect.text, effect.lineId, effect.label);
            linePlaybacks.push(playback);
            break;
          }
          case "presentChain": {
            const playback =
              linePlaybacks.length > 0
                ? linePlaybacks[linePlaybacks.length - 1]
                    .then(() => sleep(SEQUENCE_PAUSE_MS))
                    .then(() => (alive() ? playChain(effect.steps) : undefined))
                : playChain(effect.steps);
            linePlaybacks.push(playback);
            break;
          }
          case "highlight": {
            const targetItem = state.items.find((it) => it.id === effect.itemId) ?? null;
            const sheet =
              state.activeFlipchartSheet ??
              controller.getSnapshot().activeFlipchartPage ??
              defaultFlipchartPage;
            syncFlipchartHighlight(sheet, targetItem);
            break;
          }
          case "openFlipchart": {
            syncFlipchartHighlight(effect.sheetNumber, activeItemOf(state));
            applyAutoLayout(effect.layout);
            const pageNode = lessonGraph?.pages.find((p) => p.pdfSheet !== null) ?? null;
            appendLogEvent({
              kind: "sheet_opened",
              summary: `Rotafolio · Lámina ${effect.sheetNumber} abierta`,
              printedPage: pageNode?.printedPage ?? defaultWorkbookPage,
              pdfSheet: effect.sheetNumber,
              sheetSource: "flipchart",
            });
            break;
          }
          case "setLayout":
            applyAutoLayout(effect.layout, state.stage === "CELEBRATE" || state.stage === "REVIEW");
            break;
          case "openWorkbook": {
            controller.setWorkbookPage(effect.printedPage);
            setPracticeTarget({ kind: "workbook", printedPage: effect.printedPage, lesson });
            applyAutoLayout("practice", true);
            const pageNode = lessonGraph?.pages.find((p) => p.printedPage === effect.printedPage);
            appendLogEvent({
              kind: "sheet_opened",
              summary: `Cuaderno · Página impresa ${effect.printedPage} abierta`,
              printedPage: effect.printedPage,
              pdfSheet: pageNode?.pdfSheet ?? null,
              sheetSource: "workbook",
              activityId: `workbook-p${effect.printedPage}`,
            });
            appendLogEvent({
              kind: "activity_started",
              summary: `Actividad de cuaderno (pág. ${effect.printedPage})`,
              activityId: `workbook-p${effect.printedPage}`,
              printedPage: effect.printedPage,
              sheetSource: "workbook",
            });
            break;
          }
          case "launchGame": {
            const available = getTutorGamesForLesson(lesson);
            const resolvedGameId =
              available.find((g) => g.id === effect.gameId)?.id ??
              effect.gameId ??
              available[0]?.id ??
              "vocal-a";
            controller.setGameId(resolvedGameId);
            setPracticeTarget({ kind: "game", gameId: resolvedGameId, lesson });
            applyAutoLayout("practice", true);
            appendLogEvent({
              kind: "activity_started",
              summary: `Juego de refuerzo iniciado: ${resolvedGameId}`,
              activityId: resolvedGameId,
            });
            break;
          }
          case "showHint": {
            const targetItem = state.items.find((it) => it.id === effect.itemId);
            if (sessionIdRef.current) {
              recordConversationTurn(undefined, sessionIdRef.current, {
                lesson: state.lesson,
                itemId: effect.itemId,
                outcome: "hint_given",
                hintUsed: true,
                attempts: state.attempts,
              });
            }
            appendLogEvent({
              kind: "hint",
              summary: `Pista nivel ${effect.level}: ${effect.hintText}`,
              itemId: effect.itemId,
              itemText: targetItem?.text,
              hintKind: `level-${effect.level}`,
              keyMomentTag: "hint",
            });
            break;
          }
          case "recordSessionEvent": {
            if (effect.kind === "objective") {
              appendLogEvent({
                kind: "presentation_action",
                summary: `Objetivo: ${effect.summary}`,
                presentationAction: "state_objective",
              });
            } else if (effect.kind === "flipchart") {
              appendLogEvent({
                kind: "presentation_action",
                summary: effect.summary,
                presentationAction: "present_flipchart",
                pdfSheet: effect.sheetNumber ?? null,
                sheetSource: "flipchart",
              });
            } else if (effect.kind === "question") {
              appendLogEvent({
                kind: "presentation_action",
                summary: effect.summary,
                presentationAction: "ask_question",
                itemId: effect.itemId,
                itemText: effect.itemText,
              });
            } else if (effect.kind === "correction") {
              appendLogEvent({
                kind: "correction",
                summary: effect.summary,
                itemId: effect.itemId,
                itemText: effect.itemText,
                correctionDetail: effect.summary,
                keyMomentTag: "correction",
              });
            } else if (effect.kind === "workbook" && effect.summary.includes("completada")) {
              appendLogEvent({
                kind: "activity_completed",
                summary: effect.summary,
                activityId: effect.printedPage ? `workbook-p${effect.printedPage}` : "workbook",
                printedPage: effect.printedPage,
                sheetSource: "workbook",
              });
            } else if (effect.kind === "game" && effect.summary.includes("completado")) {
              appendLogEvent({
                kind: "activity_completed",
                summary: effect.summary,
                activityId: effect.gameId ?? "game",
              });
            } else if (effect.kind === "review") {
              appendLogEvent({
                kind: "key_moment",
                summary: effect.summary,
                itemId: effect.itemId,
                itemText: effect.itemText,
                keyMomentTag: "milestone",
              });
            } else if (effect.kind === "complete") {
              appendLogEvent({
                kind: "progress_change",
                summary: effect.summary,
                progressFrom: "in_progress",
                progressTo: "completed",
              });
            }
            break;
          }
          case "markCorrect":
          case "markWrongErase":
            if (effect.type === "markWrongErase") {
              const answered = activeItemOf(state);
              appendLogEvent({
                kind: "attempt",
                summary: `Intento ${state.attempts} en "${answered?.text ?? ""}" con error`,
                itemId: answered?.id,
                itemText: answered?.text,
                attemptNumber: state.attempts,
                outcome: "missed",
                keyMomentTag: "mistake",
              });
            }
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
            finalizeAndSaveLog();
            break;
        }
      }

      setProcessingTurn(false);
      await Promise.all([...linePlaybacks, ...markWaiters]);
      if (!alive()) return;

      const after = brainRef.current;
      if (!after) return;

      if (after.phase === "ENDED") {
        if (after.endedReason === "complete" || after.endedReason === "idle") {
          writeMemory(after);
          flushTutorProgress();
          finalizeAndSaveLog();
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
      setProcessingTurn(false);
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
        setAnalyzing(false);
        setProcessingTurn(true);
        dispatch({
          type: "HEARD",
          transcript: outcome.transcript,
          alternatives,
          mode: recommendedEarsMode(state),
        });
      } else if (outcome.problem === "no-speech") {
        setAnalyzing(false);
        dispatch({ type: "HEARD", transcript: "", alternatives: [] });
      } else {
        setAnalyzing(false);
        dispatch({ type: "EARS_PROBLEM", problem: outcome.problem });
      }
    } catch {
      setAnalyzing(false);
      setProcessingTurn(false);
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
    finalizeAndSaveLog();
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
      const priorEvents = readTutorProgressForLearner(sessionId).filter(
        (ev) => ev.lesson_id === String(lessonRef.current),
      );

      const startedLog = createSessionLog({
        sessionId: `${sessionId}-l${lessonRef.current}-${Date.now().toString(36)}`,
        learnerId: `${search.code}:${search.slot}`,
        lesson: lessonRef.current,
        objective: lessonGraph?.focus ?? catalogEntry?.subtitle ?? `Lección ${lessonRef.current}`,
        curriculumVersion: lessonGraph?.schemaVersion ?? "cartilla-24-v1",
      });
      sessionLogRef.current = startedLog;
      setSessionLog(startedLog);
      if (memory.returning || priorEvents.length > 0) {
        appendLogEvent({
          kind: "progress_change",
          summary: `Progreso cargado: ${priorEvents.length} evento(s) previos${memory.returning ? " (estudiante recurrente)" : ""}`,
          progressFrom: "previous_session",
          progressTo: "resumed",
        });
      }

      const initial = createBrainState({
        lesson: lessonRef.current,
        sessionId,
        returning: memory.returning,
        reviewItemIds: memory.previousMissedItemIds,
        priorCompletedCount: priorEvents.length,
        pedagogicalFlow: true,
        includePracticeStages: true,
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

  const teacherReport = useMemo(() => generateTeacherSessionReport(sessionLog), [sessionLog]);

  useEffect(() => {
    const presenting =
      shellSnapshot.layoutMode === "split" || shellSnapshot.layoutMode === "flipchart-pip";
    const nextState = deriveSessionState({
      hasBrain: brain !== null,
      brainPhase: brain?.phase ?? null,
      micCapturing: capturing,
      linePlaying,
      presenting:
        presenting && (linePlaying || brain?.phase === "MODEL" || brain?.stage === "FLIPCHART"),
      thinking: processingTurn,
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
    processingTurn,
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
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        <Star className="h-16 w-16 text-[#b88228]" aria-hidden="true" />
        {brain.endedReason === "idle" ? (
          <h1 className="text-3xl font-black">Sesión en pausa</h1>
        ) : (
          <h1 className="text-4xl font-black">¡Muy bien!</h1>
        )}
        <p className="text-sm font-bold" style={{ color: "#635145" }}>
          Lección {lesson} · {sessionLog.events.length} eventos registrados localmente ·{" "}
          {sessionLog.activities.length} actividad(es)
        </p>

        <Link
          to="/tutor"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[#5c3d28]/20 bg-[#fffaf0] px-6 py-3 text-lg font-black text-[#2a211b]"
          style={{ boxShadow: "0 6px 18px rgba(42, 33, 27, 0.1)" }}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Volver a las lecciones
        </Link>

        <section
          className="mt-4 w-full text-left"
          style={{ maxWidth: "56rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
          aria-label="Resumen estructurado y reporte docente"
        >
          <TutorReplay session={sessionLog} />

          <div
            data-tutor-teacher-report-ready=""
            className="bg-white p-6"
            style={{
              borderRadius: "1.5rem",
              border: "2px solid #e8dcc0",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2 pb-3"
              style={{ borderBottom: "1px solid #e7e5e4" }}
            >
              <div>
                <h2 className="text-lg font-black" style={{ color: "#292524" }}>
                  Reporte docente preparado (8 secciones)
                </h2>
                <p className="text-xs font-semibold" style={{ color: "#78716c" }}>
                  {teacherReport.deviceNotice}
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-black"
                style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
              >
                Listo en dispositivo
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {teacherReport.sections.map((section) => (
                <article
                  key={section.title}
                  data-report-section={section.title}
                  data-report-category={section.category}
                  className="rounded-2xl p-4"
                  style={{ border: "1px solid #e7e5e4", backgroundColor: "#fffaf1" }}
                >
                  <h3 className="text-sm font-black" style={{ color: "#292524" }}>
                    {section.title}
                  </h3>
                  <ul
                    className="text-xs font-medium"
                    style={{
                      marginTop: "0.375rem",
                      paddingLeft: "1rem",
                      listStyleType: "disc",
                      color: "#44403c",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {section.lines.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
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
    !item || brain?.phase !== "LISTEN" || capturing || replaying || linePlaying || effectsRunning;

  const handleReplayLast = async () => {
    if (!item) return;
    resetIdleTimer();
    const epoch = epochRef.current;
    setReplaying(true);
    const delivery = modelDeliveryForItem(item);
    if (delivery.lineId) {
      await playLine(delivery.lineId);
    } else {
      await playTextFallback(
        delivery.text,
        null,
        delivery.fallbackLabel ?? TEXT_ONLY_FALLBACK_LABEL,
      );
    }
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
          data-pedagogical-stage={brain?.stage ?? "WELCOME"}
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
                <span>{TEXT_ONLY_FALLBACK_LABEL}</span>
              </p>
            ) : null}

            <p className="tutor-caption" role="status" aria-live="polite">
              {spokenText}
            </p>

            {brain?.phase === "LISTEN" &&
            item &&
            (brain.stage === "QUESTION" || brain.stage === "REVIEW") ? (
              <p
                data-tutor-question-prompt=""
                className="text-xs font-bold"
                style={{ color: "#1e4b82" }}
              >
                {item.kind === "sentence"
                  ? "¿Puedes leer esta oración en voz alta?"
                  : `¿Puedes decir «${item.text}»?`}
              </p>
            ) : null}

            {brain?.activeHint ? (
              <div
                data-tutor-hint-card=""
                data-tutor-hint-level={brain.activeHint.level}
                className="w-full rounded-2xl px-4 py-2 text-left text-xs"
                style={{
                  border: "1px solid rgba(184, 130, 40, 0.35)",
                  backgroundColor: "#fffaf0",
                  color: "#2a211b",
                }}
                role="note"
              >
                <strong className="block font-extrabold" style={{ color: "#9a3412" }}>
                  Pista nivel {brain.activeHint.level} · {brain.activeHint.visualCue}
                </strong>
                <p className="mt-1 m-0 font-semibold">{brain.activeHint.hintText}</p>
                <p className="mt-1 m-0" style={{ color: "#635145" }}>
                  {brain.activeHint.explanationText}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              className="tutor-replay border border-[#5c3d28]/20 bg-[#f6efe2] text-[#2a211b] hover:bg-[#efe5d3]"
              style={{ opacity: replayDisabled ? 0.45 : 1 }}
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
          cues={flipchartCues}
          highlightedRegionId={highlightedRegionId}
          playbackPosition={playbackPosition}
          isSpeaking={linePlaying}
          onSheetChange={(sheet) => {
            controller.setFlipchartPage(sheet);
            syncFlipchartHighlight(sheet, item);
          }}
        />
      }
      practiceSlot={
        <div className="flex h-full min-h-0 flex-col gap-3">
          {brain?.stage === "WORKBOOK_PRACTICE" || brain?.stage === "GAME_PRACTICE" ? (
            <div
              data-tutor-practice-banner=""
              data-pedagogical-stage={brain.stage}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-2 text-sm"
              style={{
                border: "1px solid rgba(184, 130, 40, 0.3)",
                backgroundColor: "#fffaf0",
                color: "#2a211b",
              }}
            >
              <div className="min-w-0">
                <strong className="font-extrabold">
                  {brain.stage === "WORKBOOK_PRACTICE"
                    ? "Práctica en el cuaderno"
                    : "Juego de refuerzo"}
                </strong>
                {spokenText ? (
                  <p className="m-0 text-xs font-semibold" style={{ color: "#635145" }}>
                    {spokenText}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {brain.stage === "WORKBOOK_PRACTICE" ? (
                  <button
                    type="button"
                    data-tutor-complete-workbook=""
                    onClick={() => {
                      resetIdleTimer();
                      dispatch({ type: "COMPLETE_WORKBOOK" });
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-extrabold text-white"
                    style={{ backgroundColor: "#1e4b82" }}
                  >
                    Continuar al juego
                  </button>
                ) : (
                  <button
                    type="button"
                    data-tutor-complete-game=""
                    onClick={() => {
                      resetIdleTimer();
                      dispatch({ type: "COMPLETE_GAME" });
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-extrabold text-white"
                    style={{ backgroundColor: "#0f766e" }}
                  >
                    Terminar práctica y revisar
                  </button>
                )}
              </div>
            </div>
          ) : null}
          <div className="min-h-0 flex-1">
            <TutorPracticeHost
              target={practiceTarget}
              onWorkbookPageChange={(printedPage) => {
                controller.setWorkbookPage(printedPage);
                setPracticeTarget({ kind: "workbook", printedPage, lesson });
                const pageNode = lessonGraph?.pages.find((p) => p.printedPage === printedPage);
                appendLogEvent({
                  kind: "sheet_opened",
                  summary: `Cuaderno · Página impresa ${printedPage}`,
                  printedPage,
                  pdfSheet: pageNode?.pdfSheet ?? null,
                  sheetSource: "workbook",
                });
              }}
              onGameChange={(gameId) => {
                controller.setGameId(gameId);
                setPracticeTarget({ kind: "game", gameId, lesson });
                appendLogEvent({
                  kind: "activity_started",
                  summary: `Juego de refuerzo: ${gameId}`,
                  activityId: gameId,
                });
              }}
              onRequestHint={() => void handleReplayLast()}
              onExitPractice={() => controller.setLayoutMode("call")}
            />
          </div>
        </div>
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
          setProcessingTurn(true);
          dispatch({
            type: "HEARD",
            transcript: text,
            alternatives: [],
            mode: recommendedEarsMode(brainRef.current),
          });
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
