/**
 * PdfPage.tsx  — Lane A
 * High-definition page renderer that serves polished, upscaled, and white-balanced JPEGs
 * from our asset pipeline. Completely removes scan residues and gray margins.
 *
 * Render priority (Leap U): the faithful HD art at /cartilla/art/hd/workbook/page-NNN.jpg
 * is served FIRST. The raw verified source scan is used only as an onError fallback when
 * an HD asset is missing. This auto-upgrades pages the moment cleaner HD files land in
 * the same path, and the worst case is identical to serving the original scan.
 */
import { useEffect, useState } from "react";
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
  const src = getHdPageSrc(safePageNumber);

  let rotation = 0;
  if (src) {
    const filename = src.split("/").pop()?.replace(".jpg", "");
    if (filename && PAGE_ROTATION_MAP[filename]) {
      rotation = PAGE_ROTATION_MAP[filename];
    }
  }

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
        style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      />
    </div>
  );
}
