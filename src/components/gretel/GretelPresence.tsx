/**
 * GretelPresence — audio chrome for the living host.
 *
 * Provides the "Gretel" label and mute toggle, and manages Gretel's audio
 * lines (intros, bus events) without rendering the character figure itself.
 */
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
import { onGretelEvent } from "@/lib/gretel-bus";

export type GretelPresenceProps = {
  /**
   * Lesson catalog slice for lesson intros. Optional when `variant="home"`.
   */
  lesson?: IntroCatalogSlice;
  /** Optional printed instruction to speak after intro (real book text only). */
  instruction?: string | null;
  className?: string;
  /** Auto-play short intro once on mount. */
  autoIntro?: boolean;
  /**
   * `lesson` (default) = lesson intro lines from catalog.
   * `home` = approved home greeting only (HOME_GREETING).
   */
  variant?: "lesson" | "home";
  /** Hide mute chrome (e.g. minimal home embed). Default false. */
  hideChrome?: boolean;
};

export function GretelPresence({
  lesson,
  instruction,
  className = "",
  autoIntro = true,
  variant = "lesson",
  hideChrome = false,
}: GretelPresenceProps) {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const introDone = useRef(false);

  useEffect(() => {
    setMuted(isGretelVoiceMuted());
    const t = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(t);
    };
  }, []);

  const runSpeech = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await speakAsGretel(text, {
        onStart: () => {},
        onEnd: () => {},
      });
    },
    []
  );

  // Intro once — home greeting OR lesson catalog lines
  useEffect(() => {
    if (!autoIntro || introDone.current) return;
    if (variant === "lesson" && !lesson) return;
    introDone.current = true;
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      const lines =
        variant === "home"
          ? buildHomeIntroLines()
          : buildLessonIntroLines(lesson!);
      for (const line of lines) {
        if (cancelled) return;
        await runSpeech(line);
      }
      if (variant === "lesson" && instruction?.trim() && !cancelled) {
        await runSpeech(instruction.trim());
      }
    })();
    return () => {
      cancelled = true;
      cancelGretelSpeech();
    };
  }, [autoIntro, lesson, instruction, runSpeech, variant]);

  // Bus: events for real student moments (lesson only)
  useEffect(() => {
    if (variant === "home") return;
    return onGretelEvent((type) => {
      if (type === "answer:correct" || type === "activity:complete" || type === "lesson:complete") {
        void runSpeech(buildSuccessLine());
        return;
      }
      if (type === "answer:wrong") {
        void runSpeech(buildMissLine());
        return;
      }
    });
  }, [runSpeech, variant]);

  useEffect(() => {
    return () => {
      cancelGretelSpeech();
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) {
      cancelGretelSpeech();
    }
  };

  return (
    <aside
      className={[
        "gretel-presence",
        entered ? "gretel-presence--in" : "",
        variant === "home" ? "gretel-presence--home" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Gretel, la guía de la cartilla"
      data-testid={variant === "home" ? "book-hero-gretel" : "gretel-presence"}
      data-sticker="false"
      data-gretel-system="presence"
      data-variant={variant}
    >
      {!hideChrome ? (
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
      ) : null}
    </aside>
  );
}
