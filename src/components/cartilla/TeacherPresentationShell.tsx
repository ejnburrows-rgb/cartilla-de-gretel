import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, Home, MonitorPlay } from "lucide-react";
import { getCartillaCrmCssVars } from "@/lib/cartilla-crm-theme";

type TeacherPresentationShellProps = {
  lessonNumber?: number;
  title: string;
  subtitle?: string;
  pages?: string;
  children: ReactNode;
};

export function TeacherPresentationShell({
  lessonNumber = 1,
  title,
  subtitle,
  pages,
  children,
}: TeacherPresentationShellProps) {
  return (
    <section
      className="cartilla-presentation-frame cartilla-theme-transition min-h-screen px-4 py-6 text-white sm:px-6"
      style={getCartillaCrmCssVars(lessonNumber)}
    >
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl border border-white/16 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                <MonitorPlay className="h-4 w-4" /> Vista docente
              </span>
              {pages && (
                <span className="rounded-full bg-[var(--cartilla-accent)] px-4 py-2 text-xs font-bold text-white">
                  Paginas {pages}
                </span>
              )}
              {lessonNumber && (
                <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold">
                  Leccion {lessonNumber}
                </span>
              )}
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link
                to="/cartilla/teacher"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white hover:bg-white/20"
                aria-label="Volver al CRM docente"
              >
                <Home className="h-4 w-4" />
              </Link>
              <Link
                to="/cartilla/teacher/reportes"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white hover:bg-white/20"
                aria-label="Abrir reportes docentes"
              >
                <BarChart3 className="h-4 w-4" />
              </Link>
            </nav>
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-lg font-semibold text-white/76">{subtitle}</p>}
        </header>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}
