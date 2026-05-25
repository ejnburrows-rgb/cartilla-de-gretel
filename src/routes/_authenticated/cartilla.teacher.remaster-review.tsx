import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
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
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/assets";
import { getRemasterPresentation, type RemasterAsset, type RemasterPresentation } from "@/lib/remaster-assets";
import remasterInventory from "@/data/remaster-inventory.json";

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
    // Local review data is optional.
  }
}

function publicAsset(path?: string) {
  return path ? assetPath(path) : "";
}

function filename(path: string) {
  return path.split("/").pop() ?? path;
}

function statusBadgeStyle(presentation: RemasterPresentation) {
  if (presentation.status === "approved-student") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (presentation.status === "approved-teacher") return "bg-teal-500/15 text-teal-300 border-teal-500/30";
  if (presentation.status === "projection-candidate") return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
  if (presentation.status === "cleaned-image") return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  if (presentation.status === "needs-correction") return "bg-red-500/15 text-red-300 border-red-500/30";
  return "bg-neutral-800 text-neutral-400 border-neutral-700";
}

function queueGroupLabel(asset: RemasterAsset) {
  const presentation = getRemasterPresentation(asset);
  if (presentation.status === "needs-correction") return "Needs correction";
  if (presentation.status === "projection-candidate") return "Projection candidates";
  if (presentation.status === "cleaned-image") return "Cleaned images";
  if (presentation.status === "approved-student") return "Approved for student";
  if (presentation.status === "approved-teacher") return "Approved for teacher";
  return "Original scans";
}

function ReviewImagePanel({
  title,
  badge,
  src,
  emptyText,
  tone = "neutral",
}: {
  title: string;
  badge: string;
  src?: string;
  emptyText: string;
  tone?: "neutral" | "cleaned" | "projection" | "approved" | "correction";
}) {
  const toneClasses = {
    neutral: "border-neutral-800 text-neutral-400",
    cleaned: "border-sky-800/70 text-sky-300",
    projection: "border-indigo-800/70 text-indigo-300",
    approved: "border-emerald-800/70 text-emerald-300",
    correction: "border-red-800/70 text-red-300",
  }[tone];

  return (
    <section className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border bg-neutral-950", toneClasses)}>
      <div className={cn("flex shrink-0 items-center justify-between border-b border-current/20 px-3 py-2 text-[11px] font-bold", toneClasses)}>
        <span className="flex items-center gap-1.5">
          <Image className="h-3.5 w-3.5" />
          {title}
        </span>
        <span className="rounded border border-current/20 bg-current/10 px-2 py-0.5 text-[9px] font-mono">{badge}</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-neutral-950 p-2">
        {src ? (
          <img src={src} alt={title} className="max-h-full max-w-full rounded-sm object-contain drop-shadow-lg" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-[11px] text-neutral-600">
            <Clock className="h-6 w-6 text-neutral-800" />
            <p className="font-semibold">{emptyText}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export const Route = createFileRoute(
  "/_authenticated/cartilla/teacher/remaster-review"
)({
  component: RemasterReview,
  head: () => ({
    meta: [{ title: "Revisión de Remasterización — La Cartilla de Gretel" }],
  }),
});

function RemasterReview() {
  const assets = useMemo(
    () => remasterInventory.assets as RemasterAsset[],
    []
  );

  const reviewableAssets = useMemo(
    () =>
      assets
        .map((asset, index) => ({ asset, originalIndex: index }))
        .filter(
          ({ asset }) =>
            asset.cleanupStatus === "needs review" ||
            asset.cleanupStatus === "cleaned" ||
            asset.cleanupStatus === "approved" ||
            asset.approvalStatus !== "pending"
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
  const selectedPresentation = selectedAsset
    ? getRemasterPresentation(selectedAsset)
    : null;

  const stats = useMemo(() => {
    const total = assets.length;
    const projection = assets.filter((a) => getRemasterPresentation(a).status === "projection-candidate").length;
    const cleaned = assets.filter((a) => getRemasterPresentation(a).status === "cleaned-image").length;
    const approvedStudent = assets.filter((a) => a.approvedForStudent).length;
    const approvedTeacher = assets.filter((a) => a.approvedForTeacher).length;
    const needsCorrection = assets.filter((a) => getRemasterPresentation(a).status === "needs-correction").length;
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
    return { total, projection, cleaned, approvedStudent, approvedTeacher, needsCorrection, pending, decided, approved, rejected, tuning };
  }, [assets, decisions]);

  const filteredAssets = useMemo(() => {
    return reviewableAssets.filter(({ asset }) => {
      const file = filename(asset.originalSourcePath);
      const presentation = getRemasterPresentation(asset);
      const matchesSearch = `${file} ${presentation.label} ${queueGroupLabel(asset)}`
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

  const groupedFilteredAssets = useMemo(() => {
    const groups: Array<{ label: string; items: typeof filteredAssets }> = [];
    for (const item of filteredAssets) {
      const label = queueGroupLabel(item.asset);
      const group = groups.find((g) => g.label === label);
      if (group) group.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [filteredAssets]);

  const currentFilteredIdx = filteredAssets.findIndex(
    (x) => x.originalIndex === selectedAssetIndex
  );

  const pendingFilteredAssets = useMemo(
    () =>
      filteredAssets.filter(
        ({ asset }) => getDecision(asset.originalSourcePath).decision === null
      ),
    [filteredAssets, getDecision]
  );

  const goToFilteredAsset = useCallback(
    (direction: "next" | "prev") => {
      const offset = direction === "next" ? 1 : -1;
      const next = filteredAssets[currentFilteredIdx + offset];
      if (next) setSelectedAssetIndex(next.originalIndex);
    },
    [currentFilteredIdx, filteredAssets]
  );

  const goToNextPending = useCallback(() => {
    if (pendingFilteredAssets.length === 0) return;

    const next =
      pendingFilteredAssets.find(
        ({ originalIndex }) => originalIndex > selectedAssetIndex
      ) ?? pendingFilteredAssets[0];
    setSelectedAssetIndex(next.originalIndex);
  }, [pendingFilteredAssets, selectedAssetIndex]);

  useEffect(() => {
    if (filteredAssets.length === 0 || currentFilteredIdx !== -1) return;
    setSelectedAssetIndex(filteredAssets[0].originalIndex);
  }, [currentFilteredIdx, filteredAssets]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToFilteredAsset("next");
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToFilteredAsset("prev");
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        goToNextPending();
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
  }, [goToFilteredAsset, goToNextPending, selectedAsset, setDecision]);

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
    return "Sin decisión";
  };

  const currentFilteredPosition =
    currentFilteredIdx === -1 ? 0 : currentFilteredIdx + 1;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      <header className="flex items-center justify-between px-6 py-3 bg-neutral-950 border-b border-neutral-800 gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/cartilla/teacher/presentacion"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" /> Presentación
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-base flex items-center gap-2 truncate">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
              Revisión de Remasterización V2
            </h1>
            <p className="text-[11px] text-neutral-400 truncate">
              Aprobación visual — Original vs V1 vs V2. Decisiones guardadas en
              el navegador.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
            Total: <span className="text-white font-bold">{stats.total}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Projection candidates: <span className="font-bold">{stats.projection}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Cleaned: <span className="font-bold">{stats.cleaned}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Student OK: <span className="font-bold">{stats.approvedStudent}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Teacher OK: <span className="font-bold">{stats.approvedTeacher}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Needs correction: <span className="font-bold">{stats.needsCorrection}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Ajustar: <span className="font-bold">{stats.tuning}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
            Pendientes visibles:{" "}
            <span className="text-white font-bold">
              {pendingFilteredAssets.length}
            </span>
          </span>
          <button
            onClick={goToNextPending}
            disabled={pendingFilteredAssets.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Clock className="h-3.5 w-3.5" /> Siguiente pendiente
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Exportar JSON
          </button>
        </div>
      </header>

      <div className="px-6 py-1.5 bg-neutral-950 border-b border-neutral-800/50 flex items-center gap-2 text-[10px] text-neutral-600">
        <Info className="h-3 w-3 text-neutral-700" />
        <span>
          Teclas: <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">1</kbd> Aprobar <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">2</kbd> Rechazar <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">3</kbd> Ajustar <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">N</kbd> Siguiente pendiente <kbd className="px-1 bg-neutral-800 rounded text-neutral-400">ArrowUp/Down</kbd> Navegar
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
          <div className="p-3 border-b border-neutral-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar página..."
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

          {filteredAssets.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 text-[10px] text-neutral-500">
              <button
                disabled={currentFilteredIdx <= 0}
                onClick={() => goToFilteredAsset("prev")}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span>
                {currentFilteredPosition} / {filteredAssets.length}
              </span>
              <button
                disabled={
                  currentFilteredIdx === -1 ||
                  currentFilteredIdx >= filteredAssets.length - 1
                }
                onClick={() => goToFilteredAsset("next")}
                className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                Sin coincidencias
              </div>
            ) : (
              groupedFilteredAssets.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2 pt-2 text-[9px] font-black uppercase tracking-wider text-neutral-600">
                    {group.label} ({group.items.length})
                  </div>
                  {group.items.map(({ asset, originalIndex }) => {
                    const isSelected = originalIndex === selectedAssetIndex;
                    const d = getDecision(asset.originalSourcePath).decision;
                    const presentation = getRemasterPresentation(asset);
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
                            {filename(asset.originalSourcePath)}
                          </span>
                          <span className="block text-[9px] text-neutral-600 mt-0.5">
                            {asset.type === "student-workbook"
                              ? "Student workbook"
                              : "Teacher flipchart"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                              statusBadgeStyle(presentation)
                            )}
                          >
                            {presentation.label}
                          </span>
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
                  })}
                </div>
              ))
            )}
          </div>
        </aside>

        {selectedAsset ? (
          <main className="flex-1 flex flex-col bg-neutral-900 overflow-hidden">
            <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h2 className="font-bold text-xs font-mono text-indigo-300 truncate">
                  {selectedAsset.originalSourcePath}
                </h2>
                <div className="mt-0.5 flex items-center gap-3 text-[10px] text-neutral-400 flex-wrap">
                  <span>
                    Tipo: <strong className="text-neutral-200">{selectedAsset.type === "student-workbook" ? "Cuaderno Alumno" : "Flipchart Maestro"}</strong>
                  </span>
                  <span>
                    Inventory status: <strong className="text-indigo-300">{selectedPresentation?.label}</strong>
                  </span>
                  <span>
                    Best available: <strong className="text-neutral-200">{selectedPresentation?.bestSource}</strong>
                  </span>
                  {selectedAsset.notes && (
                    <span>
                      Nota: <strong className="text-amber-300">{selectedAsset.notes}</strong>
                    </span>
                  )}
                </div>
              </div>

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

            <div className="grid grid-cols-1 gap-3 p-3 flex-[3] min-h-0 overflow-hidden xl:grid-cols-[1fr_1fr_1fr]">
              <ReviewImagePanel
                title="Original scan"
                badge="source"
                src={publicAsset(selectedAsset.originalSourcePath)}
                emptyText="Original scan missing"
              />
              <ReviewImagePanel
                title="Cleaned image"
                badge={selectedAsset.cleanupStatus === "cleaned" || selectedAsset.cleanupStatus === "needs review" || selectedAsset.cleanupStatus === "approved" ? "cleaned" : "not processed"}
                src={
                  selectedAsset.cleanupStatus === "cleaned" ||
                  selectedAsset.cleanupStatus === "needs review" ||
                  selectedAsset.cleanupStatus === "approved"
                    ? publicAsset(selectedAsset.remasteredPath)
                    : undefined
                }
                emptyText="Cleaned image not processed"
                tone="cleaned"
              />
              <ReviewImagePanel
                title={selectedPresentation?.label ?? "Projection candidate"}
                badge={selectedAsset.remasteredPathV2 ? "candidate" : "no candidate"}
                src={selectedAsset.remasteredPathV2 ? publicAsset(selectedAsset.remasteredPathV2) : undefined}
                emptyText="Projection candidate not available"
                tone={
                  selectedPresentation?.status === "needs-correction"
                    ? "correction"
                    : selectedPresentation?.status === "approved-student" || selectedPresentation?.status === "approved-teacher"
                    ? "approved"
                    : "projection"
                }
              />
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 xl:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black", selectedPresentation ? statusBadgeStyle(selectedPresentation) : "border-neutral-700 text-neutral-400")}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {selectedPresentation?.label}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-neutral-400">
                      {selectedPresentation?.description}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-neutral-500">
                    <div>Approved for student: <strong className={selectedAsset.approvedForStudent ? "text-emerald-300" : "text-neutral-300"}>{selectedAsset.approvedForStudent ? "yes" : "no"}</strong></div>
                    <div>Approved for teacher: <strong className={selectedAsset.approvedForTeacher ? "text-teal-300" : "text-neutral-300"}>{selectedAsset.approvedForTeacher ? "yes" : "no"}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-800 bg-neutral-950 p-4 flex gap-4 shrink-0">
              <div className="flex flex-col gap-2 shrink-0">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Decisión V2 (local)</p>
                <div className="flex gap-2">
                  <button onClick={() => setDecision(selectedAsset.originalSourcePath, selectedDecision?.decision === "approve" ? null : "approve")} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all", selectedDecision?.decision === "approve" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-900/30" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-emerald-500/30 hover:text-emerald-400")}><ThumbsUp className="h-4 w-4" />Aprobar V2 <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">1</kbd></button>
                  <button onClick={() => setDecision(selectedAsset.originalSourcePath, selectedDecision?.decision === "reject" ? null : "reject")} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all", selectedDecision?.decision === "reject" ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-900/30" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-red-500/30 hover:text-red-400")}><ThumbsDown className="h-4 w-4" />Rechazar <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">2</kbd></button>
                  <button onClick={() => setDecision(selectedAsset.originalSourcePath, selectedDecision?.decision === "tune" ? null : "tune")} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all", selectedDecision?.decision === "tune" ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-900/30" : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-amber-500/30 hover:text-amber-400")}><Wrench className="h-4 w-4" />Necesita Ajuste <kbd className="ml-1 text-[9px] opacity-50 bg-neutral-800 px-1 rounded">3</kbd></button>
                </div>
                {selectedDecision?.decidedAt && <p className="text-[9px] text-neutral-600">Decidido: {new Date(selectedDecision.decidedAt).toLocaleString("es-MX")}</p>}
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Notas de Ajuste (se guardan localmente)</p>
                <textarea value={selectedDecision?.tuningNotes ?? ""} onChange={(e) => setTuningNotes(selectedAsset.originalSourcePath, e.target.value)} placeholder="Describe qué necesita ajuste: contraste, saturación, líneas, bordes, ruido..." rows={3} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/40 resize-none transition-colors" />
                <p className="text-[9px] text-neutral-700">Las notas NO modifican el inventario JSON. Usa "Exportar JSON" para obtener un resumen de decisiones.</p>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex-1 bg-neutral-900 flex items-center justify-center text-neutral-500 text-sm">Selecciona una página para comparar</div>
        )}
      </div>
    </div>
  );
}
