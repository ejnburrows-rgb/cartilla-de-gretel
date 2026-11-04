import { useEffect, useRef, useState } from "react";
import { PenLine, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherNoteFieldProps {
  lessonId: string;
  studentId?: string;
  className?: string;
}

const SAVED_INDICATOR_MS = 2000;
const noteContextKey = (lessonId: string, studentId: string) => `${lessonId}\u0000${studentId}`;

export function TeacherNoteField({
  lessonId,
  studentId = "general",
  className,
}: TeacherNoteFieldProps) {
  // Use state only since no localStorage/sessionStorage is allowed per conventions.
  // Draft text and the saved indicator are keyed by lesson+student, so switching
  // either one in a still-mounted field starts a fresh, empty context.
  const draftKey = noteContextKey(lessonId, studentId);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const note = drafts[draftKey] ?? "";
  // The indicator records which context it belongs to, so a stale hide timer can
  // never clear a newer context's save.
  const [saved, setSaved] = useState<{ key: string; shown: boolean } | null>(null);
  const isSaved = saved?.key === draftKey && saved.shown;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHideTimer = () => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  // Cancel any pending hide timer when the context changes or the field unmounts,
  // so a late callback cannot mark the next lesson/student as saved.
  useEffect(() => clearHideTimer, [draftKey]);

  const updateNote = (value: string) => {
    setDrafts((prev) => ({ ...prev, [draftKey]: value }));
  };

  const handleSave = () => {
    clearHideTimer();
    setSaved({ key: draftKey, shown: true });
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setSaved((current) => (current?.key === draftKey ? { key: draftKey, shown: false } : current));
    }, SAVED_INDICATOR_MS);
  };

  return (
    <div className={cn("p-5 bg-stone-50 border-2 border-stone-200/60 rounded-2xl mt-6", className)}>
      <label
        htmlFor={`teacher-note-${lessonId}`}
        className="flex items-center gap-2 font-bold text-stone-700 mb-3 text-lg"
      >
        <PenLine className="w-5 h-5" /> Notas del Estudiante
      </label>
      <div className="relative">
        <textarea
          id={`teacher-note-${lessonId}`}
          value={note}
          onChange={(e) => updateNote(e.target.value)}
          onBlur={handleSave}
          placeholder="Anota observaciones sobre el desempeño en esta lección..."
          className="w-full min-h-[120px] p-4 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 transition resize-y shadow-sm"
        />
        {isSaved && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md animate-in fade-in zoom-in duration-300 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
          </div>
        )}
      </div>
      <p className="text-xs text-stone-400 mt-2 font-medium">
        Tus notas se mantendrán durante la sesión para esta lección.
      </p>
    </div>
  );
}
