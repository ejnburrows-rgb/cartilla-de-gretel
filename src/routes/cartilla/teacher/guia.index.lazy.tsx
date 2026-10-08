import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Rows3, Home, ClipboardCheck, Music, UserPlus } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getTeacherFolderData } from "@/content/teacher-folder-data";
import { AssignActivityModal } from "@/components/teacher/AssignActivityModal";
import type { FolderKey } from "@/lib/folder-assignments.functions";

export const Route = createLazyFileRoute("/cartilla/teacher/guia/")({
  component: TeacherGuiaFolders,
});

interface FolderDef {
  key: FolderKey;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const FOLDERS: FolderDef[] = [
  {
    key: "guia",
    label: "Guía del profesor",
    description: "Objetivos, motivación y guion de cada lección, palabra por palabra.",
    color: "#4f46e5",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    key: "tablas",
    label: "Tablas silábicas y de vocales",
    description: "Las sílabas o la vocal que enseña cada lección.",
    color: "#059669",
    icon: <Rows3 className="w-6 h-6" />,
  },
  {
    key: "tareas",
    label: "Tareas para el hogar",
    description: "Práctica de refuerzo y la rima para practicar en casa.",
    color: "#d97706",
    icon: <Home className="w-6 h-6" />,
  },
  {
    key: "evaluaciones",
    label: "Evaluaciones",
    description: "La página de evaluación de cada lección.",
    color: "#9333ea",
    icon: <ClipboardCheck className="w-6 h-6" />,
  },
  {
    key: "poemas",
    label: "Poemas",
    description: "El poema de cada lección para leer en clase.",
    color: "#e11d48",
    icon: <Music className="w-6 h-6" />,
  },
];

function TeacherGuiaFolders() {
  const { folder: folderFromUrl } = Route.useSearch();
  const [openFolder, setOpenFolder] = useState<FolderKey | null>(folderFromUrl ?? null);
  const [assigning, setAssigning] = useState<{
    folderKey: FolderKey;
    lessonId: string;
    label: string;
  } | null>(null);

  const folder = FOLDERS.find((f) => f.key === openFolder);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="teacher-chrome__title text-2xl font-black">Guía del profesor</h1>
        <p className="text-[var(--tc-ink-soft)] font-medium">
          Todo el material del maestro, organizado en 5 carpetas. Toca una carpeta para ver las 24
          lecciones.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FOLDERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setOpenFolder(f.key)}
            className="text-left rounded-3xl p-6 border-2 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
            style={{ borderColor: f.color + "40", background: f.color + "0d" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md"
              style={{ background: f.color }}
            >
              {f.icon}
            </div>
            <h2 className="font-black text-lg text-[var(--tc-ink)]">{f.label}</h2>
            <p className="text-sm font-medium text-[var(--tc-ink-soft)] mt-1">{f.description}</p>
          </button>
        ))}
      </div>

      {folder && (
        <div className="teacher-chrome__card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl text-[var(--tc-ink)] flex items-center gap-2">
              <span style={{ color: folder.color }}>{folder.icon}</span> {folder.label}
            </h2>
            <button
              onClick={() => setOpenFolder(null)}
              className="text-sm font-bold text-[var(--tc-ink-faint)] hover:text-[var(--tc-ink)]"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-2">
            {CATALOG.map((entry) => (
              <FolderLessonRow
                key={entry.n}
                entry={entry}
                folderKey={folder.key}
                accent={folder.color}
                onAssign={(label) =>
                  setAssigning({ folderKey: folder.key, lessonId: String(entry.n), label })
                }
              />
            ))}
          </div>
        </div>
      )}

      {assigning && (
        <AssignActivityModal
          folderKey={assigning.folderKey}
          lessonId={assigning.lessonId}
          activityLabel={assigning.label}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  );
}

function FolderLessonRow({
  entry,
  folderKey,
  accent,
  onAssign,
}: {
  entry: (typeof CATALOG)[number];
  folderKey: FolderKey;
  accent: string;
  onAssign: (activityLabel: string) => void;
}) {
  const data = getTeacherFolderData(entry.n);

  let content: React.ReactNode;
  let activityLabel = `${entry.title} — ${entry.n}`;

  if (folderKey === "guia") {
    content = (
      <Link
        to="/cartilla/teacher/guia/$n"
        params={{ n: String(entry.n) }}
        className="underline decoration-dotted"
      >
        Ver guion completo de la lección
      </Link>
    );
    activityLabel = `Guía del profesor — Lección ${entry.n} (${entry.title})`;
  } else if (folderKey === "tablas") {
    const syllables =
      entry.kind === "consonant"
        ? entry.data.syllables.join(" · ")
        : entry.kind === "vowel"
          ? `Vocal ${entry.vowel.toUpperCase()}`
          : "a · e · i · o · u";
    content = <span className="font-mono font-bold">{syllables}</span>;
    activityLabel = `Tabla silábica — Lección ${entry.n} (${syllables})`;
  } else if (folderKey === "tareas") {
    content = data.rhymeTitle ? (
      <span>Refuerzo de sílabas + practicar en casa la rima "{data.rhymeTitle}".</span>
    ) : (
      <span className="text-amber-600 font-bold">
        Material pendiente de la guía original.
      </span>
    );
    activityLabel = `Tarea para el hogar — Lección ${entry.n}`;
  } else if (folderKey === "evaluaciones") {
    content = data.evaluationPage ? (
      <Link to="/cartilla/teacher/paginas/$n" params={{ n: String(entry.n) }} className="underline decoration-dotted">Abrir actividades · evaluación, página {data.evaluationPage}.</Link>
    ) : (
      <span className="text-amber-600 font-bold">
        Referencia pendiente de la guía original.
      </span>
    );
    activityLabel = `Evaluación — Lección ${entry.n} (página ${data.evaluationPage ?? "?"})`;
  } else {
    content = data.rhymeTitle ? (
      <span>
        "{data.rhymeTitle}"{" "}
        <span className="text-[var(--tc-ink-faint)] font-medium">
          · audio: pendiente (no existe grabación aún)
        </span>
      </span>
    ) : (
      <span className="text-amber-600 font-bold">
        Poema pendiente de la guía original.
      </span>
    );
    activityLabel = `Poema — Lección ${entry.n} (${data.rhymeTitle ?? "sin título"})`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--tc-border)] px-4 py-3 hover:bg-white/60">
      <span
        className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{ background: accent }}
      >
        {entry.n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-[var(--tc-ink)]">{entry.title}</p>
        <p className="text-sm text-[var(--tc-ink-soft)]">{content}</p>
      </div>
      <button
        onClick={() => onAssign(activityLabel)}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-black text-white shadow-sm hover:-translate-y-0.5 transition-all"
        style={{ background: accent }}
      >
        <UserPlus className="w-3.5 h-3.5" /> Asignar
      </button>
    </div>
  );
}
