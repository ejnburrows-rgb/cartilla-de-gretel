import { type CSSProperties } from "react";
import { useBookArt, useBookCover } from "@/hooks/useBookArt";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";

type Mode = "cover" | "character" | "pageThumb";

type Props = {
  lessonN?: number;
  mode?: Mode;
  alt: string;
  className?: string;
  priority?: boolean;
  rounded?: boolean;
};

const FIGURE_BASE_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  width: "100%",
  height: "100%",
};

const IMG_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const PLACEHOLDER_BASE_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: 800,
  letterSpacing: "0.02em",
  fontSize: "clamp(2rem, 8vw, 5rem)",
  color: "white",
  textShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

function pickInitial(entry: CatalogEntry | undefined, mode: Mode): string {
  if (mode === "cover") return "G";
  if (!entry) return "?";
  if (entry.kind === "vowel") return entry.vowel.toUpperCase();
  if (entry.kind === "consonant") return entry.letter.toUpperCase();
  return String(entry.n);
}

export function BookArtFigure({
  lessonN,
  mode = "character",
  alt,
  className,
  priority,
  rounded = true,
}: Props) {
  const cover = useBookCover();
  const lesson = useBookArt(lessonN);

  let src: string | null = null;
  if (mode === "cover") src = cover.cover ?? null;
  else if (mode === "character") src = lesson.character ?? null;
  else if (mode === "pageThumb") src = lesson.pageThumb ?? null;

  const entry =
    typeof lessonN === "number" ? CATALOG.find((e) => e.n === lessonN) : undefined;
  const accent = entry?.color ?? "#c98c4f";

  const figureStyle: CSSProperties = {
    ...FIGURE_BASE_STYLE,
    background: `${accent}14`,
    borderRadius: rounded ? "1.25rem" : 0,
    border: `1px solid ${accent}33`,
  };

  const placeholderStyle: CSSProperties = {
    ...PLACEHOLDER_BASE_STYLE,
    background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
  };

  return (
    <figure className={className} style={figureStyle} aria-label={alt}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={IMG_STYLE}
        />
      ) : (
        <div style={placeholderStyle} aria-hidden="true">
          {pickInitial(entry, mode)}
        </div>
      )}
    </figure>
  );
}

export default BookArtFigure;
