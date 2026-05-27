/**
 * PdfPage.tsx  — Lane A
 * High-definition page renderer that serves polished, upscaled, and white-balanced JPEGs
 * from our asset pipeline. Completely removes scan residues and gray margins.
 */
import { useEffect, useState } from "react";

export function prefetchPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > 92) return;
  const paddedPageNum = String(pageNumber).padStart(3, "0");
  const img = new Image();
  img.src = `/cartilla/art/hd/workbook/page-${paddedPageNum}.jpg`;
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safePageNumber = Math.max(1, pageNumber);
  const paddedPageNum = String(safePageNumber).padStart(3, "0");
  const src = `/cartilla/art/hd/workbook/page-${paddedPageNum}.jpg`;

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
      />
    </div>
  );
}


