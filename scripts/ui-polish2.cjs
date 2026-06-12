const fs = require('fs');
const path = require('path');

const clasePath = path.join(process.cwd(), 'src/routes/_authenticated/cartilla.teacher.clase.$id.tsx');
let clase = fs.readFileSync(clasePath, 'utf8');

// Import teacher-guide
if (!clase.includes('import teacherGuide')) {
  clase = clase.replace('import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";', 'import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";\nimport teacherGuide from "@/data/teacher-guide.json";');
}

// 1. Loading Skeleton
const loadingOriginal = `  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </main>
    );
  }`;
const loadingSkeleton = `  if (isLoading) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 max-w-4xl mx-auto animate-pulse">
        <div className="w-24 h-4 bg-secondary rounded mb-6"></div>
        <div className="w-64 h-10 bg-secondary rounded mb-2"></div>
        <div className="w-96 h-6 bg-secondary rounded mb-6"></div>
        <div className="flex gap-2 mb-6">
          <div className="w-32 h-10 bg-secondary rounded-xl"></div>
        </div>
        <div className="w-full h-48 bg-secondary rounded-2xl mb-6"></div>
        <div className="w-full h-32 bg-secondary rounded-2xl"></div>
      </main>
    );
  }`;
clase = clase.replace(loadingOriginal, loadingSkeleton);

// 2. Empty State
const emptyOriginal = `{data.students.length === 0 ? (
          <div className="kid-card p-6 text-center text-foreground/60">
            Aún no hay alumnos. Agrega algunos arriba.
          </div>
        ) : (`;
const emptyState = `{data.students.length === 0 ? (
          <div className="kid-card p-12 text-center flex flex-col items-center justify-center text-foreground/60">
            <ClipboardList className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-bold mb-2 text-foreground">Aún no hay alumnos</p>
            <p className="text-sm max-w-sm mb-6">Agrega los nombres de tus alumnos en la sección de arriba para comenzar a registrar su progreso.</p>
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="print:hidden px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-sm">
              Agregar alumnos
            </button>
          </div>
        ) : (`;
clase = clase.replace(emptyOriginal, emptyState);

// 3 & 4. Sorting & Current Lesson Title & Date Format
clase = clase.replace('{data.students.map((s) => (', '{[...data.students].sort((a, b) => a.display_name.localeCompare(b.display_name)).map((s) => {\n              const curNum = Math.min(s.lessons + 1, 24);\n              const curTitle = teacherGuide.lessons.find((l: any) => l.id === curNum || l.lesson === curNum)?.title || \`L\${curNum}\`;\n              return (');
clase = clase.replace('</button>\\n              </div>\\n            ))}🍿', '</button>\n              </div>\n            );\n            })}\n          </div>');
// Wait, the replace string for the closing of the map in my last attempt was broken. Let's do it safely:
clase = clase.replace(
\`                </button>
              </div>
            ))}
          </div>\`,
\`                </button>
              </div>
            );
            })}
          </div>\`
);

// Replace {s.lessons}/{TOTAL_LESSONS} lecciones with Lección actual: {curTitle}
const lessonIndicatorOriginal = `<span className="inline-flex items-center gap-1">\\n                      <BookOpen className="w-3 h-3" /> {s.lessons}/{TOTAL_LESSONS} lecciones\\n                    </span>`;
const lessonIndicatorNew = `<span className="inline-flex items-center gap-1">\\n                      <BookOpen className="w-3 h-3" /> Lección actual: {curTitle}\\n                    </span>`;
// Safely replace:
clase = clase.replace(
\`                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {s.lessons}/{TOTAL_LESSONS} lecciones
                    </span>\`,
\`                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Lección actual: {curTitle}
                    </span>\`
);

// Fix date locale in clase
clase = clase.replace('new Date(s.lastSeen).toLocaleDateString()', "new Date(s.lastSeen).toLocaleDateString('es-MX', { dateStyle: 'long' })");

// 5. Imprimir lista button
clase = clase.replace(
\`        <button
          onClick={exportClassCSV}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>\`,
\`        <button
          onClick={exportClassCSV}
          className="print:hidden inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
        <button
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border-2 border-foreground/10 hover:bg-secondary font-bold"
        >
          <ClipboardList className="w-4 h-4" /> Imprimir lista
        </button>
      </div>\`
);

// Add print:hidden to <header> sections that shouldn't print, and the add forms
clase = clase.replace(
\`      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"\`,
\`      <Link
        to="/cartilla/teacher"
        className="print:hidden inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"\`
);

// Hide forms from print
clase = clase.replaceAll('<section className="mt-6 kid-card p-4">', '<section className="print:hidden mt-6 kid-card p-4">');

fs.writeFileSync(clasePath, clase);

// TASK 2
const alumnoPath = path.join(process.cwd(), 'src/routes/_authenticated/cartilla.teacher.alumno.$id.tsx');
let alumno = fs.readFileSync(alumnoPath, 'utf8');

// Imports
if (!alumno.includes('import teacherGuide')) {
  alumno = alumno.replace('import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";', 'import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";\\nimport teacherGuide from "@/data/teacher-guide.json";\\nimport { useState, useEffect } from "react";');
}

// Date format
alumno = alumno.replace('{new Date(e.created_at).toLocaleString()}', "{new Date(e.created_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}");

// Lesson progress title
alumno = alumno.replace(
\`            const ex = summary.exerciseStats[String(entry.n)];
            const pct = ex ? Math.round((ex.score / ex.total) * 100) : null;\`,
\`            const ex = summary.exerciseStats[String(entry.n)];
            const pct = ex ? Math.round((ex.score / ex.total) * 100) : null;
            const tgTitle = teacherGuide.lessons.find((l: any) => String(l.id) === String(entry.n) || String(l.lesson) === String(entry.n))?.title || entry.title;\`
);
alumno = alumno.replace('<div className="font-bold text-sm truncate">{entry.title}</div>', '<div className="font-bold text-sm truncate">{tgTitle}</div>');

// Notes textarea
const notesState = \`  const [notes, setNotes] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem(\\\`gretel-notes-\\\${id}\\\`);
    if (saved) setNotes(saved);
  }, [id]);

  const saveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(\\\`gretel-notes-\\\${id}\\\`, val);
  };\`;

alumno = alumno.replace(
\`  const { data, isLoading } = useQuery({\`,
\`\${notesState}

  const { data, isLoading } = useQuery({\`
);

const notesSection = \`      <section className="print:hidden mt-8 kid-card p-4">
        <label htmlFor="teacher-notes" className="block font-bold mb-3 text-lg">Notas del maestro</label>
        <textarea
          id="teacher-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => saveNotes(e.target.value)}
          placeholder="Escribe tus observaciones aquí…"
          className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-foreground/10 bg-background focus:border-primary outline-none text-sm"
        />
      </section>

      <section className="mt-8">\`;
alumno = alumno.replace('<section className="mt-8">', notesSection); // Replaces the first <section className="mt-8">

fs.writeFileSync(alumnoPath, alumno);
console.log('Update script completed successfully.');
