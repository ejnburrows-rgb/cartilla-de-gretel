import { Link } from "@tanstack/react-router";
import { BarChart3, MonitorPlay, Printer } from "lucide-react";

import "../../styles/teacher-crm.css";
import { AccountPanel } from "./components/AccountPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { KpiStrip } from "./components/KpiStrip";
import { PipelineBoard } from "./components/PipelineBoard";
import { Sidebar } from "./components/Sidebar";
import { TaskList } from "./components/TaskList";
import { Topbar } from "./components/Topbar";

export function TeacherCrmShell() {
  return (
    <div className="crm-app">
      <Sidebar />
      <main className="crm-main">
        <Topbar />
        <div className="crm-content">
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-sky-700">Centro docente</p>
                <h1 className="mt-1 text-2xl font-black text-slate-950">CRM de clase y reportes</h1>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Gestiona clases, revisa progreso y prepara reportes imprimibles para familias o equipo docente.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/cartilla/teacher/reportes"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
                >
                  <BarChart3 className="h-4 w-4" /> Reportes
                </Link>
                <Link
                  to="/cartilla/teacher/flipchart/$n"
                  params={{ n: "1" }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:border-sky-300"
                >
                  <MonitorPlay className="h-4 w-4" /> Presentar
                </Link>
                <Link
                  to="/cartilla/teacher/reportes"
                  search={{ print: "class" }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:border-sky-300"
                >
                  <Printer className="h-4 w-4" /> PDF
                </Link>
              </div>
            </div>
          </section>

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
