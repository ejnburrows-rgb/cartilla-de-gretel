import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  Plus,
  Trash2,
  FastForward,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  MonitorPlay,
  ClipboardList,
  Home,
  Compass,
  Gamepad2,
} from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import * as seedData from "@/lib/seed-data";
import {
  getDemoStudentSession,
  startDemoStudentSession,
  endDemoStudentSession,
  resetDemoClassroom,
} from "@/lib/demo-student-session";
import {
  isDemoSkipEnabled,
  setDemoSkipEnabled,
  resetProgress,
} from "@/lib/lesson-progress";

const CUSTOM_TEACHERS_KEY = "cartilla.demo.custom-teachers.v1";

type CustomTeacher = {
  id: string;
  name: string;
  username: string;
  email: string;
};

function readCustomTeachers(): CustomTeacher[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_TEACHERS_KEY);
    return raw ? (JSON.parse(raw) as CustomTeacher[]) : [];
  } catch {
    return [];
  }
}

function writeCustomTeachers(list: CustomTeacher[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_TEACHERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("cartilla:seed-auth"));
}

function useSafeRouter() {
  try {
    const navigate = useNavigate();
    const location = useLocation();
    return { navigate, location };
  } catch {
    return {
      navigate: (() => {}) as unknown as ReturnType<typeof useNavigate>,
      location: {
        pathname: typeof window !== "undefined" ? window.location?.pathname || "" : "",
      } as unknown as ReturnType<typeof useLocation>,
    };
  }
}

export function DemoControlCenter({
  currentLesson,
  floating = false,
}: {
  currentLesson?: number;
  floating?: boolean;
} = {}) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return null;
  }
  const { navigate, location } = useSafeRouter();
  const [expanded, setExpanded] = useState(false);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [, setTick] = useState(0);
  const [newStudentName, setNewStudentName] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const pathMatch = location.pathname.match(/\/(?:leccion|presentar|guia)\/(\d+)/);
  const activeLessonNum =
    currentLesson ?? (pathMatch ? Math.min(24, Math.max(1, Number(pathMatch[1]))) : 1);
  const isPresentarMode = location.pathname.includes("/cartilla/presentar/");
  const isGuiaMode = location.pathname.includes("/cartilla/teacher/guia/");
  const isStudentBookMode = location.pathname.includes("/cartilla/leccion/");

  useEffect(() => {
    // Ensure demo teacher session is initialized so students & classes are available immediately
    try {
      if (typeof seedData.startTeacherReview === "function") {
        seedData.startTeacherReview();
      }
    } catch {
      /* ignore */
    }
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("cartilla:seed-data", refresh);
    window.addEventListener("cartilla:seed-auth", refresh);
    window.addEventListener("cartilla:student-session", refresh);
    window.addEventListener("cartilla:lesson-progress", refresh);
    return () => {
      window.removeEventListener("cartilla:seed-data", refresh);
      window.removeEventListener("cartilla:seed-auth", refresh);
      window.removeEventListener("cartilla:student-session", refresh);
      window.removeEventListener("cartilla:lesson-progress", refresh);
    };
  }, []);

  const flashStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const activeTeacher = (typeof seedData.getSeedTeacher === "function" ? seedData.getSeedTeacher() : null) ?? seedData.SEED_TEACHERS?.[0] ?? { id: "teacher-demo", name: "Maestra", email: "teacher@cartilla.org", username: "maestra" };
  const customTeachers = readCustomTeachers();
  const allTeachers = [...(seedData.SEED_TEACHERS ?? []), ...customTeachers];

  let classes: any[] = [];
  try {
    classes = typeof seedData.listSeedClasses === "function" ? seedData.listSeedClasses() : [];
  } catch {
    classes = [];
  }
  const activeClassId = classes[0]?.id ?? "seed-class-demo";
  let students: { id: string; display_name: string; student_code: string; lessons: number }[] = [];
  try {
    students = typeof seedData.getSeedClass === "function" ? seedData.getSeedClass(activeClassId)?.students ?? [] : [];
  } catch {
    students = [];
  }

  const demoStudent = getDemoStudentSession();
  const skipEnabled = isDemoSkipEnabled();

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStudentName.trim();
    if (!trimmed) return;
    try {
      if (typeof seedData.startTeacherReview === "function") seedData.startTeacherReview();
      const created = typeof seedData.addSeedStudents === "function" ? seedData.addSeedStudents(activeClassId, [trimmed]) : [];
      if (created[0]) {
        startDemoStudentSession(activeClassId, created[0].id);
        flashStatus(`Alumno "${trimmed}" creado y activado.`);
      }
      setNewStudentName("");
      setTick((t) => t + 1);
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : "Error al añadir alumno");
    }
  };

  const handleDeleteStudent = (studentId: string, name: string) => {
    try {
      if (demoStudent?.studentId === studentId) {
        endDemoStudentSession();
      }
      if (typeof seedData.deleteSeedStudent === "function") seedData.deleteSeedStudent(studentId);
      flashStatus(`Alumno "${name}" eliminado.`);
      setTick((t) => t + 1);
    } catch {
      /* ignore */
    }
  };

  const handleSelectStudent = (studentId: string) => {
    if (!studentId) {
      endDemoStudentSession();
      flashStatus("Modo libre (sin alumno específico).");
      setTick((t) => t + 1);
      return;
    }
    try {
      if (typeof seedData.startTeacherReview === "function") seedData.startTeacherReview();
      startDemoStudentSession(activeClassId, studentId);
      const found = students.find((s) => s.id === studentId);
      flashStatus(`Alumno activo: ${found?.display_name ?? studentId}`);
      setTick((t) => t + 1);
    } catch {
      /* ignore */
    }
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTeacherName.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "") || "maestro";
    const entry: CustomTeacher = {
      id: `custom-teacher-${Date.now()}`,
      name: trimmed,
      username: slug,
      email: `${slug}@cartilla.local`,
    };
    const next = [...customTeachers, entry];
    writeCustomTeachers(next);
    setNewTeacherName("");
    flashStatus(`Maestro "${trimmed}" añadido.`);
    setTick((t) => t + 1);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    const next = customTeachers.filter((t) => t.id !== id);
    writeCustomTeachers(next);
    flashStatus(`Maestro "${name}" eliminado.`);
    setTick((t) => t + 1);
  };

  const handleSwitchTeacher = (usernameOrId: string) => {
    try {
      const seedMatch = (seedData.SEED_TEACHERS ?? []).find((t) => t.id === usernameOrId || t.username === usernameOrId);
      if (seedMatch) {
        if (typeof seedData.signInSeedTeacher === "function") seedData.signInSeedTeacher(seedMatch.username, "demo");
        flashStatus(`Maestro activo: ${seedMatch.name}`);
      } else {
        const customMatch = customTeachers.find((t) => t.id === usernameOrId);
        if (customMatch && seedData.SEED_TEACHERS?.[0]) {
          if (typeof seedData.signInSeedTeacher === "function") seedData.signInSeedTeacher(seedData.SEED_TEACHERS[0].username, "demo");
          flashStatus(`Maestro activo: ${customMatch.name}`);
        }
      }
      setTick((t) => t + 1);
    } catch {
      /* ignore */
    }
  };

  if (floating && !floatingOpen) {
    return (
      <div className="no-print fixed bottom-2.5 left-2.5 z-50">
        <button
          type="button"
          onClick={() => setFloatingOpen(true)}
          aria-label="Abrir Panel de Control de Demostración"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-950/95 px-3.5 py-2 text-xs font-extrabold text-amber-50 shadow-lg backdrop-blur-xs transition hover:scale-105 hover:bg-amber-900"
        >
          <FastForward size={14} className="text-amber-300" /> Presentación Cliente · L{activeLessonNum}
        </button>
      </div>
    );
  }

  return (
    <section
      className={
        floating
          ? "no-print fixed inset-x-3 bottom-3 z-50 mx-auto max-h-[82dvh] w-auto max-w-[1120px] overflow-y-auto rounded-2xl border-2 border-amber-400 bg-[#fffdf7] px-4 py-3 shadow-2xl"
          : "no-print mx-auto mb-4 w-full max-w-[1160px] rounded-2xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-50 via-[#fffdf7] to-amber-50/80 px-4 py-3 shadow-sm"
      }
      aria-label="Panel de Control de Demostración"
    >
      {/* Top compact bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-50">
            <FastForward size={13} /> Modo Demo Activo
          </span>
          <span className="text-xs font-bold text-amber-950">
            Alumno:{" "}
            <strong className="underline decoration-amber-500">
              {demoStudent ? demoStudent.studentName : "Visitante Libre (Todas las lecciones)"}
            </strong>
          </span>
          <span className="text-xs font-semibold text-stone-600">
            · Maestro: <strong>{activeTeacher.name}</strong>
          </span>
        </div>

        {/* Quick Lesson Jumper + Synchronized View Switcher + Expand button */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
            <span>Lección:</span>
            <select
              aria-label="Saltar directamente a cualquier lección"
              value={String(activeLessonNum)}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (isPresentarMode) {
                  navigate({ to: "/cartilla/presentar/$n", params: { n: val } });
                } else if (isGuiaMode) {
                  navigate({ to: "/cartilla/teacher/guia/$n", params: { n: val } });
                } else {
                  navigate({ to: "/cartilla/leccion/$n", params: { n: val } });
                }
              }}
              className="rounded-xl border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-900 shadow-2xs"
            >
              {CATALOG.map((entry) => (
                <option key={entry.n} value={String(entry.n)}>
                  Lección {entry.n}: {entry.title}
                </option>
              ))}
            </select>
          </label>

          <Link
            to="/"
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              location.pathname === "/"
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <Home size={14} /> Portada
          </Link>

          <Link
            to="/cartilla/lecciones"
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              location.pathname.startsWith("/cartilla/lecciones")
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <Compass size={14} /> Mapa (24)
          </Link>

          <Link
            to="/cartilla/leccion/$n"
            params={{ n: String(activeLessonNum) }}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isStudentBookMode
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <BookOpen size={14} /> Cuaderno (L{activeLessonNum})
          </Link>

          <Link
            to="/cartilla/presentar/$n"
            params={{ n: String(activeLessonNum) }}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isPresentarMode
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <MonitorPlay size={14} /> Proyectar Rotafolio (L{activeLessonNum})
          </Link>

          <Link
            to="/cartilla/teacher/guia/$n"
            params={{ n: String(activeLessonNum) }}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isGuiaMode
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <ClipboardList size={14} /> Guía Docente (L{activeLessonNum})
          </Link>

          <Link
            to="/cartilla/teacher"
            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100"
          >
            <GraduationCap size={14} /> Panel Maestro
          </Link>

          <Link
            to="/cartilla/practica"
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              location.pathname.startsWith("/cartilla/practica") || location.pathname.startsWith("/cartilla/juego")
                ? "border-amber-700 bg-amber-800 text-white"
                : "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            }`}
          >
            <Gamepad2 size={14} /> Juegos (5)
          </Link>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-amber-900"
          >
            <Users size={14} />
            {expanded ? "Ocultar Gestor" : "Gestionar Alumnos y Maestros"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {floating && (
            <button
              type="button"
              onClick={() => setFloatingOpen(false)}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-200"
            >
              Cerrar ✕
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900">
          <CheckCircle2 size={14} /> {statusMsg}
        </div>
      )}

      {/* Expanded Management Drawer */}
      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-4 border-t border-amber-200/80 pt-3 md:grid-cols-3">
          {/* 1. Students Column */}
          <div className="rounded-xl border border-stone-200 bg-white p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-700">
              <Users size={14} className="text-amber-700" /> Alumnos ({students.length})
            </h3>

            <form onSubmit={handleAddStudent} className="mb-2.5 flex gap-1.5">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Nombre del nuevo alumno..."
                className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-900"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                <Plus size={13} /> Añadir
              </button>
            </form>

            <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectStudent("")}
                  className={`text-left font-bold ${!demoStudent ? "text-amber-800 underline" : "text-stone-700"}`}
                >
                  ★ Visitante Libre (Sin cuenta)
                </button>
              </div>
              {students.map((st) => {
                const isSelected = demoStudent?.studentId === st.id;
                return (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                      isSelected ? "border-amber-400 bg-amber-50/80" : "border-stone-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectStudent(st.id)}
                      className="min-w-0 flex-1 truncate text-left font-bold text-stone-800 hover:text-amber-800"
                    >
                      {isSelected ? "✓ " : ""}
                      {st.display_name}{" "}
                      <span className="font-normal text-stone-500">({st.lessons}/24)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(st.id, st.display_name)}
                      title={`Eliminar a ${st.display_name}`}
                      aria-label={`Eliminar a ${st.display_name}`}
                      className="ml-2 rounded p-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Teachers Column */}
          <div className="rounded-xl border border-stone-200 bg-white p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-700">
              <GraduationCap size={14} className="text-amber-700" /> Maestros ({allTeachers.length})
            </h3>

            <form onSubmit={handleAddTeacher} className="mb-2.5 flex gap-1.5">
              <input
                type="text"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                placeholder="Nombre del nuevo maestro..."
                className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-900"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                <Plus size={13} /> Añadir
              </button>
            </form>

            <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {allTeachers.map((t) => {
                const isCustom = t.id.startsWith("custom-teacher-");
                const isActive = activeTeacher.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                      isActive ? "border-amber-400 bg-amber-50/80" : "border-stone-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSwitchTeacher(t.id)}
                      className="min-w-0 flex-1 truncate text-left font-bold text-stone-800 hover:text-amber-800"
                    >
                      {isActive ? "✓ " : ""}
                      {t.name}
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        title={`Eliminar a ${t.name}`}
                        aria-label={`Eliminar a ${t.name}`}
                        className="ml-2 rounded p-1 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Lesson Skipping & Demo Reset Column */}
          <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-3">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-700">
                <FastForward size={14} className="text-amber-700" /> Opciones de Lecciones y Demo
              </h3>
              <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2 text-xs font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={skipEnabled}
                  onChange={(e) => setDemoSkipEnabled(e.target.checked)}
                  className="h-4 w-4 accent-amber-700"
                />
                <span>Permitir saltar a cualquier lección (1–24) sin bloqueo</span>
              </label>
              <p className="text-[11px] leading-snug text-stone-500">
                Con esta opción activa puedes abrir cualquier lección del cuaderno o rotafolio libremente.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  flashStatus("Progreso del alumno actual reiniciado.");
                  setTick((t) => t + 1);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100"
              >
                <RotateCcw size={13} /> Reiniciar Lecciones
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    resetDemoClassroom();
                    flashStatus("Aula de demostración restaurada a los datos iniciales.");
                    setTick((t) => t + 1);
                  } catch {
                    resetProgress();
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
              >
                <RotateCcw size={13} /> Restaurar Aula Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
