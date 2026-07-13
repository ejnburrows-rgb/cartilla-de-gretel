// /cartilla/teacher/guia — the 5 color-coded teacher folders. Each folder
// holds the lesson's REAL activities from the repo (nothing invented): the
// verbatim per-lesson guide script (Folder 1, reuses the existing
// /cartilla/teacher/guia/$n view), the real syllable/vowel tables (Folder
// 2, from consonants.json/lesson-catalog.ts), the real take-home
// reinforcement + rhyme practice (Folder 3), the real evaluation page
// reference (Folder 4), and the real poem title (Folder 5) — all sourced
// from src/content/teacher-folder-data.ts, itself extracted verbatim from
// docs/Transcripción Integral... Guía del profesor.txt. Lessons 17-24 have
// no teacher's guide source anywhere in the repo (confirmed by an
// exhaustive all-branches search) — shown honestly as pending, never
// invented.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BookOpen, Rows3, Home, ClipboardCheck, Music, UserPlus } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { getTeacherFolderData } from "@/content/teacher-folder-data";
import { AssignActivityModal } from "@/components/teacher/AssignActivityModal";
import type { FolderKey } from "@/lib/folder-assignments.functions";

const FOLDER_KEYS = ["guia", "tablas", "tareas", "evaluaciones", "poemas"] as const;

// Optional ?folder= so other pages (teacher home) can deep-link straight
// into one of the 5 folders instead of landing on the picker every time.
export const Route = createFileRoute("/cartilla/teacher/guia/")({
  validateSearch: z.object({ folder: z.enum(FOLDER_KEYS).optional() }),
  component: TeacherGuiaFolders,
  head: () => ({ meta: [{ title: "Guía del profesor — La Cartilla de Gretel" }] }),
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
    label: "Poemas y audio",
    description: "El poema de cada lección para leer en clase.",
    color: "#e11d48",
    icon: <Music className="w-6 h-6" />,
  },
];

function TeacherGuiaFolders() {
  const { folder: folderFromUrl } = Route.useSearch();
  const [openFolder, setOpenFolder] = useState<FolderKey | null>(folderFromUrl ?? null);
  const [assigning, setAssigning] = useState<{ folderKey: FolderKey; lessonId: string; label: string } | null>(null);

  const folder = FOLDERS.find((f) => f.key === openFolder);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-black text-stone-800">Guía del profesor</h1>
        <p className="text-stone-500 font-medium">
          Todo el material del maestro, organizado en 5 carpetas. Toca una carpeta para ver las 24 lecciones.
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
            <h2 className="font-black text-lg text-stone-800">{f.label}</h2>
            <p className="text-sm font-medium text-stone-500 mt-1">{f.description}</p>
          </button>
        ))}
      </div>

      {folder && (
        <div className="rounded-3xl border-2 p-6" style={{ borderColor: folder.color + "40" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl text-stone-800 flex items-center gap-2">
              <span style={{ color: folder.color }}>{folder.icon}</span> {folder.label}
            </h2>
            <button onClick={() => setOpenFolder(null)} className="text-sm font-bold text-stone-400 hover:text-stone-700">
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
                onAssign={(label) => setAssigning({ folderKey: folder.key, lessonId: String(entry.n), label })}
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
      <Link to="/cartilla/teacher/guia/$n" params={{ n: String(entry.n) }} className="underline decoration-dotted">
        Ver guion completo de la lección
      </Link>
    );
    activityLabel = `Guía del profesor — Lección ${entry.n} (${entry.title})`;
  } else if (folderKey === "tablas") {
    const syllables = entry.kind === "consonant" ? entry.data.syllables.join(" · ") : entry.kind === "vowel" ? `Vocal ${entry.vowel.toUpperCase()}` : "a · e · i · o · u";
    content = <span className="font-mono font-bold">{syllables}</span>;
    activityLabel = `Tabla silábica — Lección ${entry.n} (${syllables})`;
  } else if (folderKey === "tareas") {
    content = data.rhymeTitle ? (
      <span>Refuerzo de sílabas + practicar en casa la rima "{data.rhymeTitle}".</span>
    ) : (
      <span className="text-amber-600 font-bold">AWAITING-SOURCE-SCAN — tarea aún no transcrita.</span>
    );
    activityLabel = `Tarea para el hogar — Lección ${entry.n}`;
  } else if (folderKey === "evaluaciones") {
    content = data.evaluationPage ? (
      <span>Evaluación, página {data.evaluationPage}.</span>
    ) : (
      <span className="text-amber-600 font-bold">AWAITING-SOURCE-SCAN — evaluación aún no transcrita.</span>
    );
    activityLabel = `Evaluación — Lección ${entry.n} (página ${data.evaluationPage ?? "?"})`;
  } else {
    content = data.rhymeTitle ? (
      <span>
        "{data.rhymeTitle}" <span className="text-stone-400 font-medium">· audio: pendiente (no existe grabación aún)</span>
      </span>
    ) : (
      <span className="text-amber-600 font-bold">AWAITING-SOURCE-SCAN — poema aún no transcrito.</span>
    );
    activityLabel = `Poema — Lección ${entry.n} (${data.rhymeTitle ?? "sin título"})`;
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-100 px-4 py-3 hover:bg-stone-50">
      <span
        className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{ background: accent }}
      >
        {entry.n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-stone-800">{entry.title}</p>
        <p className="text-sm text-stone-600">{content}</p>
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
