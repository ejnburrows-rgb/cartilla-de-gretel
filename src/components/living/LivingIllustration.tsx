/**
 * LivingIllustration — subtle life on EXISTING faithful art pixels only.
 * True blink frames remain strictly allow-listed; ambient motion is CSS transform
 * only and never redraws, recolors, warps, or replaces the source pixels.
 */
import { useEffect, useMemo, useState } from "react";
import { BLINK_HOLD_MS, nextBlinkDelayMs, prefersReducedMotion } from "@/lib/living-motion";
import { resolveTrueBlinkFrame } from "@/lib/living-blink-map";
import { getFaithfulDeliverySrcSet } from "@/lib/art-delivery";

export interface LivingIllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  /** Optional: disable ambient motion for a specific asset. */
  static?: boolean;
  loading?: "lazy" | "eager";
}

type AmbientProfile = "breathe" | "float" | "sway" | null;

const APPROVED_AMBIENT_PROFILES: Readonly<Record<string, Exclude<AmbientProfile, null>>> = {
  "/cartilla/art/faithful/vocal-o/oso.webp": "breathe",
  "/cartilla/art/faithful/vocal-o/oruga.webp": "sway",
};

function ambientProfileFor(src: string): AmbientProfile {
  return APPROVED_AMBIENT_PROFILES[src] ?? null;
}

function phaseFor(src: string): number {
  let hash = 0;
  for (let i = 0; i < src.length; i++) hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
  return hash % 3;
}

export function LivingIllustration({
  src,
  alt = "",
  className = "",
  static: forceStatic = false,
  loading = "lazy",
}: LivingIllustrationProps) {
  const trueBlink = resolveTrueBlinkFrame(src);
  const [reduced, setReduced] = useState(false);
  const [blinkReady, setBlinkReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [reacting, setReacting] = useState(false);
  const ambientProfile = useMemo(
    () => (forceStatic ? null : ambientProfileFor(src)),
    [forceStatic, src],
  );
  const phase = useMemo(() => phaseFor(src), [src]);
  const canBlink = ambientProfile === "breathe" && !forceStatic;
  const isCreature = ambientProfile === "breathe" && !forceStatic;
  const blinkMode = trueBlink ? "frame" : canBlink ? "fallback" : "none";

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!canBlink) {
      setBlinkReady(false);
      return;
    }
    if (!trueBlink) {
      setBlinkReady(true);
      return;
    }
    if (typeof Image === "undefined") {
      setBlinkReady(false);
      return;
    }
    setBlinkReady(false);
    let cancelled = false;
    const img = new Image();
    const ready = () => {
      if (!cancelled) setBlinkReady(true);
    };
    img.onload = ready;
    img.onerror = () => {
      if (!cancelled) setBlinkReady(false);
    };
    img.decoding = "async";
    img.src = trueBlink;
    if (img.complete) ready();
    return () => {
      cancelled = true;
    };
  }, [canBlink, trueBlink]);

  useEffect(() => {
    if (!canBlink || !blinkReady || reduced) return;
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
  }, [blinkReady, canBlink, reduced, src]);

  const blinkActive = canBlink && blinkReady && !reduced;
  const ambientActive = Boolean(ambientProfile) && !reduced;
  const displaySrc = blinkActive && blinking && trueBlink ? trueBlink : src;
  const deliverySrcSet = displaySrc === src ? getFaithfulDeliverySrcSet(src) : undefined;

  const reactToPointer = () => {
    if (!ambientActive || reduced) return;
    setReacting(true);
    window.setTimeout(() => setReacting(false), 360);
  };

  return (
    <span
      className={[
        "living-illustration",
        blinkActive ? "living-illustration--alive" : "",
        blinkActive && blinking && !trueBlink ? "living-illustration--blink" : "",
        reacting ? "living-illustration--reacting" : "",
        isCreature && ambientActive ? "living-illustration--creature-life" : "",
        ambientActive ? "living-illustration--ambient" : "",
        ambientActive && ambientProfile ? `living-illustration--${ambientProfile}` : "",
        ambientActive ? `living-illustration--phase-${phase}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ambient-motion={ambientActive ? ambientProfile ?? "none" : "none"}
      data-blink-mode={blinkMode}
      data-interactive={ambientActive ? "true" : "false"}
      onPointerDown={reactToPointer}
    >
      <img
        src={displaySrc}
        srcSet={deliverySrcSet}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        className="living-illustration__art"
      />
      {blinkActive && !trueBlink ? (
        <span className="living-illustration__lids" aria-hidden="true">
          <span className="living-illustration__eyelid living-illustration__eyelid--left" />
          <span className="living-illustration__eyelid living-illustration__eyelid--right" />
        </span>
      ) : null}
    </span>
  );
}
