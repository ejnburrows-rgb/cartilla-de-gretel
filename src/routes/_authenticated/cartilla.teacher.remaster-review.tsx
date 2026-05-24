import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle2, Clock, Eye, AlertCircle, Sparkles, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import remasterInventory from "@/data/remaster-inventory.json";

interface RemasterAsset {
  originalSourcePath: string;
  remasteredPath: string;
  cleanupStatus: "pending" | "cleaned" | "needs review" | "approved";
  artifactFixed: boolean;
  remasterType: string;
  approvalStatus: "approved" | "rejected" | "pending";
  type: "student-workbook" | "teacher-flipchart";
}

export const Route = createFileRoute("/_authenticated/cartilla/teacher/remaster-review")({
  component: RemasterReview,
  head: () => ({ meta: [{ title: "Revisión de Remasterización — La Cartilla de Gretel" }] }),
});

function RemasterReview() {
  const assets = useMemo(() => remasterInventory.assets as RemasterAsset[], []);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(() => {
    // Default to the first "cleaned" asset if possible
    const cleanedIdx = assets.findIndex(a => a.cleanupStatus === "cleaned");
    return cleanedIdx !== -1 ? cleanedIdx : 0;
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "student" | "teacher">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "cleaned" | "pending">("all");

  const selectedAsset = assets[selectedAssetIndex];

  // Stats calculation
  const stats = useMemo(() => {
    const total = assets.length;
    const cleaned = assets.filter(a => a.cleanupStatus === "cleaned").length;
    const pending = assets.filter(a => a.cleanupStatus === "pending").length;
    const approved = assets.filter(a => a.approvalStatus === "approved").length;
    return { total, cleaned, pending, approved };
  }, [assets]);

  // Filtering assets for list
  const filteredAssets = useMemo(() => {
    return assets
      .map((asset, index) => ({ asset, originalIndex: index }))
      .filter(({ asset }) => {
        const matchesSearch = asset.originalSourcePath.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = 
          filterType === "all" || 
          (filterType === "student" && asset.type === "student-workbook") ||
          (filterType === "teacher" && asset.type === "teacher-flipchart");
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "cleaned" && asset.cleanupStatus === "cleaned") ||
          (filterStatus === "pending" && asset.cleanupStatus === "pending");
        return matchesSearch && matchesType && matchesStatus;
      });
  }, [assets, searchQuery, filterType, filterStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link
            to="/cartilla/teacher"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" /> Aprobación de Remasterización
            </h1>
            <p className="text-xs text-neutral-400">Revisión honesta y comparación side-by-side de scans oficiales</p>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-full bg-neutral-800 border border-neutral-700">
            Total páginas: <span className="text-indigo-400 font-bold">{stats.total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Limpias: <span className="font-bold">{stats.cleaned}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pendientes: <span className="font-bold">{stats.pending}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Assets list */}
        <aside className="w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
          {/* Filters area */}
          <div className="p-4 border-b border-neutral-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar página..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setFilterType("all")}
                className={cn("py-1 text-[10px] font-bold rounded", filterType === "all" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200")}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType("student")}
                className={cn("py-1 text-[10px] font-bold rounded", filterType === "student" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200")}
              >
                Alumno
              </button>
              <button
                onClick={() => setFilterType("teacher")}
                className={cn("py-1 text-[10px] font-bold rounded", filterType === "teacher" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200")}
              >
                Maestro
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Filter className="h-3 w-3" />
              <button
                onClick={() => setFilterStatus(filterStatus === "cleaned" ? "all" : "cleaned")}
                className={cn("px-2 py-0.5 rounded border border-neutral-800 text-[10px] font-semibold", filterStatus === "cleaned" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "hover:bg-neutral-800")}
              >
                Solo limpiadas
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">Sin coincidencias</div>
            ) : (
              filteredAssets.map(({ asset, originalIndex }) => {
                const isSelected = originalIndex === selectedAssetIndex;
                const isCleaned = asset.cleanupStatus === "cleaned";
                return (
                  <button
                    key={asset.originalSourcePath}
                    onClick={() => setSelectedAssetIndex(originalIndex)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg flex items-center justify-between gap-3 text-xs border transition-all",
                      isSelected 
                        ? "bg-indigo-600/10 border-indigo-500/30 text-white font-bold" 
                        : "border-transparent bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-mono tracking-tight">
                        {asset.originalSourcePath.split('/').pop()}
                      </span>
                      <span className="block text-[10px] text-neutral-500 mt-0.5">
                        {asset.type === "student-workbook" ? "Cuaderno Alumno" : "Flipchart Maestro"}
                      </span>
                    </div>
                    {isCleaned ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shrink-0" title="Limpieza completada" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-neutral-700 shrink-0" title="Pendiente" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Comparison Workspace */}
        {selectedAsset ? (
          <main className="flex-1 flex flex-col bg-neutral-900 overflow-hidden">
            {/* Asset header */}
            <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-bold text-sm font-mono text-indigo-300 truncate">
                  {selectedAsset.originalSourcePath}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                  <span>Tipo: <strong className="text-neutral-200">{selectedAsset.type === "student-workbook" ? "Student Cuaderno" : "Teacher Flipchart"}</strong></span>
                  {selectedAsset.remasterType && (
                    <span>Técnica: <strong className="text-neutral-200">{selectedAsset.remasterType}</strong></span>
                  )}
                </div>
              </div>

              {/* Status and Action Panel */}
              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                  selectedAsset.cleanupStatus === "cleaned" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-neutral-800 text-neutral-400 border-neutral-700"
                )}>
                  {selectedAsset.cleanupStatus === "cleaned" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {selectedAsset.cleanupStatus === "cleaned" ? "Limpieza completada" : "Remaster pendiente"}
                </span>

                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5 animate-pulse" /> Pendiente de Aprobación (No en prod)
                </span>
              </div>
            </div>

            {/* Side-by-side view */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-hidden">
              {/* Left Column: Original Scan */}
              <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden relative group">
                <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-400 z-10 shrink-0">
                  <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Original Scan (Honest Source)</span>
                  <span className="font-mono text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    No Alterado
                  </span>
                </div>
                <div className="flex-1 relative flex items-center justify-center p-4 min-h-0 bg-neutral-950 overflow-hidden">
                  <img
                    src={selectedAsset.originalSourcePath}
                    alt="Original Scan"
                    className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm"
                  />
                </div>
              </div>

              {/* Right Column: Remaster Preview */}
              <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden relative group">
                <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-400 z-10 shrink-0">
                  <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Remaster Preview (Cleaned)</span>
                  <span className="font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400">
                    Deterministico
                  </span>
                </div>
                <div className="flex-1 relative flex items-center justify-center p-4 min-h-0 bg-neutral-950 overflow-hidden">
                  {selectedAsset.cleanupStatus === "cleaned" ? (
                    <img
                      src={selectedAsset.remasteredPath}
                      alt="Remaster Preview"
                      className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm"
                    />
                  ) : (
                    <div className="text-center text-xs text-neutral-500 flex flex-col items-center gap-3">
                      <Clock className="h-10 w-10 text-neutral-700 animate-pulse" />
                      <div className="space-y-1">
                        <p className="font-bold">Vista previa no disponible</p>
                        <p className="text-[10px] text-neutral-600 max-w-[200px]">La limpieza de esta página oficial está pendiente de procesamiento</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex-1 bg-neutral-900 flex items-center justify-center text-neutral-500">
            Selecciona una página para comparar
          </div>
        )}
      </div>
    </div>
  );
}
