import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { BookOpen } from "lucide-react";
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
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-white/85">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/16"
          >
            <BookOpen className="h-4 w-4" /> Cuaderno
          </Link>
          <div className="rounded-full bg-white/14 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Cuaderno del estudiante
          </div>
        </div>

        <article className="cartilla-book-paper cartilla-page-frame flex-1 px-4 py-5 sm:px-7 sm:py-7">
          <header className="border-b-2 border-[var(--cartilla-accent)]/20 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--cartilla-accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Lección {lessonNumber}
              </span>
              <span className="rounded-full border border-[var(--cartilla-accent)]/30 bg-white/70 px-3 py-1 text-xs font-bold text-[var(--cartilla-title-ink)]">
                Páginas {pages}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--cartilla-title-ink)] sm:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-base font-semibold text-foreground/65">{subtitle}</p>
            )}
            {pageNumbers.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Páginas del libro">
                {pageNumbers.map((page) => (
                  <span
                    key={page}
                    className="grid h-9 min-w-9 place-items-center rounded-lg border border-[var(--cartilla-accent)]/25 bg-white/80 px-2 text-sm font-bold text-[var(--cartilla-title-ink)]"
                  >
                    {page}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div className="pb-24 pt-5 sm:pb-28">
            {children}
            <VerifiedWorkbookPages pages={workbookPages} />
          </div>
        </article>
      </div>
    </div>
  );
}
