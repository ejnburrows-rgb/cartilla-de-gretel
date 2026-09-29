import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

import pageInventory from "@/data/page-inventory.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { getPageLayout } from "@/lib/book-faithful";
import { buildGretelPageLine } from "@/lib/gretel-page-guide";
import { ExactWorkbookPage } from "@/components/cartilla/ExactWorkbookPage";

const BASE = "/cartilla/images/source";

/** Honest pending shell — never invents book text or art. */
function PendingPageShell({ lessonId, pageNum, globalPage }: { lessonId: number; pageNum: number; globalPage?: number }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 text-sm font-bold bg-white p-6 text-center" role="status">
      <span>Página pendiente</span>
      <span className="text-xs font-medium text-stone-400">
        Lección {lessonId} · página {pageNum}{typeof globalPage === "number" ? ` (libro ${globalPage})` : ""}
      </span>
      <span className="text-xs font-medium text-stone-400">Sin página fuente verificada — no se inventa contenido.</span>
    </div>
  );
}

/**
 * Builds the WorkbookPageEntry[] for a specific lesson.
 *
 * Exact-replica rule: when a printed workbook page number is known, render the
 * locked canonical full-page source image unchanged. The physical book controls
 * placement, geometry, typography, chrome, and artwork; the app only scales the
 * whole page uniformly.
 */
export function buildPageArray(lessonId: number): WorkbookPageEntry[] {
  const lessonEntry = (pageInventory.workbook.lessons as Array<{ lessonId: number; pages: string[] }>).find((l) => l.lessonId === lessonId);
  const paths: string[] = lessonEntry?.pages ?? [];
  const catalogEntry = CATALOG.find((e) => e.n === lessonId);
  const globalPages = catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : [];
  const count = globalPages.length > 0 ? globalPages.length : paths.length;
  if (count === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const filename = paths[i];
    const src = filename ? `${BASE}/${filename}` : undefined;
    const pageNum = i + 1;
    const globalPage = globalPages[i];
    const isAnimated = Boolean(filename?.endsWith(".mp4"));
    const pageNumberForGuide = typeof globalPage === "number" ? globalPage : pageNum;
    const gretelLine = buildGretelPageLine(
      typeof globalPage === "number" ? getPageLayout(globalPage) : null,
      pageNumberForGuide,
    );

    if (typeof globalPage === "number") {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        pageNumber: pageNumberForGuide,
        gretelLine,
        content: <ExactWorkbookPage pageNumber={globalPage} />,
      };
    }

    if (filename) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        pageNumber: pageNumberForGuide,
        gretelLine,
        content: isAnimated ? (
          <video src={src} autoPlay loop muted playsInline className="w-full h-full object-contain bg-white" />
        ) : (
          <img src={src} alt={`Lección ${lessonId} — Página ${pageNum}`} loading="lazy" decoding="async" className="w-full h-full object-contain bg-white" onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            const fb = document.createElement("div");
            fb.className = "w-full h-full flex items-center justify-center text-text-muted text-sm font-bold bg-white";
            fb.textContent = `Página ${pageNum} — pendiente`;
            t.parentNode?.appendChild(fb);
          }} />
        ),
      };
    }

    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      pageNumber: pageNumberForGuide,
      gretelLine,
      content: <PendingPageShell lessonId={lessonId} pageNum={pageNum} globalPage={globalPage} />,
    };
  });
}
