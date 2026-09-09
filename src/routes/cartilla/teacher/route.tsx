import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  redirect,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  MonitorPlay,
  BookOpen,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import {
  isSeedSessionActive,
  signOutSeedTeacher,
  startTeacherReview,
} from "@/lib/seed-data";
import { useIsAdmin } from "@/lib/admin-overview.functions";
import "@/styles/teacher-chrome.css";

// Public access opens an isolated local classroom. Cloud reads still require
// their own authenticated teacher session in the service layer.
export const Route = createFileRoute("/cartilla/teacher")({
  beforeLoad: async () => {
    if (import.meta.env.VITE_CRM_REVIEW === "true") {
      startTeacherReview();
      return;
    }
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
  if (isSeedSessionActive()) signOutSeedTeacher();
  else await supabase.auth.signOut();
  window.location.assign("/entrar");
}

// The teacher lane's real "task menu" — every nav item here maps to an
// actual, working destination. Kept as one list so the desktop bar and the
// mobile drawer below always stay in sync (previously "Present" pointed at
// the student lesson list and "Progress" at a disconnected legacy page —
// both silent dead-ends a teacher had no way to know were wrong).
const NAV_ITEMS: Array<{
  to: string;
  icon: React.ReactNode;
  label: string;
  match: string;
}> = [
  {
    to: "/cartilla/teacher/crm",
    icon: <GraduationCap className="w-4 h-4" />,
    label: "Clase",
    match: "/crm",
  },
  {
    to: "/cartilla/teacher/roster",
    icon: <Users className="w-4 h-4" />,
    label: "Alumnos",
    match: "/roster",
  },
  {
    to: "/cartilla/teacher/guia",
    icon: <BookOpen className="w-4 h-4" />,
    label: "Guía",
    match: "/guia",
  },
  {
    to: "/cartilla/presentar/1",
    icon: <MonitorPlay className="w-4 h-4" />,
    label: "Presentar",
    match: "/presentar",
  },
  {
    to: "/cartilla/imprimir/all",
    icon: <Printer className="w-4 h-4" />,
    label: "Imprimir",
    match: "/imprimir",
  },
  {
    to: "/cartilla/teacher/reportes",
    icon: <FileSpreadsheet className="w-4 h-4" />,
    label: "Reportes",
    match: "/reportes",
  },
  {
    to: "/cartilla/teacher/ayuda",
    icon: <HelpCircle className="w-4 h-4" />,
    label: "Ayuda",
    match: "/ayuda",
  },
];

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
          match: "/admin",
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
      {isSeedSessionActive() && (
        <div
          role="status"
          className="bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950"
        >
          Acceso abierto · Clase de ejemplo. Los cambios se guardan solo en este
          navegador.
        </div>
      )}
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
                active={location.pathname.includes(item.match)}
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
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
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
                  location.pathname.includes(item.match)
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
