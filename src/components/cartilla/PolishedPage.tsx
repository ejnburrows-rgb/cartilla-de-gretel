import { useMemo, type CSSProperties } from "react";
import { useBookArt } from "@/hooks/useBookArt";
import { CATALOG } from "@/lib/lesson-catalog";
import { getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { PdfPage } from "@/components/cartilla/PdfPage";

type Props = {
  pageNumber: number;
  lessonN?: number;
  preferPolished?: boolean;
  hideBadge?: boolean;
  className?: string;
};

const FIGURE_STYLE: CSSProperties = {
  position: "relative",
  display: "block",
  width: "100%",
  margin: 0,
};

const IMG_STYLE: CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: "0.85rem",
  background: "#fffefa",
  boxShadow: "inset 0 0 0 1px rgba(23,49,59,0.08)",
};

const BADGE_STYLE: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  padding: "3px 9px",
  borderRadius: 999,
  background: "rgba(13,10,6,0.68)",
  color: "white",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.04em",
  pointerEvents: "none",
};

const EXPRESS_FILTER_WRAP_STYLE: CSSProperties = {
  filter: "contrast(1.08) brightness(1.045) saturate(1.12)",
  borderRadius: "0.85rem",
  overflow: "hidden",
  background: "#fffefa",
  boxShadow: "inset 0 0 0 1px rgba(23,49,59,0.08)",
};

const PAGE_TO_LESSON: Map<number, number> = (() => {
  const m = new Map<number, number>();
  try {
    for (const entry of CATALOG) {
      const pages = getWorkbookPagesForLesson(entry.n);
      for (const p of pages) m.set(p.pageNumber, entry.n);
    }
  } catch {
    // Keep module import safe if generated data is unavailable during tooling.
  }
  return m;
})();

function frameStyle(accent: string): CSSProperties {
  return {
    ...FIGURE_STYLE,
    padding: 6,
    borderRadius: "1.1rem",
    background: `linear-gradient(135deg, ${accent}24 0%, rgba(255,255,255,0.72) 42%, ${accent}10 100%)`,
    border: `1px solid ${accent}33`,
    boxSizing: "border-box",
  };
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
    [lessonN, pageNumber],
  );
  const lesson = useBookArt(resolvedLesson);

  const polishedSrc = useMemo(() => {
    if (!preferPolished || !resolvedLesson || !lesson.ready) return null;
    if (!lesson.pages || lesson.pages.length === 0) return null;
    const pages = getWorkbookPagesForLesson(resolvedLesson);
    const idx = pages.findIndex((page) => page.pageNumber === pageNumber);
    if (idx < 0) return null;
    return lesson.pages[idx] ?? null;
  }, [preferPolished, resolvedLesson, lesson.ready, lesson.pages, pageNumber]);

  const theme = resolvedLesson ? getCartillaCrmTheme(resolvedLesson) : null;
  const accent = theme?.accent ?? "#c98c4f";
  const shellStyle = frameStyle(accent);

  if (polishedSrc) {
    return (
      <figure className={className} style={shellStyle} aria-label={`Pagina ${pageNumber}`}>
        <img src={polishedSrc} alt={`Pagina ${pageNumber} de la cartilla`} loading="lazy" decoding="async" style={IMG_STYLE} />
        {hideBadge ? null : <span style={BADGE_STYLE}>p. {pageNumber}</span>}
      </figure>
    );
  }

  return (
    <figure className={className} style={shellStyle} aria-label={`Pagina ${pageNumber}`}>
      <div style={EXPRESS_FILTER_WRAP_STYLE}>
        <PdfPage pageNumber={pageNumber} hideBadge={hideBadge} />
      </div>
      {hideBadge ? null : <span style={BADGE_STYLE}>p. {pageNumber}</span>}
    </figure>
  );
}

export default PolishedPage;
