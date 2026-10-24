import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognitionCtor } from "@/lib/speech-recognition-types";

/**
 * Microphone session for the Piano Hablador.
 *
 * Uses only the browser's own Web Speech recognizer (no new service, no audio
 * recording, nothing stored). Differences from the shared
 * `useSpeechRecognition` hook, which other activities keep using unchanged:
 * - continuous + interim results, so "sa … po" with a pause stays one session;
 * - every FINAL result is delivered exactly once (by result index);
 * - interim text and the browser's speech-start/end events are exposed only as
 *   provisional listening feedback — never as a confirmed result;
 * - on-device only: a recognizer is created only after the browser confirms
 *   (`available({ processLocally: true })` === "available") that it can
 *   recognize this language on the device, and every session is started with
 *   `processLocally = true`. If that is unsupported, unconfirmed, still
 *   downloading or fails, the microphone stays off — there is never a silent
 *   fallback to an online speech service (Google, Apple or any other);
 * - errors are mapped to child-friendly states (denied, no microphone,
 *   network, no speech) instead of a console warning.
 */

export type PianoListenStatus = "idle" | "starting" | "listening" | "hearing";
export type PianoListenProblem =
  | "unsupported"
  | "no-local"
  | "denied"
  | "no-microphone"
  | "network"
  | "no-speech"
  | "failed";
/**
 * "checking": waiting for the browser's on-device answer (microphone off).
 * "on-device": confirmed; the only state in which the microphone can start.
 * "unavailable": no confirmed on-device recognizer; touch/keyboard only.
 */
export type PianoRecognitionProcessing = "checking" | "on-device" | "unavailable";

type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;

interface PianoRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  processLocally?: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
  onsoundstart?: (() => void) | null;
  onsoundend?: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionCtorWithAvailability = (new () => PianoRecognition) & {
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
};

export interface PianoListeningOptions {
  lang?: string;
  /** Called once per final recognizer result. */
  onFinal: (transcript: string) => void;
  /** Provisional text while the recognizer is still deciding. */
  onInterim?: (transcript: string) => void;
  /** Safety stop so a forgotten microphone never stays open. */
  maxSessionMs?: number;
  /**
   * Optional, provisional only: the browser picked up any sound (true) or the
   * sound stopped (false). Earlier than speech start, so the piano can react
   * the moment the child begins. Never a recognized result.
   */
  onSound?: (active: boolean) => void;
}

export interface PianoListening {
  /** True only when on-device recognition is confirmed for `lang`. */
  supported: boolean;
  status: PianoListenStatus;
  problem: PianoListenProblem | null;
  processing: PianoRecognitionProcessing;
  start: () => void;
  stop: () => void;
  /** Stop immediately and discard pending results (navigation, new word). */
  cancel: () => void;
}

const ERROR_MAP: Record<string, PianoListenProblem> = {
  "not-allowed": "denied",
  "audio-capture": "no-microphone",
  network: "network",
  "no-speech": "no-speech",
  // With processLocally, the browser reports these when it cannot stay on the
  // device; the microphone is then turned off rather than retried online.
  "language-not-supported": "no-local",
  "service-not-allowed": "no-local",
};

export function usePianoListening({
  lang = "es-MX",
  onFinal,
  onInterim,
  maxSessionMs = 15000,
  onSound,
}: PianoListeningOptions): PianoListening {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<PianoListenStatus>("idle");
  const [problem, setProblem] = useState<PianoListenProblem | null>(null);
  const [processing, setProcessing] = useState<PianoRecognitionProcessing>("checking");
  const recognitionRef = useRef<PianoRecognition | null>(null);
  const sessionRef = useRef(0);
  const deliveredRef = useRef<Set<number>>(new Set());
  const localRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  onFinalRef.current = onFinal;
  onInterimRef.current = onInterim;
  const onSoundRef = useRef(onSound);
  onSoundRef.current = onSound;

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor() as unknown as
      | RecognitionCtorWithAvailability
      | undefined;
    localRef.current = false;
    setSupported(false);
    const unavailable = () => {
      localRef.current = false;
      setSupported(false);
      setProcessing("unavailable");
      setProblem("no-local");
    };
    if (!Ctor) {
      setProcessing("unavailable");
      setProblem("unsupported");
      return;
    }
    if (typeof Ctor.available !== "function") {
      // The browser cannot promise on-device recognition: never start it.
      unavailable();
      return;
    }
    setProcessing("checking");
    let cancelled = false;
    const available = Ctor.available;
    // async wrapper: a synchronous throw becomes a rejection (handled below).
    const askOnDevice = async () => available.call(Ctor, { langs: [lang], processLocally: true });
    askOnDevice()
      .then((availability) => {
        if (cancelled) return;
        if (availability !== "available") {
          unavailable();
          return;
        }
        localRef.current = true;
        setSupported(true);
        setProcessing("on-device");
      })
      .catch(() => {
        if (!cancelled) unavailable();
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const detach = useCallback((mode: "stop" | "abort") => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    sessionRef.current += 1;
    clearTimer();
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onspeechstart = null;
    recognition.onspeechend = null;
    recognition.onsoundstart = null;
    recognition.onsoundend = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onstart = null;
    try {
      if (mode === "abort") recognition.abort();
      else recognition.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const cancel = useCallback(() => {
    const wasOpen = Boolean(recognitionRef.current);
    detach("abort");
    // Discarded provisional text must not leave keys half-lit.
    if (wasOpen) {
      onInterimRef.current?.("");
      onSoundRef.current?.(false);
    }
    setStatus("idle");
  }, [detach]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setStatus("idle");
      return;
    }
    // Let the recognizer flush its last final result, then end the session.
    try {
      recognition.stop();
    } catch {
      detach("abort");
      setStatus("idle");
    }
  }, [detach]);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor() as unknown as
      | RecognitionCtorWithAvailability
      | undefined;
    if (!Ctor) {
      setProblem("unsupported");
      return;
    }
    // Only a confirmed on-device recognizer may ever be created.
    if (!localRef.current) {
      setProblem("no-local");
      return;
    }
    detach("abort");
    const session = sessionRef.current;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.processLocally = true;
    if (recognition.processLocally !== true) {
      // The property did not stick: this recognizer cannot stay on the device.
      localRef.current = false;
      setSupported(false);
      setProcessing("unavailable");
      setProblem("no-local");
      return;
    }
    deliveredRef.current = new Set();
    const current = () => sessionRef.current === session && recognitionRef.current === recognition;

    let failed = false;
    recognition.onstart = () => {
      // Some browsers report "started" after a permission error; stay idle then.
      if (current() && !failed) setStatus("listening");
    };
    recognition.onsoundstart = () => {
      if (current()) onSoundRef.current?.(true);
    };
    recognition.onsoundend = () => {
      if (current()) onSoundRef.current?.(false);
    };
    recognition.onspeechstart = () => {
      if (current()) {
        onSoundRef.current?.(true);
        setStatus("hearing");
      }
    };
    recognition.onspeechend = () => {
      if (current()) setStatus("listening");
    };
    recognition.onresult = (event) => {
      if (!current()) return;
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? "";
        if (result?.isFinal) {
          if (deliveredRef.current.has(index)) continue;
          deliveredRef.current.add(index);
          onFinalRef.current(text);
        } else {
          interim += `${text} `;
        }
      }
      onInterimRef.current?.(interim.trim());
    };
    recognition.onerror = (event) => {
      if (!current()) return;
      if (event.error === "aborted") return;
      const mapped = ERROR_MAP[event.error] ?? "failed";
      if (mapped === "no-local") {
        localRef.current = false;
        setSupported(false);
        setProcessing("unavailable");
      }
      setProblem(mapped);
      if (mapped !== "no-speech") {
        // Permission, device or service problems: release the microphone now
        // instead of waiting for the browser's own end event.
        failed = true;
        detach("abort");
        onInterimRef.current?.("");
        onSoundRef.current?.(false);
        setStatus("idle");
      }
    };
    recognition.onend = () => {
      if (!current()) return;
      recognitionRef.current = null;
      clearTimer();
      onInterimRef.current?.("");
      onSoundRef.current?.(false);
      setStatus("idle");
    };

    recognitionRef.current = recognition;
    setProblem(null);
    setStatus("starting");
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus("idle");
      setProblem("failed");
      return;
    }
    timerRef.current = setTimeout(() => {
      if (current()) stop();
    }, maxSessionMs);
  }, [detach, lang, maxSessionMs, stop]);

  // Interruptions: leaving the tab or unmounting always releases the microphone.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") cancel();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      detach("abort");
    };
  }, [cancel, detach]);

  return { supported, status, problem, processing, start, stop, cancel };
}
