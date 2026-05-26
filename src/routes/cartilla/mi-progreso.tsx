import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import {
  getLessonStatus,
  getStreakDays,
  resetSession,
  useSessionEvents,
  useStudentSession,
} from "@/lib/student-session";
import { AudioControls } from "@/components/cartilla/AudioControls";
import { AccessibilityPanel } from "@/components/cartilla/AccessibilityPanel";

export const Route = createFileRoute("/cartilla/mi-progreso")({
  component: MyProgress,
  head: () => ({ meta: [{ title: "Mi progreso - La Cartilla de Gretel" }] }),
});

const DASHBOARD_SURFACE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 12% 10%, #fff3b0, transparent 30%), radial-gradient(circle at 88% 12%, #b9f3ff, transparent 30%), linear-gradient(135deg, #fff8de, #ffd6e3 48%, #d9efff)",
};

const SPARKLINE_COLOR = "#c98c4f";
const EMPTY_SPARKLINE_POINTS = "0,56 280,56";

function lessonRingStyle(color: string): CSSProperties {
  return { borderColor: color, color };
}

function completedTileStyle(color: string): CSSProperties {
  return { backgroundColor: color, borderColor: color };
}

function progressTileStyle(color: string): CSSProperties {
  return { borderColor: color };
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastFourteenDays() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return dayKey(date);
  });
}

function countSessionsByDay(events: ReturnType<typeof useSessionEvents>) {
  const days = lastFourteenDays();
  return days.map((day) => ({
    day,
    count: events.filter((event) => event.type === "practica:start" && dayKey(new Date(event.createdAt)) === day).length,
  }));
}

function sparklinePoints(counts: Array<{ day: string; count: number }>) {
  const max = Math.max(1, ...counts.map((item) => item.count));
  return counts
    .map((item, index) => {
      const x = Math.round((index / Math.max(1, counts.length - 1)) * 280);
      const y = Math.round(56 - (item.count / max) * 48);
      return `${x},${y}`;
    })
    .join(" ");
}

function weekSessionCount(events: ReturnType<typeof useSessionEvents>) {
  const cutoff = Date.now() - 7 * 86_400_000;
  return events.filter((event) => event.type === "practica:start" && Date.parse(event.createdAt) >= cutoff).length;
}

function lessonMark(entry: (typeof CATALOG)[number]) {
  if (entry.kind === "intro") return "1";
  if (entry.kind === "vowel") return entry.vowel.toUpperCase();
  return entry.letter.toUpperCase();
}

function TileStateLabel({ status }: { status: ReturnType<typeof getLessonStatus> }) {
  if (status === "completa") return <span>completa</span>;
  if (status === "en-progreso") return <span>en progreso</span>;
  return <span>no visitada</span>;
}

function MyProgress() {
  const session = useStudentSession();
  const events = useSessionEvents();
  const counts = countSessionsByDay(events);
  const points = events.length > 0 ? sparklinePoints(counts) : EMPTY_SPARKLINE_POINTS;
  const completedCount = CATALOG.filter((entry) => getLessonStatus(entry.n) === "completa").length;
  const sessionsThisWeek = weekSessionCount(events);
  const streak = getStreakDays();
  const name = session?.studentName || "lector(a)";

  const clearProgress = () => {
    if (!window.confirm("Esta accion restablece el progreso guardado en este navegador. Desea continuar?")) return;
    resetSession();
  };

  return (
    <main className="cartilla-student-surface min-h-screen px-4 py-6 text-[#3A281E]" style={DASHBOARD_SURFACE_STYLE}>
      <div className="mx-auto max-w-5xl pb-32">
        <Link
          to="/cartilla/lecciones"
          aria-label="Volver a lecciones"
          className="cartilla-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-black shadow-sm backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
          Lecciones
        </Link>

        <header className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-wide text-amber-800">Mi progreso</p>
          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Hola, {name}</h1>
          <p className="mt-2 text-sm font-bold text-[#3A281E]/68">Revise sus lecciones, sesiones y racha de practica.</p>
        </header>

        <section className="mt-6">
          <h2 className="mb-3 text-lg font-black">Cuadricula de lecciones</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {CATALOG.map((entry) => {
              const status = getLessonStatus(entry.n);
              const isComplete = status === "completa";
              const isProgress = status === "en-progreso";
              return (
                <article
                  key={entry.n}
                  className="cartilla-student-card rounded-2xl border-2 bg-white/86 p-3 shadow-sm"
                  style={isComplete ? completedTileStyle(entry.color) : isProgress ? progressTileStyle(entry.color) : undefined}
                >
                  <div
                    className="grid h-12 w-12 place-items-center rounded-full border-4 bg-white text-xl font-black"
                    style={lessonRingStyle(entry.color)}
                  >
                    {lessonMark(entry)}
                  </div>
                  <div className={isComplete ? "mt-3 text-sm font-black text-white" : "mt-3 text-sm font-black text-[#3A281E]"}>
                    Leccion {entry.n}
                  </div>
                  <div className={isComplete ? "text-xs font-bold text-white/88" : "text-xs font-bold text-[#3A281E]/62"}>
                    <TileStateLabel status={status} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cartilla-student-card mt-6 rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-xl backdrop-blur">
          <h2 className="text-lg font-black">Linea de tiempo</h2>
          <svg viewBox="0 0 280 64" role="img" aria-label="Sesiones de practica en los ultimos 14 dias" className="mt-3 h-16 w-full">
            <path d="M0 56 H280" stroke="#ead7bf" strokeWidth="4" strokeLinecap="round" />
            <polyline points={points} fill="none" stroke={SPARKLINE_COLOR} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {counts.map((item, index) => {
              const x = Math.round((index / Math.max(1, counts.length - 1)) * 280);
              const max = Math.max(1, ...counts.map((count) => count.count));
              const y = Math.round(56 - (item.count / max) * 48);
              return <circle key={item.day} cx={x} cy={y} r="3" fill={SPARKLINE_COLOR} />;
            })}
          </svg>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatTile label="Lecciones completadas" value={`${completedCount}/${TOTAL_LESSONS}`} />
          <StatTile label="Sesiones esta semana" value={String(sessionsThisWeek)} />
          <StatTile label="Racha actual" value={`${streak} dias`} />
        </section>

        <section className="cartilla-student-card mt-6 rounded-[2rem] border border-rose-200 bg-white/86 p-5 shadow-xl backdrop-blur">
          <h2 className="text-lg font-black text-rose-800">Restablecer progreso</h2>
          <p className="mt-1 text-sm font-bold text-[#3A281E]/68">
            Esta accion borra el historial local de practica y las estadisticas de este navegador.
          </p>
          <button
            type="button"
            aria-label="Restablecer progreso"
            onClick={clearProgress}
            className="cartilla-focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-rose-700 px-5 py-3 text-sm font-black text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer progreso
          </button>
        </section>
      </div>
      <AccessibilityPanel />
      <AudioControls />
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="cartilla-student-card rounded-[1.5rem] border border-white/70 bg-white/86 p-5 shadow-xl backdrop-blur">
      <div className="text-3xl font-black text-amber-800">{value}</div>
      <div className="mt-1 text-sm font-bold text-[#3A281E]/65">{label}</div>
    </div>
  );
}
