import { getPageLayout, type PageRegion } from "@/lib/book-faithful";
import { MonochromeDrawing } from "./MonochromeDrawings";
import { WorkbookPageRenderer } from "./WorkbookPageRenderer";

const fontRoleClass: Record<PageRegion["fontRole"], string> = {
  heading: "font-[var(--font-book-faithful)] font-black text-2xl text-stone-800",
  body: "font-[var(--font-book-faithful)] text-sm text-stone-600",
  tracing: "font-[var(--font-book-faithful)] text-3xl tracking-[0.4em] text-stone-400",
};

function PageRegionView({ region }: { region: PageRegion }) {
  if (region.regionType === "illustration-slot") {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-stone-200 bg-white p-2">
        {region.illustrationWord ? (
          <MonochromeDrawing word={region.illustrationWord} size={72} />
        ) : null}
      </div>
    );
  }

  return <p className={fontRoleClass[region.fontRole]}>{region.text}</p>;
}

interface FaithfulPageRendererProps {
  pageNumber: number;
}

/**
 * Renders a page from its faithful-HTML region layout (live text in
 * --font-book-faithful, illustrations as MonochromeDrawing SVGs) when one
 * has been authored. Falls back to the generic WorkbookPageRenderer template
 * for any page that doesn't have a layout yet.
 */
export function FaithfulPageRenderer({ pageNumber }: FaithfulPageRendererProps) {
  const regions = getPageLayout(pageNumber);

  if (!regions) {
    return <WorkbookPageRenderer pageNumber={pageNumber} />;
  }

  const ordered = [...regions].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
      {ordered.map((region) => (
        <PageRegionView key={region.id} region={region} />
      ))}
    </div>
  );
}
