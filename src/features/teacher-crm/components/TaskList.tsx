import { mockTasks } from "../mock/seed";
import { Calendar, CheckCircle, Clock } from "lucide-react";

export function TaskList() {
  return (
    <div className="crm-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Mis tareas</h3>
        <button className="text-sm text-[#8da47e] font-medium hover:underline">+ Nueva</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {mockTasks.map(task => (
          <div key={task.id} className="flex gap-3 p-3 rounded-lg border border-[#e8e2d9] hover:bg-[#fdfbf7] transition-colors cursor-pointer">
            <button className="mt-0.5 text-[#e8e2d9] hover:text-[#8da47e] transition-colors">
              <CheckCircle className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-[#3a322b]">{task.title}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#7a7065]">
                {task.priority === 'high' ? <Clock className="w-3 h-3 text-[#902b2b]" /> : <Calendar className="w-3 h-3" />}
                <span className={task.priority === 'high' ? 'text-[#902b2b] font-medium' : ''}>{task.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
