/**
 * Owner-approval firewall for the interactive Student Workbook only.
 *
 * An illustration that merely exists in the repository or teacher Flip Chart
 * does NOT constitute approval for another printed workbook page / slot.
 * Until an exact owner-signed page/slot manifest exists, only the already
 * documented final Page 1 artwork can be displayed.
 *
 * Keep the original structured source untouched, preserving text, correct
 * answers, layout, and teacher/Flip Chart rendering.
 */
import pageOneArt from "@/data/workbook-page1-art.json";
import type { PageRegion } from "@/lib/book-faithful";

const APPROVED_PAGE_ONE = new Set(
  pageOneArt.ownerColor
    .filter((item) =>
      item.pageNumber === 1 &&
      /^OWNER-(?:APPROVED|OPTIMIZED)-COLOR-/.test(item.provenanceStatus),
    )
    .map((item) => `${item.word}\u0000${item.src}`),
);

/** Never infer a new page/slot approval from a matching word or file path. */
function approvedSource(
  printedPage: number,
  caption: string | undefined,
  source: string | undefined,
): string | undefined {
  return printedPage === 1 && source && APPROVED_PAGE_ONE.has(`${caption ?? ""}\u0000${source}`)
    ? source
    : undefined;
}

/** Return a display-only copy; do not change the physical-book transcription. */
export function approvedWorkbookRegions(
  printedPage: number,
  regions: readonly PageRegion[],
): PageRegion[] {
  return regions.map((region) => ({
    ...region,
    illustrationSrc: approvedSource(
      printedPage,
      region.caption ?? region.illustrationWord,
      region.illustrationSrc,
    ),
    cells: region.cells?.map((cell) => ({
      ...cell,
      illustrationSrc: approvedSource(printedPage, cell.caption, cell.illustrationSrc),
    })),
    vowelRows: region.vowelRows?.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => ({
        ...cell,
        illustrationSrc: approvedSource(printedPage, cell.caption, cell.illustrationSrc),
      })),
    })),
    vowelPairs: region.vowelPairs?.map((pair) => ({
      ...pair,
      illustrationSrc: approvedSource(printedPage, pair.caption, pair.illustrationSrc),
    })),
    matchRows: region.matchRows?.map((row) => row.map((entry) => ({
      ...entry,
      illustrationSrc: undefined,
    }))),
    fillItems: region.fillItems?.map((item) => ({
      ...item,
      illustrationSrc: undefined,
    })),
  }));
}
