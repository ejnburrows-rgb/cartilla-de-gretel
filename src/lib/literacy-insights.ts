import { CATALOG, type ActivityId, type CatalogEntry } from "@/lib/lesson-catalog";

export type SkillStatus = "introduced" | "practicing" | "mastered" | "needs_review";

export interface LearningEvent {
  lesson_id: string | null;
  event_kind: string;
  score: number | null;
  total: number | null;
  created_at: string;
  meta?: unknown;
}

export interface InsightAssignment {
  lessonId?: string;
  lesson_id?: string;
  dueAt?: string | null;
  due_at?: string | null;
}

export interface SkillInsight {
  lessonNumber: number;
  lessonId: string;
  title: string;
  detail: string;
  status: SkillStatus;
  reason: string;
  scoredRounds: number;
  recentAccuracy: number | null;
  recentIncorrect: number;
  recentTotal: number;
}

export interface AttentionFlag {
  key: string;
  lessonNumber: number | null;
  exactSkill: string;
  reason: string;
  supportingData: string;
  activity: ActivityId;
}

export interface PracticeRecommendation {
  lessonNumber: number;
  lessonId: string;
  exactSkill: string;
  activity: ActivityId;
  reason: string;
}

export interface StudentLearningInsight {
  skills: SkillInsight[];
  attention: AttentionFlag[];
  recommendation: PracticeRecommendation | null;
  recentAccuracy: number | null;
}

export const SKILL_STATUS_RULES = {
  mastered:
    "Lección completada y, cuando hay 2 o más rondas puntuadas recientes, al menos 80% de aciertos.",
  needs_review:
    "3 o más rondas puntuadas con menos de 60% de aciertos recientes, o 3 de las últimas 5 rondas por debajo de 60%.",
  practicing: "Hay práctica registrada, pero todavía no cumple el umbral de dominio ni de repaso.",
  introduced:
    "La habilidad ya está dentro del tramo curricular alcanzado, pero todavía no tiene práctica puntuable registrada.",
} as const;

function catalogEntry(lessonId: string): CatalogEntry | undefined {
  const n = Number(lessonId);
  return Number.isFinite(n) ? CATALOG.find((entry) => entry.n === n) : undefined;
}

function skillName(entry: CatalogEntry): { title: string; detail: string } {
  if (entry.kind === "intro") return { title: "Vocales", detail: "a–e–i–o–u" };
  if (entry.kind === "vowel") return { title: `Vocal ${entry.vowel.toUpperCase()}`, detail: entry.vowel };
  return { title: `Letra ${entry.letter.toUpperCase()}`, detail: entry.data.syllables.join("–") };
}

function scoredRounds(events: LearningEvent[]) {
  return events
    .filter(
      (event) =>
        event.event_kind === "exercise" &&
        typeof event.total === "number" &&
        event.total > 0 &&
        typeof event.score === "number",
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function aggregateAccuracy(events: LearningEvent[]): {
  accuracy: number | null;
  incorrect: number;
  total: number;
} {
  let hits = 0;
  let total = 0;
  for (const event of events) {
    if ((event.total ?? 0) <= 0) continue;
    hits += event.score ?? 0;
    total += event.total ?? 0;
  }
  return {
    accuracy: total > 0 ? hits / total : null,
    incorrect: Math.max(0, total - hits),
    total,
  };
}

function statusForLesson(
  entry: CatalogEntry,
  lessonEvents: LearningEvent[],
  completed: boolean,
  reachedLesson: number,
): SkillInsight {
  const skill = skillName(entry);
  const rounds = scoredRounds(lessonEvents);
  const recent = rounds.slice(0, 5);
  const recentStats = aggregateAccuracy(recent);
  const lowRounds = recent.filter((event) => (event.score ?? 0) / (event.total ?? 1) < 0.6).length;
  const enoughEvidenceForReview = rounds.length >= 3 && ((recentStats.accuracy ?? 1) < 0.6 || lowRounds >= 3);

  let status: SkillStatus;
  let reason: string;
  if (enoughEvidenceForReview) {
    status = "needs_review";
    reason = `${recentStats.incorrect} errores en ${recentStats.total} respuestas de las últimas ${recent.length} rondas puntuadas.`;
  } else if (
    completed &&
    (rounds.length === 0 || (rounds.length >= 2 && (recentStats.accuracy ?? 0) >= 0.8))
  ) {
    status = "mastered";
    reason =
      rounds.length === 0
        ? "Lección completada; este registro anterior no conserva rondas puntuadas para calcular exactitud."
        : `Lección completada con ${Math.round((recentStats.accuracy ?? 0) * 100)}% de aciertos en ${recent.length} rondas recientes.`;
  } else if (lessonEvents.length > 0 || completed) {
    status = "practicing";
    reason =
      recentStats.total > 0
        ? `${recentStats.incorrect} errores en ${recentStats.total} respuestas de las últimas ${recent.length} rondas; sigue en práctica.`
        : completed
          ? "Lección completada, pero no hay suficientes rondas puntuadas recientes para confirmar dominio."
          : "Hay actividad registrada en esta lección, todavía sin suficientes respuestas puntuadas.";
  } else {
    status = "introduced";
    reason =
      entry.n <= reachedLesson
        ? "La habilidad ya está dentro del tramo curricular alcanzado, sin intentos puntuados registrados."
        : "Aún no hay práctica registrada.";
  }

  return {
    lessonNumber: entry.n,
    lessonId: String(entry.n),
    title: skill.title,
    detail: skill.detail,
    status,
    reason,
    scoredRounds: rounds.length,
    recentAccuracy: recentStats.accuracy,
    recentIncorrect: recentStats.incorrect,
    recentTotal: recentStats.total,
  };
}

function exerciseName(event: LearningEvent): string {
  const meta = (event.meta ?? {}) as Record<string, unknown>;
  return typeof meta.exercise === "string" ? meta.exercise : "exercise";
}

function activityForLesson(events: LearningEvent[]): ActivityId {
  const weakest = scoredRounds(events).find((event) => (event.score ?? 0) / (event.total ?? 1) < 0.8);
  const exercise = weakest ? exerciseName(weakest) : "";
  if (exercise.includes("sound_search")) return "sonido";
  if (exercise.includes("gretel_mirror") || exercise.includes("pronunciation")) return "espejo";
  if (exercise.includes("trace")) return "trazar";
  if (exercise.includes("order") || exercise.includes("build")) return "armar";
  if (exercise.includes("picture") || exercise.includes("line_match") || exercise.includes("match_pairs")) return "palabras";
  return "silabas";
}

function assignmentLessonId(assignment: InsightAssignment): string | null {
  return assignment.lessonId ?? assignment.lesson_id ?? null;
}

function assignmentDueAt(assignment: InsightAssignment): string | null {
  return assignment.dueAt ?? assignment.due_at ?? null;
}

function skillDisplay(skill: SkillInsight): string {
  return skill.detail ? `${skill.title} · ${skill.detail}` : skill.title;
}

export function buildStudentLearningInsight(
  events: LearningEvent[],
  completedLessonIds: ReadonlySet<string>,
  assignments: InsightAssignment[] = [],
  now: number = Date.now(),
): StudentLearningInsight {
  const sortedEvents = events.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  const engagedLessonNumbers = sortedEvents.map((event) => Number(event.lesson_id)).filter((n) => Number.isFinite(n) && n > 0);
  const completedNumbers = Array.from(completedLessonIds).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const assignedNumbers = assignments.map(assignmentLessonId).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const reachedLesson = Math.max(1, ...engagedLessonNumbers, ...completedNumbers, ...assignedNumbers);

  const skills = CATALOG.filter((entry) => entry.n <= reachedLesson).map((entry) => {
    const lessonId = String(entry.n);
    return statusForLesson(
      entry,
      sortedEvents.filter((event) => event.lesson_id === lessonId),
      completedLessonIds.has(lessonId),
      reachedLesson,
    );
  });

  const attention: AttentionFlag[] = [];
  for (const skill of skills.filter((item) => item.status === "needs_review")) {
    const lessonEvents = sortedEvents.filter((event) => event.lesson_id === skill.lessonId);
    attention.push({
      key: `skill-${skill.lessonId}`,
      lessonNumber: skill.lessonNumber,
      exactSkill: skillDisplay(skill),
      reason: "Errores repetidos en esta habilidad",
      supportingData: skill.reason,
      activity: activityForLesson(lessonEvents),
    });
  }

  const allRecentRounds = scoredRounds(sortedEvents);
  const recentRounds = allRecentRounds.slice(0, 5);
  const recentStats = aggregateAccuracy(recentRounds);
  if (recentRounds.length >= 5 && (recentStats.accuracy ?? 1) < 0.6) {
    const target = skills.find((item) => item.status === "needs_review") ?? skills.at(-1);
    attention.push({
      key: "recent-accuracy",
      lessonNumber: target?.lessonNumber ?? null,
      exactSkill: target ? skillDisplay(target) : "Práctica reciente",
      reason: "Exactitud reciente baja",
      supportingData: `${recentStats.incorrect} errores en ${recentStats.total} respuestas de las últimas 5 rondas puntuadas (${Math.round((recentStats.accuracy ?? 0) * 100)}% de aciertos).`,
      activity: target
        ? activityForLesson(sortedEvents.filter((event) => event.lesson_id === target.lessonId))
        : "silabas",
    });
  }

  if (allRecentRounds.length >= 6) {
    const newest = aggregateAccuracy(allRecentRounds.slice(0, 3)).accuracy ?? 0;
    const prior = aggregateAccuracy(allRecentRounds.slice(3, 6)).accuracy ?? 0;
    if (prior - newest >= 0.2 && newest < 0.7) {
      const target = skills.find((item) => item.status === "needs_review") ?? skills.at(-1);
      attention.push({
        key: "decline",
        lessonNumber: target?.lessonNumber ?? null,
        exactSkill: target ? skillDisplay(target) : "Práctica reciente",
        reason: "Rendimiento reciente en descenso",
        supportingData: `Las 3 rondas más recientes promedian ${Math.round(newest * 100)}% frente a ${Math.round(prior * 100)}% en las 3 anteriores.`,
        activity: target
          ? activityForLesson(sortedEvents.filter((event) => event.lesson_id === target.lessonId))
          : "silabas",
      });
    }
  }

  const correctionGroups = new Map<string, LearningEvent[]>();
  for (const event of allRecentRounds.slice(0, 30)) {
    const key = `${event.lesson_id ?? ""}:${exerciseName(event)}`;
    const bucket = correctionGroups.get(key) ?? [];
    bucket.push(event);
    correctionGroups.set(key, bucket);
  }
  for (const [key, group] of correctionGroups) {
    if (group.length < 3) continue;
    const latest = group[0];
    if ((latest.score ?? 0) >= (latest.total ?? 0)) continue;
    const lessonId = key.split(":", 1)[0];
    const skill = skills.find((item) => item.lessonId === lessonId);
    if (!skill) continue;
    const stats = aggregateAccuracy(group.slice(0, 5));
    attention.push({
      key: `correction-${key}`,
      lessonNumber: skill.lessonNumber,
      exactSkill: skillDisplay(skill),
      reason: "Intentos de corrección repetidos",
      supportingData: `${group.length} intentos recientes del mismo ejercicio; ${stats.incorrect} errores en ${stats.total} respuestas consideradas.`,
      activity: activityForLesson(group),
    });
    break;
  }

  for (const assignment of assignments) {
    const lessonId = assignmentLessonId(assignment);
    if (!lessonId || completedLessonIds.has(lessonId)) continue;
    const lessonEvents = sortedEvents.filter((event) => event.lesson_id === lessonId);
    const dueAt = assignmentDueAt(assignment);
    const overdue = dueAt ? new Date(dueAt).getTime() < now : false;
    if (!overdue && lessonEvents.length === 0) continue;
    const entry = catalogEntry(lessonId);
    if (!entry) continue;
    const skill = skills.find((item) => item.lessonId === lessonId) ?? statusForLesson(entry, lessonEvents, false, entry.n);
    attention.push({
      key: `assignment-${lessonId}`,
      lessonNumber: entry.n,
      exactSkill: skillDisplay(skill),
      reason: overdue ? "Lección asignada vencida y sin terminar" : "Lección asignada iniciada y sin terminar",
      supportingData: overdue
        ? `Fecha límite: ${new Date(dueAt as string).toLocaleDateString("es")}. La lección no figura como completada.`
        : `${lessonEvents.length} registros de actividad; la lección no figura como completada.`,
      activity: activityForLesson(lessonEvents),
    });
  }

  const lastActive = sortedEvents[0]?.created_at ?? null;
  if (!lastActive) {
    attention.push({
      key: "no-activity",
      lessonNumber: 1,
      exactSkill: skillDisplay(skills[0]),
      reason: "Sin actividad registrada",
      supportingData: "No hay intentos ni lecciones completadas guardadas para este estudiante.",
      activity: "silabas",
    });
  } else {
    const days = Math.floor((now - new Date(lastActive).getTime()) / 86_400_000);
    if (days >= 7) {
      const target = skills.find((item) => item.status !== "mastered") ?? skills.at(-1);
      attention.push({
        key: "inactive",
        lessonNumber: target?.lessonNumber ?? null,
        exactSkill: target ? skillDisplay(target) : "Práctica actual",
        reason: "Actividad interrumpida",
        supportingData: `Última actividad registrada hace ${days} días.`,
        activity: target
          ? activityForLesson(sortedEvents.filter((event) => event.lesson_id === target.lessonId))
          : "silabas",
      });
    }
  }

  const recommendationSkill =
    skills.find((item) => item.status === "needs_review") ??
    skills.find((item) => item.status === "practicing") ??
    skills.find((item) => item.status === "introduced") ??
    null;

  let recommendation: PracticeRecommendation | null = null;
  if (recommendationSkill) {
    const lessonEvents = sortedEvents.filter((event) => event.lesson_id === recommendationSkill.lessonId);
    recommendation = {
      lessonNumber: recommendationSkill.lessonNumber,
      lessonId: recommendationSkill.lessonId,
      exactSkill: skillDisplay(recommendationSkill),
      activity: activityForLesson(lessonEvents),
      reason:
        recommendationSkill.recentTotal > 0
          ? `Repasar ${recommendationSkill.detail || recommendationSkill.title} porque hubo ${recommendationSkill.recentIncorrect} errores en ${recommendationSkill.recentTotal} respuestas de las últimas rondas registradas.`
          : `Practicar ${recommendationSkill.detail || recommendationSkill.title} porque es la siguiente habilidad del orden curricular sin práctica suficiente registrada.`,
    };
  }

  return { skills, attention: attention.slice(0, 6), recommendation, recentAccuracy: recentStats.accuracy };
}
