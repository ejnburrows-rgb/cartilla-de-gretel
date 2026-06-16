import type { WorkbookPageEntry } from "@/components/StudentBook/StudentWorkbookFlip";

const TOTAL_PAGES = 95;

/**
 * Builds the full WorkbookPageEntry[] array for pages 1–95.
 * Page 1 is the cover (hard density). All others are soft.
 */
export function buildPageArray(): WorkbookPageEntry[] {
  return Array.from({ length: TOTAL_PAGES }, (_, i) => {
    const n = i + 1;
    return {
      id: `page-${n}`,
      cover: n === 1,
      content: (
        <img
          src={`/art/hd/page-${n}.png`}
          alt={`Página ${n}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            const fb = document.createElement("div");
            fb.className =
              "w-full h-full flex items-center justify-center text-text-muted text-sm font-bold bg-surface";
            fb.textContent = `Página ${n}`;
            t.parentNode?.appendChild(fb);
          }}
        />
      ),
    };
  });
}
