import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, Plus, Trash2, Rocket } from "lucide-react";
import { listSeedAssignments, createSeedAssignment, deleteSeedAssignment } from "@/lib/seed-data";

export function TaskList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTimeLimit, setNewTimeLimit] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  
  // We need to fetch the class ID from localStorage or pass it down via Props.
  // For now, we will grab the first class of the seed teacher if available.
  // Actually, wait, TeacherCrmShell handles the selected class. It's best if we just use a mock or fetch the list of classes.
  // We'll read the first class ID locally since this is the component directly.
  const fetchAssignments = () => {
    try {
      const stateStr = localStorage.getItem("cartilla.seed.state.v1");
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.classes && state.classes.length > 0) {
          const classId = state.classes[0].id; // Simple fallback
          const data = listSeedAssignments(classId);
          setAssignments(data);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAssignments();
    window.addEventListener("cartilla:seed-data", fetchAssignments);
    return () => window.removeEventListener("cartilla:seed-data", fetchAssignments);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stateStr = localStorage.getItem("cartilla.seed.state.v1");
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.classes && state.classes.length > 0) {
          const classId = state.classes[0].id;
          createSeedAssignment({
            classId,
            lessonId: "custom",
            title: newTitle,
            timeLimitSeconds: newTimeLimit ? parseInt(newTimeLimit) * 60 : null,
            dueAt: newDueDate || null,
          });
          setNewTitle("");
          setNewTimeLimit("");
          setNewDueDate("");
          setIsCreating(false);
          fetchAssignments();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteSeedAssignment(id);
      fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

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
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl border-2 border-[#818cf8] shadow-sm mb-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-black text-[#4f46e5] text-sm mb-3">Nueva Tarea Programada</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título de la lección (Ej. Vocales)"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Minutos"
                  min="1"
                  value={newTimeLimit}
                  onChange={(e) => setNewTimeLimit(e.target.value)}
                  className="w-1/3 text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
                />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-2/3 text-sm font-bold bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-[#334155] focus:outline-none focus:border-[#6366f1]"
                />
              </div>
              <button type="submit" className="w-full bg-[#6366f1] text-white font-black text-sm py-3 rounded-xl shadow-md hover:bg-[#4f46e5]">
                Asignar
              </button>
            </div>
          </form>
        )}

        {assignments.length > 0 ? (
          assignments.map((task) => (
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
                    <p className="text-sm font-black text-[#1e293b]">{task.title || "Tarea General"}</p>
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
                          <Calendar className="w-3 h-3" /> {task.due_at}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 space-y-3 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#e0e7ff] rounded-full flex items-center justify-center text-[#6366f1] shadow-inner mb-2">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-[#1e293b]">¡No hay tareas!</p>
            <p className="text-xs text-[#64748b] font-bold leading-relaxed max-w-[200px]">
              Crea una asignación y establécale un límite de tiempo para retar a tus alumnos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
