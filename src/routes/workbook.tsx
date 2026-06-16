import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentWorkbookFlip } from "@/components/StudentBook/StudentWorkbookFlip";
import { buildPageArray } from "@/utils/buildPageArray";
import { useBookDimensions } from "@/utils/useBookDimensions";
import { useState } from "react";
import { exerciseForPage } from "@/content/exercise-seed";
import { AnimatePresence, motion } from "framer-motion";
import { InteractiveWorkbookLayer } from "@/components/cartilla/InteractiveWorkbookLayer";
import { LessonCompleteModal } from "@/components/cartilla/LessonCompleteModal";
import { getLessonForPage } from "@/content/lesson-meta";
import { feelBus } from "@/lib/feel-bus";
import { Play } from "lucide-react";

export const Route = createFileRoute("/workbook")({
  component: WorkbookPage,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - Mi libro" },
      {
        name: "description",
        content: "El libro del estudiante con vuelta de hoja real, página por página.",
      },
    ],
  }),
});

const pages = buildPageArray();

function WorkbookPage() {
  const dims = useBookDimensions();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lessonCompleteId, setLessonCompleteId] = useState<string | null>(null);

  // In a spread view, currentPageIndex points to the left page, 
  // so the visible pages are currentPageIndex and currentPageIndex + 1 (if 0-indexed).
  // The flipbook passes the current left-side index. So page numbers are index+1 and index+2.
  const leftPageNum = currentPageIndex + 1;
  const rightPageNum = currentPageIndex + 2;

  // Check if either visible page has an exercise.
  const leftExercise = exerciseForPage(leftPageNum);
  const rightExercise = exerciseForPage(rightPageNum);
  
  const activeExercisePage = rightExercise ? rightPageNum : (leftExercise ? leftPageNum : null);
  const hasExercise = activeExercisePage !== null;

  return (
    <main className="min-h-screen relative bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8 overflow-hidden">
      <div className="mx-auto max-w-6xl relative">
        <header className="mb-6 flex items-center justify-between">
          <Link
            to="/cartilla"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/70 px-4 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Inicio
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Libro del estudiante
          </p>
        </header>
        
        <StudentWorkbookFlip
          pages={pages}
          spreadAspectRatio={dims ? String(dims.spreadAspect) : undefined}
          singleAspectRatio={dims ? String(dims.singleAspect) : undefined}
          onPageChange={setCurrentPageIndex}
        />

        {/* The Drawer */}
        <AnimatePresence>
          {hasExercise && !showOverlay && !lessonCompleteId && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-2 py-2 rounded-full shadow-2xl border-2 border-primary/20 flex items-center gap-4 cursor-pointer hover:bg-primary/5 hover:scale-105 transition active:scale-95"
              onClick={() => {
                feelBus.emit("pop");
                setShowOverlay(true);
              }}
            >
              <div className="text-primary font-bold pl-4 text-sm sm:text-base hidden sm:block">¡Esta página tiene ejercicios!</div>
              <div className="bg-primary text-primary-foreground font-black uppercase px-6 py-3 rounded-full shadow-md flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                ¡Practicar!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Full Screen Overlay */}
        <AnimatePresence>
          {showOverlay && activeExercisePage && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-8"
            >
              <button 
                onClick={() => setShowOverlay(false)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full px-6 py-2 backdrop-blur transition font-bold"
              >
                Cerrar
              </button>
              
              <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-white">
                <div className="p-4 sm:p-6 min-h-[60vh] flex flex-col">
                  <InteractiveWorkbookLayer
                    lessonNumber={getLessonForPage(activeExercisePage)?.n ?? 1}
                    pageNumbers={[activeExercisePage]}
                    activePageNumber={activeExercisePage}
                    accent={getLessonForPage(activeExercisePage)?.accent ?? "hsl(var(--primary))"}
                    onComplete={() => {
                      setShowOverlay(false);
                      setLessonCompleteId(String(getLessonForPage(activeExercisePage)?.n ?? 1));
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lesson Complete Modal */}
        {lessonCompleteId && (
          <LessonCompleteModal
            lessonId={lessonCompleteId}
            onNext={() => setLessonCompleteId(null)}
          />
        )}
      </div>
    </main>
  );
}
