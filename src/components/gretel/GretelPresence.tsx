/**
 * GretelPresence — professional full-figure host (NOT corner sticker / pose roulette).
 *
 * Continuous layered life from existing faithful Gretel art:
 *   base idle + breath/sway CSS
 *   blink = brief closed-idle overlay (same canvas)
 *   speak = soft talk-0 mouth/open cycle while TTS plays
 *
 * Whole-body 4–5 pose carousel is NOT the primary system.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
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
import { prefersReducedMotion } from "@/lib/living-motion";

const IDLE = "/cartilla/images/gretel/poses/gretel-idle.webp";
const BLINK = "/cartilla/images/gretel/poses/gretel-closed-idle.webp";
const TALK = "/cartilla/images/gretel/poses/gretel-talk-0.webp";

export type GretelPresenceProps = {
  lesson: IntroCatalogSlice;
  /** Optional printed instruction to speak after intro (real book text only). */
  instruction?: string | null;
  className?: string;
  /** Auto-play short lesson intro once on mount. */
  autoIntro?: boolean;
};

export function GretelPresence({
  lesson,
  instruction,
  className = "",
  autoIntro = true,
}: GretelPresenceProps) {
  const [entered, setEntered] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [reactBoost, setReactBoost] = useState<"none" | "yes" | "no">("none");
  const [muted, setMuted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const introDone = useRef(false);
  const mouthTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMuted(isGretelVoiceMuted());
    setReduced(prefersReducedMotion());
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Continuous blink (layer only — not whole-body pose roulette)
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let schedule: ReturnType<typeof setTimeout> | undefined;
    const loop = () => {
      schedule = setTimeout(() => {
        if (cancelled || speaking) {
          loop();
          return;
        }
        setBlinking(true);
        hold = setTimeout(() => {
          setBlinking(false);
          loop();
        }, 120);
      }, 3000 + Math.random() * 4000);
    };
    loop();
    return () => {
      cancelled = true;
      if (schedule) clearTimeout(schedule);
      if (hold) clearTimeout(hold);
    };
  }, [reduced, speaking]);

  // Mouth cycle while speaking
  useEffect(() => {
    if (!speaking || reduced) {
      setMouthOpen(false);
      if (mouthTimer.current) clearInterval(mouthTimer.current);
      mouthTimer.current = null;
      return;
    }
    mouthTimer.current = setInterval(() => setMouthOpen((m) => !m), 140);
    return () => {
      if (mouthTimer.current) clearInterval(mouthTimer.current);
      mouthTimer.current = null;
    };
  }, [speaking, reduced]);

  const runSpeech = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setSpeaking(true);
    await speakAsGretel(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    setSpeaking(false);
  }, []);

  // Lesson intro once
  useEffect(() => {
    if (!autoIntro || introDone.current) return;
    introDone.current = true;
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 450));
      if (cancelled) return;
      const lines = buildLessonIntroLines(lesson);
      for (const line of lines) {
        if (cancelled) return;
        await runSpeech(line);
      }
      if (instruction?.trim() && !cancelled) {
        await runSpeech(instruction.trim());
      }
    })();
    return () => {
      cancelled = true;
      cancelGretelSpeech();
    };
  }, [autoIntro, lesson, instruction, runSpeech]);

  // Bus: success / miss short reactions
  useEffect(() => {
    return onGretelEvent((type) => {
      if (type === "answer:correct" || type === "activity:complete" || type === "lesson:complete") {
        setReactBoost("yes");
        void runSpeech(buildSuccessLine());
        setTimeout(() => setReactBoost("none"), 900);
      } else if (type === "answer:wrong") {
        setReactBoost("no");
        void runSpeech(buildMissLine());
        setTimeout(() => setReactBoost("none"), 900);
      }
    });
  }, [runSpeech]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) {
      cancelGretelSpeech();
      setSpeaking(false);
    }
  };

  const alive = !reduced;
  // Visible figure: base idle; blink overlay; speak uses talk layer
  const showBlink = blinking && !speaking;
  const showTalk = speaking && mouthOpen;

  return (
    <aside
      className={[
        "gretel-presence",
        entered ? "gretel-presence--in" : "",
        speaking ? "gretel-presence--speaking" : "",
        reactBoost === "yes" ? "gretel-presence--yes" : "",
        reactBoost === "no" ? "gretel-presence--no" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Gretel, la guía de la cartilla"
    >
      <div className="gretel-presence__stage">
        <span className="gretel-presence__shadow" aria-hidden />
        <div
          className={[
            "gretel-presence__figure",
            alive ? "gretel-presence__figure--alive" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Base continuous figure */}
          <img src={IDLE} alt="" className="gretel-presence__layer gretel-presence__base" draggable={false} />
          {/* Speak mouth/open layer from existing talk art — not a pose carousel */}
          <img
            src={TALK}
            alt=""
            className={[
              "gretel-presence__layer gretel-presence__talk",
              showTalk ? "is-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={false}
          />
          {/* Blink layer */}
          <img
            src={BLINK}
            alt=""
            className={[
              "gretel-presence__layer gretel-presence__blink",
              showBlink ? "is-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={false}
          />
        </div>
      </div>

      <div className="gretel-presence__chrome">
        <p className="gretel-presence__name">Gretel</p>
        <button
          type="button"
          onClick={toggleMute}
          className="gretel-presence__mute"
          aria-pressed={muted}
          aria-label={muted ? "Activar voz de Gretel" : "Silenciar voz de Gretel"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span>{muted ? "Sin voz" : "Con voz"}</span>
        </button>
      </div>
    </aside>
  );
}
