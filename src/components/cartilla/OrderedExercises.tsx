import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Settings2, RotateCcw } from "lucide-react";

export type ExerciseBlock = { id: string; label: string; node: ReactNode };

const KEY = (lessonId: string) => `cartilla.exercise-order.v1.${lessonId}`;

function loadOrder(lessonId: string): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY(lessonId));
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function saveOrder(lessonId: string, order: string[]) {
  try {
    localStorage.setItem(KEY(lessonId), JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function OrderedExercises({
  lessonId,
  blocks,
}: {
  lessonId: string;
  blocks: ExerciseBlock[];
}) {
  const defaultIds = blocks.map((b) => b.id);
  const [order, setOrder] = useState<string[]>(defaultIds);
  const [editing, setEditing] = useState(false);

  // Hydrate from storage and reconcile with current blocks (handle added/removed ids)
  useEffect(() => {
    const stored = loadOrder(lessonId);
    const ids = blocks.map((b) => b.id);
    if (!stored) {
      setOrder(ids);
      return;
    }
    const merged = [
      ...stored.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !stored.includes(id)),
    ];
    setOrder(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, blocks.map((b) => b.id).join("|")]);

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
    saveOrder(lessonId, next);
  };

  const reset = () => {
    setOrder(defaultIds);
    saveOrder(lessonId, defaultIds);
  };

  const byId = new Map(blocks.map((b) => [b.id, b]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as ExerciseBlock[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-2">
        {editing && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-bold text-foreground/60 hover:text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer orden
          </button>
        )}
        <button
          onClick={() => setEditing((e) => !e)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-foreground/15 hover:bg-secondary"
        >
          <Settings2 className="w-3.5 h-3.5" /> {editing ? "Listo" : "Reordenar ejercicios"}
        </button>
      </div>
      {ordered.map((b, i) => (
        <div key={b.id} className="relative">
          {editing && (
            <div className="absolute -top-3 left-3 z-10 inline-flex items-center gap-1 bg-background border-2 border-foreground/15 rounded-xl px-2 py-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/60 mr-1">
                {b.label}
              </span>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded-md hover:bg-secondary disabled:opacity-30"
                aria-label={`Subir ${b.label}`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === ordered.length - 1}
                className="p-1 rounded-md hover:bg-secondary disabled:opacity-30"
                aria-label={`Bajar ${b.label}`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {b.node}
        </div>
      ))}
    </div>
  );
}
