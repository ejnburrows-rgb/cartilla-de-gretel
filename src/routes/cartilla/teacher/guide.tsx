import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Folder, BookOpenCheck, ChevronRight } from "lucide-react";
import { allLessonExercises } from "@/data/lesson-exercises";
import { CATALOG } from "@/lib/lesson-catalog";
import { getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";

export const Route = createFileRoute("/cartilla/teacher/guide")({
  component: TeacherGuide,
  head: () => ({
    meta: [{ title: "Guía del Maestro — La Cartilla de Gretel" }],
  }),
});

function TeacherGuide() {
  const [selectedLesson, setSelectedLesson] = useState<number>(2); // Start with Vocal O

  const vowels = CATALOG.filter(c => c.n >= 2 && c.n <= 6);
  const consonants = CATALOG.filter(c => c.n >= 7);

  const selectedData = useMemo(() => {
    return allLessonExercises.filter(ex => ex.lessonNumber === selectedLesson);
  }, [selectedLesson]);

  const selectedCatalogEntry = CATALOG.find(c => c.n === selectedLesson);
  const theme = selectedCatalogEntry ? getCartillaCrmTheme(selectedLesson) : null;

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden cartilla-crm-theme" style={theme ? { "--cartilla-accent": theme.accent, "--cartilla-accent-dark": theme.accentDark } as any : {}}>
      
      {/* Sidebar Layout */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-stone-200 flex flex-col shadow-sm z-10 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <Link
            to="/cartilla/teacher"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Recursos
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-stone-800">Guía del Maestro</h1>
              <p className="text-xs font-bold text-stone-500">Plan de Clases</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Vowels - The 5 Color-Coded Folders */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3 ml-2">Las 5 Vocales</h2>
            <div className="space-y-1">
              {vowels.map(v => {
                const isSelected = selectedLesson === v.n;
                const vTheme = getCartillaCrmTheme(v.n);
                return (
                  <button
                    key={v.n}
                    onClick={() => setSelectedLesson(v.n)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isSelected ? 'bg-stone-100 shadow-inner' : 'hover:bg-stone-50'}`}
                  >
                    <div className="relative">
                      <Folder className="w-8 h-8 fill-current" style={{ color: vTheme.accent }} />
                      <span className="absolute inset-0 flex items-center justify-center text-white font-black text-xs font-fredoka pt-1">
                        {v.title.replace("Vocal ", "").replace("Consonante ", "")}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className={`font-bold ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>{v.title}</div>
                    </div>
                    {isSelected && <ChevronRight className="w-5 h-5 ml-auto text-stone-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consonants */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3 ml-2">Consonantes</h2>
            <div className="space-y-1">
              {consonants.map(c => {
                const isSelected = selectedLesson === c.n;
                const cTheme = getCartillaCrmTheme(c.n);
                return (
                  <button
                    key={c.n}
                    onClick={() => setSelectedLesson(c.n)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isSelected ? 'bg-stone-100 shadow-inner' : 'hover:bg-stone-50'}`}
                  >
                    <Folder className="w-6 h-6 fill-current" style={{ color: cTheme.accent }} />
                    <div className={`font-bold ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>{c.title}</div>
                    {isSelected && <ChevronRight className="w-5 h-5 ml-auto text-stone-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-stone-50/50">
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
          {selectedCatalogEntry && theme && (
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl font-black text-white shadow-lg mb-6 font-fredoka" style={{ backgroundColor: theme.accent }}>
                {selectedCatalogEntry.title.replace("Vocal ", "").replace("Consonante ", "")}
              </div>
              <h2 className="text-4xl font-black text-stone-800 font-fredoka mb-4">{selectedCatalogEntry.title}</h2>
              <p className="text-lg text-stone-600 font-medium border-l-4 pl-4" style={{ borderColor: theme.accent }}>
                Sigue las siguientes instrucciones para guiar a los estudiantes en las actividades de esta lección.
              </p>
            </div>
          )}

          {selectedData.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-stone-200">
              <p className="text-stone-500 font-bold">No hay notas extraídas para esta lección todavía.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {selectedData.map((exercise, idx) => (
                <div key={exercise.id} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: theme?.accent || '#ccc' }} />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-sm font-black uppercase tracking-widest text-stone-400 mb-1">
                        Página {exercise.pageNumber}
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800">{exercise.title}</h3>
                    </div>
                    {exercise.kind && (
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {exercise.kind.replace(/-/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-6 mb-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Instrucción para el estudiante</h4>
                    <p className="text-lg font-medium text-stone-800">"{exercise.prompt}"</p>
                  </div>

                  {exercise.teacherNotes && (
                    <div className="mb-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Notas del Maestro</h4>
                      <p className="text-stone-600">{exercise.teacherNotes}</p>
                    </div>
                  )}

                  {exercise.items && exercise.items.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Vocabulario / Elementos</h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.items.map((item: any) => (
                          <span key={item.id} className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-700 shadow-sm">
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
