import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Download,
  FileText,
  GraduationCap,
  Printer,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ClassRoster } from "@/components/teacher/ClassRoster";
import { ReportCard } from "@/components/teacher/ReportCard";
import { StudentPicker } from "@/components/teacher/StudentPicker";
import { downloadCSV, toCSV } from "@/lib/csv";
import { useLessonProgress } from "@/lib/lesson-progress";
import { getAllPageStates, getLastVisitedPage, getTotalMinutesToday } from "@/lib/page-progress";
import {
  getClass,
  getClassProgress,
  getStudentProgress,
  listClasses,
} from "@/lib/teacher.functions";

import "../../../styles/teacher-print.css";

type TeacherClass = Awaited<ReturnType<typeof listClasses>>[number];
type ClassData = Awaited<ReturnType<typeof getClass>>;
type ClassProgress = Awaited<ReturnType<typeof getClassProgress>>;
type StudentProgress = Awaited<ReturnType<typeof getStudentProgress>>;
type RosterStudent = ClassData["students"][number];

export const Route = createFileRoute("/cartilla/teacher/reportes")({
  component: TeacherReportsRoute,
});

function formatDate(value?: string | null) {
  if (!value) return "Sin actividad";
  return new Intl.DateTimeFormat("es", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function percent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return `${Math.round(value * 100)}%`;
}

function minutes(seconds?: number | null) {
  return Math.round((seconds ?? 0) / 60);
}

function csvDate() {
  return new Date().toISOString().slice(0, 10);
}

function TeacherReportsRoute() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [classProgress, setClassProgress] = useState<ClassProgress | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lessonProgress = useLessonProgress();

  const pageStates = useMemo(() => getAllPageStates(), []);
  const lastVisitedPage = useMemo(() => getLastVisitedPage(), []);
  const minutesToday = useMemo(() => getTotalMinutesToday(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      setIsLoading(true);
      setError(null);
      try {
        const nextClasses = await listClasses();
        if (cancelled) return;
        setClasses(nextClasses);
        setSelectedClassId((current) => current || nextClasses[0]?.id || "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudieron cargar clases.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadClasses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    let cancelled = false;

    async function loadClass() {
      setIsLoading(true);
      setError(null);
      try {
        const [nextClass, nextProgress] = await Promise.all([
          getClass({ data: { id: selectedClassId } }),
          getClassProgress({ data: { id: selectedClassId } }),
        ]);
        if (cancelled) return;
        setClassData(nextClass);
        setClassProgress(nextProgress);
        setSelectedStudentId((current) => current || nextClass.students[0]?.id || "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar la clase.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadClass();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentProgress(null);
      return;
    }

    let cancelled = false;
    async function loadStudent() {
      try {
        const nextProgress = await getStudentProgress({ data: { id: selectedStudentId } });
        if (!cancelled) setStudentProgress(nextProgress);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar el alumno.");
      }
    }

    loadStudent();
    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const classRows = classProgress?.perStudent ?? [];
  const scoredRows = classRows.filter((row) => typeof row.accuracy === "number");
  const classAccuracy = scoredRows.length
    ? scoredRows.reduce((sum, row) => sum + (row.accuracy ?? 0), 0) / scoredRows.length
    : null;
  const totalCompletedLessons = classRows.reduce((sum, row) => sum + row.lessonsCount, 0);
  const totalTimeSeconds = classRows.reduce((sum, row) => sum + row.timeSeconds, 0);
  const selectedClassName = classData?.class.name ?? classes.find((item) => item.id === selectedClassId)?.name ?? "Clase";
  const selectedStudentName = studentProgress?.student.display_name ?? "Alumno";
  const selectedStudentClassName = studentProgress?.class?.name ?? selectedClassName;
  const selectedRosterStudent = classData?.students.find((student) => student.id === selectedStudentId) ?? null;
  const touchedPageCount = Object.keys(pageStates).length;

  function selectRosterStudent(student: RosterStudent) {
    setSelectedStudentId(student.id);
  }

  function printReport() {
    window.setTimeout(() => window.print(), 50);
  }

  function exportClassCsv() {
    const csv = toCSV(
      classRows.map((row) => ({
        alumno: row.name,
        lecciones_completadas: row.lessonsCount,
        precision: percent(row.accuracy),
        minutos: minutes(row.timeSeconds),
      })),
    );
    downloadCSV(`reporte-clase-${selectedClassName}-${csvDate()}.csv`, csv);
  }

  function exportStudentCsv() {
    if (!studentProgress) return;
    const csv = toCSV(
      studentProgress.events.map((event) => ({
        alumno: studentProgress.student.display_name,
        clase: selectedStudentClassName,
        leccion: event.lesson_id,
        tipo: event.event_kind,
        puntaje: event.score ?? "",
        total: event.total ?? "",
        segundos: event.time_seconds ?? "",
        fecha: event.created_at,
      })),
    );
    downloadCSV(`reporte-alumno-${studentProgress.student.display_name}-${csvDate()}.csv`, csv);
  }

  return (
    <main className="teacher-report-page min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="teacher-report-no-print mb-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
          <Link to="/cartilla/teacher" className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:text-sky-800">
            CRM
          </Link>
          <Link
            to="/cartilla/teacher/flipchart/$n"
            params={{ n: "1" }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:text-sky-800"
          >
            Presentacion
          </Link>
        </nav>

        <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-sky-800">Reportes docentes</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Seguimiento por clase, alumno y maestro
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
                Vista CRM para progreso multi-maestro: cada alumno conserva actividad por clase, maestro y contexto de practica.
              </p>
            </div>
            <div className="teacher-report-no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportClassCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
              >
                <Download className="h-4 w-4" /> CSV clase
              </button>
              <button
                type="button"
                onClick={exportStudentCsv}
                disabled={!studentProgress}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-4 w-4" /> CSV alumno
              </button>
              <button
                type="button"
                onClick={printReport}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:border-sky-300"
              >
                <Printer className="h-4 w-4" /> Imprimir PDF
              </button>
            </div>
          </div>
        </header>

        {error && <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</div>}

        <section className="teacher-report-no-print mb-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="class-picker">
              Clase activa
            </label>
            <select
              id="class-picker"
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setSelectedStudentId("");
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-950"
            >
              {classes.map((teacherClass) => (
                <option key={teacherClass.id} value={teacherClass.id}>
                  {teacherClass.name} · {teacherClass.student_count} alumnos
                </option>
              ))}
            </select>
          </div>
          <StudentPicker classId={selectedClassId} selectedStudentId={selectedStudentId} onSelect={(student) => setSelectedStudentId(student.id)} />
        </section>

        <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportCard title="Clase" value={selectedClassName} subtitle={isLoading ? "Actualizando..." : "Contexto de maestro activo"} tone="blue" />
          <ReportCard title="Alumnos" value={classData?.students.length ?? 0} subtitle="Roster de esta clase" tone="green" />
          <ReportCard title="Precision promedio" value={percent(classAccuracy)} subtitle="Eventos con puntaje" tone="amber" />
          <ReportCard title="Minutos registrados" value={minutes(totalTimeSeconds)} subtitle="Tiempo acumulado" tone="rose" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <ClassRoster students={classData?.students ?? []} selectedStudentId={selectedStudentId} onSelect={selectRosterStudent} />

            <ReportCard title="Reporte de clase" subtitle={`${totalCompletedLessons} lecciones completadas entre alumnos`} actions={
              <button
                type="button"
                onClick={exportClassCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800"
              >
                <Download className="h-4 w-4" /> Exportar
              </button>
            }>
              <div className="overflow-x-auto">
                <table className="teacher-report-table min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th>Alumno</th>
                      <th>Lecciones</th>
                      <th>Precision</th>
                      <th>Minutos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRows.map((row) => (
                      <tr key={row.id}>
                        <td className="font-black text-slate-950">{row.name}</td>
                        <td>{row.lessonsCount}</td>
                        <td>{percent(row.accuracy)}</td>
                        <td>{minutes(row.timeSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          </div>

          <aside className="space-y-5">
            <ReportCard
              title="Alumno seleccionado"
              value={selectedStudentName}
              subtitle={studentProgress ? `${selectedStudentClassName} · ${studentProgress.student.student_code}` : "Selecciona un alumno"}
              tone="blue"
              actions={
                <button
                  type="button"
                  onClick={exportStudentCsv}
                  disabled={!studentProgress}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" /> Exportar
                </button>
              }
            >
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/70 p-3">
                  <dt className="font-bold text-slate-500">Eventos</dt>
                  <dd className="text-2xl font-black text-slate-950">{studentProgress?.events.length ?? selectedRosterStudent?.events ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <dt className="font-bold text-slate-500">Lecciones</dt>
                  <dd className="text-2xl font-black text-slate-950">{selectedRosterStudent?.lessons ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <dt className="font-bold text-slate-500">Ultima vez</dt>
                  <dd className="text-sm font-black text-slate-950">{formatDate(selectedRosterStudent?.lastSeen)}</dd>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <dt className="font-bold text-slate-500">Maestro/clase</dt>
                  <dd className="text-sm font-black text-slate-950">{selectedStudentClassName}</dd>
                </div>
              </dl>
            </ReportCard>

            <ReportCard title="Practica en este dispositivo" subtitle="Datos locales de lesson-progress y page-progress" tone="green">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white/70 p-3 font-bold">
                  <span className="inline-flex items-center gap-2 text-slate-600"><GraduationCap className="h-4 w-4" /> Lecciones completas</span>
                  <span>{lessonProgress.completed.size}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 p-3 font-bold">
                  <span className="inline-flex items-center gap-2 text-slate-600"><BarChart3 className="h-4 w-4" /> Paginas tocadas</span>
                  <span>{touchedPageCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 p-3 font-bold">
                  <span className="inline-flex items-center gap-2 text-slate-600"><UsersRound className="h-4 w-4" /> Minutos hoy</span>
                  <span>{minutesToday}</span>
                </div>
                <div className="rounded-lg bg-white/70 p-3 text-sm font-bold text-slate-600">
                  Ultima pagina: {lastVisitedPage ?? "Sin visitas"}
                </div>
              </div>
            </ReportCard>
          </aside>
        </section>
      </div>
    </main>
  );
}
