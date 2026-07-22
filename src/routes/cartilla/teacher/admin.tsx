import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { ShieldCheck, Users, GraduationCap, AlertCircle, Clock, BookOpen } from "lucide-react";
import { getSeedAdminOverview, isSeedAdmin, isSeedSessionActive } from "@/lib/seed-data";

// D7 — admin cross-teacher dashboard (demo lane).
// Nests under /cartilla/teacher so the teacher-lane gate already ran; this
// beforeLoad only adds the admin check on top. Demo lane only for now: the
// live path (real 'admin' role + cross-teacher queries under RLS) is wired
// after D2's Supabase go-live, per docs/AGENT-LOOP.md.
export const Route = createFileRoute("/cartilla/teacher/admin")({
  beforeLoad: () => {
    if (isSeedSessionActive() && !isSeedAdmin()) {
      throw redirect({ to: "/cartilla/teacher/crm" });
    }
    if (!isSeedSessionActive()) {
      // Live sessions have no admin surface yet (pre-D2) — keep teachers on
      // their own CRM instead of showing an empty page.
      throw redirect({ to: "/cartilla/teacher/crm" });
    }
  },
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Dirección — La Cartilla de Gretel" }],
  }),
});

function pct(v: number | null): string {
  return v !== null ? `${Math.round(v * 100)}%` : "—";
}

function AdminDashboard() {
  const overview = useMemo(() => getSeedAdminOverview(), []);
  const { totals, teachers } = overview;

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[var(--tc-ink)]">Panel de Dirección</h1>
          <p className="text-xs font-bold text-[var(--tc-ink-faint)] uppercase tracking-widest">
            Vista global de todos los maestros (modo demo)
          </p>
        </div>
      </div>

      {/* Global totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile
          icon={<GraduationCap className="w-5 h-5" />}
          label="Maestros"
          value={String(totals.teacherCount)}
        />
        <StatTile
          icon={<BookOpen className="w-5 h-5" />}
          label="Clases"
          value={String(totals.classCount)}
        />
        <StatTile
          icon={<Users className="w-5 h-5" />}
          label="Alumnos"
          value={String(totals.studentCount)}
        />
        <StatTile
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Precisión global"
          value={pct(totals.accuracy)}
        />
        <StatTile
          icon={<AlertCircle className="w-5 h-5" />}
          label="Necesitan atención"
          value={String(totals.attentionCount)}
          warn={totals.attentionCount > 0}
        />
      </div>

      {/* Per-teacher sections */}
      {teachers.map((t) => (
        <section
          key={t.teacherId}
          className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/60">
            <div>
              <h2 className="text-lg font-black text-stone-800">{t.teacherName}</h2>
              <p className="text-xs font-bold text-stone-500">
                {t.classes.length} clase{t.classes.length === 1 ? "" : "s"} · {t.studentCount}{" "}
                alumno{t.studentCount === 1 ? "" : "s"} · precisión media {pct(t.accuracy)}
              </p>
            </div>
            {t.attentionCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.attentionCount} alumno{t.attentionCount === 1 ? "" : "s"} necesita
                {t.attentionCount === 1 ? "" : "n"} atención
              </span>
            )}
          </div>

          {t.classes.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm font-bold text-stone-400">
              Este maestro todavía no tiene clases.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3 pl-6">Clase</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Alumnos</th>
                    <th className="p-3">Lecciones completadas</th>
                    <th className="p-3">Precisión</th>
                    <th className="p-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Tiempo total
                      </span>
                    </th>
                    <th className="p-3 pr-6">Atención</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {t.classes.map((c) => (
                    <tr key={c.classId} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 pl-6 font-bold text-stone-800">{c.className}</td>
                      <td className="p-3 font-mono text-xs text-stone-600">{c.joinCode}</td>
                      <td className="p-3">{c.studentCount}</td>
                      <td className="p-3">{c.lessonsCompleted}</td>
                      <td className="p-3 font-bold">{pct(c.accuracy)}</td>
                      <td className="p-3">{c.totalMinutes} min</td>
                      <td className="p-3 pr-6">
                        {c.attentionCount > 0 ? (
                          <span className="font-black text-amber-700">{c.attentionCount}</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <p className="text-xs font-bold text-stone-400 text-center">
        Vista de demostración con datos locales. La conexión a datos reales llega con la puesta en
        marcha del servidor (D2).{" "}
        <Link to="/cartilla/teacher/crm" className="underline hover:text-stone-600">
          Volver a mi clase
        </Link>
      </p>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  warn = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-2 ${
        warn
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-white border-stone-200 text-stone-700"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-70">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}
