import React, { useRef, useEffect } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";

const FlipBook = HTMLFlipBook as any;

interface BookPageFlipProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  pageNum: number;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(({ pageNum, ...props }, ref) => {
  return (
    <div
      {...props}
      className={`page bg-white shadow-md relative overflow-hidden ${props.className || ""}`}
      ref={ref}
    >
      <BookPage pageNumber={pageNum} active={true} />
    </div>
  );
});

export function BookPageFlip({ currentPage, totalPages, onPageChange }: BookPageFlipProps) {
  const bookRef = useRef<any>(null);

  // Sync internal state with external currentPage
  useEffect(() => {
    if (bookRef.current && bookRef.current.pageFlip) {
      const flipPage = bookRef.current.pageFlip().getCurrentPageIndex() + 1;
      if (Math.abs(flipPage - currentPage) > 1) {
        bookRef.current.pageFlip().turnToPage(currentPage - 1);
      }
    }
  }, [currentPage]);

  const onFlip = (e: any) => {
    onPageChange(e.data + 1);
  };

  const handlePrev = () => {
    if (bookRef.current && bookRef.current.pageFlip) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNext = () => {
    if (bookRef.current && bookRef.current.pageFlip) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="relative w-full flex items-center justify-center select-none py-4 md:py-8">
      <div className="relative z-10 drop-shadow-2xl mx-auto w-full max-w-4xl">
        <FlipBook
          width={450}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={550}
          minHeight={420}
          maxHeight={750}
          maxShadowOpacity={0.4}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={onFlip}
          ref={bookRef}
          className="book-flip"
          style={{ margin: "0 auto" }}
        >
          {pages.map((pageNum) => (
            <Page key={pageNum} pageNum={pageNum} />
          ))}
        </FlipBook>

        {/* Spiral Binding Overlay - only visible on md+ (2-page spread) */}
        <div className="pointer-events-none absolute inset-y-4 left-1/2 -ml-[14px] z-50 hidden md:flex w-7 flex-col items-center justify-around drop-shadow-md">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="relative block h-5 w-5 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1.5px_2px_rgba(0,0,0,0.4),0_1.5px_3px_rgba(0,0,0,0.28)]"
            >
              <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/65 blur-[1px]" />
              <span className="absolute inset-x-1 bottom-0.5 h-px rounded-full bg-black/35" />
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -left-2 -right-2 md:-left-12 md:-right-12 transform -translate-y-1/2 flex justify-between pointer-events-none z-20 no-print">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border-2 border-stone-200 bg-white/80 backdrop-blur hover:bg-stone-50 text-stone-700 flex items-center justify-center cursor-pointer pointer-events-auto transition hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border-2 border-stone-200 bg-white/80 backdrop-blur hover:bg-stone-50 text-stone-700 flex items-center justify-center cursor-pointer pointer-events-auto transition hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
