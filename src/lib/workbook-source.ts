import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";

export const WORKBOOK_PDF_PATH = "/book/book.pdf";

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
  hasVerifiedImage: boolean;
  hasVerifiedText: boolean;
  status: WorkbookSourceStatus;
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
): WorkbookLessonSource {
  const pageNumbers = parsePageRange(pages);
  const verifiedPages = getWorkbookPagesForLesson(lessonNumber);
  const pdfStatus = getWorkbookPdfStatus();

  const sources = pageNumbers.map((pageNumber) => {
    const verifiedPage = verifiedPages.find((page) => page.pageNumber === pageNumber);
    const imageRef = verifiedPage?.imageScanReference ?? undefined;
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
      hasVerifiedImage,
      hasVerifiedText,
      status,
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
