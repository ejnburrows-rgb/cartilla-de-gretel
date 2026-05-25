import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  Image,
  Layers3,
  Presentation,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { CoverInspiredPanel } from "@/components/CoverInspiredPanel";
import { useStudentSession } from "@/lib/student-session";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { getRemasterProgress } from "@/lib/remaster-assets";
import { getDeadlineRemasterQueue, getDeadlineRemasterSummary } from "@/lib/remaster-batches";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaHome,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - CRM de aula" },
      {
        name: "description",
        content:
          "CRM de aula para La Cartilla de Gretel: cuaderno real del estudiante, progreso de alumnos y flipchart del maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel - CRM de aula" },
      {
        property: "og:description",
        content:
          "Del libro físico al CRM de aula: cuaderno del estudiante, panel docente y presentación del maestro.",
      },
    ],
  }),
});

function CartillaHome() {
  const session = useStudentSession();
  const remaster = getRemasterProgress();
  const deadlineSummary = getDeadlineRemasterSummary();
  const deadlineQueue = getDeadlineRemasterQueue(6);

  const primaryCards = [
    {
      href: "/cartilla/lecciones",
      icon: BookOpen,
      title: "Abrir el cuaderno real",
      desc: "Las 24 lecciones están abiertas. Cada lección muestra páginas del cuaderno, escaneos conectados, calidad mejorada cuando existe y actividades generadas desde texto verificado.",
      tone: "bg-[hsl(197,41%,22%)]",
      action: "Ver las 24 lecciones",
    },
    {
      href: "/cartilla/teacher",
      icon: GraduationCap,
      title: "Entrar al CRM docente",
      desc: "Clases, alumnos, códigos, tareas, progreso, tiempos, aciertos e historial. El papel se convierte en un sistema de seguimiento real.",
      tone: "bg-vowel-o",
      action: "Abrir panel docente",
    },
    {
      href: "/cartilla/teacher/flipchart",
      icon: Presentation,
      title: "Proyectar el libro del maestro",
      desc: "Flipchart para clase, con modo proyección, controles de pantalla completa, avance por página y fallback al escaneo original.",
      tone: "bg-vowel-a",
      action: "Abrir flipchart",
    },
  ];

  const proofItems = [
    {
      icon: Image,
      title: "Libro primero",
      desc: "El lado del estudiante parte de la cartilla: páginas, lecciones, escaneos y lectura guiada.",
    },
    {
      icon: Database,
      title: "CRM después",
      desc: isSupabaseConfigured
        ? "Supabase está configurado para cuentas reales, clases y progreso."
        : "El sistema corre con modo local hasta que las variables Supabase estén activas en producción.",
    },
    {
      icon: Layers3,
      title: "Calidad visual",
      desc: `${remaster.corrected} imágenes ya tienen corrección/V2 utilizable; ${remaster.total} imágenes están inventariadas.`,
    },
    {
      icon: CheckCircle2,
      title: "Sin demo como meta",
      desc: "La navegación empuja al cuaderno, CRM docente y flipchart: el producto real, no una maqueta suelta.",
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-white/92 p-3 shadow-xl shadow-primary/10 backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-3 text-sm font-black text-foreground/70 hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href="/cartilla/lecciones" className="rounded-2xl bg-[hsl(197,41%,22%)] px-4 py-3 text-sm font-black text-white shadow-sm">Cuaderno</a>
            <a href="/cartilla/teacher" className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm">CRM docente</a>
            <a href="/cartilla/teacher/flipchart" className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm">Flipchart</a>
          </div>
        </nav>

        <header className="mt-8 grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <CoverInspiredPanel compact />
          <div className="text-center lg:text-left">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-vowel-a">Del libro físico al CRM de aula</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.95] text-[hsl(197,41%,22%)] sm:text-6xl lg:text-7xl">
              La Cartilla convertida en sistema real de clase.
            </h1>
            <p className="mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-foreground/75">
              El corazón del proyecto es claro: el estudiante ve el cuaderno como libro, el maestro proyecta la presentación como libro, y el progreso se guarda en un CRM docente.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a href="/cartilla/lecciones" className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[hsl(197,41%,22%)] px-6 py-4 text-base font-black text-white shadow-xl shadow-primary/20">
                Ver el cuaderno ahora
              </a>
              <a href="/cartilla/teacher/flipchart" className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-vowel-a/30 bg-white px-6 py-4 text-base font-black text-vowel-a shadow-sm">
                Ver presentación maestro
              </a>
            </div>
            {session && (
              <a href="/cartilla/mi-progreso" className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-black text-primary">
                <BarChart3 className="h-4 w-4" /> Continuar progreso de {session.studentName}
              </a>
            )}
          </div>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {primaryCards.map((card) => (
            <a key={card.href} href={card.href} className="kid-card group flex min-h-72 flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div>
                <div className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl ${card.tone} text-white transition duration-300 group-hover:scale-105`}>
                  <card.icon className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-2xl font-black leading-tight text-[hsl(197,41%,22%)]">{card.title}</h2>
                <p className="mt-3 text-base font-semibold leading-relaxed text-foreground/72">{card.desc}</p>
              </div>
              <span className="mt-5 inline-flex text-sm font-black text-primary group-hover:underline">{card.action} →</span>
            </a>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-[hsl(197,41%,22%)]/15 bg-white/92 p-5 shadow-xl shadow-primary/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-vowel-a/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-vowel-a">
                <Sparkles className="h-4 w-4" /> Estado de construcción real
              </p>
              <h2 className="mt-3 text-3xl font-black text-[hsl(197,41%,22%)]">
                La ruta principal ya está centrada en libro + CRM + flipchart.
              </h2>
              <p className="mt-2 max-w-4xl text-base font-semibold leading-relaxed text-foreground/70">
                Lo importante no es un demo: es que el material viejo de papel se convierta en una herramienta usable para clase, con lectura, seguimiento, asignaciones, proyección y mejora visual constante.
              </p>
            </div>
            <a href="/cartilla/unirse" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20">
              <UserPlus className="h-4 w-4" /> Unirse a clase
            </a>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {proofItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-foreground/10 bg-card p-4">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base font-black text-[hsl(197,41%,22%)]">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-foreground/10 bg-[hsl(197,41%,22%)] p-5 text-white shadow-xl shadow-primary/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">Siguiente lote visual</p>
              <h2 className="mt-2 text-3xl font-black">Remasterización y corrección siguen en cola.</h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/75">
                {deadlineSummary.usableNow} imágenes ya tienen corrección/V2 utilizable. Quedan {deadlineSummary.studentPending} del cuaderno y {deadlineSummary.teacherPending} del flipchart pendientes en cola.
              </p>
            </div>
            <a href="/cartilla/teacher/remaster-review" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-[hsl(197,41%,22%)] shadow-lg">
              Revisar calidad
            </a>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {deadlineQueue.map((asset) => (
              <div key={asset.originalSourcePath} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white/80">{asset.label}</span>
                  <span className="text-[10px] font-bold uppercase text-white/50">{asset.type === "student-workbook" ? "Cuaderno" : "Maestro"}</span>
                </div>
                <p className="mt-3 truncate font-mono text-xs text-white/85">{asset.originalSourcePath}</p>
                <p className="mt-1 truncate font-mono text-[10px] text-white/50">→ {asset.remasteredPathV2 ?? asset.remasteredPath}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
