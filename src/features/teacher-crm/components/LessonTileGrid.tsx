import { Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import type { LessonTileState } from "@/lib/progress-calculation";

interface LessonTileGridProps {
  tiles: LessonTileState[];
  classId: string;
  studentId: string;
}

const STATUS_STYLES: Record<LessonTileState["status"], string> = {
  completed: "bg-[#8da47e] text-white border-[#6b8257] hover:brightness-110",
  in_progress: "bg-[#e8c874] text-[#5c4a1a] border-[#d4a94a] hover:brightness-105",
  not_started: "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200",
};

/** The Lalilo-style "one glance = whole class status" tile: 24 color-coded
 * squares, one per lesson. Real per-lesson status (never a fake toggle) —
 * green = completada, yellow = en progreso, grey = sin empezar. A blue dot
 * overlay marks a lesson currently assigned to the class regardless of this
 * student's own status on it. Clicking a tile drills into the lesson detail
 * route (Lección), completing the Panel → Clase → Estudiante → Lección nav. */
export function LessonTileGrid({ tiles, classId, studentId }: LessonTileGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {tiles.map((tile) => {
        const entry = CATALOG.find((c) => c.n === tile.lessonNumber);
        const label =
          tile.status === "completed"
            ? "Completada"
            : tile.status === "in_progress"
              ? "En progreso"
              : "Sin empezar";
        return (
          <Link
            key={tile.lessonNumber}
            to="/cartilla/teacher/crm/$classId/$studentId/$lessonId"
            params={{ classId, studentId, lessonId: String(tile.lessonNumber) }}
            className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center font-black text-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${STATUS_STYLES[tile.status]}`}
            title={`${entry?.title ?? `Lección ${tile.lessonNumber}`} — ${label}${tile.assigned ? " (asignada)" : ""}`}
          >
            {tile.assigned && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#0284c7] ring-2 ring-white" />
            )}
            {tile.lessonNumber}
          </Link>
        );
      })}
    </div>
  );
}

export function LessonTileLegend() {
  const items: Array<{ swatch: string; label: string }> = [
    { swatch: "bg-[#8da47e]", label: "Completada" },
    { swatch: "bg-[#e8c874]", label: "En progreso" },
    { swatch: "bg-stone-200", label: "Sin empezar" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-stone-500">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-md ${item.swatch}`} />
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
        Asignada
      </span>
    </div>
  );
}
