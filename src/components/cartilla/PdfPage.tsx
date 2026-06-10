/**
 * PdfPage.tsx — Lane A
 * High-definition page renderer.
 *
 * Render priority: HD art at /cartilla/art/hd/workbook/page-NNN.jpg is served
 * FIRST. If it is missing, falls back to the raw verified source scan.
 *
 * color/workbook/ is excluded — those are student activity pages (colored-in)
 * and must not appear in the student reader UI.
 *
 * Rotation correction applies to ALL sources via PAGE_ROTATION_MAP.
 */
import { useEffect, useMemo, useState } from "react";
import sourceArtInventory from "@/data/source-art-inventory.json";
import { PAGE_ROTATION_MAP } from "@/lib/page-rotation-map";

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

function getRawScanFallbackSrc(pageNumber: number) {
  return rawScanByWorkbookPage.get(pageNumber);
}

function getPageSources(pageNumber: number) {
  // Priority: HD art → raw scan fallback.
  // color/workbook/ is intentionally excluded (student activity/colored-in pages).
  const list = [getHdPageSrc(pageNumber)];
  const raw = getRawScanFallbackSrc(pageNumber);
  if (raw) list.push(raw);
  return list;
}

export function prefetchPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > 92) return;
  const img = new Image();
  img.src = getHdPageSrc(pageNumber);
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safePageNumber = Math.max(1, pageNumber);

  const sources = useMemo(() => getPageSources(safePageNumber), [safePageNumber]);
  const [srcIndex, setSrcIndex] = useState(0);

  // Reset to the highest-quality source whenever the page changes.
  useEffect(() => {
    setSrcIndex(0);
  }, [safePageNumber]);

  const src = sources[Math.min(srcIndex, sources.length - 1)];

  // Apply rotation to ALL sources — PAGE_ROTATION_MAP keys on filename without extension.
  let rotation = 0;
  if (src) {
    const filename = src.split("/").pop()?.replace(/\.(jpg|png)$/, "");
    if (filename && PAGE_ROTATION_MAP[filename]) {
      rotation = PAGE_ROTATION_MAP[filename];
    }
  }

  const handleError = () => {
    setSrcIndex((i) => (i < sources.length - 1 ? i + 1 : i));
  };

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
        onError={handleError}
        style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      />
    </div>
  );
}
