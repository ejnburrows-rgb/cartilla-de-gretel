import type { CSSProperties } from "react";
import { useState, useCallback } from "react";
import { Volume2, CheckCircle2, BookOpen, Hand, Image as ImageIcon, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { assetPath } from "@/lib/assets";
import type { WorkbookInteraction } from "@/lib/workbook-interactions";

type Props = {
  interaction: WorkbookInteraction;
  accent?: string;
  onComplete?: (interactionId: string) => void;
};

type RevealState = {
  itemId: string;
  isCorrect: boolean;
  targetId?: string;
} | null;

function accentBarStyle(accent: string): CSSProperties {
  return { backgroundColor: accent };
}

function activeChipStyle(accent: string): CSSProperties {
  return {
    borderColor: `${accent}35`,
    borderBottomColor: `${accent}a0`,
    borderBottomWidth: "5px",
  };
}

function revealPanelStyle(accent: string): CSSProperties {
  return { borderColor: `${accent}44` };
}

function revealWordStyle(accent: string): CSSProperties {
  return { color: accent };
}

export function DragWordReveal({ interaction, accent = "hsl(var(--primary))", onComplete }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setReveal] = useState<RevealState>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleReveal = useCallback(
    (itemId: string, targetId?: string) => {
      const item = interaction.items.find((i) => i.id === itemId);
      if (!item) return;

      const target = targetId
        ? interaction.targets.find((t) => t.id === targetId)
        : interaction.targets.find((t) => t.acceptsItemId === itemId);
      const isCorrect =
        interaction.targets.length === 0 ||
        Boolean(target && (!target.acceptsItemId || target.acceptsItemId === itemId));

      setReveal({ itemId, isCorrect, targetId });
      speak(item.label);

      if (isCorrect) {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.add(itemId);
          const totalWithTargets = interaction.items.filter((i) =>
            interaction.targets.length === 0 || interaction.targets.some((t) => t.acceptsItemId === i.id),
          ).length;
          if (next.size >= totalWithTargets && onComplete) onComplete(interaction.id);
          return next;
        });
      }
      setSelectedId(null);
    },
    [interaction, onComplete],
  );

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    setDraggedId(itemId);
  };

  const handleDragEnd = () => setDraggedId(null);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const droppedItemId = e.dataTransfer.getData("text/plain");
    if (!droppedItemId) return;
    handleReveal(droppedItemId, targetId);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleTargetClick = (targetId: string) => {
    if (!selectedId) return;
    handleReveal(selectedId, targetId);
  };
  const resetActivity = () => {
    setSelectedId(null);
    setReveal(null);
    setCompleted(new Set());
  };
  const revealedItem = revealed ? interaction.items.find((i) => i.id === revealed.itemId) : undefined;
  const revealedTarget = revealed?.targetId ? interaction.targets.find((t) => t.id === revealed.targetId) : undefined;
  const imageSrc = interaction.assetRef ? assetPath(interaction.assetRef) : undefined;

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-[#fffdfa] p-5 sm:p-6 space-y-5 shadow-[0_20px_50px_rgba(50,30,10,0.06)] relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-10 rounded-full shrink-0"
          style={accentBarStyle(accent)}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-[#3A281E] leading-tight">{interaction.title}</h3>
          <p className="text-sm font-semibold text-stone-600 mt-1 leading-snug">{interaction.prompt}</p>
          {interaction.targets.length > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-950/5 px-3 py-1 text-[11px] font-black text-amber-900/70">
              <Hand className="h-3.5 w-3.5" />
              Arrastra, o toca una palabra y luego su cuadro.
            </p>
          )}
        </div>
        {(completed.size > 0 || revealed) && (
          <button
            type="button"
            onClick={resetActivity}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black text-stone-600 transition hover:bg-stone-50 active:scale-95 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-stone-500" /> Reiniciar
          </button>
        )}
      </div>

      {imageSrc && (
        <div className="rounded-3xl border border-stone-200 bg-[#FAF7F0]/40 p-4 shadow-[inset_0_4px_12px_rgba(44,30,22,0.06)]">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-stone-500/80">
            <ImageIcon className="h-4 w-4 text-stone-400" />
            Busca la palabra en la página
          </div>
          <img
            src={imageSrc}
            alt="Página fuente del cuaderno"
            className="mx-auto max-h-72 w-auto rounded-2xl object-contain shadow-lg border border-stone-200 bg-white"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3" role="list" aria-label="Palabras para arrastrar">
        {interaction.items.map((item) => {
          const isDone = completed.has(item.id);
          const isSelected = selectedId === item.id;
          const itemImageSrc = item.assetRef ? assetPath(item.assetRef) : undefined;
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              aria-label={`Palabra: ${item.label}${isDone ? ". Completada." : ""}`}
              draggable={!isDone}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={handleDragEnd}
              onClick={() =>
                !isDone && (interaction.targets.length > 0
                  ? setSelectedId((current) => (current === item.id ? null : item.id))
                  : handleReveal(item.id))
              }
              className={cn(
                "inline-flex min-h-16 items-center gap-3 px-5 py-3 sm:px-6 sm:py-4 rounded-3xl font-black text-lg sm:text-2xl border-2 shadow-sm cursor-grab active:cursor-grabbing transition-all select-none duration-200",
                isDone
                  ? "border-emerald-250 bg-emerald-50/80 text-emerald-800 opacity-65 border-b-4"
                  : draggedId === item.id
                    ? "opacity-30 scale-95"
                    : isSelected
                      ? "border-amber-600 bg-amber-50/80 text-[#3A281E] scale-[1.03] ring-4 ring-amber-500/20"
                      : "border-stone-200 bg-white text-[#3A281E] hover:scale-104 hover:shadow-md active:translate-y-px active:border-b-2",
              )}
              style={isDone ? undefined : activeChipStyle(accent)}
            >
              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {itemImageSrc && (
                <img
                  src={itemImageSrc}
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-stone-200"
                  loading="lazy"
                />
              )}
              <span>{item.label}</span>
              <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden />
            </button>
          );
        })}
      </div>

      {interaction.targets.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Zonas de destino">
          {interaction.targets.map((target) => {
            const accepted = completed.has(target.acceptsItemId ?? "");
            const isSelectedTarget =
              selectedId !== null && target.acceptsItemId === selectedId && !accepted;
            return (
              <button
                key={target.id}
                type="button"
                role="listitem"
                aria-label={`Zona: ${target.label}${accepted ? ". Completada." : ""}`}
                onDrop={(e) => handleDrop(e, target.id)}
                onDragOver={handleDragOver}
                onClick={() => handleTargetClick(target.id)}
                className={cn(
                  "min-h-20 sm:min-h-24 flex items-center justify-center px-4 py-4 rounded-3xl border-3 border-dashed font-black text-lg sm:text-2xl transition-all duration-200 shadow-inner",
                  accepted
                    ? "border-emerald-250 bg-emerald-50/80 text-emerald-800 border-b-4"
                    : isSelectedTarget
                      ? "border-amber-600 bg-amber-50/60 text-amber-950 ring-4 ring-amber-500/20"
                      : "border-amber-900/20 bg-[#faf5e8]/80 text-[#3A281E]/40 hover:border-amber-800/40 hover:bg-[#fffdf9]",
                )}
              >
                {accepted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    {target.label}
                  </span>
                ) : (
                  <span>{target.label}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {revealed && (
        <div
          className={cn(
            "rounded-3xl border-2 bg-white p-5 text-center space-y-4 animate-in fade-in slide-in-from-bottom-2",
            revealed.isCorrect ? "shadow-lg shadow-emerald-500/10" : "shadow-lg shadow-rose-500/10",
          )}
          style={revealPanelStyle(accent)}
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex flex-col items-center gap-2.5 py-2">
            <div
              className="text-5xl font-black tracking-wide"
              style={revealWordStyle(accent)}
              aria-label={`Palabra: ${revealedItem?.label}`}
            >
              {revealedItem?.label}
            </div>
            {revealed.isCorrect ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-black text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ¡Gran trabajo! {revealedTarget ? "Sí coincide." : "Lee y busca esta palabra."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-sm font-black text-rose-800 border border-rose-200">
                <XCircle className="h-4 w-4 text-rose-600" />
                Intenta otra vez. Busca el cuadro que dice {revealedItem?.label}.
              </span>
            )}
            {!imageSrc && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5" />
                Imagen pendiente de mapeo del libro
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setReveal(null)}
            className="min-h-11 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-black text-white transition hover:bg-stone-850 active:scale-95 cursor-pointer"
          >
            Continuar
          </button>
        </div>
      )}

      {interaction.sourceStatus === "needs-art-mapping" && (
        <p className="text-xs font-bold text-stone-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-stone-300" />
          {interaction.studentFacingStatus}
        </p>
      )}
    </div>
  );
}
