import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/progreso")({
  component: TeacherProgressPage,
  head: () => ({
    meta: [
      { title: "Progreso — La Cartilla de Gretel CRM" },
    ],
  }),
});

function TeacherProgressPage() {
  return (
    <div className="w-full space-y-6">
      <header className="no-print">
        <h1 className="text-3xl font-black text-stone-800">Progreso de la Clase</h1>
        <p className="text-sm font-bold text-stone-500 mt-1">
          Visualiza estadísticas en tiempo real y el avance del currículo.
        </p>
      </header>

      <div className="bg-white border border-stone-200 rounded-3xl p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <h2 className="text-lg font-black text-stone-800">Módulo de Progreso en Construcción</h2>
        <p className="text-sm font-bold text-stone-500 mt-2 max-w-md mx-auto">
          Próximamente podrás ver gráficas detalladas y comparativas de rendimiento por lección y por habilidad.
        </p>
      </div>
    </div>
  );
}
