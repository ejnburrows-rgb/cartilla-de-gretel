import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  content: React.ReactNode;
}

export interface StudentWorkbookFlipProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
}

const PageContent = React.forwardRef<HTMLDivElement, { children?: React.ReactNode; cover?: boolean }>(
  function PageContent({ children, cover }, ref) {
    return (
      <div
        ref={ref}
        data-density={cover ? "hard" : "soft"}
        className="relative flex h-full w-full flex-col overflow-hidden bg-surface"
      >
        <div className="flex-1 w-full h-full p-0">{children}</div>
      </div>
    );
  }
);

export function StudentWorkbookFlip({ pages, initialPage = 0 }: StudentWorkbookFlipProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const normalizedStartIdx = (!isMobile && initialPage % 2 !== 0) ? initialPage - 1 : initialPage;
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, normalizedStartIdx));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipTransform, setFlipTransform] = useState('rotateY(0deg)');
  const [hintVisible, setHintVisible] = useState(true);

  const step = isMobile ? 1 : 2;
  const hasPrev = currentIndex - step >= 0;
  const hasNext = currentIndex + step < pages.length;

  const handlePrev = () => {
    if (!hasPrev || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('prev');
    setIsFlipping(true);
    setFlipTransform('rotateY(-180deg)'); 
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(0deg)');
      });
    });

    setTimeout(() => {
      setCurrentIndex(prev => prev - step);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  const handleNext = () => {
    if (!hasNext || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('next');
    setIsFlipping(true);
    setFlipTransform('rotateY(0deg)'); 
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(-180deg)');
      });
    });

    setTimeout(() => {
      setCurrentIndex(prev => prev + step);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  const renderDesktop = () => {
    const leftIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 2 : currentIndex;
    const rightIndex = isFlipping && flipDirection === 'next' ? currentIndex + 3 : currentIndex + 1;
    
    const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex - 1) : -1;
    const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 2 : currentIndex) : -1;
    
    return (
      <div className="book-container flex w-full aspect-[2/1.33] shadow-2xl rounded-lg bg-surface border border-border">
        <div className="w-1/2 h-full border-r border-border relative overflow-hidden">
          {pages[leftIndex] ? <PageContent cover={pages[leftIndex].cover}>{pages[leftIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
        </div>
        
        <div className="w-1/2 h-full relative overflow-hidden">
          {pages[rightIndex] ? <PageContent cover={pages[rightIndex].cover}>{pages[rightIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
        </div>
        
        {isFlipping && (
          <div className={`page-flip ${flipDirection === 'next' ? 'flipping-right-to-left' : ''}`} style={{ transform: flipTransform }}>
            <div className="page-front border-l border-border overflow-hidden">
              {pages[flipFrontIndex] ? <PageContent cover={pages[flipFrontIndex].cover}>{pages[flipFrontIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
            </div>
            <div className="page-back border-r border-border overflow-hidden">
              {pages[flipBackIndex] ? <PageContent cover={pages[flipBackIndex].cover}>{pages[flipBackIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
            </div>
          </div>
        )}
        <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-30 pointer-events-none" />
      </div>
    );
  };

  const renderMobile = () => {
    const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 1 : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
    const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
    const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex) : -1;

    return (
      <div className="book-container book-single-page w-full aspect-[3/4] shadow-2xl rounded-lg bg-surface border border-border">
        <div className="w-full h-full relative overflow-hidden">
          {pages[staticIndex] ? <PageContent cover={pages[staticIndex].cover}>{pages[staticIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
        </div>
        
        {isFlipping && (
          <div className={`page-flip ${flipDirection === 'next' ? 'flipping-right-to-left' : ''}`}
               style={{ transform: flipTransform }}>
             <div className="page-front overflow-hidden">
               {pages[flipFrontIndex] ? <PageContent cover={pages[flipFrontIndex].cover}>{pages[flipFrontIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
             </div>
             <div className="page-back overflow-hidden">
               {pages[flipBackIndex] ? <PageContent cover={pages[flipBackIndex].cover}>{pages[flipBackIndex].content}</PageContent> : <div className="w-full h-full bg-surface" />}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
      <div className="w-full px-4">
        {isMobile ? renderMobile() : renderDesktop()}
      </div>

      {hintVisible && currentIndex === 0 && (
        <div className="pointer-events-none absolute bottom-20 right-10 z-10 animate-pulse rounded-full bg-surface-2 px-4 py-2 text-sm font-black text-primary shadow-lg border border-border">
          Presione aquí
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-6 z-20">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold transition-all ${
            hasPrev
              ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
              : "bg-surface-2 text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> Anterior
        </button>
        <div className="text-sm font-bold text-text bg-surface-2 px-4 py-2 rounded-md border border-border shadow-sm">
          Página {currentIndex + 1} {(!isMobile && currentIndex+1 < pages.length) ? `- ${currentIndex+2}` : ''} de {pages.length}
        </div>
        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold transition-all ${
            hasNext
              ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
              : "bg-surface-2 text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          Siguiente <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
