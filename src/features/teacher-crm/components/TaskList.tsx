import { mockTasks } from "../mock/seed";
import { Calendar, CheckCircle, Clock } from "lucide-react";

export function TaskList() {
  return (
    <div className="crm-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Mis tareas</h3>
        <button className="text-sm text-[#8da47e] font-medium hover:underline">+ Nueva</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 flex flex-col justify-center items-center">
        {mockTasks.length > 0 ? (
          mockTasks.map((task) => (
            <div
              key={task.id}
              className="flex gap-3 p-3 rounded-lg border border-[#e8e2d9] hover:bg-[#fdfbf7] transition-colors cursor-pointer w-full"
            >
              <button className="mt-0.5 text-[#e8e2d9] hover:text-[#8da47e] transition-colors">
                <CheckCircle className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-medium text-[#3a322b]">{task.title}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-[#7a7065]">
                  {task.priority === "high" ? (
                    <Clock className="w-3 h-3 text-[#902b2b]" />
                  ) : (
                    <Calendar className="w-3 h-3" />
                  )}
                  <span className={task.priority === "high" ? "text-[#902b2b] font-medium" : ""}>
                    {task.due}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 bg-[#fdfbf7] border border-[#e8e2d9] rounded-xl flex items-center justify-center text-[#7a7065]/60 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#3a322b]">No assignments yet.</p>
              <p className="text-xs text-[#7a7065]/80 font-semibold leading-relaxed">
                Tasks and assignments will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
