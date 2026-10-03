import { AUDIO_POLICY } from "@/content/audio-manifest";
import { approvedPictureRecording } from "@/lib/picture-vocabulary";
import { resolvePictureName } from "@/lib/picture-vocabulary";
/**
 * LivingIllustration — subtle life on EXISTING faithful art pixels only.
 * True blink frames remain strictly allow-listed; ambient motion is CSS transform
 * only and never redraws, recolors, warps, or replaces the source pixels.
 */
import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { BLINK_HOLD_MS, nextBlinkDelayMs, prefersReducedMotion } from "@/lib/living-motion";
import { resolveTrueBlinkFrame } from "@/lib/living-blink-map";
import { getLivingActor } from "@/lib/living-actor-registry";
import { getFaithfulDeliverySrcSet } from "@/lib/art-delivery";
import approvedMotion from "@/content/approved-art-motion.json";

export interface LivingIllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  /** Optional: disable ambient motion for a specific asset. */
  static?: boolean;
  loading?: "lazy" | "eager";
  /** Approved, silent Flow clip; plays once, then rests on the still. */
  clipSrc?: string;
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
  clipSrc,
}: LivingIllustrationProps) {
  const picture = resolvePictureName(src, alt);
  const canListen = !!picture && (!!approvedPictureRecording(picture.key) || AUDIO_POLICY.allowTts);
  const pictureRef = useRef<HTMLSpanElement>(null);
  const [insideControl, setInsideControl] = useState(true);
  useLayoutEffect(() => { setInsideControl(Boolean(pictureRef.current?.parentElement?.closest("button, a, [role=button], [draggable=true], [aria-hidden=true], [inert]"))); }, [src]);
  const actor = useMemo(() => (forceStatic ? null : getLivingActor(src)), [forceStatic, src]);
  const trueBlink = actor?.blinkFrame ?? resolveTrueBlinkFrame(src);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);
  const approvedClip = clipSrc ?? (approvedMotion as Record<string, string>)[src];
  const [finishedClip, setFinishedClip] = useState<string | null>(null);
  const clipActive = Boolean(approvedClip) && finishedClip !== approvedClip && !forceStatic && !reduced;
  useEffect(() => {
    if (!clipActive || !videoRef.current) return;
    const playback = videoRef.current.play();
    playback?.catch(() => setFinishedClip(approvedClip ?? null));
  }, [clipActive, approvedClip]);
  const [blinkReady, setBlinkReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [failedDeliveryFor, setFailedDeliveryFor] = useState<string | null>(null);
  const ambientProfile = actor?.action ?? null;
  const phase = useMemo(() => phaseFor(src), [src]);
  const canBlink = Boolean(actor?.blinkFrame) && !forceStatic;
  const isCreature = Boolean(actor?.creature) && !forceStatic;
  const blinkMode = trueBlink && canBlink ? "frame" : "none";

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

  const blinkActive = canBlink && blinkReady && !reduced && !approvedClip;
  const ambientActive = Boolean(ambientProfile) && !reduced && !approvedClip;
  const partBased = Boolean(actor?.parts?.length);
  const wholeActionActive = ambientActive && !partBased;
  const displaySrc = blinkActive && blinking && trueBlink ? trueBlink : src;
  const deliverySrcSet = displaySrc === src && failedDeliveryFor !== src ? getFaithfulDeliverySrcSet(src) : undefined;

  const reactToPointer = () => {
    if (!ambientActive || reduced) return;
    setReacting(true);
    window.setTimeout(() => setReacting(false), 360);
  };

  return (
    <span
      ref={pictureRef}
      data-picture-name={picture?.name}
      data-picture-src={picture ? src : undefined}
      role={canListen && !insideControl ? "button" : undefined}
      tabIndex={canListen && !insideControl ? 0 : undefined}
      aria-label={canListen && !insideControl ? "Escuchar el nombre del dibujo" : undefined}
      onKeyDown={canListen && !insideControl ? event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } } : undefined}
      className={[
        "living-illustration",
        blinkActive ? "living-illustration--alive" : "",
        reacting ? "living-illustration--reacting" : "",
        isCreature && ambientActive ? "living-illustration--creature-life" : "",
        ambientActive ? "living-illustration--ambient" : "",
        wholeActionActive && ambientProfile ? `living-illustration--${ambientProfile}` : "",
        partBased && ambientActive ? "living-illustration--part-rigged" : "",
        ambientActive ? `living-illustration--phase-${phase}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ambient-motion={ambientActive ? ambientProfile ?? "none" : "none"}
      data-part-based={partBased ? "true" : "false"}
      data-blink-mode={blinkMode}
      data-interactive={ambientActive ? "true" : "false"}
      onPointerDown={reactToPointer}
    >
      {clipActive && <video ref={videoRef} src={approvedClip} autoPlay muted playsInline preload="metadata" aria-hidden className="living-illustration__clip" onEnded={() => setFinishedClip(approvedClip ?? null)} onError={() => setFinishedClip(approvedClip ?? null)} />}
      <img
        style={clipActive ? { visibility: "hidden" } : undefined}
        src={displaySrc}
        srcSet={deliverySrcSet}
        onError={() => {
          // Delivery derivatives are generated for production. If absent in a
          // local checkout, retry the immutable canonical faithful asset.
          if (deliverySrcSet) setFailedDeliveryFor(src);
        }}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        className="living-illustration__art"
      />
      {ambientActive && actor?.parts?.map((part) => (
        <img
          key={part.name + part.clipPath}
          src={displaySrc}
          alt=""
          aria-hidden
          loading={loading}
          decoding="async"
          draggable={false}
          className={`living-illustration__part living-illustration__part--${part.name}`}
          style={{ clipPath: part.clipPath, transformOrigin: part.transformOrigin }}
        />
      ))}
    </span>
  );
}
