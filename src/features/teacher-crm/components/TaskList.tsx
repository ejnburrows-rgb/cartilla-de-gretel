import { useState } from "react";
import { Calendar, CheckCircle, Clock, Plus, Trash2, Rocket } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAssignments, createAssignment, deleteAssignment } from "@/lib/assignments.functions";
import { CATALOG } from "@/lib/lesson-catalog";

interface TaskListProps {
  classId: string;
}

/** Real assignment management for the currently-selected class — creates
 * and lists rows in the real `assignments` table (via assignments.functions.ts),
 * never the local seed-data mock. This is what makes "assign one of the
 * established 24 lessons" actually work for a real teacher. */
export function TaskList({ classId }: TaskListProps) {
  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [lessonN, setLessonN] = useState("1");
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments", classId],
    queryFn: () => listAssignments({ data: { classId } }),
    enabled: !!classId,
  });

  const alreadyAssignedLessons = new Set((assignments ?? []).map((a) => a.lesson_id));
  const isDuplicate = alreadyAssignedLessons.has(lessonN);

  const createMut = useMutation({
    mutationFn: () =>
      createAssignment({
        data: {
          classId,
          lessonId: lessonN,
          title: title.trim() || undefined,
          dueAt: dueDate ? new Date(dueDate).toISOString() : null,
          timeLimitSeconds: timeLimit ? Number(timeLimit) * 60 : null,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setTimeLimit("");
      setDueDate("");
      setIsCreating(false);
      qc.invalidateQueries({ queryKey: ["assignments", classId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAssignment({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments", classId] }),
  });

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-stone-100 flex flex-col min-h-[300px] overflow-hidden">
      <div className="bg-gradient-to-r from-[#e0e7ff] to-[#c7d2fe] p-5 flex items-center justify-between border-b border-[#a5b4fc]">
        <h3 className="text-xl font-black text-[#3730a3] flex items-center gap-2">
          <Rocket className="w-6 h-6 text-[#4f46e5]" /> Asignaciones
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-[#4f46e5] text-white p-2 rounded-xl hover:bg-[#4338ca] hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
        {isCreating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isDuplicate) createMut.mutate();
            }}
            className="bg-white p-4 rounded-2xl border-2 border-[#818cf8] shadow-sm mb-4 animate-in fade-in slide-in-from-top-2"
          >
            <h4 className="font-black text-[#4f46e5] text-sm mb-3">Asignar una lección</h4>
            <div className="space-y-3">
              <select
                value={lessonN}
                aria-label="Lección a asignar"
                onChange={(e) => setLessonN(e.target.value)}
                className="w-full text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
              >
                {CATALOG.map((entry) => (
                  <option key={entry.n} value={String(entry.n)}>
                    L{entry.n} — {entry.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Minutos"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-1/3 text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-2/3 text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
                />
              </div>
              {isDuplicate && (
                <p className="text-xs font-bold text-[#dc2626]">
                  Esta clase ya tiene una tarea asignada para esta lección.
                </p>
              )}
              {createMut.isError && (
                <p className="text-xs font-bold text-[#dc2626]">
                  {(createMut.error as Error).message}
                </p>
              )}
              <button
                type="submit"
                disabled={isDuplicate || createMut.isPending}
                className="w-full bg-[#6366f1] text-white font-black text-sm py-3 rounded-xl shadow-md hover:bg-[#4f46e5] disabled:opacity-50"
              >
                {createMut.isPending ? "Asignando…" : "Asignar"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-sm font-bold text-stone-400 animate-pulse">
            Cargando asignaciones…
          </div>
        ) : (assignments ?? []).length > 0 ? (
          (assignments ?? []).map((task) => {
            const entry = CATALOG.find((c) => String(c.n) === task.lesson_id);
            return (
              <div
                key={task.id}
                className="group flex flex-col gap-2 p-4 rounded-2xl bg-white border-2 border-[#e2e8f0] hover:border-[#818cf8] transition-colors relative shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="bg-[#e0e7ff] w-10 h-10 rounded-xl flex items-center justify-center text-[#4f46e5] shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1e293b]">
                        {task.title || (entry ? `L${entry.n} — ${entry.title}` : "Tarea")}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs font-bold text-[#64748b]">
                        {task.time_limit_seconds ? (
                          <span className="flex items-center gap-1 text-[#ea580c]">
                            <Clock className="w-3 h-3" /> {task.time_limit_seconds / 60} mins
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Sin límite
                          </span>
                        )}
                        {task.due_at && (
                          <span className="flex items-center gap-1 text-[#0284c7]">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMut.mutate(task.id)}
                    disabled={deleteMut.isPending}
                    className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4 space-y-3 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#e0e7ff] rounded-full flex items-center justify-center text-[#6366f1] shadow-inner mb-2">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-[#1e293b]">¡No hay tareas!</p>
            <p className="text-xs text-[#64748b] font-bold leading-relaxed max-w-[200px]">
              Asigna una lección y establécele un límite de tiempo para retar a tus alumnos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
