import type { WorkbookPageEntry } from "@/components/StudentBook/SimplePageViewer";

import pageInventory from "@/data/page-inventory.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { getPageLayout, hasPageLayout } from "@/lib/book-faithful";
import { isWorkbookPageSourceBlocked } from "@/lib/workbook-pages";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { PianoLessonSection, PIANO_LESSONS } from "@/components/cartilla/PianoLessonSection";

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
 * True iff the printed page's verified layout contains a "Completa"
 * (fill-in-blank) region — the exercise the Piano Hablador section follows.
 * Uses the same canonical layout source (`getPageLayout`) as
 * `FaithfulPageRenderer` and `page-completion`, so the detection always
 * agrees with what the child actually sees on the page.
 */
function pageHasCompletaExercise(pageNumber: number): boolean {
  const regions = getPageLayout(pageNumber);
  return Boolean(regions?.some((region) => region.regionType === "fill-in-blank"));
}

/**
 * WorkbookPageEntry for the Piano Hablador section that follows the Completa
 * page. It deliberately carries NO `pageNumber`:
 *   • `usePageCompletion(undefined, …)` returns `{ complete: true }`, so the
 *     Piano never gates the Siguiente button — Piano never counts toward
 *     lesson completion (owner rule).
 *   • It cannot collide with any printed page's identity, and it is never
 *     source-blocked, so the relaxed trailing filter always lets it through.
 * `PianoLessonSection` itself returns null on devices without a confirmed
 * on-device microphone and for lessons outside the owner-approved set, so
 * the entry is inert when it should not show.
 */
function pianoSectionEntry(lessonId: number): WorkbookPageEntry {
  return {
    id: `piano-lesson-${lessonId}`,
    content: <PianoLessonSection lessonNumber={lessonId} />,
  };
}

/**
 * Builds the WorkbookPageEntry[] for a specific lesson. Lesson slices contain
 * interior worksheet leaves only; none is mislabeled as a hard book cover.
 */
export function buildPageArray(lessonId: number, includePiano = true): WorkbookPageEntry[] {
  const lessonEntry = (pageInventory.workbook.lessons as Array<{ lessonId: number; pages: string[] }>).find((l) => l.lessonId === lessonId);
  const paths: string[] = lessonEntry?.pages ?? [];
  const catalogEntry = CATALOG.find((e) => e.n === lessonId);
  const globalPages = catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : [];
  const count = globalPages.length > 0 ? globalPages.length : paths.length;
  if (count === 0) return [];

  const pages: WorkbookPageEntry[] = Array.from({ length: count }, (_, i) => {
    const filename = paths[i];
    const src = filename ? `${BASE}/${filename}` : undefined;
    const pageNum = i + 1;
    const globalPage = globalPages[i];
    const isAnimated = Boolean(filename?.endsWith(".mp4"));
    const pageNumberForGuide = typeof globalPage === "number" ? globalPage : pageNum;

    if (typeof globalPage === "number" && hasPageLayout(globalPage)) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        pageNumber: pageNumberForGuide,
        content: <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} interactive native />,
      };
    }

    if (typeof globalPage === "number") {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        pageNumber: pageNumberForGuide,
        content: <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} fallback={<PdfPage pageNumber={globalPage} />} />,
      };
    }

    if (filename) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        src,
        pageNumber: pageNumberForGuide,
        content: isAnimated ? (
          <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={src} alt={`Lección ${lessonId} — Página ${pageNum}`} loading="lazy" decoding="async" className="w-full h-full object-contain" onError={(e) => {
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
      pageNumber: pageNumberForGuide,
      content: <PendingPageShell lessonId={lessonId} pageNum={pageNum} globalPage={globalPage} />,
    };
  }).filter((page) =>
    // The Piano section insert has no printed page number; it is the only
    // such entry and never maps to a source-blocked scan, so it always
    // stays in the flow. Every other entry must map to a real, unblocked
    // printed page.
    typeof page.pageNumber !== "number" ||
    !isWorkbookPageSourceBlocked(page.pageNumber),
  );

  // Owner-approved Piano Hablador section after the Completa exercise page.
  // PianoLessonSection itself returns null outside the approved lessons and
  // on devices without a confirmed on-device microphone, so this insert is
  // a no-op render in those cases.
  if (includePiano && PIANO_LESSONS.has(lessonId)) {
    const completaIdx = pages.findIndex((page) =>
      typeof page.pageNumber === "number" &&
      pageHasCompletaExercise(page.pageNumber),
    );
    if (completaIdx >= 0) {
      pages.splice(completaIdx + 1, 0, pianoSectionEntry(lessonId));
    }
  }

  return pages;
}
