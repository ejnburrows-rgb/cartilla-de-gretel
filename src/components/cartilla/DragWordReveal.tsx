import { useState, useCallback } from "react";
import { Volume2, CheckCircle2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import type { WorkbookInteraction } from "@/lib/workbook-interactions";

type Props = {
  interaction: WorkbookInteraction;
  accent?: string;
  onComplete?: (interactionId: string) => void;
};

type RevealState = {
  itemId: string;
  isCorrect: boolean;
} | null;

export function DragWordReveal({ interaction, accent = "hsl(var(--primary))", onComplete }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [revealed, setReveal] = useState<RevealState>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleReveal = useCallback(
    (itemId: string) => {
      const item = interaction.items.find((i) => i.id === itemId);
      if (!item) return;

      // Find matching target
      const target = interaction.targets.find((t) => t.acceptsItemId === itemId);
      const isCorrect = Boolean(target);

      setReveal({ itemId, isCorrect });
      speak(item.label);

      if (isCorrect) {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.add(itemId);
          // If all items with targets are completed, fire onComplete
          const totalWithTargets = interaction.items.filter((i) =>
            interaction.targets.some((t) => t.acceptsItemId === i.id),
          ).length;
          if (next.size >= totalWithTargets && onComplete) {
            onComplete(interaction.id);
          }
          return next;
        });
      }
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
    const target = interaction.targets.find((t) => t.id === targetId);
    if (!target) return;

    // Reveal whichever item was dropped
    handleReveal(droppedItemId);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-full min-h-[2rem] rounded-full shrink-0"
          style={{ backgroundColor: accent }}
        />
        <div>
          <h3 className="font-bold text-base text-foreground/90">{interaction.title}</h3>
          <p className="text-sm text-foreground/65 mt-0.5">{interaction.prompt}</p>
        </div>
      </div>

      {/* Word Chips */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Palabras para arrastrar">
        {interaction.items.map((item) => {
          const isDone = completed.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              aria-label={`Palabra: ${item.label}${isDone ? ". Completada." : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleReveal(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm border-2 cursor-grab active:cursor-grabbing transition-all select-none",
                isDone
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 opacity-70"
                  : draggedId === item.id
                    ? "opacity-40 scale-95"
                    : "border-foreground/15 bg-background text-foreground hover:scale-105 hover:border-primary/40 active:scale-95",
              )}
              style={{ borderColor: draggedId === item.id ? accent : undefined }}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {item.label}
              <Volume2 className="w-3 h-3 text-foreground/40" aria-hidden />
            </button>
          );
        })}
      </div>

      {/* Drop Zones */}
      {interaction.targets.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Zonas de destino">
          {interaction.targets.map((target) => {
            const accepted = completed.has(target.acceptsItemId ?? "");
            return (
              <div
                key={target.id}
                role="listitem"
                aria-label={`Zona: ${target.label}${accepted ? ". Completada." : ""}`}
                onDrop={(e) => handleDrop(e, target.id)}
                onDragOver={handleDragOver}
                className={cn(
                  "min-w-[80px] min-h-[48px] flex items-center justify-center px-3 py-2 rounded-xl border-2 border-dashed font-bold text-sm transition-all",
                  accepted
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : "border-foreground/20 bg-secondary/30 text-foreground/50",
                )}
              >
                {accepted ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {target.label}
                  </span>
                ) : (
                  <span>{target.label}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reveal Panel */}
      {revealed && (
        <div
          className="rounded-2xl border-2 bg-background p-4 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2"
          style={{ borderColor: accent }}
          role="status"
          aria-live="polite"
        >
          {interaction.assetRef ? (
            <img
              src={interaction.assetRef}
              alt={interaction.items.find((i) => i.id === revealed.itemId)?.label ?? ""}
              className="mx-auto max-h-48 rounded-xl object-contain"
            />
          ) : (
            <div className="mx-auto flex flex-col items-center gap-2 py-4">
              <div
                className="text-5xl font-extrabold tracking-wide"
                style={{ color: accent }}
                aria-label={`Palabra: ${interaction.items.find((i) => i.id === revealed.itemId)?.label}`}
              >
                {interaction.items.find((i) => i.id === revealed.itemId)?.label}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/50 bg-secondary/60 px-2.5 py-1 rounded-full">
                <BookOpen className="w-3 h-3" />
                Imagen pendiente de mapeo del libro
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setReveal(null)}
            className="text-xs font-bold text-foreground/50 hover:text-foreground underline"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Source status footer */}
      {interaction.sourceStatus === "needs-art-mapping" && (
        <p className="text-xs font-bold text-foreground/40 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {interaction.studentFacingStatus}
        </p>
      )}
    </div>
  );
}
