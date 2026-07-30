import { createFileRoute, Outlet, Link, useLocation, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  FileSpreadsheet,
  BookOpen,
  Home,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import { useIsAdmin } from "@/lib/admin-overview.functions";
import { setTeacherAccessNotice } from "@/lib/teacher-access-state";
import { TeacherAccessNotice } from "@/components/teacher/TeacherAccessNotice";
import "@/styles/teacher-chrome.css";

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

    let session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch {
      // Never treat a failed check as "allowed" — fail closed and let the
      // teacher retry instead of silently blocking the whole lane.
      setTeacherAccessNotice("retry");
      throw redirect({ to: "/login" });
    }
    if (!session) {
      throw redirect({ to: "/login" });
    }

    let hasRole: boolean;
    try {
      hasRole = await hasTeacherOrAdminRole(session.user.id);
    } catch {
      setTeacherAccessNotice("retry");
      throw redirect({ to: "/login" });
    }
    if (!hasRole) {
      // No source of a real "approval request" record exists yet (see
      // docs/DECISIONS.md), so a signed-in account with no role is reported
      // as unauthorized rather than guessing it's "pending" — that only
      // shows up today via the pre-login invitation-link banner on /login.
      setTeacherAccessNotice("unauthorized");
      throw redirect({ to: "/login" });
    }
  },
  pendingComponent: () => <TeacherAccessNotice state="loading" />,
  component: TeacherLayout,
});

async function signOut() {
  await supabase.auth.signOut();
  window.location.assign("/login");
}

// The teacher lane's real, top-level task menu — four buckets, each landing
// on an actual, working destination. Nested tasks (Alumnos, Presentar,
// Imprimir, Ayuda) moved off the fixed bar onto the Inicio hub's own entry
// points (see teacher/index.tsx) rather than disappearing — a fixed bar
// crowded with 7+ items didn't fit a tablet in a real classroom, but every
// page it pointed at still needs one click of reach from somewhere.
type NavItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
  /** Path substrings that count as "on this section". Ignored when exact is set. */
  matches: string[];
  /** Active only on an exact pathname match — for Inicio, whose own path is a
   * prefix of every other section's path. */
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/cartilla/teacher",
    icon: <Home className="w-4 h-4" />,
    label: "Inicio",
    matches: [],
    exact: true,
  },
  {
    to: "/cartilla/teacher/crm",
    icon: <GraduationCap className="w-4 h-4" />,
    label: "Clases",
    matches: ["/crm", "/roster"],
  },
  {
    to: "/cartilla/teacher/guia",
    icon: <BookOpen className="w-4 h-4" />,
    label: "Contenido",
    matches: ["/guia", "/flipchart", "/presentar", "/imprimir", "/paginas"],
  },
  {
    to: "/cartilla/teacher/reportes",
    icon: <FileSpreadsheet className="w-4 h-4" />,
    label: "Informes",
    matches: ["/reportes"],
  },
];

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.to || pathname === `${item.to}/`;
  return item.matches.some((m) => pathname.includes(m));
}

function TeacherLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = useIsAdmin();

  // Admin-only entry (D7): the demo admin account, or a real account holding
  // the 'admin' role. useIsAdmin answers the demo lane synchronously and the
  // real lane once the role check returns.
  const navItems = isAdmin
    ? [
        ...NAV_ITEMS,
        {
          to: "/cartilla/teacher/admin",
          icon: <ShieldCheck className="w-4 h-4" />,
          label: "Dirección",
          matches: ["/admin"],
        },
      ]
    : NAV_ITEMS;

  // If we are in presentation mode, don't show the nav.
  if (location.pathname.includes("/proyectar")) {
    return (
      <div className="teacher-chrome">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="teacher-chrome min-h-screen flex flex-col relative overflow-hidden">
      <header className="teacher-chrome__header sticky top-0 z-30 no-print transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="teacher-chrome__brand-mark w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white font-black ring-1 ring-white/50">
              G
            </div>
            <div className="flex flex-col min-w-0">
              <span className="teacher-chrome__title text-sm font-black leading-tight truncate">
                La Cartilla de Gretel
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--tc-ink-faint)] leading-tight">
                Panel del Docente
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={isNavItemActive(location.pathname, item)}
              />
            ))}
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-2 text-sm font-bold text-[var(--tc-ink-soft)] hover:text-[var(--tc-ink)] py-5 border-b-2 border-transparent hover:border-[var(--tc-border)] transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </nav>

          <button
            type="button"
            className="md:hidden min-h-11 min-w-11 flex items-center justify-center rounded-xl border border-[var(--tc-border)] text-[var(--tc-ink-soft)]"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[var(--tc-border)] bg-[var(--tc-paper-soft)]/95 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 min-h-12 px-3 rounded-xl text-sm font-bold ${
                  isNavItemActive(location.pathname, item)
                    ? "bg-[var(--tc-ink)] text-white"
                    : "text-[var(--tc-ink-soft)] hover:bg-white/60"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full flex items-center gap-3 min-h-12 px-3 rounded-xl text-sm font-bold text-[var(--tc-ink-soft)] hover:bg-white/60"
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
      className={`teacher-chrome__nav-link flex items-center gap-2 text-sm font-bold transition-all duration-200 py-5 border-b-2 ${
        active ? "is-active" : ""
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
