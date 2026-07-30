import { useState, useEffect, useRef } from "react";
import { MessageSquare, User, Save, Clock } from "lucide-react";
import type { DashboardStudent } from "./PipelineBoard";

interface AccountPanelProps {
  student: DashboardStudent | null;
  onUpdate?: (id: string, updates: Partial<DashboardStudent>) => void;
}

export function AccountPanel({ student, onUpdate }: AccountPanelProps) {
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Reset the notes draft only when the SELECTED student changes (by id) —
  // not on every parent re-render — so in-progress edits aren't clobbered.
  // The ref carries the latest student without widening the effect deps.
  const studentRef = useRef(student);
  studentRef.current = student;
  const studentId = student?.id;
  useEffect(() => {
    const current = studentRef.current;
    if (current) {
      setNotes(current.teacher_notes || "");
      setIsEditingNotes(false);
    }
  }, [studentId]);

  const handleSave = () => {
    if (student && onUpdate) {
      onUpdate(student.id, { teacher_notes: notes });
    }
    setIsEditingNotes(false);
  };

  if (!student) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border-4 border-dashed border-[#f6ecd7] flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-[#fdf3e0] rounded-full flex items-center justify-center text-[#d97706] mb-4 shadow-inner">
          <User className="w-10 h-10" />
        </div>
        <h4 className="font-black text-xl text-[#3b2a12]">Sin selección</h4>
        <p className="text-sm font-bold text-[#7a6040] mt-2 max-w-[200px]">
          Selecciona un alumno de la pizarra para ver sus detalles, notas y tiempo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-stone-100 overflow-hidden">
      {/* Header Area */}
      <div className="bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] p-6 relative">
        <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-black text-[#166534]">
          Vista de Alumno
        </div>
        <div className="flex flex-col items-center pt-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-black text-[#166534] shadow-lg mb-3">
            {student.name.charAt(0)}
          </div>
          <h4 className="font-black text-2xl text-[#14532d]">{student.name}</h4>
          <p className="text-xs font-bold text-[#166534]/70 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Última actividad: {student.lastActive}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress */}
        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
          <div className="flex justify-between text-xs font-black mb-2">
            <span className="text-[#64748b] uppercase tracking-wider">Progreso del libro</span>
            <span className="text-[#0ea5e9]">{student.progress}%</span>
          </div>
          <div className="h-4 w-full bg-[#e0f2fe] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] rounded-full transition-all duration-1000"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        {/* Teacher Notes Area */}
        <div className="bg-[#fefce8] p-4 rounded-2xl border border-[#fef08a]">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="teacher-notes"
              className="flex items-center gap-2 text-xs font-black text-[#a16207] uppercase tracking-wider"
            >
              <MessageSquare className="w-4 h-4" /> Comentarios del Maestro
            </label>
          </div>
          <textarea
            id="teacher-notes"
            placeholder="Añade un comentario sobre el progreso o áreas de mejora..."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setIsEditingNotes(true);
            }}
            className="w-full h-24 bg-white px-3 py-3 rounded-xl text-sm font-medium text-[#713f12] focus:outline-none focus:ring-2 focus:ring-[#fde047] border border-[#fde047] resize-none"
          />
          {isEditingNotes && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-2 bg-[#ca8a04] hover:bg-[#a16207] text-white text-xs font-black rounded-xl shadow-sm transition"
              >
                <Save className="w-3 h-3" /> Guardar Notas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
