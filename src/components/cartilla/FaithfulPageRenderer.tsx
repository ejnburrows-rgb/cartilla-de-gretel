import type { ReactNode } from "react";
import { getPageLayout, type PageRegion } from "@/lib/book-faithful";
import { PageFrame } from "./PageFrame";

/**
 * Renders a workbook page from its faithful, verified region layout
 * (src/data/page-layouts.json) — real text in the book's font + real COLOR
 * illustrations cropped from the original artwork. This is the single renderer
 * shared by the student CRM view, the student workbook, and the teacher
 * flipbook, so all three match exactly and in the same order.
 *
 * If a page has no verified layout yet, it renders `fallback` (the surface's
 * existing content) so nothing regresses — never invented content.
 */
interface FaithfulPageRendererProps {
  pageNumber: number;
  lessonNumber?: number;
  /** Override layout (used by the preview route); defaults to the canonical file. */
  regions?: PageRegion[];
  /** Shown when this page has no verified faithful layout yet. */
  fallback?: ReactNode;
}

function IllustrationSlot({ region }: { region: PageRegion }) {
  const caption = region.caption ?? region.illustrationWord;
  if (region.illustrationSrc) {
    return (
      <div className="fp-illustration">
        <img src={region.illustrationSrc} alt={caption ?? ""} loading="lazy" />
        {caption ? <span className="fp-illustration__caption">{caption}</span> : null}
      </div>
    );
  }
  // No faithful crop yet — explicit marker, NEVER an invented drawing.
  return (
    <div className="fp-art-pending" role="img" aria-label={caption ? `Ilustración pendiente: ${caption}` : "Ilustración pendiente"}>
      {caption ? <span className="fp-art-pending__word">{caption}</span> : null}
      <span>ilustración pendiente</span>
    </div>
  );
}

function RegionView({ region }: { region: PageRegion }) {
  if (region.regionType === "illustration-slot") {
    return <IllustrationSlot region={region} />;
  }
  if (region.regionType === "instruction") {
    return (
      <p className="fp-region--instruction">
        <span className="fp-label">Instrucciones: </span>
        {region.text}
      </p>
    );
  }
  return <p className={`fp-region--${region.regionType}`}>{region.text}</p>;
}

export function FaithfulPageRenderer({
  pageNumber,
  lessonNumber,
  regions,
  fallback,
}: FaithfulPageRendererProps) {
  const layout = regions ?? getPageLayout(pageNumber);

  if (!layout) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <PageFrame pageNumber={pageNumber} lessonNumber={lessonNumber} className="faithful-page--pending">
        <p>Página en preparación</p>
      </PageFrame>
    );
  }

  const ordered = [...layout].sort((a, b) => a.order - b.order);

  return (
    <PageFrame pageNumber={pageNumber} lessonNumber={lessonNumber}>
      {ordered.map((region) => (
        <RegionView key={region.id} region={region} />
      ))}
    </PageFrame>
  );
}
