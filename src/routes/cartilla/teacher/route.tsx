import { createFileRoute, Outlet, Link, useLocation, redirect } from "@tanstack/react-router";
import { Users, BarChart3, FileSpreadsheet, MonitorPlay, BookOpen } from "lucide-react";
import { getStudentSession } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/teacher")({
  beforeLoad: () => {
    const session = getStudentSession();
    if (session) {
      throw redirect({ to: "/cartilla/student/lecciones" });
    }
  },
  component: TeacherLayout,
});

function TeacherLayout() {
  const location = useLocation();

  if (location.pathname.includes("/proyectar")) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-white font-semibold">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-800 leading-tight">
                La Cartilla de Gretel
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-gray-500 leading-tight">
                Educator Portal
              </span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-2">
            <NavLink
              to="/cartilla/teacher"
              icon={<BookOpen className="w-[18px] h-[18px]" />}
              label="Recursos"
              active={location.pathname === "/cartilla/teacher"}
            />
            <NavLink
              to="/cartilla/teacher/roster"
              icon={<Users className="w-[18px] h-[18px]" />}
              label="Clases"
              active={location.pathname.includes("/roster")}
            />
            <NavLink
              to="/cartilla/teacher/progreso"
              icon={<BarChart3 className="w-[18px] h-[18px]" />}
              label="Progreso"
              active={location.pathname.includes("/progreso")}
            />
            <NavLink
              to="/cartilla/teacher/reportes"
              icon={<FileSpreadsheet className="w-[18px] h-[18px]" />}
              label="Reportes"
              active={location.pathname.includes("/reportes")}
            />
            <NavLink
              to="/cartilla/student/lecciones"
              icon={<MonitorPlay className="w-[18px] h-[18px]" />}
              label="Modo Alumno"
              active={false}
            />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-[14px] font-medium transition-colors duration-150 px-4 py-2 rounded-md ${
        active
          ? "bg-[#e8f0fe] text-[#1967d2]"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
