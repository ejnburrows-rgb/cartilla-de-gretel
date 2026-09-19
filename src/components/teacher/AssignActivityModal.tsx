// AssignActivityModal.tsx — lets a teacher assign one real folder activity
// (from the /cartilla/teacher/guia 5-folder hub) to the whole class, or to
// one/several selected students. Persists via folder-assignments.functions
// (the new, additive folder_assignments table).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Check } from "lucide-react";
import { useServerFn } from "@/lib/useServerFn";
import { listClasses, getClass } from "@/lib/teacher.functions";
import { createFolderAssignment, type FolderKey } from "@/lib/folder-assignments.functions";

interface AssignActivityModalProps {
  folderKey: FolderKey;
  lessonId: string;
  activityLabel: string;
  onClose: () => void;
}

export function AssignActivityModal({
  folderKey,
  lessonId,
  activityLabel,
  onClose,
}: AssignActivityModalProps) {
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listClasses);
  const fetchClass = useServerFn(getClass);
  const assign = useServerFn(createFolderAssignment);

  const [classId, setClassId] = useState<string>("");
  const [scope, setScope] = useState<"class" | "students">("class");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const classesQuery = useQuery({ queryKey: ["teacher-classes"], queryFn: () => fetchClasses() });
  const classDetailQuery = useQuery({
    queryKey: ["teacher-class", classId],
    queryFn: () => fetchClass({ data: { id: classId } }),
    enabled: !!classId && scope === "students",
  });

  const mutation = useMutation({
    mutationFn: () =>
      assign({
        data: {
          classId,
          folderKey,
          lessonId,
          activityLabel,
          targetScope: scope,
          studentIds: scope === "students" ? [...selectedIds] : undefined,
        },
      }),
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries({ queryKey: ["folder-assignments", classId] });
    },
  });

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-stone-800">Asignar actividad</h2>
            <p className="text-sm font-medium text-stone-500">{activityLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-bold text-stone-700">Asignado correctamente.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-stone-800 text-white font-bold text-sm"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div>
              <label
                htmlFor="assign-class-select"
                className="text-xs font-black uppercase tracking-wide text-stone-500 mb-1 block"
              >
                Clase
              </label>
              <select
                id="assign-class-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border-2 border-stone-200 px-3 py-2 font-medium"
              >
                <option value="">Selecciona una clase…</option>
                {(classesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide text-stone-500 block">
                Asignar a
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScope("class")}
                  className={`flex-1 rounded-xl px-3 py-2 font-bold text-sm border-2 ${scope === "class" ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 text-stone-600"}`}
                >
                  Toda la clase
                </button>
                <button
                  onClick={() => setScope("students")}
                  className={`flex-1 rounded-xl px-3 py-2 font-bold text-sm border-2 ${scope === "students" ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 text-stone-600"}`}
                >
                  Estudiantes específicos
                </button>
              </div>
            </div>

            {scope === "students" && classId && (
              <div className="max-h-48 overflow-y-auto space-y-1 border-2 border-stone-100 rounded-xl p-2">
                {classDetailQuery.isLoading && <Loader2 className="w-4 h-4 animate-spin mx-auto" />}
                {(classDetailQuery.data?.students ?? []).map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-stone-700">{s.display_name}</span>
                  </label>
                ))}
              </div>
            )}

            {mutation.isError && (
              <p className="text-sm font-bold text-red-600">{(mutation.error as Error).message}</p>
            )}

            <button
              onClick={() => mutation.mutate()}
              disabled={
                !classId || (scope === "students" && selectedIds.size === 0) || mutation.isPending
              }
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-black disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Asignar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
