import { createFileRoute, Outlet, Link, useLocation, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Users, GraduationCap, FileSpreadsheet, MonitorPlay, BookOpen, LogOut, HelpCircle, Menu, X } from "lucide-react";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";

// Every /cartilla/teacher/* page nests under this route via <Outlet/>, so
// this is the single real gate for the whole teacher lane. Previously this
// only kicked out logged-in students — it never actually checked for a real
// teacher session, so the nav shell (and public curriculum content like the
// Guía folders) rendered for anyone, logged in or not. Real student/class
// data was still protected separately (every teacher.functions.ts call
// requires a session), but the lane itself wasn't gated. Now it is — and it
// also requires the signed-in user to actually hold the teacher or admin
// role (has_role RPC), not just any authenticated Supabase session. Every
// self-signup already gets 'teacher' automatically (see the
// handle_new_user trigger), so this only ever blocks an account with no
// role at all, which should never legitimately reach this lane.
export const Route = createFileRoute("/cartilla/teacher")({
  beforeLoad: async () => {
    // The local demo/seed lane is its own self-contained auth (see
    // seed-data.ts) and is env-gated to never activate in a production
    // build (VITE_ALLOW_DEMO_MODE) — when active, skip the real Supabase
    // session/role check entirely rather than bouncing a demo teacher to
    // /login for a session that was never meant to exist.
    if (isSeedSessionActive()) return;
    const studentSession = getStudentSession();
    if (studentSession) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const hasRole = await hasTeacherOrAdminRole(data.session.user.id);
    if (!hasRole) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("cartilla.auth.unauthorized", "1");
        }
      } catch {
        /* storage unavailable in some test runners — still redirect */
      }
      throw redirect({ to: "/login" });
    }
  },
  component: TeacherLayout,
});

async function signOut() {
  await supabase.auth.signOut();
  window.location.assign("/login");
}

// The teacher lane's real "task menu" — every nav item here maps to an
// actual, working destination. Kept as one list so the desktop bar and the
// mobile drawer below always stay in sync (previously "Present" pointed at
// the student lesson list and "Progress" at a disconnected legacy page —
// both silent dead-ends a teacher had no way to know were wrong).
const NAV_ITEMS: Array<{ to: string; icon: React.ReactNode; label: string; match: string }> = [
  { to: "/cartilla/teacher/crm", icon: <GraduationCap className="w-4 h-4" />, label: "Clase", match: "/crm" },
  { to: "/cartilla/teacher/roster", icon: <Users className="w-4 h-4" />, label: "Alumnos", match: "/roster" },
  { to: "/cartilla/teacher/guia", icon: <BookOpen className="w-4 h-4" />, label: "Guía", match: "/guia" },
  { to: "/cartilla/presentar/1", icon: <MonitorPlay className="w-4 h-4" />, label: "Presentar", match: "/presentar" },
  { to: "/cartilla/teacher/reportes", icon: <FileSpreadsheet className="w-4 h-4" />, label: "Reportes", match: "/reportes" },
  { to: "/cartilla/teacher/ayuda", icon: <HelpCircle className="w-4 h-4" />, label: "Ayuda", match: "/ayuda" },
];

function TeacherLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we are in presentation mode, don't show the nav.
  if (location.pathname.includes("/proyectar")) {
    return (
      <div className="cartilla-crm-theme">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 cartilla-crm-theme flex flex-col font-sans relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[hsl(197,41%,90%)]/50 to-transparent pointer-events-none -z-10" />

      <header className="bg-white/70 backdrop-blur-xl border-b border-stone-200/50 sticky top-0 z-30 shadow-sm no-print transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-vowel-a to-vowel-o flex items-center justify-center text-white font-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(249,115,22,0.3)] ring-1 ring-white/50">
              G
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-stone-800 leading-tight truncate">
                La Cartilla de Gretel
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 leading-tight">
                Panel del Docente
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname.includes(item.match)}
              />
            ))}
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 py-5 border-b-2 border-transparent hover:border-stone-300 transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </nav>

          <button
            type="button"
            className="md:hidden min-h-11 min-w-11 flex items-center justify-center rounded-xl border border-stone-200 text-stone-600"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-stone-200/70 bg-white/95 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 min-h-12 px-3 rounded-xl text-sm font-bold ${
                  location.pathname.includes(item.match)
                    ? "bg-stone-800 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full flex items-center gap-3 min-h-12 px-3 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-100"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  // We use standard anchor props since some routes might not exist yet,
  // but Link is safer if they do. For placeholder routes, it might error if route doesn't exist,
  // so we'll just use a normal a tag for now if it's missing, or Link if we will create them.
  // Actually TanStack Router is strict, so if a route doesn't exist, <Link to="..."> will typescript error.
  // We can bypass TS by using @ts-ignore or we can create the dummy routes.
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-sm font-bold transition-all duration-200 py-5 border-b-2 ${
        active
          ? "border-vowel-a text-stone-900"
          : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
