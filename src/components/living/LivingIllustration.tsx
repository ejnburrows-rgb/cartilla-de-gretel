/**
 * LivingIllustration — ambient life on EXISTING faithful art pixels only.
 * Breath + occasional eyelid overlay blink. Never redraws / regenerates art.
 */
import { useEffect, useState } from "react";
import { BLINK_HOLD_MS, nextBlinkDelayMs, prefersReducedMotion } from "@/lib/living-motion";
import { resolveTrueBlinkFrame } from "@/lib/living-blink-map";

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
  const trueBlink = resolveTrueBlinkFrame(src);

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
  // Prefer true blink frame when mapped; else soft lid overlay (unchanged timing).
  const displaySrc = blinking && trueBlink ? trueBlink : src;
  const useLidOverlay = alive && blinking && !trueBlink;

  return (
    <span
      className={[
        "living-illustration",
        alive ? "living-illustration--alive" : "",
        useLidOverlay ? "living-illustration--blink" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        draggable={false}
        className="living-illustration__art"
      />
      {/* Soft eyelid plane only when no true blink frame is registered. */}
      {useLidOverlay ? <span className="living-illustration__lids" aria-hidden="true" /> : null}
    </span>
  );
}
