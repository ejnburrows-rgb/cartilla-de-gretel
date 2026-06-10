/**
 * PdfPage.tsx — Lane A
 * High-definition page renderer.
 *
 * Render priority: the clean COLORIZED art at /cartilla/art/color/workbook/page-NNN.jpg
 * is served FIRST. If it is missing, it falls back to the HD art at
 * /cartilla/art/hd/workbook/page-NNN.jpg, and finally to the raw verified source
 * scan. This auto-upgrades every page the moment the colorized files land in the
 * color/ folder, with no risk: the worst case is identical to serving the scan.
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

function getColorPageSrc(pageNumber: number) {
  const paddedPageNum = String(pageNumber).padStart(3, "0");
  return `/cartilla/art/color/workbook/page-${paddedPageNum}.jpg`;
}

function getHdPageSrc(pageNumber: number) {
  const paddedPageNum = String(pageNumber).padStart(3, "0");
  return `/cartilla/art/hd/workbook/page-${paddedPageNum}.jpg`;
}

function getRawScanFallbackSrc(pageNumber: number) {
  return rawScanByWorkbookPage.get(pageNumber);
}

function getPageSources(pageNumber: number) {
  const list = [getColorPageSrc(pageNumber), getHdPageSrc(pageNumber)];
  const raw = getRawScanFallbackSrc(pageNumber);
  if (raw) list.push(raw);
  return list;
}

export function prefetchPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > 92) return;
  const img = new Image();
  img.src = getColorPageSrc(pageNumber);
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
  const isColorSrc = src === getColorPageSrc(safePageNumber);

  // Rotation correction only applies to the legacy raw scans (the rotation map
  // was built from raw scan filenames). The colorized art is delivered upright.
  let rotation = 0;
  if (!isColorSrc && src) {
    const filename = src.split("/").pop()?.replace(".jpg", "");
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
