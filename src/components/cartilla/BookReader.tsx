import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { CATALOG } from "@/lib/lesson-catalog";
import { PolishedPage } from "./PolishedPage";
import { StudentBookToolbar } from "./StudentBookToolbar";
import { BookOpen, Tv } from "lucide-react";
import { speak } from "@/lib/speak";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { FlipErrorBoundary } from "./FlipErrorBoundary";

// Lazy-load the flipbook so `react-pageflip` (which touches browser-only APIs
// at import time) never evaluates during SSR. Combined with the `mounted` gate
// below, the module only loads on the client after hydration.
const BookPageFlip = lazy(() =>
  import("./BookPageFlip").then((m) => ({ default: m.BookPageFlip })),
);

interface BookReaderProps {
  initialPage?: number;
}

export function BookReader({ initialPage = 1 }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [mounted, setMounted] = useState(false);
  // If the flipbook throws at runtime, fall back to the continuous vertical
  // reader instead of white-screening the whole route.
  const [flipFailed, setFlipFailed] = useState(false);

  // Only render the client-only flipbook after mount so `react-pageflip`
  // is never requested on the server.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine total pages from catalog
  const totalPages = useMemo(() => {
    return Math.max(
      1,
      ...CATALOG.map((entry) => {
        const parts = entry.pages.split("-").map(Number);
        return parts[1] || parts[0] || 1;
      }),
    );
  }, []);

  const allPages = useMemo(() => {
    const list = [];
    for (let i = 1; i <= totalPages; i++) {
      list.push(i);
    }
    return list;
  }, [totalPages]);

  const handlePrint = () => {
    window.open("/cartilla/imprimir/all", "_blank");
  };

  const handleAudio = () => {
    speak(`Página ${currentPage}`);
  };

  const flipbookFallback = (
    <div className="w-full flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
        <span className="text-stone-500 font-medium">Cargando libro…</span>
      </div>
    </div>
  );

  // Continuous vertical reader. Used both as the explicit "vertical" layout
  // mode AND as the safe fallback if the horizontal flipbook ever throws.
  const verticalReader = (
    <div className="w-full space-y-8 pb-24">
      {allPages.map((pageNum) => (
        <div
          key={pageNum}
          className={`transition-all duration-300 w-full flex justify-center ${
            pageNum === currentPage ? "scale-[1.01] opacity-100" : "opacity-80"
          }`}
          onClick={() => setCurrentPage(pageNum)}
        >
          <PolishedPage pageNumber={pageNum} />
        </div>
      ))}
    </div>
  );

  const showHorizontal = layoutMode === "horizontal" && !flipFailed;

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Student Book Toolbar */}
      <StudentBookToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPrint={handlePrint}
        onAudio={handleAudio}
      />

      {/* Layout Mode Toggles */}
      <div className="no-print max-w-2xl w-full mx-auto px-4 py-3 flex justify-between items-center bg-white/40 backdrop-blur rounded-2xl border border-stone-200/50 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFlipFailed(false);
              setLayoutMode("horizontal");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
              layoutMode === "horizontal"
                ? "bg-amber-900 border-amber-900 text-white shadow-sm"
                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
            aria-label="Vista de libro clásica (horizontal)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Horizontal
          </button>
          <button
            onClick={() => setLayoutMode("vertical")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition ${
              layoutMode === "vertical"
                ? "bg-amber-900 border-amber-900 text-white shadow-sm"
                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
            aria-label="Vista vertical continua"
          >
            <Tv className="w-3.5 h-3.5" />
            Vertical (Flipbook)
          </button>
        </div>
        <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
          Modo Lectura
        </span>
      </div>

      {/* Main Page Layout Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {showHorizontal ? (
          mounted ? (
            <FlipErrorBoundary
              fallback={verticalReader}
              onError={() => setFlipFailed(true)}
            >
              <Suspense fallback={flipbookFallback}>
                <BookPageFlip
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </Suspense>
            </FlipErrorBoundary>
          ) : (
            flipbookFallback
          )
        ) : (
          verticalReader
        )}
      </main>

      {/* Mascot Integration */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        <GretelMascot
          pose="read"
          text="¡Vamos a leer!\nPasa las páginas para explorar el libro."
          bubblePosition="left"
          showCloseButton={true}
        />
      </div>
    </div>
  );
}
