/** GretelPresence — the living lesson host: authentic pose animation + voice chrome. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  buildHomeIntroLines,
  buildLessonIntroLines,
  buildMissLine,
  buildSuccessLine,
  cancelGretelSpeech,
  isGretelVoiceMuted,
  setGretelVoiceMuted,
  speakAsGretel,
  type IntroCatalogSlice,
} from "@/lib/gretel-voice";
import { gretelEvent, onGretelEvent } from "@/lib/gretel-bus";
import { GretelLiveAvatar } from "./GretelLiveAvatar";

export type GretelPresenceProps = {
  lesson?: IntroCatalogSlice;
  instruction?: string | null;
  className?: string;
  autoIntro?: boolean;
  variant?: "lesson" | "home";
  hideChrome?: boolean;
  /** Living-book mode: hidden while paper turns, revealed only after the page settles. */
  bookMode?: boolean;
};

export function GretelPresence({
  lesson,
  instruction,
  className = "",
  autoIntro = true,
  variant = "lesson",
  hideChrome = false,
  bookMode = false,
}: GretelPresenceProps) {
  const [entered, setEntered] = useState(false);
  const [introReady, setIntroReady] = useState(!bookMode);
  const [muted, setMuted] = useState(false);
  const introDone = useRef(false);
  const lastReactionAt = useRef(0);

  useEffect(() => {
    setMuted(isGretelVoiceMuted());
    if (bookMode) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [bookMode]);

  useEffect(() => {
    if (!bookMode) return;
    return onGretelEvent((type) => {
      if (type === "page-turn:start") {
        setEntered(false);
        cancelGretelSpeech();
        return;
      }
      if (type === "page:revealed") {
        setEntered(true);
        setIntroReady(true);
      }
    });
  }, [bookMode]);

  const runSpeech = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await speakAsGretel(text);
  }, []);

  useEffect(() => {
    if (!introReady || !autoIntro || introDone.current) return;
    if (variant === "lesson" && !lesson) return;
    introDone.current = true;
    let cancelled = false;
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, bookMode ? 260 : 760));
      if (cancelled) return;
      if (variant === "lesson" && bookMode) gretelEvent("lesson:start");
      const lines = variant === "home" ? buildHomeIntroLines() : buildLessonIntroLines(lesson!);
      for (const line of lines) {
        if (cancelled) return;
        await runSpeech(line);
      }
      if (variant === "lesson" && instruction?.trim() && !cancelled) {
        await runSpeech(instruction.trim());
      }
      if (variant === "lesson" && bookMode && !cancelled) {
        gretelEvent("task:point");
      }
    })();
    return () => {
      cancelled = true;
      cancelGretelSpeech();
    };
  }, [autoIntro, bookMode, instruction, introReady, lesson, runSpeech, variant]);

  useEffect(() => {
    if (variant === "home") return;
    return onGretelEvent((type) => {
      const now = Date.now();
      if (type === "answer:correct") {
        if (now - lastReactionAt.current < 1400) return;
        lastReactionAt.current = now;
        void runSpeech(buildSuccessLine());
        return;
      }
      if (type === "activity:complete" || type === "lesson:complete") {
        // The avatar still gives the medium/big visual celebration. Avoid a
        // second spoken praise when completion immediately follows the final hit.
        if (now - lastReactionAt.current > 1600) {
          lastReactionAt.current = now;
          void runSpeech(buildSuccessLine());
        }
        return;
      }
      if (type === "answer:wrong") {
        lastReactionAt.current = now;
        void runSpeech(buildMissLine());
      }
    });
  }, [runSpeech, variant]);

  useEffect(() => () => cancelGretelSpeech(), []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) cancelGretelSpeech();
  };

  return (
    <aside
      className={[
        "gretel-presence",
        entered ? "gretel-presence--in" : "",
        variant === "home" ? "gretel-presence--home" : "",
        bookMode ? "gretel-presence--book" : "",
        className,
      ].filter(Boolean).join(" ")}
      aria-label="Gretel, la guía de la cartilla"
      data-testid={variant === "home" ? "book-hero-gretel" : "gretel-presence"}
      data-sticker="false"
      data-gretel-system="presence"
      data-variant={variant}
      data-placement={bookMode ? "book" : "standalone"}
      data-page-ready={entered ? "true" : "false"}
    >
      <GretelLiveAvatar
        size={variant === "home" ? "md" : "sm"}
        bubblePosition={bookMode ? "right" : "top"}
      />

      {!hideChrome && (
        <div className="gretel-presence__chrome">
          <p className="gretel-presence__name">Gretel</p>
          <button
            type="button"
            onClick={toggleMute}
            className="gretel-presence__mute"
            aria-pressed={muted}
            aria-label={muted ? "Activar voz de Gretel" : "Silenciar voz de Gretel"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? "Sin voz" : "Con voz"}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
