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
  return { borderColor: `${accent}66` };
}

function revealPanelStyle(accent: string): CSSProperties {
  return { borderColor: `${accent}55` };
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
    <div className="rounded-[1.75rem] border-2 border-foreground/10 bg-card p-4 sm:p-5 space-y-4 shadow-xl shadow-primary/5">
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-full min-h-[2.5rem] rounded-full shrink-0"
          style={accentBarStyle(accent)}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-foreground/90 leading-tight">{interaction.title}</h3>
          <p className="text-sm font-semibold text-foreground/65 mt-1 leading-snug">{interaction.prompt}</p>
          {interaction.targets.length > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-black text-foreground/55">
              <Hand className="h-3.5 w-3.5" />
              Arrastra, o toca una palabra y luego su cuadro.
            </p>
          )}
        </div>
        {(completed.size > 0 || revealed) && (
          <button
            type="button"
            onClick={resetActivity}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-2 text-xs font-black text-foreground/55 transition hover:bg-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        )}
      </div>

      {imageSrc && (
        <div className="rounded-3xl border border-foreground/10 bg-[hsl(42,48%,97%)] p-3 shadow-inner">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-foreground/45">
            <ImageIcon className="h-4 w-4" />
            Busca la palabra en la página
          </div>
          <img
            src={imageSrc}
            alt="Página fuente del cuaderno"
            className="mx-auto max-h-72 w-full rounded-2xl object-contain shadow-md ring-1 ring-foreground/10"
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
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={handleDragEnd}
              onClick={() =>
                interaction.targets.length > 0
                  ? setSelectedId((current) => (current === item.id ? null : item.id))
                  : handleReveal(item.id)
              }
              className={cn(
                "inline-flex min-h-16 items-center gap-3 px-5 py-3 sm:px-6 sm:py-4 rounded-3xl font-black text-lg sm:text-2xl border-[3px] shadow-md cursor-grab active:cursor-grabbing transition-all select-none",
                isDone
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 opacity-75"
                  : draggedId === item.id
                    ? "opacity-40 scale-95"
                    : isSelected
                      ? "border-primary bg-primary/10 text-foreground scale-[1.03] ring-4 ring-primary/15"
                      : "border-foreground/15 bg-background text-foreground hover:scale-105 hover:border-primary/40 active:scale-95",
              )}
              style={isDone ? undefined : activeChipStyle(accent)}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {itemImageSrc && (
                <img
                  src={itemImageSrc}
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-foreground/10"
                  loading="lazy"
                />
              )}
              {item.label}
              <Volume2 className="w-3 h-3 text-foreground/40" aria-hidden />
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
                  "min-h-20 sm:min-h-24 flex items-center justify-center px-4 py-4 rounded-3xl border-[3px] border-dashed font-black text-lg sm:text-2xl transition-all shadow-inner",
                  accepted
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : isSelectedTarget
                      ? "border-primary bg-primary/10 text-foreground ring-4 ring-primary/15"
                      : "border-foreground/20 bg-secondary/30 text-foreground/50 hover:border-primary/45 hover:bg-primary/5",
                )}
              >
                {accepted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
            "rounded-3xl border-2 bg-background p-4 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2",
            revealed.isCorrect ? "shadow-lg shadow-emerald-500/10" : "shadow-lg shadow-rose-500/10",
          )}
          style={revealPanelStyle(accent)}
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex flex-col items-center gap-2 py-2">
            <div
              className="text-5xl font-black tracking-wide"
              style={revealWordStyle(accent)}
              aria-label={`Palabra: ${revealedItem?.label}`}
            >
              {revealedItem?.label}
            </div>
            {revealed.isCorrect ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-800 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                ¡Gran trabajo! {revealedTarget ? "Sí coincide." : "Lee y busca esta palabra."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-black text-rose-800 ring-1 ring-rose-200">
                <XCircle className="h-4 w-4" />
                Intenta otra vez. Busca el cuadro que dice {revealedItem?.label}.
              </span>
            )}
            {!imageSrc && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/50 bg-secondary/60 px-2.5 py-1 rounded-full">
                <BookOpen className="w-3 h-3" />
                Imagen pendiente de mapeo del libro
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setReveal(null)}
            className="min-h-11 rounded-full bg-foreground px-5 py-2 text-sm font-black text-background transition hover:opacity-90"
          >
            Continuar
          </button>
        </div>
      )}

      {interaction.sourceStatus === "needs-art-mapping" && (
        <p className="text-xs font-bold text-foreground/40 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {interaction.studentFacingStatus}
        </p>
      )}
    </div>
  );
}
