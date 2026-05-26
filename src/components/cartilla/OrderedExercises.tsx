import { useEffect, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowDown, ArrowUp, Settings2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExerciseBlock = { id: string; label: string; node: ReactNode };

const KEY = (lessonId: string) => `cartilla.exercise-order.v1.${lessonId}`;
const blockVariants: Variants = {
  rest: { y: 0, scale: 1 },
  editing: { y: [0, -2, 0], scale: 1.005 },
};

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
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-[1.5rem] bg-amber-50/55 px-3 py-2 ring-1 ring-amber-900/10">
        {editing && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-amber-900 shadow-sm ring-1 ring-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-50 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" /> Restablecer orden
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5 active:scale-95",
            editing
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-900/15 bg-white text-amber-950 hover:bg-amber-50",
          )}
        >
          <Settings2 className="h-4 w-4" /> {editing ? "Listo" : "Reordenar ejercicios"}
        </button>
      </div>
      {ordered.map((b, i) => (
        <motion.div
          key={b.id}
          className="relative"
          variants={blockVariants}
          animate={editing ? "editing" : "rest"}
          transition={{ duration: 0.55, repeat: editing ? Infinity : 0, repeatDelay: 1.4 }}
          layout
        >
          {editing && (
            <div className="absolute -top-4 left-3 z-10 inline-flex items-center gap-1 rounded-2xl border-2 border-amber-900/15 bg-white px-2 py-1 shadow-md">
              <span className="mr-1 max-w-32 truncate px-1 text-[10px] font-black uppercase tracking-wide text-amber-900/70">
                {b.label}
              </span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="grid min-h-10 min-w-10 place-items-center rounded-xl text-amber-950 transition hover:bg-amber-50 active:scale-95 disabled:opacity-30"
                aria-label={`Subir ${b.label}`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === ordered.length - 1}
                className="grid min-h-10 min-w-10 place-items-center rounded-xl text-amber-950 transition hover:bg-amber-50 active:scale-95 disabled:opacity-30"
                aria-label={`Bajar ${b.label}`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          )}
          {b.node}
        </motion.div>
      ))}
    </div>
  );
}
