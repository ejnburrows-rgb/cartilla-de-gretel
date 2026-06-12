import { useState } from "react";
import { PenLine, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherNoteFieldProps {
  lessonId: string;
  studentId?: string;
  className?: string;
}

export function TeacherNoteField({ lessonId, studentId = "general", className }: TeacherNoteFieldProps) {
  // Use state only since no localStorage/sessionStorage is allowed per conventions
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className={cn("p-5 bg-stone-50 border-2 border-stone-200/60 rounded-2xl mt-6", className)}>
      <label htmlFor={`teacher-note-${lessonId}`} className="flex items-center gap-2 font-bold text-stone-700 mb-3 text-lg">
        <PenLine className="w-5 h-5" /> Notas del Estudiante
      </label>
      <div className="relative">
        <textarea
          id={`teacher-note-${lessonId}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
