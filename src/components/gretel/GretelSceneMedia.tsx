import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { GretelCinematic } from "@/content/gretel-cinematics";

/** A produced clip plays once; completion, slow loading and errors return to its still. */
export function GretelSceneMedia({
  video,
  fallback,
  durationSeconds,
  onSettled,
  loop = false,
}: {
  video?: GretelCinematic["video"];
  fallback: string;
  durationSeconds: number;
  onSettled?: () => void;
  loop?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
  );
  const eligible = Boolean(video) && !reducedMotion && !saveData;
  const [state, setState] = useState<"loading" | "playing" | "still">("loading");
  // A registered poster can be broken. Remember that and use `fallback` instead;
  // the flag is keyed to the current sources so a new clip/poster resets it and a
  // broken poster is never retried in a loop.
  const posterKey = formatPosterKey(video?.poster, fallback);
  const [posterFallback, setPosterFallback] = useState<{ key: string; failed: boolean }>({ key: posterKey, failed: false });
  const posterFailed = posterFallback.key === posterKey && posterFallback.failed;
  const player = useRef<HTMLVideoElement>(null);
  const live = useRef(true);
  const started = useRef(false);
  const playing = useRef(false);
  const stallTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    live.current = true;
    if (!eligible) return;
    const loading = window.setTimeout(() => {
      if (!playing.current) setState("still");
    }, 2000);
    // A stalled clip must not remain on screen indefinitely.
    const deadline = window.setTimeout(() => { if (!loop || !playing.current) setState("still"); }, (durationSeconds + 3) * 1000);
    return () => {
      live.current = false;
      window.clearTimeout(loading);
      window.clearTimeout(deadline);
      window.clearTimeout(stallTimer.current);
    };
  }, [eligible, durationSeconds, loop]);

  useEffect(() => {
    if (!eligible || state === "still") player.current?.pause();
    if (!eligible || state === "still") onSettled?.();
  }, [eligible, state, onSettled]);

  const playOnce = () => {
    if (!eligible || started.current || state === "still" || !player.current) return;
    started.current = true;
    try {
      const playing = player.current.play();
      playing?.catch(() => { if (live.current) setState("still"); });
    } catch {
      setState("still");
    }
  };

  const posterSrc = video?.poster && !posterFailed ? video.poster : fallback;

  return (
    <div className="relative flex w-full justify-center" data-gretel-media={eligible ? state : "still"}>
      <img
        src={posterSrc}
        alt="Gretel, la niña de la cartilla"
        className="gretel-cinematic-portrait"
        style={{ visibility: eligible && state === "playing" ? "hidden" : "visible" }}
        draggable={false}
        onError={() => { if (video?.poster && !posterFailed) setPosterFallback({ key: posterKey, failed: true }); }}
      />
      {eligible && state !== "still" && video && (
        <video
          ref={player}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ visibility: state === "playing" ? "visible" : "hidden" }}
          aria-hidden="true"
          muted
          loop={loop}
          playsInline
          preload="auto"
          poster={video.poster}
          onCanPlay={playOnce}
          onPlaying={() => { window.clearTimeout(stallTimer.current); playing.current = true; setState("playing"); }}
          onWaiting={() => { window.clearTimeout(stallTimer.current); stallTimer.current = window.setTimeout(() => setState("still"), 2000); }}
          onEnded={() => { if (!loop) setState("still"); }}
          onError={() => setState("still")}
        >
          {video.webm && <source src={video.webm} type="video/webm" />}
          <source src={video.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

function formatPosterKey(poster: string | undefined, fallback: string): string {
  return `${poster ?? ""}\u0000${fallback}`;
}
