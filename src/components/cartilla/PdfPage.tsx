/**
 * PdfPage.tsx  — Lane A
 * High-definition page renderer that serves polished, upscaled, and white-balanced JPEGs
 * from our asset pipeline. Completely removes scan residues and gray margins.
 */
import { useEffect, useState } from "react";
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

const sourcePageByWorkbookPage = new Map(
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

function getBestWorkbookPageSrc(pageNumber: number) {
  return sourcePageByWorkbookPage.get(pageNumber) ?? getHdPageSrc(pageNumber);
}

export function prefetchPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > 92) return;
  const img = new Image();
  img.src = getBestWorkbookPageSrc(pageNumber);
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safePageNumber = Math.max(1, pageNumber);
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? getHdPageSrc(safePageNumber) : getBestWorkbookPageSrc(safePageNumber);

  useEffect(() => {
    setUseFallback(false);
  }, [safePageNumber]);

  return (
    <div
      className={`pdf-page-wrapper flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
      aria-label={`Página ${safePageNumber} del libro`}
    >
      <img
        src={src}
        alt={`Página ${safePageNumber} del libro`}
        className="w-full h-full object-contain max-h-full"
        loading="lazy"
        draggable={false}
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}
