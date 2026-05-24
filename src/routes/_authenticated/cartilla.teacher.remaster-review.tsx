import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  Sparkles,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Download,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import remasterInventory from "@/data/remaster-inventory.json";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RemasterAsset {
  originalSourcePath: string;
  remasteredPath: string;
  remasteredPathV2?: string;
  cleanupStatus: "pending" | "cleaned" | "needs review" | "approved";
  artifactFixed: boolean;
  remasterType: string;
  approvalStatus: "approved" | "rejected" | "pending";
  type: "student-workbook" | "teacher-flipchart";
  remasterVersion?: string;
  artifactLineFixAttempted?: boolean;
  notes?: string;
}

type Decision = "approve" | "reject" | "tune" | null;

interface AssetDecision {
  decision: Decision;
  tuningNotes: string;
  decidedAt?: string;
}

const STORAGE_KEY = "remaster-review-decisions-v1";

function loadDecisions(): Record<string, AssetDecision> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDecisions(decisions: Record<string, AssetDecision>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  } catch {
    // silent
  }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute(
  "/_authenticated/cartilla/teacher/remaster-review"
)({
  component: RemasterReview,
  head: () => ({
    meta: [{ title: "Revisión de Remasterización — La Cartilla de Gretel" }],
  }),
});

// ─── Component ───────────────────────────────────────────────────────────────

function RemasterReview() {
  const assets = useMemo(
    () => remasterInventory.assets as RemasterAsset[],
    []
  );

  // Only show assets that are reviewable (V2 "needs review" or V1 "cleaned")
  const reviewableAssets = useMemo(
    () =>
      assets
        .map((asset, index) => ({ asset, originalIndex: index }))
        .filter(
          ({ asset }) =>
            asset.cleanupStatus === "needs review" ||
            asset.cleanupStatus === "cleaned"
        ),
    [assets]
  );

  const [selectedAssetIndex, setSelectedAssetIndex] = useState(() => {
    const reviewIdx = assets.findIndex(
      (a) => a.cleanupStatus === "needs review"
    );
    return reviewIdx !== -1 ? reviewIdx : 0;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "student" | "teacher">(
    "all"
  );
  const [filterDecision, setFilterDecision] = useState<
    "all" | "undecided" | "approve" | "reject" | "tune"
  >("all");

  // ── Decisions (localStorage) ─────────────────────────────────────────────
  const [decisions, setDecisions] = useState<Record<string, AssetDecision>>(
    () => loadDecisions()
  );

  const getDecision = useCallback(
    (path: string): AssetDecision =>
      decisions[path] ?? { decision: null, tuningNotes: "" },
    [decisions]
  );

  const setDecision = useCallback(
    (path: string, decision: Decision) => {
      setDecisions((prev) => {
        const next = {
          ...prev,
          [path]: {
            ...prev[path],
            decision,
            tuningNotes: prev[path]?.tuningNotes ?? "",
            decidedAt: new Date().toISOString(),
          },
        };
        saveDecisions(next);
        return next;
      });
    },
    []
  );

  const setTuningNotes = useCallback((path: string, notes: string) => {
    setDecisions((prev) => {
      const next = {
        ...prev,
        [path]: {
          ...prev[path],
          decision: prev[path]?.decision ?? null,
          tuningNotes: notes,
        },
      };
      saveDecisions(next);
      return next;
    });
  }, []);

  const selectedAsset = assets[selectedAssetIndex];
  const selectedDecision = selectedAsset
    ? getDecision(selectedAsset.originalSourcePath)
    : null;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = assets.length;
    const v2 = assets.filter((a) => a.cleanupStatus === "needs review").length;
    const v1 = assets.filter((a) => a.cleanupStatus === "cleaned").length;
    const pending = assets.filter((a) => a.cleanupStatus === "pending").length;
    const decided = Object.values(decisions).filter(
      (d) => d.decision !== null
    ).length;
    const approved = Object.values(decisions).filter(
      (d) => d.decision === "approve"
    ).length;
    const rejected = Object.values(decisions).filter(
      (d) => d.decision === "reject"
    ).length;
    const tuning = Object.values(decisions).filter(
      (d) => d.decision === "tune"
    ).length;
    return { total, v2, v1, pending, decided, approved, rejected, tuning };
  }, [assets, decisions]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredAssets = useMemo(() => {
    return reviewableAssets.filter(({ asset }) => {
      const filename = asset.originalSourcePath.split("/").pop() ?? "";
      const matchesSearch = filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "all" ||
        (filterType === "student" && asset.type === "student-workbook") ||
        (filterType === "teacher" && asset.type === "teacher-flipchart");
      const d = getDecision(asset.originalSourcePath).decision;
      const matchesDecision =
        filterDecision === "all" ||
        (filterDecision === "undecided" && d === null) ||
        (filterDecision === "approve" && d === "approve") ||
        (filterDecision === "reject" && d === "reject") ||
        (filterDecision === "tune" && d === "tune");
      return matchesSearch && matchesType && matchesDecision;
    });
  }, [reviewableAssets, searchQuery, filterType, filterDecision, getDecision]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      const currentFilteredIdx = filteredAssets.findIndex(
        (x) => x.originalIndex === selectedAssetIndex
      );
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = filteredAssets[currentFilteredIdx + 1];
        if (next) setSelectedAssetIndex(next.originalIndex);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = filteredAssets[currentFilteredIdx - 1];
        if (prev) setSelectedAssetIndex(prev.originalIndex);
      } else if (e.key === "1" && selectedAsset) {
        setDecision(selectedAsset.originalSourcePath, "approve");
      } else if (e.key === "2" && selectedAsset) {
        setDecision(selectedAsset.originalSourcePath, "reject");
      } else if (e.key === "3" && selectedAsset) {
        setDecision(selectedAsset.originalSourcePath, "tune");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filteredAssets, selectedAssetIndex, selectedAsset, setDecision]);

  // ── Export JSON ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: stats,
      decisions: Object.entries(decisions).map(([path, d]) => ({
        originalSourcePath: path,
        decision: d.decision,
        tuningNotes: d.tuningNotes || null,
        decidedAt: d.decidedAt || null,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remaster-decisions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Decision color helpers ────────────────────────────────────────────────
  const decisionBadge = (d: Decision) => {
    if (d === "approve")
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (d === "reject")
      return "bg-red-500/20 text-red-300 border-red-500/30";
    if (d === "tune")
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-neutral-800 text-neutral-500 border-neutral-700";
  };

  const decisionLabel = (d: Decision) => {
    if (d === "approve") return "Aprobado";
    if (d === "reject") return "Rechazado";
    if (d === "tune") return "Ajustar";
    return "Sin decision";
  };

  const currentFilteredIdx = filteredAssets.findIndex(
    (x) => x.originalIndex === selectedAssetIndex
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-neutral-950 border-b border-neutral-800 gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/cartilla/teacher/presentacion"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" /> Presentacion
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-base flex items-center gap-2 truncate">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
              Revision de Remasterizacion V2
            </h1>
            <p className="text-[11px] text-neutral-400 truncate">
              Aprobacion visual — Original vs V1 vs V2. Decisiones guardadas en
              el navegador.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
            Total: <span className="text-white font-bold">{stats.total}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            V2: <span className="font-bold">{stats.v2}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Aprobados: <span className="font-bold">{stats.approved}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Rechazados: <span className="font-bold">{stats.rejected}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Ajustar: <span className="font-bold">{stats.tuning}</span>
          </span>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Exportar JSON
          </button>
        </div>
      </header>

      {/* ── Keyboard shortcut hint ─────────────────────────────────────── */}
      <div className="px-6 py-1.5 bg-neutral-950 border-b border-neutral-800/50 flex items-center gap-2 text-[10px] text-neutral-600">
        <Info className="h-3 w-3 text-neutral-700" />
        <span>
          Teclas:{" "}
          <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">1</kbd>{" "}
          Aprobar{" "}
          <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">2</kbd>{" "}
          Rechazar{" "}
          <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">3</kbd>{" "}
          Ajustar{" "}
          <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">
            ArrowUp/Down
          </kbd>{" "}
          Navegar
        </span>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
          {/* Filters */}
          <div className="p-3 border-b border-neutral-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar pagina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-[11px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
              {(["all", "student", "teacher"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded capitalize",
                    filterType === t
                      ? "bg-indigo-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  {t === "all" ? "Todos" : t === "student" ? "Alumno" : "Maestro"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <Filter className="h-3 w-3 text-neutral-600" />
              {(
                [
                  ["all", "Todos"],
                  ["undecided", "Sin dec."],
                  ["approve", "Aprobados"],
                  ["reject", "Rechaz."],
                  ["tune", "Ajustar"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() =>
                    setFilterDecision(
                      filterDecision === val ? "all" : val
                    )
                  }
                  className={cn(
                    "px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors",
                    filterDecision === val
                      ? val === "approve"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : val === "reject"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : val === "tune"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav arrows + count */}
          {filteredAssets.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 text-[10px] text-neutral-500">
              <button
                disabled={currentFilteredIdx <= 0}
                onClick={() => {
                  const prev = filteredAssets[currentFilteredIdx - 1];
                  if (prev) setSelectedAssetIndex(prev.originalIndex);
                }}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span>
                {currentFilteredIdx + 1} / {filteredAssets.length}
              </span>
              <button
                disabled={currentFilteredIdx >= filteredAssets.length - 1}
                onClick={() => {
                  const next = filteredAssets[currentFilteredIdx + 1];
                  if (next) setSelectedAssetIndex(next.originalIndex);
                }}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Asset list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                Sin coincidencias
              </div>
            ) : (
              filteredAssets.map(({ asset, originalIndex }) => {
                const isSelected = originalIndex === selectedAssetIndex;
                const isV2 = asset.cleanupStatus === "needs review";
                const d = getDecision(asset.originalSourcePath).decision;
                const filename =
                  asset.originalSourcePath.split("/").pop() ?? "";
                return (
                  <button
                    key={asset.originalSourcePath}
                    onClick={() => setSelectedAssetIndex(originalIndex)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs border transition-all",
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/30 text-white font-bold"
                        : "border-transparent bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-mono tracking-tight">
                        {filename}
                      </span>
                      <span className="block text-[9px] text-neutral-600 mt-0.5">
                        {asset.type === "student-workbook"
                          ? "Cuaderno Alumno"
                          : "Flipchart Maestro"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isV2 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[8px] font-bold uppercase tracking-wider">
                          V2
                        </span>
                      )}
                      {d !== null && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                            decisionBadge(d)
                          )}
                        >
                          {d === "approve"
                            ? "OK"
                            : d === "reject"
                            ? "NO"
                            : "Tune"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        {selectedAsset ? (
          <main className="flex-1 flex flex-col bg-neutral-900 overflow-hidden">
            {/* Asset header bar */}
            <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h2 className="font-bold text-xs font-mono text-indigo-300 truncate">
                  {selectedAsset.originalSourcePath}
                </h2>
                <div className="mt-0.5 flex items-center gap-3 text-[10px] text-neutral-400 flex-wrap">
                  <span>
                    Tipo:{" "}
                    <strong className="text-neutral-200">
                      {selectedAsset.type === "student-workbook"
                        ? "Cuaderno Alumno"
                        : "Flipchart Maestro"}
                    </strong>
                  </span>
                  <span>
                    Estado cleanup:{" "}
                    <strong className="text-indigo-300">
                      {selectedAsset.cleanupStatus}
                    </strong>
                  </span>
                  {selectedAsset.notes && (
                    <span>
                      Nota:{" "}
                      <strong className="text-amber-300">
                        {selectedAsset.notes}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Current decision badge */}
              <span
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                  decisionBadge(selectedDecision?.decision ?? null)
                )}
              >
                {selectedDecision?.decision === "approve" ? (
                  <ThumbsUp className="h-3.5 w-3.5" />
                ) : selectedDecision?.decision === "reject" ? (
                  <ThumbsDown className="h-3.5 w-3.5" />
                ) : selectedDecision?.decision === "tune" ? (
                  <Wrench className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {decisionLabel(selectedDecision?.decision ?? null)}
              </span>
            </div>

            {/* Triple compare */}
            <div className="grid grid-cols-3 gap-2 p-3 flex-[3] min-h-0 overflow-hidden">
              {/* Col 1: Original */}
              <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> Original
                  </span>
                  <span className="font-mono text-[9px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-500">
                    Fuente Honesta
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2 min-h-0 bg-neutral-950 overflow-hidden">
                  <img
                    src={selectedAsset.originalSourcePath}
                    alt="Original Scan"
                    className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm"
                  />
                </div>
              </div>

              {/* Col 2: V1 */}
              <div className="flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between text-[11px] font-bold text-emerald-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Remaster V1
                  </span>
                  <span className="font-mono text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400">
                    Limpieza Basica
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2 min-h-0 bg-neutral-950 overflow-hidden">
                  {selectedAsset.cleanupStatus === "cleaned" ||
                  selectedAsset.cleanupStatus === "needs review" ? (
                    <img
                      src={selectedAsset.remasteredPath}
                      alt="Remaster V1"
                      className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm"
                    />
                  ) : (
                    <div className="text-center text-[11px] text-neutral-600 flex flex-col items-center gap-2">
                      <Clock className="h-6 w-6 text-neutral-800" />
                      <p>V1 no procesado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Col 3: V2 */}
              <div className="flex flex-col bg-neutral-950 rounded-xl border border-indigo-900/60 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-indigo-900/40 flex items-center justify-between text-[11px] font-bold text-indigo-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 animate-pulse" /> Remaster V2
                  </span>
                  <span className="font-mono text-[9px] bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">
                    Vivid Projection
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2 min-h-0 bg-neutral-950 overflow-hidden">
                  {selectedAsset.cleanupStatus === "needs review" &&
                  selectedAsset.remasteredPathV2 ? (
                    <img
                      src={selectedAsset.remasteredPathV2}
                      alt="Remaster V2"
                      className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm border-2 border-indigo-500/20"
                    />
                  ) : (
                    <div className="text-center text-[11px] text-neutral-600 flex flex-col items-center gap-2">
                      <Clock className="h-6 w-6 text-neutral-800" />
                      <p className="font-semibold">V2 no disponible</p>
                      <p className="text-[9px] text-neutral-700 max-w-[160px]">
                        Solo los samples del Sprint V2 tienen imagen V2.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decision + Tuning panel */}
            <div className="border-t border-neutral-800 bg-neutral-950 p-4 flex gap-4 shrink-0">
              {/* Decision buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Decision V2 (local)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDecision(
                        selectedAsset.originalSourcePath,
                        selectedDecision?.decision === "approve"
                          ? null
                          : "approve"
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                      selectedDecision?.decision === "approve"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-900/30"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-emerald-500/30 hover:text-emerald-400"
                    )}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Aprobar V2{" "}
                    <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">
                      1
                    </kbd>
                  </button>

                  <button
                    onClick={() =>
                      setDecision(
                        selectedAsset.originalSourcePath,
                        selectedDecision?.decision === "reject"
                          ? null
                          : "reject"
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                      selectedDecision?.decision === "reject"
                        ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-900/30"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-red-500/30 hover:text-red-400"
                    )}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Rechazar{" "}
                    <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">
                      2
                    </kbd>
                  </button>

                  <button
                    onClick={() =>
                      setDecision(
                        selectedAsset.originalSourcePath,
                        selectedDecision?.decision === "tune" ? null : "tune"
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                      selectedDecision?.decision === "tune"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-900/30"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-amber-500/30 hover:text-amber-400"
                    )}
                  >
                    <Wrench className="h-4 w-4" />
                    Necesita Ajuste{" "}
                    <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">
                      3
                    </kbd>
                  </button>
                </div>
                {selectedDecision?.decidedAt && (
                  <p className="text-[9px] text-neutral-600">
                    Decidido:{" "}
                    {new Date(selectedDecision.decidedAt).toLocaleString(
                      "es-MX"
                    )}
                  </p>
                )}
              </div>

              {/* Tuning notes */}
              <div className="flex-1 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Notas de Ajuste (se guardan localmente)
                </p>
                <textarea
                  value={selectedDecision?.tuningNotes ?? ""}
                  onChange={(e) =>
                    setTuningNotes(
                      selectedAsset.originalSourcePath,
                      e.target.value
                    )
                  }
                  placeholder="Describe que necesita ajuste: contraste, saturacion, lineas, bordes, ruido..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/40 resize-none transition-colors"
                />
                <p className="text-[9px] text-neutral-700">
                  Las notas NO modifican el inventario JSON. Usa "Exportar JSON"
                  para obtener un resumen de decisiones.
                </p>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex-1 bg-neutral-900 flex items-center justify-center text-neutral-500 text-sm">
            Selecciona una pagina para comparar
          </div>
        )}
      </div>
    </div>
  );
}
