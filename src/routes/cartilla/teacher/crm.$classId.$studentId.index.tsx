import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clipboard, FileText, Sparkles } from "lucide-react";
import { updateStudent } from "@/lib/teacher.functions";
import { isSeedSessionActive, listSeedAssignments, updateSeedStudent } from "@/lib/seed-data";
import { listAssignments } from "@/lib/assignments.functions";
import { fetchCrmStudentProgress } from "@/lib/crm-student-progress";
import { buildLessonTiles, summarizeStudentProgress } from "@/lib/progress-calculation";
import {
  buildStudentLearningInsight,
  SKILL_STATUS_RULES,
  type SkillStatus,
} from "@/lib/literacy-insights";
import { CrmBreadcrumbs } from "@/features/teacher-crm/components/CrmBreadcrumbs";
import { LessonTileGrid, LessonTileLegend } from "@/features/teacher-crm/components/LessonTileGrid";
import { AccountPanel } from "@/features/teacher-crm/components/AccountPanel";
import type { DashboardStudent } from "@/features/teacher-crm/components/PipelineBoard";

export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId/")({
  component: EstudianteDetail,
  head: () => ({ meta: [{ title: "Alumno — La Cartilla de Gretel CRM" }] }),
});

const STATUS_LABEL: Record<SkillStatus, string> = {
  introduced: "Introducida",
  practicing: "Practicando",
  mastered: "Dominada",
  needs_review: "Necesita repaso",
};

const STATUS_CLASS: Record<SkillStatus, string> = {
  introduced: "bg-stone-100 text-stone-600 border-stone-200",
  practicing: "bg-blue-50 text-blue-700 border-blue-200",
  mastered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needs_review: "bg-amber-50 text-amber-800 border-amber-200",
};

type PromptKind = "review" | "parent" | "extra";

function familyPracticeHref(lessonNumber: number, activity: string) {
  return `/cartilla/practica?family=1&lesson=${lessonNumber}&activity=${activity}`;
}

function EstudianteDetail() {
  const { classId, studentId } = Route.useParams();
  const qc = useQueryClient();
  const [promptKind, setPromptKind] = useState<PromptKind>("review");
  const [promptDraft, setPromptDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const isSeed = useMemo(() => isSeedSessionActive(), []);

  const { data: progress, isLoading: loadingProgress, refetch } = useQuery({
    queryKey: ["crm-estudiante", studentId, isSeed],
    queryFn: () => fetchCrmStudentProgress(studentId, isSeed),
  });

  const { data: assignments } = useQuery({
    queryKey: ["crm-estudiante-assignments", classId, isSeed],
    queryFn: () =>
      isSeed
        ? Promise.resolve(listSeedAssignments(classId))
        : listAssignments({ data: { classId } }),
  });

  const assignedLessonIds = useMemo(
    () => new Set((assignments ?? []).map((assignment) => assignment.lesson_id)),
    [assignments],
  );

  const summary = useMemo(
    () => (progress ? summarizeStudentProgress(progress.lessonProgress) : null),
    [progress],
  );

  const tiles = useMemo(
    () => (progress ? buildLessonTiles(progress.lessonProgress, assignedLessonIds) : []),
    [progress, assignedLessonIds],
  );

  const insight = useMemo(() => {
    if (!progress) return null;
    const completed = new Set(
      progress.lessonProgress
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id),
    );
    return buildStudentLearningInsight(progress.events, completed, assignments ?? []);
  }, [progress, assignments]);

  const dashboardStudent: DashboardStudent | null = useMemo(() => {
    if (!progress || !summary) return null;
    return {
      id: progress.student.id,
      name: progress.student.display_name,
      progress: summary.completionPercent,
      lastActive: summary.lastActiveAt ? new Date(summary.lastActiveAt).toLocaleDateString() : "Nunca",
      teacher_notes: progress.student.teacher_notes ?? undefined,
    };
  }, [progress, summary]);

  const generatedPrompt = useMemo(() => {
    if (!progress || !insight) return "";
    const mastered = insight.skills
      .filter((skill) => skill.status === "mastered")
      .map((skill) => `${skill.title} (${skill.detail})`)
      .join(", ") || "ninguna habilidad confirmada todavía";
    const practicing = insight.skills
      .filter((skill) => skill.status === "practicing" || skill.status === "needs_review")
      .map((skill) => `${skill.title} (${skill.detail}): ${skill.reason}`)
      .join("; ") || "sin áreas de práctica registradas";
    const recommendation = insight.recommendation
      ? `${insight.recommendation.exactSkill}. ${insight.recommendation.reason}`
      : "No hay recomendación pendiente registrada.";
    const task =
      promptKind === "review"
        ? "Crea una actividad de repaso de 10 minutos centrada en la práctica recomendada."
        : promptKind === "parent"
          ? "Reescribe estos hechos como una nota breve, cálida y factual para la familia, sin añadir diagnósticos ni datos no registrados."
          : "Crea práctica adicional breve usando exclusivamente las sílabas y letras ya aprendidas o introducidas arriba.";

    return `${task}\n\nDATOS REGISTRADOS\nEstudiante: ${progress.student.display_name}.\nHabilidades dominadas según datos: ${mastered}.\nHabilidades en práctica o repaso: ${practicing}.\nSiguiente práctica determinística: ${recommendation}\n\nREGLAS\n- Usa solamente las letras, sílabas y palabras ya introducidas en los datos anteriores.\n- No introduzcas letras ni familias silábicas nuevas.\n- No diagnostiques al niño ni infieras condiciones, capacidades o causas.\n- Distingue claramente los hechos registrados de cualquier sugerencia tuya.\n- Mantén la actividad breve, concreta y apropiada para alfabetización inicial en español.`;
  }, [progress, insight, promptKind]);

  useEffect(() => {
    setPromptDraft(generatedPrompt);
    setCopied(false);
  }, [generatedPrompt]);

  const handleUpdate = async (id: string, updates: Partial<DashboardStudent>) => {
    if (isSeed) {
      updateSeedStudent(id, { teacher_notes: updates.teacher_notes });
    } else {
      await updateStudent({ data: { id, teacherNotes: updates.teacher_notes ?? null } });
    }
    qc.invalidateQueries({ queryKey: ["crm-estudiante", studentId] });
    refetch();
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(promptDraft);
    setCopied(true);
  };

  return (
    <div className="w-full space-y-6">
      <CrmBreadcrumbs
        items={[
          { label: "Panel", to: "/cartilla/teacher/crm" },
          { label: "Clase", to: "/cartilla/teacher/crm/$classId", params: { classId } },
          { label: progress?.student.display_name ?? "Alumno" },
        ]}
      />

      {loadingProgress || !progress || !summary || !insight ? (
        <div className="animate-pulse rounded-[2rem] border border-stone-200 bg-white p-12 text-center font-bold text-stone-400">Cargando alumno...</div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-stone-800">{progress.student.display_name}</h1>
                <p className="mt-1 text-sm font-bold text-stone-500">Código: <span className="font-mono text-vowel-e">{progress.student.student_code}</span></p>
              </div>
              <Link
                to="/cartilla/teacher/crm/$classId/$studentId/reporte"
                params={{ classId, studentId }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-vowel-a px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
              >
                <FileText className="h-4 w-4" /> Reporte para Familias
              </Link>
            </header>

            {insight.recommendation && (
              <section className="rounded-3xl border-2 border-[#e7c99b] bg-[#fffaf1] p-6">
                <p className="text-xs font-black uppercase tracking-wider text-[#9a5a24]">Siguiente práctica recomendada</p>
                <h2 className="mt-2 text-xl font-black text-stone-900">{insight.recommendation.exactSkill}</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-600">{insight.recommendation.reason}</p>
                <a href={familyPracticeHref(insight.recommendation.lessonNumber, insight.recommendation.activity)} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#a45d22] px-4 text-sm font-black text-white">Abrir actividad recomendada</a>
              </section>
            )}

            <section className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6">
              <div>
                <h2 className="text-lg font-black text-stone-800">Mapa de habilidades</h2>
                <p className="mt-1 text-xs font-semibold text-stone-500">Estados calculados con reglas visibles sobre intentos y lecciones registradas.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {insight.skills.map((skill) => (
                  <article key={skill.lessonId} className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-sm font-black text-stone-900">{skill.title}</p><p className="mt-0.5 text-sm font-black text-[#8a4c1c]">{skill.detail}</p></div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${STATUS_CLASS[skill.status]}`}>{STATUS_LABEL[skill.status]}</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-stone-500">{skill.reason}</p>
                  </article>
                ))}
              </div>
              <details className="rounded-2xl bg-stone-50 p-4 text-xs text-stone-600">
                <summary className="cursor-pointer font-black text-stone-700">Ver reglas de estado</summary>
                <div className="mt-3 space-y-2 font-semibold leading-relaxed">
                  <p><strong>Dominada:</strong> {SKILL_STATUS_RULES.mastered}</p>
                  <p><strong>Necesita repaso:</strong> {SKILL_STATUS_RULES.needs_review}</p>
                  <p><strong>Practicando:</strong> {SKILL_STATUS_RULES.practicing}</p>
                  <p><strong>Introducida:</strong> {SKILL_STATUS_RULES.introduced}</p>
                </div>
              </details>
            </section>

            <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#7c3aed]" />
                <div><h2 className="text-lg font-black text-stone-800">Prompt para usar manualmente con IA</h2><p className="mt-1 text-xs font-semibold text-stone-500">La Cartilla no envía estos datos a ningún servicio. Edita y copia el texto tú mismo.</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["review", "parent", "extra"] as PromptKind[]).map((kind) => (
                  <button key={kind} onClick={() => setPromptKind(kind)} className={`min-h-10 rounded-xl px-3 text-xs font-black ${promptKind === kind ? "bg-[#7c3aed] text-white" : "bg-stone-100 text-stone-700"}`}>
                    {kind === "review" ? "Repaso 10 min" : kind === "parent" ? "Nota para familia" : "Práctica extra"}
                  </button>
                ))}
              </div>
              <textarea aria-label="Prompt editable para copiar" value={promptDraft} onChange={(event) => setPromptDraft(event.target.value)} rows={12} className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm font-medium leading-relaxed text-stone-700 focus:border-[#7c3aed] focus:outline-none" />
              <button onClick={copyPrompt} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7c3aed] px-4 text-sm font-black text-white"><Clipboard className="h-4 w-4" /> {copied ? "Copiado" : "Copiar prompt"}</button>
            </section>

            <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-wider text-stone-700">Progreso de las 24 lecciones</h2><LessonTileLegend /></div>
              <LessonTileGrid tiles={tiles} classId={classId} studentId={studentId} />
            </section>
          </div>

          <AccountPanel student={dashboardStudent} onUpdate={handleUpdate} />
        </div>
      )}
    </div>
  );
}
