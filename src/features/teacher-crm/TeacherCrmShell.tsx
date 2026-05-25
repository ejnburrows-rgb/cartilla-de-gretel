import "../../styles/teacher-crm.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { KpiStrip } from "./components/KpiStrip";
import { PipelineBoard } from "./components/PipelineBoard";
import { AccountPanel } from "./components/AccountPanel";
import { TaskList } from "./components/TaskList";
import { AnalyticsPanel } from "./components/AnalyticsPanel";

export function TeacherCrmShell() {
  return (
    <div className="crm-app">
      <Sidebar />
      <main className="crm-main">
        <Topbar />
        <div className="crm-content">
          <KpiStrip />
          
          <div className="crm-grid">
            <div className="space-y-6">
              <PipelineBoard />
            </div>
            <div className="space-y-6">
              <AccountPanel />
              <TaskList />
              <AnalyticsPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
