/**
 * BookArtFigure.tsx  — Lane A
 * Renders art extracted from the workbook PDF.
 * Consumes useBookArt(); falls back to a skeleton if manifest not yet shipped.
 */
import type React from "react";
import { useEffect, useState } from "react";
import { useBookArt } from "@/hooks/useBookArt";


type Role = "character" | "cover" | "page-thumb";

interface BookArtFigureProps {
  lesson: number;
  role: Role;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function BookArtFigure({ lesson, role, className = "", alt, style }: BookArtFigureProps) {
  const art = useBookArt(lesson);
  const [loaded, setLoaded] = useState(false);

  const src =
    role === "cover"
      ? art.cover
      : role === "page-thumb"
        ? art.pageThumb
        : art.character;

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const defaultAlt =
    role === "cover"
      ? "Portada de La Cartilla de Gretel"
      : role === "page-thumb"
        ? `Miniatura de la lección ${lesson}`
        : `Ilustración de la lección ${lesson}`;

  if (art.loading) {
    return (
      <div
        className={`book-art-figure ${className}`}
        style={style}
        aria-label="Cargando ilustración…"
        aria-busy="true"
        role="img"
      >
        <div className="book-art-skeleton w-full h-full" style={{ minHeight: "8rem" }} />
      </div>
    );
  }

  if (!src) {
    // Manifest present but no art for this role/lesson — render nothing so layout is unaffected
    return null;
  }

  return (
    <figure className={`book-art-figure ${className}`} style={style} aria-label={alt ?? defaultAlt}>
      <img
        key={src}
        src={src}
        alt={alt ?? defaultAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`book-art-figure__img ${loaded ? "is-loaded" : ""}`}
        onLoad={() => setLoaded(true)}
      />
    </figure>
  );
}
