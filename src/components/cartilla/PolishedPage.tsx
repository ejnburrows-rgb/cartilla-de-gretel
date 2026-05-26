import { useMemo, type CSSProperties } from "react";
import { useBookArt } from "@/hooks/useBookArt";
import { CATALOG } from "@/lib/lesson-catalog";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { PdfPage } from "@/components/cartilla/PdfPage";

type Props = {
  pageNumber: number;
  /** Optional lesson hint; if omitted, derived from the page-to-lesson index. */
  lessonN?: number;
  /** Default true. Set false to force live PDF rendering. */
  preferPolished?: boolean;
  hideBadge?: boolean;
  className?: string;
};

const FIGURE_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
};

const IMG_STYLE: CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: "0.75rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const BADGE_STYLE: CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  padding: "2px 8px",
  borderRadius: 999,
  background: "rgba(13,10,6,0.72)",
  color: "white",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  pointerEvents: "none",
};

// Express-polish: when the build-time art pipeline hasn't yet produced a
// polished webp for this page, we still wrap the live PDF render in a tinted
// accent frame and apply a CSS filter chain that lifts contrast, brightness,
// and saturation. This makes raw scans look intentionally designed without any
// dependency on the prebuild art pipeline.
const EXPRESS_FRAME_BASE_STYLE: CSSProperties = {
  position: "relative",
  borderRadius: "1rem",
  padding: 6,
  width: "100%",
  boxSizing: "border-box",
};

const EXPRESS_FILTER_WRAP_STYLE: CSSProperties = {
  // CSS filter chain. No reliance on art pipeline.
  filter: "contrast(1.08) brightness(1.04) saturate(1.10)",
  borderRadius: "0.75rem",
  overflow: "hidden",
  background: "white",
};

// Static reverse index built at module load. CATALOG and consonants.json are
// both deterministic at import time, so this never throws under normal builds.
const PAGE_TO_LESSON: Map<number, number> = (() => {
  const m = new Map<number, number>();
  try {
    for (const entry of CATALOG) {
      const pages = getWorkbookPagesForLesson(entry.n);
      for (const p of pages) m.set(p, entry.n);
    }
  } catch {
    // If catalog wiring fails at import time, fall back to live PDF render.
  }
  return m;
})();

function accentForLesson(n: number | undefined): string {
  if (typeof n !== "number") return "#c98c4f";
  const entry = CATALOG.find((e) => e.n === n);
  return entry?.color ?? "#c98c4f";
}

export function PolishedPage({
  pageNumber,
  lessonN,
  preferPolished = true,
  hideBadge,
  className,
}: Props) {
  const resolvedLesson = useMemo(
    () => lessonN ?? PAGE_TO_LESSON.get(pageNumber),
    [lessonN, pageNumber]
  );
  const lesson = useBookArt(resolvedLesson);

  const polishedSrc = useMemo(() => {
    if (!preferPolished || !resolvedLesson || !lesson.ready) return null;
    if (!lesson.pages || lesson.pages.length === 0) return null;
    const pages = getWorkbookPagesForLesson(resolvedLesson);
    const idx = pages.indexOf(pageNumber);
    if (idx < 0) return null;
    return lesson.pages[idx] ?? null;
  }, [preferPolished, resolvedLesson, lesson.ready, lesson.pages, pageNumber]);

  const accent = accentForLesson(resolvedLesson);

  if (polishedSrc) {
    return (
      <figure
        className={className}
        style={FIGURE_STYLE}
        aria-label={`Página ${pageNumber}`}
      >
        <img
          src={polishedSrc}
          alt={`Página ${pageNumber} de la cartilla`}
          loading="lazy"
          decoding="async"
          style={IMG_STYLE}
        />
        {hideBadge ? null : <span style={BADGE_STYLE}>p. {pageNumber}</span>}
      </figure>
    );
  }

  // Express-polish fallback: CSS filter + accent frame, no pipeline dependency.
  const frameStyle: CSSProperties = {
    ...EXPRESS_FRAME_BASE_STYLE,
    background: `linear-gradient(135deg, ${accent}22 0%, ${accent}0a 100%)`,
    border: `1px solid ${accent}33`,
  };

  return (
    <figure
      className={className}
      style={frameStyle}
      aria-label={`Página ${pageNumber}`}
    >
      <div style={EXPRESS_FILTER_WRAP_STYLE}>
        <PdfPage pageNumber={pageNumber} hideBadge={hideBadge} />
      </div>
      {hideBadge ? null : <span style={BADGE_STYLE}>p. {pageNumber}</span>}
    </figure>
  );
}

export default PolishedPage;
