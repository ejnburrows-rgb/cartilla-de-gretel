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

  return (
    <PdfPage
      pageNumber={pageNumber}
      hideBadge={hideBadge}
      className={className}
    />
  );
}

export default PolishedPage;
