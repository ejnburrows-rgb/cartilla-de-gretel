import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ActivityBadge } from "../components/activities/ActivityBadge";
import { ALL_ACTIVITY_KINDS, ACTIVITY_REGISTRY } from "../components/activities/activityIcons";
import { InteractiveWorkbookLayer } from "../components/cartilla/InteractiveWorkbookLayer";
import interactionsData from "../data/workbook-interactions.json";
import { CATALOG } from "../lib/lesson-catalog";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Trophy, ArrowLeft, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPreview,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Actividades" },
      {
        name: "description",
        content: "Explora y practica las actividades interactivas del cuaderno de La Cartilla.",
      },
    ],
  }),
});

function ActivitiesPreview() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<string>("hsl(var(--primary))");
  const [activeTitle, setActiveTitle] = useState<string>("");

  // Group verified/book-derived interactions by lesson & page
  const interactivePages = useMemo(() => {
    const list: Array<{
      lessonNumber: number;
      pageNumber: number;
      interactionCount: number;
      lessonTitle: string;
      color: string;
    }> = [];
    const seen = new Set<string>();

    const visibleInteractions = (
      interactionsData.interactions as {
        sourceStatus?: string;
        kind?: string;
        lessonNumber: number;
        pageNumber: number;
      }[]
    ).filter(
      (i) =>
        i.sourceStatus === "verified" ||
        i.sourceStatus === "book-derived" ||
        (i.kind === "mini-story" && i.sourceStatus === "needs-transcription"),
    );

    for (const inter of visibleInteractions) {
      const key = `${inter.lessonNumber}-${inter.pageNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        const catalogEntry = CATALOG.find((c) => c.n === inter.lessonNumber);
        const lessonTitle = catalogEntry?.title ?? `Lección ${inter.lessonNumber}`;
        const color = catalogEntry?.color ?? "#14343d";

        const count = visibleInteractions.filter(
          (i) => i.lessonNumber === inter.lessonNumber && i.pageNumber === inter.pageNumber,
        ).length;

        list.push({
          lessonNumber: inter.lessonNumber,
          pageNumber: inter.pageNumber,
          interactionCount: count,
          lessonTitle,
          color,
        });
      }
    }

    return list.sort((a, b) => {
      if (a.lessonNumber !== b.lessonNumber) return a.lessonNumber - b.lessonNumber;
      return a.pageNumber - b.pageNumber;
    });
  }, []);

  const handleSelectPage = (lessonNum: number, pageNum: number, color: string, title: string) => {
    setActiveLesson(lessonNum);
    setActivePage(pageNum);
    setActiveColor(color);
    setActiveTitle(title);

    // Smooth scroll to top of workspace
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToGrid = () => {
    setActiveLesson(null);
    setActivePage(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/70 px-4 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            ← Inicio
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)] flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[hsl(31,56%,48%)]" />
            Catálogo e interactivos
          </p>
        </header>

        <AnimatePresence mode="wait">
          {activeLesson !== null && activePage !== null ? (
            <motion.div
              key="interactive-player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur border border-stone-200/50 p-4 rounded-3xl shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-lg text-xs font-black text-white"
                      style={{ backgroundColor: activeColor }}
                    >
                      Página {activePage}
                    </span>
                    <span className="text-xs font-bold text-foreground/50">
                      Lección {activeLesson} · {activeTitle}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 mt-1">Arena de Práctica</h2>
                </div>
                <button
                  onClick={handleBackToGrid}
                  className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 text-white font-extrabold px-5 py-3 text-sm hover:bg-stone-800 transition active:scale-95 self-start sm:self-center shadow-md shadow-stone-950/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al listado
                </button>
              </div>

              {/* The Live Interactive Workbook Component */}
              <div className="bg-white/40 backdrop-blur rounded-[2.25rem] border border-white/80 p-4 sm:p-6 shadow-xl">
                <InteractiveWorkbookLayer
                  lessonNumber={activeLesson}
                  pageNumbers={[activePage]}
                  activePageNumber={activePage}
                  accent={activeColor}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="catalog-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div>
                <h1 className="mb-2 text-4xl font-black text-[hsl(197,41%,22%)] leading-tight flex items-center gap-3">
                  Actividades
                  <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                </h1>
                <p className="max-w-2xl text-base font-bold text-[hsl(28,30%,18%)]/65">
                  Los 8 tipos de actividad que aparecen en La Cartilla de Gretel. Cada tipo tiene su
                  propio ícono y color para que el estudiante reconozca de un vistazo qué va a
                  hacer.
                </p>
              </div>

              {/* Live Interactive Explorer Section */}
              <section className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-200/10 rounded-full blur-3xl -z-10" />

                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-black text-[hsl(197,41%,22%)]">
                    Práctica Interactiva del Cuaderno
                  </h2>
                </div>
                <p className="text-sm font-semibold text-stone-600 mb-6 max-w-xl">
                  Selecciona cualquiera de las páginas del cuaderno con actividades interactivas
                  listas para jugar, escuchar audios y interactuar con la mascota Gretel.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {interactivePages.map((page) => (
                    <motion.button
                      key={`${page.lessonNumber}-${page.pageNumber}`}
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() =>
                        handleSelectPage(
                          page.lessonNumber,
                          page.pageNumber,
                          page.color,
                          page.lessonTitle,
                        )
                      }
                      className="group flex flex-col justify-between items-start text-left p-5 rounded-2xl bg-white/70 border border-stone-200/60 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Accent glow on hover */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-1 transition-all duration-300 opacity-50 group-hover:h-2"
                        style={{ backgroundColor: page.color }}
                      />

                      <div className="w-full">
                        <div className="flex items-center justify-between w-full mb-3">
                          <span
                            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-white"
                            style={{ backgroundColor: page.color }}
                          >
                            Pág. {page.pageNumber}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400">
                            Lección {page.lessonNumber}
                          </span>
                        </div>

                        <h3 className="font-black text-stone-800 text-lg leading-tight group-hover:text-stone-950 transition-colors">
                          {page.lessonTitle}
                        </h3>
                      </div>

                      <div className="mt-4 flex items-center justify-between w-full text-xs">
                        <span className="font-bold text-stone-500">
                          {page.interactionCount}{" "}
                          {page.interactionCount === 1 ? "actividad" : "actividades"}
                        </span>
                        <span
                          className="font-black uppercase tracking-widest text-[9px] group-hover:translate-x-1 transition-transform"
                          style={{ color: page.color }}
                        >
                          Jugar →
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Static badges catalog */}
              <section>
                <h2 className="mb-4 text-xl font-black text-[hsl(197,41%,22%)]">
                  Tipos de Actividad
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ALL_ACTIVITY_KINDS.map((kind) => (
                    <div key={kind} className="kid-card flex items-center gap-4 p-5">
                      <ActivityBadge kind={kind} size="lg" showLabel />
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-[hsl(28,30%,18%)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
                  <h2 className="mb-3 text-lg font-black text-[hsl(197,41%,22%)]">Tamaños</h2>
                  <div className="flex flex-wrap items-center gap-6">
                    <ActivityBadge kind="read" size="sm" />
                    <ActivityBadge kind="read" size="md" />
                    <ActivityBadge kind="read" size="lg" />
                  </div>
                </section>

                <section className="rounded-2xl border border-[hsl(28,30%,18%)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
                  <h2 className="mb-3 text-lg font-black text-[hsl(197,41%,22%)]">
                    Variante sólida
                  </h2>
                  <div className="flex flex-wrap items-center gap-4">
                    {ALL_ACTIVITY_KINDS.map((kind) => (
                      <ActivityBadge
                        key={kind}
                        kind={kind}
                        size="md"
                        variant="solid"
                        showLabel={false}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <footer className="mt-12 text-xs font-bold text-[hsl(28,30%,18%)]/45 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>
                  {Object.keys(ACTIVITY_REGISTRY).length} tipos registrados · lucide-react
                </span>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
