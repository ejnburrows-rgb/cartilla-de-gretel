import React, { useState } from "react";
import { BookOpen, Target, ListTodo, GraduationCap, ChevronRight } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";

interface GuideLayoutProps {
  children: React.ReactNode;
  selectedLesson: number;
  onSelectLesson: (n: number) => void;
  accentColor?: string;
}

type TabId = "objetivos" | "procedimiento" | "vocabulario" | "evaluacion";

export function GuideLayout({
  children,
  selectedLesson,
  onSelectLesson,
  accentColor = "#f97316",
}: GuideLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>("objetivos");

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start relative h-[85vh]">
      {/* Master Sidebar: Curriculum Map */}
      <aside className="w-full md:w-72 shrink-0 premium-glass bg-white/80 rounded-2xl border border-stone-200 shadow-sm hidden md:flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b border-stone-200/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
            Mapa Curricular
          </h3>
          <p className="text-sm font-bold text-stone-600 mt-1">24 Lecciones</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-stone-200">
          {CATALOG.map((entry) => (
            <button
              key={entry.n}
              onClick={() => {
                onSelectLesson(entry.n);
                setActiveTab("objetivos"); // Reset tab when switching lessons
              }}
              className={`flex items-center justify-between w-full text-left px-3 py-3 rounded-xl transition-all ${
                selectedLesson === entry.n
                  ? "bg-stone-800 text-white shadow-md"
                  : "hover:bg-stone-100 text-stone-600"
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${selectedLesson === entry.n ? "text-stone-300" : "text-stone-400"}`}
                >
                  Lección {entry.n}
                </span>
                <span
                  className={`text-sm font-bold truncate pr-2 ${selectedLesson === entry.n ? "text-white" : "text-stone-700"}`}
                >
                  {entry.title}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${selectedLesson === entry.n ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          ))}
        </div>
      </aside>

      {/* Detail Area: Seamless Tabs + HTML Content */}
      <div className="flex-1 premium-glass bg-white/90 rounded-2xl border border-stone-200 shadow-sm flex flex-col h-full overflow-hidden min-w-0">
        {/* Horizontal Seamless Tabs */}
        <div className="flex items-center gap-2 p-3 bg-stone-50/80 border-b border-stone-200/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("objetivos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === "objetivos"
                ? "bg-white text-stone-800 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Target
              className={`w-4 h-4 ${activeTab === "objetivos" ? "text-orange-500" : "text-stone-400"}`}
            />
            Objetivos
          </button>

          <button
            onClick={() => setActiveTab("procedimiento")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === "procedimiento"
                ? "bg-white text-stone-800 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
          >
            <ListTodo
              className={`w-4 h-4 ${activeTab === "procedimiento" ? "text-emerald-500" : "text-stone-400"}`}
            />
            Procedimiento
          </button>

          <button
            onClick={() => setActiveTab("vocabulario")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === "vocabulario"
                ? "bg-white text-stone-800 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
          >
            <BookOpen
              className={`w-4 h-4 ${activeTab === "vocabulario" ? "text-blue-500" : "text-stone-400"}`}
            />
            Vocabulario y Poema
          </button>

          <button
            onClick={() => setActiveTab("evaluacion")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === "evaluacion"
                ? "bg-white text-stone-800 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
          >
            <GraduationCap
              className={`w-4 h-4 ${activeTab === "evaluacion" ? "text-purple-500" : "text-stone-400"}`}
            />
            Evaluación
          </button>
        </div>

        {/* HTML Rendering Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div
            className={`prose prose-stone max-w-none guide-html-content active-tab-${activeTab}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
