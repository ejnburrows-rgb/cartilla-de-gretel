import React from "react";
import { BookOpen, Target, ListTodo, GraduationCap, Link as LinkIcon } from "lucide-react";

interface GuideLayoutProps {
  children: React.ReactNode;
  accentColor?: string;
}

export function GuideLayout({ children, accentColor = "#f97316" }: GuideLayoutProps) {
  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      
      {/* Sidebar with Hyperlinks */}
      <aside className="w-full md:w-64 shrink-0 premium-glass bg-white/80 rounded-2xl p-6 border border-stone-200 sticky top-6 shadow-sm hidden md:block">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
          Navegación Rápida
        </h3>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => scrollTo("objetivos")}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-600 font-bold text-sm transition group"
          >
            <Target className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
            Objetivos
          </button>
          
          <button 
            onClick={() => scrollTo("procedimiento")}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-600 font-bold text-sm transition group"
          >
            <ListTodo className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
            Procedimiento
          </button>

          <button 
            onClick={() => scrollTo("vocabulario")}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-600 font-bold text-sm transition group"
          >
            <BookOpen className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
            Vocabulario y Poema
          </button>

          <button 
            onClick={() => scrollTo("evaluacion")}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-600 font-bold text-sm transition group"
          >
            <GraduationCap className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
            Evaluación
          </button>
        </nav>
      </aside>

      {/* Main HTML Content Area */}
      <div 
        className="flex-1 premium-glass bg-white/90 rounded-2xl p-8 md:p-12 border border-stone-200 shadow-sm min-w-0 prose prose-stone max-w-none guide-html-content"
      >
        {children}
      </div>

    </div>
  );
}
