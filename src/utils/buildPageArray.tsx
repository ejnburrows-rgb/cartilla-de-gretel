import type { WorkbookPageEntry } from "@/components/StudentBook/StudentWorkbookFlip";

import pageInventory from "@/data/page-inventory.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { hasPageLayout } from "@/lib/book-faithful";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";

const BASE = "/cartilla/images/source";

/**
 * Builds the WorkbookPageEntry[] for a specific lesson.
 * Pages are served from /cartilla/images/source/{letter}/{filename}
 * as defined in page-inventory.json workbook.lessons.
 * as defined in page-inventory.json workbook.lessons.
 */
export function buildPageArray(lessonId: number): WorkbookPageEntry[] {
  const lessonEntry = (pageInventory.workbook.lessons as Array<{ lessonId: number; pages: string[] }>)
    .find((l) => l.lessonId === lessonId);

  const paths: string[] = lessonEntry?.pages ?? [];

  if (paths.length === 0) {
    // Teacher-distributed lesson or unknown — return empty
    return [];
  }

  // Global (book) page numbers for this lesson, so we can look up a faithful,
  // verified layout for each page. Falls back to the scan when none exists.
  const catalogEntry = CATALOG.find((e) => e.n === lessonId);
  const globalPages = catalogEntry ? getLessonPageNumbers(catalogEntry.pages) : [];

  return paths.map((filename, i) => {
    const src = `${BASE}/${filename}`;
    const pageNum = i + 1;
    const globalPage = globalPages[i];
    // Check animated list by position index (legacy animated pages used global page numbers;
    // for inventory-driven lessons we simply check if the file is an mp4)
    const isAnimated = filename.endsWith(".mp4");

    // Prefer the faithful, verified page when one exists (same shared source as
    // the teacher flipbook + student CRM view). Until then, keep the scan.
    if (typeof globalPage === "number" && hasPageLayout(globalPage)) {
      return {
        id: `lesson-${lessonId}-page-${pageNum}`,
        cover: i === 0,
        src,
        content: (
          <FaithfulPageRenderer pageNumber={globalPage} lessonNumber={lessonId} />
        ),
      };
    }

    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      cover: i === 0,
      src,
      content: isAnimated ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
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
            fb.textContent = `Página ${pageNum}`;
            t.parentNode?.appendChild(fb);
          }}
        />
      ),
    };
  });
}
