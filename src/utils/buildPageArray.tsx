import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

import pageInventory from "@/data/page-inventory.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { hasPageLayout } from "@/lib/book-faithful";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { PdfPage } from "@/components/cartilla/PdfPage";

const BASE = "/cartilla/images/source";

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

    if (typeof globalPage === "number" && hasPageLayout(globalPage)) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        content: <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} interactive />,
      };
    }

    if (typeof globalPage === "number") {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        content: <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} fallback={<PdfPage pageNumber={globalPage} />} />,
      };
    }

    if (filename) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        content: isAnimated ? (
          <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={src} alt={`Lección ${lessonId} — Página ${pageNum}`} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            const fb = document.createElement("div");
            fb.className = "w-full h-full flex items-center justify-center text-text-muted text-sm font-bold bg-surface";
            fb.textContent = `Página ${pageNum} — pendiente`;
            t.parentNode?.appendChild(fb);
          }} />
        ),
      };
    }

    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      content: <PendingPageShell lessonId={lessonId} pageNum={pageNum} globalPage={globalPage} />,
    };
  });
}
