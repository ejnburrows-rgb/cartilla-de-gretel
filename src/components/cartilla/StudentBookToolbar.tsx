import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Home, Printer, Rows3, Sparkles } from "lucide-react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import type { CartillaCrmTheme } from "@/lib/cartilla-crm-theme";

type StudentBookToolbarProps = {
  entry: CatalogEntry;
  theme: CartillaCrmTheme;
  lessonIndex: number;
  totalLessons: number;
  pageIndex: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onLessonChange: (lessonNumber: number) => void;
  lessons: CatalogEntry[];
};

function buttonStyle(theme: CartillaCrmTheme, primary = false): CSSProperties {
  return primary
    ? { backgroundColor: theme.accent, color: "white", borderColor: theme.accent }
    : { backgroundColor: "rgba(255,255,255,0.78)", color: theme.titleInk, borderColor: theme.border };
}

export function StudentBookToolbar({
  entry,
  theme,
  lessonIndex,
  totalLessons,
  pageIndex,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onLessonChange,
  lessons,
}: StudentBookToolbarProps) {
  const title = entry.subtitle ? `${entry.title} · ${entry.subtitle}` : entry.title;

  return (
    <header className="student-book-toolbar" style={{ borderColor: theme.border }}>
      <div className="student-book-toolbar__top">
        <Link to="/cartilla" className="student-book-icon-button" style={buttonStyle(theme)} aria-label="Volver a Cartilla">
          <Home className="h-4 w-4" />
        </Link>

        <div className="student-book-toolbar__title">
          <span className="student-book-toolbar__eyebrow" style={{ color: theme.accentDark }}>
            <BookOpen className="h-4 w-4" /> Libro del estudiante
          </span>
          <h1 style={{ color: theme.titleInk }}>{title}</h1>
        </div>

        <a href="/cartilla/imprimir/all" className="student-book-icon-button" style={buttonStyle(theme)} aria-label="Imprimir libro completo">
          <Printer className="h-4 w-4" />
        </a>
      </div>

      <div className="student-book-toolbar__controls">
        <button type="button" onClick={onPrev} disabled={!canPrev} className="student-book-nav-button" style={buttonStyle(theme)}>
          <ChevronLeft className="h-5 w-5" />
          <span>Anterior</span>
        </button>

        <div className="student-book-toolbar__status" style={{ borderColor: theme.border }}>
          <Sparkles className="h-4 w-4" style={{ color: theme.accent }} />
          <span>Leccion {lessonIndex + 1} de {totalLessons}</span>
          <span className="student-book-toolbar__dot" />
          <span>Pagina {Math.min(pageIndex + 1, Math.max(totalPages, 1))} de {Math.max(totalPages, 1)}</span>
        </div>

        <label className="student-book-toolbar__selectWrap" style={{ borderColor: theme.border }}>
          <Rows3 className="h-4 w-4" style={{ color: theme.accentDark }} />
          <select value={entry.n} onChange={(event) => onLessonChange(Number(event.target.value))} aria-label="Cambiar leccion">
            {lessons.map((lesson) => (
              <option key={lesson.n} value={lesson.n}>
                Leccion {lesson.n}: {lesson.title}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={onNext} disabled={!canNext} className="student-book-nav-button" style={buttonStyle(theme, true)}>
          <span>Siguiente</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
