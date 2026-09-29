import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { getPageLayout, hasPageLayout } from "@/lib/book-faithful";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";

/** Honest pending shell — never invents book text or art. */
function PendingPageShell({ lessonId, pageNum, globalPage }: { lessonId: number; pageNum: number; globalPage?: number }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 text-sm font-bold bg-stone-50 border border-dashed border-stone-300 p-6 text-center" role="status">
      <span>Página pendiente</span>
      <span className="text-xs font-medium text-stone-400">
        Lección {lessonId} · página {pageNum}{typeof globalPage === "number" ? ` (libro ${globalPage})` : ""}
      </span>
      <span className="text-xs font-medium text-stone-400">Sin diseño verificado ni escaneo disponible — no se inventa contenido.</span>
    </div>
  );
}

/**
 * Builds the WorkbookPageEntry[] for a specific lesson. Lesson slices contain
 * interior worksheet leaves only; none is mislabeled as a hard book cover.
 *
 * Native rollout (September 2026): every one of the 90 student workbook pages
 * now has verified structured regions in page-layouts.json, so every lesson
 * renders as a native digital learning screen through FaithfulPageRenderer.
 * The proven Lessons 7–9 pattern (interactive + native) is applied to all
 * lessons; scan-first branches are kept only as honest fallbacks for pages
 * that somehow lack a layout record.
 */
export function buildPageArray(lessonId: number): WorkbookPageEntry[] {
  const catalogEntry = CATALOG.find((e) => e.n === lessonId);
  const globalPages = catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : [];
  if (globalPages.length === 0) return [];

  return globalPages.map((globalPage, i) => {
    const pageNum = i + 1;
    const gretelLine = buildGretelPageLine(getPageLayout(globalPage), globalPage);

    if (hasPageLayout(globalPage)) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        pageNumber: globalPage,
        gretelLine,
        content: (
          <FaithfulPageRenderer
            pageNumber={globalPage}
            lessonNumber={lessonId}
            interactive
            native
          />
        ),
      };
    }

    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      pageNumber: globalPage,
      gretelLine,
      content: <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} fallback={<PendingPageShell lessonId={lessonId} pageNum={pageNum} globalPage={globalPage} />} />,
    };
  });
}
