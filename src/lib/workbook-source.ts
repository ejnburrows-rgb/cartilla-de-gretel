import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { assetPath } from "@/lib/assets";
import {
  getBestDisplayPath,
  getQualityLabel,
  getRemasterAssetByOriginal,
  type QualityMode,
} from "@/lib/remaster-assets";
import { getWorkbookPageFallbackChain, getLineartPathFromSource } from "@/lib/bookImages";

export const WORKBOOK_PDF_PATH = assetPath("book/book.pdf");

export type WorkbookSourceStatus =
  | "pdf-available"
  | "image-available"
  | "missing-source"
  | "pending-transcription";

export type WorkbookPdfStatus = {
  pdfPath: string;
  isConfigured: boolean;
  isPresentInRepo: boolean;
  status: "missing-source" | "configured-runtime-fetch";
};

export type WorkbookPageSource = {
  pageNumber: number;
  lessonNumber: number;
  pdfPath: string;
  imageRef?: string;
  originalImageRef?: string;
  lineartImageRef?: string;
  hdImageRef?: string;
  fallbackChain?: string[];
  hasVerifiedImage: boolean;
  hasVerifiedText: boolean;
  status: WorkbookSourceStatus;
  remasterStatus?: "pending" | "cleaned" | "needs review" | "approved" | "original only";
  remasteredPath?: string;
  remasteredPathV2?: string;
  qualityLabel?: string;
};

export type WorkbookLessonSource = {
  lessonNumber: number;
  pages: WorkbookPageSource[];
  pdfStatus: WorkbookPdfStatus;
  verifiedTextCount: number;
  verifiedImageCount: number;
  connectedSourceCount: number;
};

export function parsePageRange(pages: string): number[] {
  return getLessonPageNumbers(pages);
}

export function getWorkbookPdfStatus(): WorkbookPdfStatus {
  return {
    pdfPath: WORKBOOK_PDF_PATH,
    isConfigured: true,
    isPresentInRepo: false,
    status: "missing-source",
  };
}

export function getWorkbookPageSourcesForLesson(
  lessonNumber: number,
  pages: string,
  qualityMode: QualityMode = "projection",
): WorkbookLessonSource {
  const pageNumbers = parsePageRange(pages);
  const verifiedPages = getWorkbookPagesForLesson(lessonNumber);
  const pdfStatus = getWorkbookPdfStatus();

  const sources = pageNumbers.map((pageNumber) => {
    const verifiedPage = verifiedPages.find((page) => page.pageNumber === pageNumber);
    const originalRef = verifiedPage?.imageScanReference ?? undefined;
    const remasterAsset = getRemasterAssetByOriginal(originalRef);
    const fallbackChain = getWorkbookPageFallbackChain(pageNumber, originalRef);
    const hdImageRef = fallbackChain[0];
    const lineartImageRef = getLineartPathFromSource(originalRef) ?? undefined;
    const imageRef = getBestDisplayPath(originalRef, qualityMode) ?? hdImageRef ?? originalRef;
    const originalImageRef = originalRef ? assetPath(originalRef) : undefined;
    const remasterStatus = remasterAsset?.cleanupStatus ?? "original only";
    const remasteredPath = remasterAsset?.remasteredPath
      ? assetPath(remasterAsset.remasteredPath)
      : undefined;
    const remasteredPathV2 = remasterAsset?.remasteredPathV2
      ? assetPath(remasterAsset.remasteredPathV2)
      : undefined;
    const hasVerifiedImage = Boolean(imageRef);
    const hasVerifiedText = Boolean(verifiedPage?.verifiedTextBlocks.length);
    const baseStatus: WorkbookSourceStatus = hasVerifiedImage
      ? "image-available"
      : pdfStatus.isPresentInRepo
        ? "pdf-available"
        : "missing-source";
    const status: WorkbookSourceStatus =
      baseStatus !== "missing-source" && !hasVerifiedText ? "pending-transcription" : baseStatus;

    return {
      pageNumber,
      lessonNumber,
      pdfPath: pdfStatus.pdfPath,
      imageRef,
      originalImageRef,
      lineartImageRef,
      hdImageRef,
      fallbackChain,
      hasVerifiedImage,
      hasVerifiedText,
      status,
      remasterStatus,
      remasteredPath,
      remasteredPathV2,
      qualityLabel: getQualityLabel(originalRef, qualityMode),
    };
  });

  return {
    lessonNumber,
    pages: sources,
    pdfStatus,
    verifiedTextCount: sources.filter((source) => source.hasVerifiedText).length,
    verifiedImageCount: sources.filter((source) => source.hasVerifiedImage).length,
    connectedSourceCount: sources.filter(
      (source) =>
        source.hasVerifiedImage ||
        source.status === "image-available" ||
        source.status === "pdf-available" ||
        source.status === "pending-transcription",
    ).length,
  };
}
