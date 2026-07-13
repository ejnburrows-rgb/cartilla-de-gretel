/**
 * BookHeroGretel — catalog-worthy home/welcome hero.
 *
 * Uses the full painted garden scene (`gretel-authentic.jpg`) so Gretel appears
 * as a grounded figure in her book world — NEVER a transparent PNG sticker
 * cutout floating on white/blur.
 */
import type { CSSProperties } from "react";
import "@/styles/home-hero.css";

/** Full painted scene with Gretel in the garden (not a transparent cutout pose). */
export const GRETEL_HERO_SCENE = "/art/hd/gretel-authentic.jpg";
/** Soft garden wash for page backgrounds (same art family). */
export const GRETEL_GARDEN_WASH = "/art/hd/garden/base.jpg";

export type BookHeroGretelProps = {
  /** Visual scale of the scene panel. */
  size?: "sm" | "md" | "lg";
  /** Optional caption under the scene (Spanish, warm). */
  caption?: string;
  className?: string;
  /** Object-position tweak so full figure stays in frame. */
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

  return (
    <figure
      className={`book-hero-gretel ${SIZE_CLASS[size]}${className ? ` ${className}` : ""}`}
      data-testid="book-hero-gretel"
      data-sticker="false"
    >
      <div className="book-hero-gretel__frame">
        <div className="book-hero-gretel__matte" aria-hidden />
        <img
          src={GRETEL_HERO_SCENE}
          alt={alt}
          className="book-hero-gretel__scene"
          style={imgStyle}
          draggable={false}
          loading="eager"
          decoding="async"
        />
        {/* Soft vignette + floor wash grounds the figure (not a floating cutout) */}
        <div className="book-hero-gretel__ground" aria-hidden />
        <div className="book-hero-gretel__vignette" aria-hidden />
      </div>
      {caption ? (
        <figcaption className="book-hero-gretel__caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
