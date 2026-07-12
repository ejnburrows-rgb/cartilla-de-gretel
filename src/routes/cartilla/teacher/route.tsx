import { createFileRoute, Outlet, Link, useLocation, redirect } from "@tanstack/react-router";
import { Users, BarChart3, FileSpreadsheet, MonitorPlay, BookOpen, LogOut } from "lucide-react";
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
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cartilla.auth.unauthorized", "1");
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

function TeacherLayout() {
  const location = useLocation();

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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vowel-a to-vowel-o flex items-center justify-center text-white font-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(249,115,22,0.3)] ring-1 ring-white/50">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-stone-800 leading-tight">
                La Cartilla de Gretel
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 leading-tight">
                Teacher CRM
              </span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <NavLink
              to="/cartilla/teacher/roster"
              icon={<Users className="w-4 h-4" />}
              label="Roster"
              active={location.pathname.includes("/roster")}
            />
            {/* Progress can just be a placeholder pointing to reports or missing for now if not explicitly requested, but we will add the link */}
            <NavLink
              to="/cartilla/teacher/progreso"
              icon={<BarChart3 className="w-4 h-4" />}
              label="Progress"
              active={location.pathname.includes("/progreso")}
            />
            <NavLink
              to="/cartilla/teacher/reportes"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              label="Reports"
              active={location.pathname.includes("/reportes")}
            />
            <NavLink
              to="/cartilla/teacher/guia"
              icon={<BookOpen className="w-4 h-4" />}
              label="Guía"
              active={location.pathname.includes("/guia")}
            />
            <NavLink
              to="/cartilla/lecciones"
              icon={<MonitorPlay className="w-4 h-4" />}
              label="Present"
              active={false}
            />
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 py-5 border-b-2 border-transparent hover:border-stone-300 transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6">
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
