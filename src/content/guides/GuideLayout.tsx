import React, { useState } from "react";
import { BookOpen, Target, ListTodo, GraduationCap } from "lucide-react";

interface GuideLayoutProps {
  children: React.ReactNode;
  accentColor?: string;
}

type TabId = "objetivos" | "procedimiento" | "vocabulario" | "evaluacion";

export function GuideLayout({ children, accentColor = "#f97316" }: GuideLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>("objetivos");

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      
      {/* Sidebar with Seamless Tabs */}
      <aside className="w-full md:w-64 shrink-0 premium-glass bg-white/80 rounded-2xl p-6 border border-stone-200 sticky top-6 shadow-sm hidden md:block">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
          Contenido de la Lección
        </h3>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("objetivos")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition group ${
              activeTab === "objetivos" ? "bg-stone-100 text-stone-800 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
            }`}
          >
            <Target className={`w-4 h-4 ${activeTab === "objetivos" ? "text-orange-500" : "text-stone-400 group-hover:text-stone-500"}`} />
            Objetivos
          </button>
          
          <button 
            onClick={() => setActiveTab("procedimiento")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition group ${
              activeTab === "procedimiento" ? "bg-stone-100 text-stone-800 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
            }`}
          >
            <ListTodo className={`w-4 h-4 ${activeTab === "procedimiento" ? "text-emerald-500" : "text-stone-400 group-hover:text-stone-500"}`} />
            Procedimiento
          </button>

          <button 
            onClick={() => setActiveTab("vocabulario")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition group ${
              activeTab === "vocabulario" ? "bg-stone-100 text-stone-800 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === "vocabulario" ? "text-blue-500" : "text-stone-400 group-hover:text-stone-500"}`} />
            Vocabulario y Poema
          </button>

          <button 
            onClick={() => setActiveTab("evaluacion")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition group ${
              activeTab === "evaluacion" ? "bg-stone-100 text-stone-800 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${activeTab === "evaluacion" ? "text-purple-500" : "text-stone-400 group-hover:text-stone-500"}`} />
            Evaluación
          </button>
        </nav>
      </aside>

      {/* Main HTML Content Area */}
      <div 
        className="flex-1 premium-glass bg-white/90 rounded-2xl p-8 md:p-12 border border-stone-200 shadow-sm min-w-0"
      >
        <div className={`prose prose-stone max-w-none guide-html-content active-tab-${activeTab}`}>
          {/* We wrap children in a container that uses CSS to only show the active section */}
          {children}
        </div>
      </div>

    </div>
  );
}
