import { getDemoStudentSession } from "@/lib/demo-student-session";

export function DemoStudentBanner() {
  const demo = getDemoStudentSession();
  if (!demo) return null;
  return <aside className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-100 p-3 text-sm text-amber-950" aria-label="Alumno de demostración">
    <div><strong>Alumno de demostración · {demo.studentName} · {demo.className}</strong><p>El trabajo se guarda en este navegador y actualiza la clase de ejemplo.</p></div>
    <a href={`/cartilla/teacher/crm/${demo.classId}/${demo.studentId}`} className="rounded-xl bg-white px-4 py-3 font-bold border border-amber-200">Volver al CRM</a>
  </aside>;
}
