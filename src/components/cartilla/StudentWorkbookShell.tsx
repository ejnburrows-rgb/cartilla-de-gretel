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
    <div className="student-workbook-shell min-h-screen" style={style}>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[#3A281E]">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-black shadow-sm backdrop-blur hover:bg-white"
          >
            <BookOpen className="h-4 w-4" /> Cuaderno
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/cartilla/teacher"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/55 bg-white/55 px-3 py-2 text-xs font-black shadow-sm backdrop-blur hover:bg-white/80"
            >
              <GraduationCap className="h-3.5 w-3.5" /> CRM docente
            </Link>
            <Link
              to="/cartilla/lecciones"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/55 bg-white/55 px-3 py-2 text-xs font-black shadow-sm backdrop-blur hover:bg-white/80"
            >
              <Presentation className="h-3.5 w-3.5" /> Flipchart
            </Link>
          </div>
        </div>

        <article className="relative flex-1 overflow-hidden rounded-[2.25rem] border border-white/65 bg-white/46 px-4 py-5 shadow-[0_28px_90px_rgba(105,69,33,0.18),0_8px_22px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-8 sm:py-8">
          <header className="relative border-b border-white/60 pb-4">
            <div className="flex flex-wrap items-center gap-2 pr-24">
              <span className="rounded-full bg-[var(--cartilla-accent)] px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm">
                Lección {lessonNumber}
              </span>
              <span className="rounded-full border border-white/65 bg-white/78 px-3 py-1 text-xs font-black text-[var(--cartilla-title-ink)]">
                Páginas {pages}
              </span>
              <span className="rounded-full border border-white/65 bg-[#fffaf0]/86 px-3 py-1 text-xs font-black text-foreground/60">
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
                  <span
                    key={page}
                    className="grid h-9 min-w-9 place-items-center rounded-lg border border-white/65 bg-white/85 px-2 text-sm font-black text-[var(--cartilla-title-ink)] shadow-sm"
                  >
                    {page}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="relative pb-24 pt-5 sm:pb-28">
            {children}
            <VerifiedWorkbookPages pages={workbookPages} />
          </div>
        </article>
      </div>
    </div>
  );
}
