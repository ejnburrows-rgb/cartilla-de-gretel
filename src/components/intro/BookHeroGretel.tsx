/**
 * BookHeroGretel — home hero host.
 *
 * Uses the REAL GretelPresence looping system (breath/sway, blink, multi-frame
 * idle, talk mouth cycle) — NOT a cheap 3-static-frame swap.
 * Garden plate behind as book-world context only.
 */
import type { CSSProperties } from "react";
import { GretelPresence } from "@/components/gretel/GretelPresence";
import "@/styles/home-hero.css";
import "@/styles/gretel-presence.css";

/** Full painted garden scene — book world plate under the living host. */
export const GRETEL_HERO_SCENE = "/art/hd/gretel-authentic.jpg";
/** Soft garden wash for page backgrounds (same art family). */
export const GRETEL_GARDEN_WASH = "/art/hd/garden/base.jpg";

export type BookHeroGretelProps = {
  /** Visual scale of the scene panel. */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Object-position tweak for the scene plate. */
  objectPosition?: string;
  /** Auto-play home greeting TTS via GretelPresence. */
  autoIntro?: boolean;
};

const SIZE_CLASS: Record<NonNullable<BookHeroGretelProps["size"]>, string> = {
  sm: "book-hero-gretel--sm",
  md: "book-hero-gretel--md",
  lg: "book-hero-gretel--lg",
};

export function BookHeroGretel({
  size = "lg",
  className = "",
  objectPosition = "center 28%",
  autoIntro = true,
}: BookHeroGretelProps) {
  const imgStyle = { objectPosition } as CSSProperties;

  return (
    <figure
      className={`book-hero-gretel ${SIZE_CLASS[size]}${className ? ` ${className}` : ""}`}
      data-testid="book-hero-gretel-frame"
      data-sticker="false"
      data-gretel-system="presence"
    >
      <div className="book-hero-gretel__frame">
        <div className="book-hero-gretel__matte" aria-hidden />
        {/* Soft book-world plate behind living host */}
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
        {/* REAL GretelPresence — breath, blink, multi-frame idle, talk cycle */}
        <div className="book-hero-gretel__presence-wrap">
          <GretelPresence
            variant="home"
            autoIntro={autoIntro}
            hideChrome={false}
            className="book-hero-gretel__presence"
          />
        </div>
        <div className="book-hero-gretel__ground" aria-hidden />
        <div className="book-hero-gretel__vignette" aria-hidden />
      </div>
    </figure>
  );
}
