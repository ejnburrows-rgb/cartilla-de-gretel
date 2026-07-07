import { useState } from "react";
import { Link } from "@tanstack/react-router";
import lessonsData from "@/data/lessons.json";
import { BookOpen, MonitorPlay, Search, FolderOpen } from "lucide-react";

export function LessonCatalog() {
  const [searchTerm, setSearchTerm] = useState("");

  const vowels = lessonsData.vowelOrder.map((v, i) => ({ 
    lesson: i + 1, 
    title: `Vocal ${v}`, 
    focus: v, 
    type: "vowel" 
  }));

  const consonants = lessonsData.consonantOrder.map((c, i) => ({ 
    lesson: i + 6, 
    title: `Consonante ${c}`, 
    focus: c, 
    type: "consonant" 
  }));

  const filterLessons = (list: typeof vowels) => {
    if (!searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(l => 
      l.title.toLowerCase().includes(lower) || 
      l.focus.toLowerCase().includes(lower) ||
      l.lesson.toString() === lower
    );
  };

  const filteredVowels = filterLessons(vowels);
  const filteredConsonants = filterLessons(consonants);

  const LessonCard = ({ l }: { l: typeof vowels[0] }) => (
    <div 
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-200/60 hover:-translate-y-1 hover:shadow-xl transition-all group flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${l.type === "vowel" ? "bg-[#ea580c]" : "bg-[#0284c7]"}`} />
      
      <span className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2 z-10">
        Lección {l.lesson}
      </span>
      
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-inner mb-4 z-10 font-fredoka ${l.type === "vowel" ? "bg-gradient-to-br from-[#ea580c] to-[#c2410c]" : "bg-gradient-to-br from-[#0284c7] to-[#0369a1]"}`}>
        {l.focus}
      </div>

      <h2 className="font-bold text-[#3b2a12] mb-4 z-10 font-fredoka text-xl">{l.title}</h2>

      <div className="mt-auto w-full flex flex-col gap-2 z-10">
        <Link
          to={`/cartilla/leccion/$n`}
          params={{ n: l.lesson.toString() }}
          className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" /> Ver Cuaderno
        </Link>
        <Link
          to={`/cartilla/presentar/$n`}
          params={{ n: l.lesson.toString() }}
          className={`w-full py-2.5 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${l.type === "vowel" ? "bg-[#ea580c] hover:bg-[#c2410c]" : "bg-[#0284c7] hover:bg-[#0369a1]"}`}
        >
          <MonitorPlay className="w-4 h-4" /> Proyectar
        </Link>
      </div>
    </div>
  );

  return (
    <div className="cartilla-crm-theme h-full overflow-y-auto p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Sticky Header & Search */}
        <header className="mb-12 sticky top-0 z-50 bg-[#fdf3e0]/90 backdrop-blur-md pt-4 pb-6 border-b border-stone-200/50 -mx-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#3b2a12] font-fredoka flex items-center gap-3">
              <FolderOpen className="w-10 h-10 text-[#ea580c]" />
              Catálogo de Lecciones
            </h1>
            <p className="text-[#7a6040] mt-2 font-bold text-lg">
              Explora las 24 lecciones del currículo oficial.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por letra o número..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white bg-white/60 focus:bg-white shadow-sm font-bold text-stone-700 placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-[#ea580c]/20 transition-all text-lg"
            />
          </div>
        </header>

        {/* Vocales Section */}
        {filteredVowels.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-black text-[#ea580c] font-fredoka bg-white/50 px-6 py-2 rounded-full border-2 border-white shadow-sm inline-block">
                Vocales
              </h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-[#ea580c]/20 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredVowels.map((l) => <LessonCard key={l.lesson} l={l} />)}
            </div>
          </section>
        )}

        {/* Consonantes Section */}
        {filteredConsonants.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-black text-[#0284c7] font-fredoka bg-white/50 px-6 py-2 rounded-full border-2 border-white shadow-sm inline-block">
                Consonantes
              </h2>
              <div className="h-1 flex-1 bg-gradient-to-r from-[#0284c7]/20 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredConsonants.map((l) => <LessonCard key={l.lesson} l={l} />)}
            </div>
          </section>
        )}

        {filteredVowels.length === 0 && filteredConsonants.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-500 font-fredoka">No se encontraron lecciones</h3>
            <p className="text-stone-400 mt-2">Intenta buscar con otra letra o número.</p>
          </div>
        )}

      </div>
    </div>
  );
}
