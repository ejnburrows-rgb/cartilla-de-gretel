export type ExtractionPage = {
  pageNumber: number;
  lessonId: number | null;
  label: string;
  pdfPath: string;
  imagePath: string;
  artDir: string;
};

const SOURCE_PDF = "public/book/book.pdf";
const IMAGE_ROOT = "public/cartilla/images/source";
const ART_ROOT = "public/cartilla/art/extracted";

export const PDF_EXTRACTION_MANIFEST: ExtractionPage[] = Array.from({ length: 92 }, (_, index) => {
  const pageNumber = index + 1;
  const lessonId = pageNumber <= 3 ? 1 : pageNumber <= 18 ? Math.ceil((pageNumber - 3) / 3) + 1 : Math.min(24, Math.ceil((pageNumber - 18) / 4) + 6);
  const slug = String(pageNumber).padStart(2, "0");
  return {
    pageNumber,
    lessonId,
    label: `page-${slug}`,
    pdfPath: SOURCE_PDF,
    imagePath: `${IMAGE_ROOT}/page-${slug}.png`,
    artDir: `${ART_ROOT}/page-${slug}`,
  };
});

export function extractionPageFor(pageNumber: number): ExtractionPage | null {
  return PDF_EXTRACTION_MANIFEST.find((page) => page.pageNumber === pageNumber) ?? null;
}
