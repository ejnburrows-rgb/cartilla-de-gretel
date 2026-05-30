import { forwardRef, useState, type ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";

interface PageContentProps {
  children?: ReactNode;
  number?: number;
  cover?: boolean;
}

const PageContent = forwardRef<HTMLDivElement, PageContentProps>(
  function PageContent({ children, number, cover }, ref) {
    return (
      <div
        ref={ref}
        data-density={cover ? "hard" : "soft"}
        className="relative flex h-full w-full flex-col overflow-hidden bg-white"
      >
        <div className="flex-1 w-full h-full p-0">{children}</div>
      </div>
    );
  },
);

// react-pageflip's TypeScript typings are strict and incomplete versus its
// documented runtime API (v2.0.3). Cast to a permissive component to bypass.
// Runtime API ref: https://nodlik.github.io/react-pageflip/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlipBook = HTMLFlipBook as any;

const flipBookStyle = { background: "transparent" } as const;

export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  content: ReactNode;
}

export interface StudentWorkbookFlipProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
}

/**
 * Horizontal 3D page-flip for the student workbook (Cartilla).
 * Built on react-pageflip 2.0.3. iPad-portrait is the primary target.
 *
 * Lane-lock note: this component is intentionally separate from
 * src/components/Reader.tsx and does NOT import or modify it.
 */
export function StudentWorkbookFlip({
  pages,
  initialPage = 0,
}: StudentWorkbookFlipProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hintVisible, setHintVisible] = useState(true);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
      <div className="w-full">
        <FlipBook
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1500}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          flippingTime={700}
          startPage={initialPage}
          drawShadow={true}
          usePortrait={true}
          showPageCorners={true}
          className="mx-auto"
          style={flipBookStyle}
          onFlip={(e: { data: number }) => {
            setCurrentPage(e.data);
            setHintVisible(false);
          }}
        >
          {pages.map((p, i) => (
            <PageContent key={p.id} number={i} cover={p.cover}>
              {p.content}
            </PageContent>
          ))}
        </FlipBook>
      </div>

      {hintVisible && currentPage === 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-10 right-10 z-10 animate-pulse rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[hsl(31,56%,48%)] shadow-lg"
        >
          Presione aquí
        </div>
      ) : null}

      <div className="mt-4 text-sm font-bold text-[hsl(28,30%,18%)]/60">
        Página {currentPage + 1} de {pages.length}
      </div>
    </div>
  );
}
