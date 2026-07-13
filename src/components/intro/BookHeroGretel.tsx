/**
 * BookHeroGretel — catalog-worthy home/welcome hero.
 *
 * Book-like scene plate (garden painting) + living FULL-FIGURE pose from the
 * pose library (welcome/wave cycle). Never a chopped corner sticker and never
 * a scarce 3-file character.
 */
import { useEffect, useState, type CSSProperties } from "react";
import {
  getGretelPose,
  getGretelPoseFrames,
  poseFrameMs,
} from "@/components/gretel/gretelPoses";
import { prefersReducedMotion } from "@/lib/living-motion";
import "@/styles/home-hero.css";

/** Full painted garden scene — book world plate (not a transparent cutout alone). */
export const GRETEL_HERO_SCENE = "/art/hd/gretel-authentic.jpg";
/** Soft garden wash for page backgrounds (same art family). */
export const GRETEL_GARDEN_WASH = "/art/hd/garden/base.jpg";

export type BookHeroGretelProps = {
  /** Visual scale of the scene panel. */
  size?: "sm" | "md" | "lg";
  /** Optional caption under the scene (Spanish, warm). */
  caption?: string;
  className?: string;
  /** Object-position tweak for the scene plate. */
  objectPosition?: string;
  /** Accessible name for the scene image. */
  alt?: string;
};

const SIZE_CLASS: Record<NonNullable<BookHeroGretelProps["size"]>, string> = {
  sm: "book-hero-gretel--sm",
  md: "book-hero-gretel--md",
  lg: "book-hero-gretel--lg",
};

export function BookHeroGretel({
  size = "lg",
  caption,
  className = "",
  objectPosition = "center 28%",
  alt = "Gretel en el jardín de La Cartilla",
}: BookHeroGretelProps) {
  const imgStyle = { objectPosition } as CSSProperties;
  const [frameIdx, setFrameIdx] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [reduced, setReduced] = useState(false);

  const welcomeFrames = getGretelPoseFrames("welcome");
  const frames = Array.isArray(welcomeFrames) ? welcomeFrames : [welcomeFrames];
  const figureSrc = frames[frameIdx % frames.length];
  const blinkSrc = getGretelPose("blinking");

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  // Welcome/wave multi-frame cycle from full library
  useEffect(() => {
    if (reduced || frames.length < 2) return;
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, poseFrameMs("welcome"));
    return () => clearInterval(id);
  }, [reduced, frames.length]);

  // Soft blink on top of welcome cycle (living base)
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let schedule: ReturnType<typeof setTimeout> | undefined;
    const loop = () => {
      schedule = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        hold = setTimeout(() => {
          setBlinking(false);
          loop();
        }, 120);
      }, 3200 + Math.random() * 3800);
    };
    loop();
    return () => {
      cancelled = true;
      if (schedule) clearTimeout(schedule);
      if (hold) clearTimeout(hold);
    };
  }, [reduced]);

  return (
    <figure
      className={`book-hero-gretel ${SIZE_CLASS[size]}${className ? ` ${className}` : ""}`}
      data-testid="book-hero-gretel"
      data-sticker="false"
      data-pose-library="full"
    >
      <div className="book-hero-gretel__frame">
        <div className="book-hero-gretel__matte" aria-hidden />
        {/* Book world scene plate */}
        <img
          src={GRETEL_HERO_SCENE}
          alt=""
          className="book-hero-gretel__scene"
          style={imgStyle}
          draggable={false}
          loading="eager"
          decoding="async"
          aria-hidden
        />
        {/* Living full-figure pose from library (welcome/wave) */}
        <div className="book-hero-gretel__figure-wrap" aria-hidden={!caption}>
          <span className="book-hero-gretel__figure-shadow" aria-hidden />
          <div
            className={
              reduced
                ? "book-hero-gretel__figure"
                : "book-hero-gretel__figure book-hero-gretel__figure--alive"
            }
          >
            <img
              src={figureSrc}
              alt={alt}
              className="book-hero-gretel__pose"
              data-testid="book-hero-gretel-pose"
              draggable={false}
              loading="eager"
              decoding="async"
            />
            <img
              src={blinkSrc}
              alt=""
              className={[
                "book-hero-gretel__pose book-hero-gretel__pose-blink",
                blinking ? "is-on" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable={false}
              aria-hidden
            />
          </div>
        </div>
        <div className="book-hero-gretel__ground" aria-hidden />
        <div className="book-hero-gretel__vignette" aria-hidden />
      </div>
      {caption ? (
        <figcaption className="book-hero-gretel__caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
