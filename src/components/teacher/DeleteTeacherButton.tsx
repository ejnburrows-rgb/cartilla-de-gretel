import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteTeacherAccount } from "@/lib/admin-teacher.functions";

/**
 * Removes a teacher's account from the Dirección screen.
 *
 * Deleting a teacher can take real children's work with it, so this asks twice
 * and never guesses. The first click only asks the server what would be lost;
 * the server refuses and reports the counts. Those exact counts are shown, and
 * the admin has to type the teacher's name before the destructive call is made.
 * Typing the name is deliberate — a plain "are you sure?" is clicked through on
 * reflex, and there is no undo here.
 *
 * The button is hidden for the signed-in admin's own row: the server rejects
 * self-deletion anyway, but offering a button that always fails is worse than
 * not offering it.
 */
export function DeleteTeacherButton({
  teacherId,
  teacherName,
  onDeleted,
}: {
  teacherId: string;
  teacherName: string;
  onDeleted: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "checking" | "confirming" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [cost, setCost] = useState<{ classCount: number; studentCount: number } | null>(null);

  const reset = () => {
    setPhase("idle");
    setError(null);
    setTyped("");
    setCost(null);
  };

  // First click: ask what this would cost. Nothing is deleted by this call.
  const begin = async () => {
    setPhase("checking");
    setError(null);
    const result = await deleteTeacherAccount(teacherId);
    if (result.status === "needs_confirmation") {
      setCost({ classCount: result.classCount, studentCount: result.studentCount });
      setPhase("confirming");
    } else if (result.status === "deleted") {
      // Owned nothing, so the server completed it outright.
      onDeleted();
      reset();
    } else {
      setError(result.message);
      setPhase("idle");
    }
  };

  const confirm = async () => {
    setPhase("deleting");
    setError(null);
    const result = await deleteTeacherAccount(teacherId, { deleteClasses: true });
    if (result.status === "deleted") {
      onDeleted();
      reset();
    } else {
      setError(result.status === "error" ? result.message : "No se pudo eliminar la cuenta.");
      setPhase("confirming");
    }
  };

  const nameMatches = typed.trim().toLowerCase() === teacherName.trim().toLowerCase();

  if (phase === "confirming" || phase === "deleting") {
    return (
      <div className="w-full mt-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-bold text-red-900">
            Se eliminará la cuenta de <strong>{teacherName}</strong>
            {cost && (cost.classCount > 0 || cost.studentCount > 0) ? (
              <>
                , junto con {cost.classCount} clase{cost.classCount === 1 ? "" : "s"} y el progreso
                de {cost.studentCount} alumno{cost.studentCount === 1 ? "" : "s"}.
              </>
            ) : (
              "."
            )}{" "}
            <span className="font-black">Esto no se puede deshacer.</span>
          </div>
        </div>

        <label htmlFor={`confirm-${teacherId}`} className="block text-xs font-bold text-red-900">
          Escribe <strong>{teacherName}</strong> para confirmar:
        </label>
        <input
          id={`confirm-${teacherId}`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={phase === "deleting"}
          autoComplete="off"
          className="w-full px-3 py-2 rounded-xl border-2 border-red-200 bg-white text-sm font-bold outline-none focus:border-red-500"
        />

        {error && <p className="text-xs font-bold text-red-700">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={!nameMatches || phase === "deleting"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black disabled:opacity-40 hover:bg-red-700 transition"
          >
            {phase === "deleting" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Eliminar definitivamente
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={phase === "deleting"}
            className="px-4 py-2 rounded-xl bg-white border-2 border-stone-200 text-xs font-black text-stone-700 hover:bg-stone-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={begin}
        disabled={phase === "checking"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-red-200 bg-white text-xs font-black text-red-700 hover:bg-red-50 transition disabled:opacity-50"
      >
        {phase === "checking" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        Eliminar cuenta
      </button>
      {error && <p className="text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}
