/**
 * LivingIllustration — ambient life on EXISTING faithful art pixels only.
 * Breath + occasional eyelid overlay blink. Never redraws / regenerates art.
 */
import { useEffect, useState } from "react";
import {
  BLINK_HOLD_MS,
  nextBlinkDelayMs,
  prefersReducedMotion,
} from "@/lib/living-motion";

export interface LivingIllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  /** Optional: disable ambient motion for a specific asset. */
  static?: boolean;
  loading?: "lazy" | "eager";
}

export function LivingIllustration({
  src,
  alt = "",
  className = "",
  static: forceStatic = false,
  loading = "lazy",
}: LivingIllustrationProps) {
  const [reduced, setReduced] = useState(false);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (forceStatic || reduced) return;
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let scheduleTimer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      scheduleTimer = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        holdTimer = setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          schedule();
        }, BLINK_HOLD_MS);
      }, nextBlinkDelayMs());
    };
    schedule();
    return () => {
      cancelled = true;
      if (scheduleTimer) clearTimeout(scheduleTimer);
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [forceStatic, reduced, src]);

  const alive = !forceStatic && !reduced;

  return (
    <span
      className={[
        "living-illustration",
        alive ? "living-illustration--alive" : "",
        blinking ? "living-illustration--blink" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        className="living-illustration__art"
      />
      {/* Soft eyelid plane — composes over existing pixels; not a redrawn face. */}
      {alive ? (
        <span className="living-illustration__lids" aria-hidden="true" />
      ) : null}
    </span>
  );
}
