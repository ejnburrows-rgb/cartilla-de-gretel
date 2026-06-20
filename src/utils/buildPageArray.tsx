import type { WorkbookPageEntry } from "@/components/StudentBook/StudentWorkbookFlip";
import animatedPages from "@/data/animatedPages.json";
import pageInventory from "@/data/page-inventory.json";

const BASE = "/cartilla/images/source";

/**
 * Builds the WorkbookPageEntry[] for a specific lesson.
 * Pages are served from /cartilla/images/source/{letter}/{filename}
 * as defined in page-inventory.json workbook.lessons.
 *
 * Falls back to /art/hd/page-{n}.png for any page not in the inventory
 * so legacy animated/art pages continue to work unchanged.
 */
export function buildPageArray(lessonId: number): WorkbookPageEntry[] {
  const lessonEntry = (pageInventory.workbook.lessons as Array<{ lessonId: number; pages: string[] }>)
    .find((l) => l.lessonId === lessonId);

  const paths: string[] = lessonEntry?.pages ?? [];

  if (paths.length === 0) {
    // Teacher-distributed lesson or unknown — return empty
    return [];
  }

  return paths.map((filename, i) => {
    const src = `${BASE}/${filename}`;
    const pageNum = i + 1;
    // Check animated list by position index (legacy animated pages used global page numbers;
    // for inventory-driven lessons we simply check if the file is an mp4)
    const isAnimated = filename.endsWith(".mp4");

    return {
      id: `lesson-${lessonId}-page-${pageNum}`,
      cover: i === 0,
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
