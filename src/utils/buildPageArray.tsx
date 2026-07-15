import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

import pageInventory from "@/data/page-inventory.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { hasPageLayout } from "@/lib/book-faithful";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { PdfPage } from "@/components/cartilla/PdfPage";

const BASE = "/cartilla/images/source";

/** Honest pending shell — never invents book text or art. */
function PendingPageShell({
  lessonId,
  pageNum,
  globalPage,
}: {
  lessonId: number;
  pageNum: number;
  globalPage?: number;
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 text-sm font-bold bg-stone-50 border border-dashed border-stone-300 p-6 text-center"
      role="status"
    >
      <span>Página pendiente</span>
      <span className="text-xs font-medium text-stone-400">
        Lección {lessonId} · página {pageNum}
        {typeof globalPage === "number" ? ` (libro ${globalPage})` : ""}
      </span>
      <span className="text-xs font-medium text-stone-400">
        Sin diseño verificado ni escaneo disponible — no se inventa contenido.
      </span>
    </div>
  );
}

/**
 * Builds the WorkbookPageEntry[] for a specific lesson.
 *
 * Preference order per page:
 *   1. Faithful verified layout (page-layouts.json) via FaithfulPageRenderer
 *   2. Art fallback chain (HD colorized → lineart → source scan) via PdfPage
 *   3. Honest "página pendiente" — never invented text/art
 *
 * Inventory file lists may be shorter than the catalog page range (e.g. L21–L24
 * historically listed 3 of 4 printed pages). We always pad to the catalog
 * length so every printed page with a verified layout still appears.
 */
export function buildPageArray(lessonId: number): WorkbookPageEntry[] {
  const lessonEntry = (
    pageInventory.workbook.lessons as Array<{ lessonId: number; pages: string[] }>
  ).find((l) => l.lessonId === lessonId);

  const paths: string[] = lessonEntry?.pages ?? [];

  const catalogEntry = CATALOG.find((e) => e.n === lessonId);
  const globalPages = catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : [];

  // Catalog page range is the source of truth for how many printed pages a
  // lesson has. Inventory may be short (L21–L24 missing page 4) or long
  // (L15 had two extra unmapped scan files) — always prefer the catalog so
  // every verified layout is shown and no orphan scan is invented as a page.
  const count = globalPages.length > 0 ? globalPages.length : paths.length;
  if (count === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const filename = paths[i];
    const src = filename ? `${BASE}/${filename}` : undefined;
    const pageNum = i + 1;
    const globalPage = globalPages[i];
    const isAnimated = Boolean(filename?.endsWith(".mp4"));

    // Prefer the faithful, verified page when one exists (same shared source as
    // the teacher flipbook + student CRM view).
    if (typeof globalPage === "number" && hasPageLayout(globalPage)) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        cover: i === 0,
        src,
        content: (
          <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} interactive />
        ),
      };
    }

    // No verified layout: walk HD → lineart → scan for a real page image.
    if (typeof globalPage === "number") {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        cover: i === 0,
        src,
        content: (
          <FaithfulPageRenderer
            pageNumber={globalPage}
            lessonNumber={lessonId}
            fallback={<PdfPage pageNumber={globalPage} />}
          />
        ),
      };
    }

    // Inventory-only extra slot with no catalog global page number.
    if (filename) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        cover: i === 0,
        src,
        content: isAnimated ? (
          <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img
            src={src}
            alt={`Lección ${lessonId} — Página ${pageNum}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fb = document.createElement("div");
              fb.className =
                "w-full h-full flex items-center justify-center text-text-muted text-sm font-bold bg-surface";
              fb.textContent = `Página ${pageNum} — pendiente`;
              t.parentNode?.appendChild(fb);
            }}
          />
        ),
      };
    }

    // Nothing at all — honest pending.
    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      cover: i === 0,
      content: <PendingPageShell lessonId={lessonId} pageNum={pageNum} globalPage={globalPage} />,
    };
  });
}
