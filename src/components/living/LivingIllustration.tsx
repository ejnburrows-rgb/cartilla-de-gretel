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

const LIVING_WORDS = [
  "oso","mono","papa","papá","sapo","ardilla","erizo","iguana","oveja","oruga",
  "elefante","unicornio","pajaro","pájaro","pez","pulpo","delfin","delfín","lobo",
  "loro","vaca","foca","yegua","cisne","gato","conejo","burro","perro","abeja",
  "insecto","nino","niño","bebe","bebé","mama","mamá","indio","rana",
];
const FLOAT_WORDS = ["globo","nube","luna","sol","ola","avion","avión","cometa"];
const SWAY_WORDS = ["flor","tulipan","tulipán","arbol","árbol","pino","pina","piña"];

function slugFromSrc(src: string): string {
  return decodeURIComponent(src.split("/").pop() ?? "").replace(/\.[^.]+$/, "").toLowerCase();
}

function ambientProfileFor(src: string): AmbientProfile {
  const slug = slugFromSrc(src);
  if (LIVING_WORDS.some((word) => slug.includes(word))) return "breathe";
  if (FLOAT_WORDS.some((word) => slug.includes(word))) return "float";
  if (SWAY_WORDS.some((word) => slug.includes(word))) return "sway";
  return null;
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
  const ambientProfile = useMemo(
    () => (forceStatic ? null : ambientProfileFor(src)),
    [forceStatic, src],
  );
  const phase = useMemo(() => phaseFor(src), [src]);
  const canBlink = Boolean(trueBlink) && !forceStatic;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    setBlinkReady(false);
    if (!canBlink || !trueBlink || typeof Image === "undefined") return;
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

  return (
    <span
      className={[
        "living-illustration",
        blinkActive ? "living-illustration--alive" : "",
        ambientActive ? "living-illustration--ambient" : "",
        ambientActive && ambientProfile ? `living-illustration--${ambientProfile}` : "",
        ambientActive ? `living-illustration--phase-${phase}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ambient-motion={ambientActive ? ambientProfile ?? "none" : "none"}
    >
      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        decoding="async"
        srcSet={getFaithfulDeliverySrcSet(displaySrc)}
        draggable={false}
        className="living-illustration__art"
      />
    </span>
  );
}
