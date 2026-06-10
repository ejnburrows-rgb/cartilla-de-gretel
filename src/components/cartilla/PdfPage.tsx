/**
 * PdfPage.tsx
 * Routes pages 1-90 to the fully digital WorkbookPageRenderer (SVG/JSX).
 * Pages 91-92 fall back to the HD image scan.
 *
 * The color/workbook/ and hd/workbook/ scan paths are no longer used
 * for pages 1-90 and can be deleted from public/ when convenient.
 */
import { useEffect, useMemo, useState } from "react";
import { WorkbookPageRenderer } from "./WorkbookPageRenderer";
import sourceArtInventory from "@/data/source-art-inventory.json";

type SourcePageAsset = {
  path?: string;
  workbookPageNumber?: number;
  sourceStatus?: string;
  safeForStudentUI?: boolean;
};

type SourceArtInventory = {
  assets?: SourcePageAsset[];
};

const rawScanByWorkbookPage = new Map(
  ((sourceArtInventory as SourceArtInventory).assets ?? [])
    .filter(
      (asset): asset is SourcePageAsset & { path: string; workbookPageNumber: number } =>
        Boolean(asset.path) &&
        typeof asset.workbookPageNumber === "number" &&
        asset.safeForStudentUI === true &&
        asset.sourceStatus === "verified-source-image",
    )
    .map((asset) => [asset.workbookPageNumber, `/${asset.path}`]),
);
function getHdPageSrc(pageNumber: number) {
  const paddedPageNum = String(pageNumber).padStart(3, "0");
  return `/cartilla/art/hd/workbook/page-${paddedPageNum}.jpg`;
}

function getFallbackSources(pageNumber: number) {
  const list = [getHdPageSrc(pageNumber)];
  const raw = rawScanByWorkbookPage.get(pageNumber);
  if (raw) list.push(raw);
  return list;
}

export function prefetchPage(pageNumber: number) {
  // No-op for SVG pages; kept for API compatibility.
  if (pageNumber < 91 || pageNumber > 92) return;
  const img = new Image();
  img.src = getHdPageSrc(pageNumber);
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safePageNumber = Math.max(1, pageNumber);

  // Pages 1-90: fully digital interactive SVG content.
  if (safePageNumber >= 1 && safePageNumber <= 90) {
    return (
      <div
        className={`pdf-page-wrapper flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
        aria-label={`Página ${safePageNumber} del libro`}
      >
        <WorkbookPageRenderer pageNumber={safePageNumber} />
      </div>
    );
  }

  // Pages 91+: image fallback.
  return <PdfPageImageFallback pageNumber={safePageNumber} className={className} />;
}

function PdfPageImageFallback({ pageNumber, className = "" }: PdfPageProps) {
  const sources = useMemo(() => getFallbackSources(pageNumber), [pageNumber]);
  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [pageNumber]);

  const src = sources[Math.min(srcIndex, sources.length - 1)];

  const handleError = () => {
    setSrcIndex((i) => (i < sources.length - 1 ? i + 1 : i));
  };

  return (
    <div
      className={`pdf-page-wrapper flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
      aria-label={`Página ${pageNumber} del libro`}
    >
      <img
        src={src}
        alt={`Página ${pageNumber} del libro`}
        className="w-full h-full object-contain max-h-full"
        loading="lazy"
        draggable={false}
        onError={handleError}
      />
    </div>
  );
}
