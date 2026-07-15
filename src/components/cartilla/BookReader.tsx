import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { CATALOG } from "@/lib/lesson-catalog";
import { PolishedPage } from "./PolishedPage";
import { StudentBookToolbar } from "./StudentBookToolbar";
import { RingTabNav } from "./RingTabNav";
import { speak } from "@/lib/speak";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { FlipErrorBoundary } from "./FlipErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";

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
  // Students always read the horizontal flipbook — orientation is decided by
  // role, not a user-facing toggle (teacher lane uses its own vertical
  // flipchart view). The continuous vertical reader below still exists as
  // the automatic fallback if the flipbook throws at runtime.
  const [mounted, setMounted] = useState(false);
  // If the flipbook throws at runtime, fall back to the continuous vertical
  // reader instead of white-screening the whole route.
  const [flipFailed, setFlipFailed] = useState(false);

  const [isTeacher, setIsTeacher] = useState(false);

  // Only render the client-only flipbook after mount so `react-pageflip`
  // is never requested on the server.
  useEffect(() => {
    setMounted(true);
    
    if (isSeedSessionActive()) {
      setIsTeacher(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        hasTeacherOrAdminRole(data.session.user.id).then(setIsTeacher);
      }
    });
  }, []);

  const totalPages = 95;

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

  const showHorizontal = !flipFailed;

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Student Book Toolbar */}
      <StudentBookToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPrint={isTeacher ? handlePrint : undefined}
        onAudio={handleAudio}
      />

      {/* Main Page Layout Container — ring-tab rail + book */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-center gap-2 md:gap-4 px-2 md:px-4">
        <RingTabNav
          currentPage={currentPage}
          onSelect={setCurrentPage}
          className="md:sticky md:top-24 md:max-h-[78vh]"
        />
        <main className="flex-1 w-full max-w-2xl mx-auto px-2 md:px-4 py-6 md:py-8 flex flex-col items-center justify-center">
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
      </div>

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
