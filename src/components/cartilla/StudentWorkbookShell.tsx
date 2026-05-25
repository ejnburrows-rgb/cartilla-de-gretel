import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { BookOpen, GraduationCap, Presentation } from "lucide-react";
import { getCartillaCrmCssVars, getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { VerifiedWorkbookPages } from "@/components/cartilla/VerifiedWorkbookPages";
import type { WorkbookPageContent } from "@/lib/book-faithful";

type StudentWorkbookShellProps = {
  lessonNumber: number;
  pages: string;
  title: string;
  subtitle?: string;
  accent?: string;
  workbookPages?: WorkbookPageContent[];
  children: ReactNode;
};

export function StudentWorkbookShell({
  lessonNumber,
  pages,
  title,
  subtitle,
  accent,
  workbookPages = [],
  children,
}: StudentWorkbookShellProps) {
  const pageNumbers = getLessonPageNumbers(pages);
  const cssVars = getCartillaCrmCssVars(lessonNumber);
  const style = accent ? ({ ...cssVars, "--cartilla-accent": accent } as CSSProperties) : cssVars;

  return (
    <div className="cartilla-crm-bg cartilla-theme-transition min-h-screen" style={style}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-white/90">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-black backdrop-blur hover:bg-white/18"
          >
            <BookOpen className="h-4 w-4" /> Cuaderno
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to="/cartilla/teacher" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur hover:bg-white/16">
              <GraduationCap className="h-3.5 w-3.5" /> CRM docente
            </Link>
            <Link to="/cartilla/teacher/flipchart" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs font-black backdrop-blur hover:bg-white/16">
              <Presentation className="h-3.5 w-3.5" /> Flipchart
            </Link>
          </div>
        </div>

        <article className="cartilla-book-paper cartilla-page-frame relative flex-1 overflow-hidden px-4 py-5 shadow-[0_28px_90px_rgba(24,18,10,0.28),0_8px_22px_rgba(0,0,0,0.10)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-10 bg-gradient-to-r from-black/10 via-black/3 to-transparent" />
          <div className="pointer-events-none absolute inset-y-8 left-8 w-px bg-[var(--cartilla-accent)]/15" />
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] bg-gradient-to-bl from-black/8 to-transparent" />

          <header className="relative border-b-2 border-[var(--cartilla-accent)]/20 pb-4 pl-3 sm:pl-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--cartilla-accent)] px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm">
                Lección {lessonNumber}
              </span>
              <span className="rounded-full border border-[var(--cartilla-accent)]/30 bg-white/78 px-3 py-1 text-xs font-black text-[var(--cartilla-title-ink)]">
                Páginas {pages}
              </span>
              <span className="rounded-full border border-foreground/10 bg-[#fffaf0] px-3 py-1 text-xs font-black text-foreground/55">
                Libro real + CRM
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[var(--cartilla-title-ink)] sm:text-5xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-base font-bold text-foreground/65">{subtitle}</p>}
            {pageNumbers.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Páginas del libro">
                {pageNumbers.map((page) => (
                  <span key={page} className="grid h-9 min-w-9 place-items-center rounded-lg border border-[var(--cartilla-accent)]/25 bg-white/85 px-2 text-sm font-black text-[var(--cartilla-title-ink)] shadow-sm">
                    {page}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="relative pb-24 pl-3 pt-5 sm:pb-28 sm:pl-5">
            {children}
            <VerifiedWorkbookPages pages={workbookPages} />
          </div>
        </article>
      </div>
    </div>
  );
}
