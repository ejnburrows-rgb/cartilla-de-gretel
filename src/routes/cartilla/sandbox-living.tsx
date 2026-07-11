import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Trophy } from "lucide-react";
import { LivingWorkbookPage } from "@/components/cartilla/LivingWorkbookPage";
import { getAllWorkbookPages, WorkbookManifestPage } from "@/lib/workbook-manifest";

export const Route = createFileRoute("/cartilla/sandbox-living")({
  component: SandboxLivingPage,
});

function SandboxLivingPage() {
  const pages = getAllWorkbookPages();
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [completedPages, setCompletedPages] = useState<number[]>([]);

  const handlePageComplete = (pageNumber: number) => {
    setCompletedPages((prev) =>
      prev.includes(pageNumber) ? prev : [...prev, pageNumber]
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
          <div>
            <Link
              to="/cartilla"
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Cartilla
            </Link>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              LivingWorkbookPage Sandbox
            </h1>
            <p className="text-sm text-stone-500">
              Prueba interactiva del pipeline de manifiestos y páginas oficiales conectadas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>
                Completadas: {completedPages.length} / {pages.length}
              </span>
            </div>
          </div>
        </div>

        {/* Page Selector Tabs */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Seleccionar Página:
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-2">
            {pages.map((p: WorkbookManifestPage) => {
              const isActive = p.pageNumber === activePageNumber;
              const isDone = completedPages.includes(p.pageNumber);
              return (
                <button
                  key={p.pageNumber}
                  onClick={() => setActivePageNumber(p.pageNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md"
                      : isDone
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Pág {p.pageNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active LivingWorkbookPage */}
        <div className="mt-4">
          <LivingWorkbookPage
            key={activePageNumber}
            pageNumber={activePageNumber}
            onPageCompleted={handlePageComplete}
          />
        </div>
      </div>
    </div>
  );
}
