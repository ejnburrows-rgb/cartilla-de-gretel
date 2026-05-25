import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Cloud,
  Database,
  GraduationCap,
  ListOrdered,
  Presentation,
  Rocket,
  ShieldCheck,
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
      { title: "La Cartilla de Gretel - plataforma de aula" },
      {
        name: "description",
        content:
          "Plataforma de aula para La Cartilla de Gretel: cuaderno del estudiante, panel docente y presentación del maestro.",
      },
      { property: "og:title", content: "La Cartilla de Gretel - plataforma de aula" },
      {
        property: "og:description",
        content:
          "Cuaderno del estudiante, panel docente y presentación del maestro en un solo sistema.",
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
      to: "/cartilla/lecciones" as const,
      icon: BookOpen,
      title: "Cuaderno del estudiante",
      desc: "Abrir las 24 lecciones del cuaderno. Puedes explorar sin iniciar sesión.",
      color: "bg-[hsl(197,41%,22%)]",
    },
    {
      to: "/cartilla/teacher" as const,
      icon: GraduationCap,
      title: "Panel docente",
      desc: "Gestionar clases, alumnos, asignaciones y progreso.",
      color: "bg-vowel-o",
    },
    {
      to: "/cartilla/teacher/flipchart" as const,
      icon: Presentation,
      title: "Presentación del maestro",
      desc: "Abrir el flipchart para seguir la clase en pantalla.",
      color: "bg-vowel-a",
    },
  ];

  const secondaryCards = [
    {
      to: session ? ("/cartilla/mi-progreso" as const) : ("/cartilla/unirse" as const),
      icon: session ? BarChart3 : UserPlus,
      title: session ? "Mi progreso" : "Unirse a una clase",
      desc: session
        ? `Hola ${session.studentName}. Revisa tu progreso guardado.`
        : "Opcional: usa un código de clase si tu maestro te lo dio.",
      color: "bg-vowel-i",
    },
    {
      to: "/book" as const,
      icon: ListOrdered,
      title: "PDF oficial",
      desc: "Consultar el PDF del libro cuando haga falta.",
      color: "bg-[hsl(197,41%,22%)]",
    },
  ];

  const launchItems = [
    {
      icon: CheckCircle2,
      title: "Páginas conectadas",
      desc: `${remaster.total} imágenes inventariadas: ${remaster.student} del cuaderno y ${remaster.teacher} del flipchart.`,
    },
    {
      icon: Sparkles,
      title: "Calidad / 3D activada",
      desc: `${remaster.corrected} imágenes corregidas o en V2; el visor usa modo proyección cuando existe.`,
    },
    {
      icon: Database,
      title: isSupabaseConfigured ? "Supabase conectado" : "Supabase listo para conectar",
      desc: isSupabaseConfigured
        ? "El sitio está leyendo las variables de Supabase en producción."
        : "El sistema conserva modo local hasta que Vercel tenga las variables Supabase.",
    },
    {
      icon: Cloud,
      title: "Automatización activada",
      desc: "GitHub Actions puede verificar, migrar Supabase y desplegar Vercel.",
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-col gap-3 rounded-3xl border border-foreground/10 bg-white/90 p-3 shadow-xl shadow-primary/10 backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl px-3 text-sm font-black text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to="/cartilla/lecciones" className="rounded-2xl bg-[hsl(197,41%,22%)] px-4 py-3 text-sm font-black text-white shadow-sm">
              Cuaderno
            </Link>
            <Link to="/cartilla/teacher" className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm">
              Docentes
            </Link>
            <Link to="/cartilla/teacher/flipchart" className="rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm font-black text-foreground/75 shadow-sm">
              Flipchart
            </Link>
          </div>
        </nav>

        <header className="mt-8 grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <CoverInspiredPanel compact />
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-vowel-a">Plataforma de aula</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[hsl(197,41%,22%)] sm:text-6xl">
              Cuaderno, panel docente y presentación en un solo sistema.
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-foreground/75">
              Explora el cuaderno sin iniciar sesión. Únete a una clase solo si tu maestro te dio un código para guardar progreso y recibir asignaciones.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {primaryCards.map((card) => (
            <Link key={card.to} to={card.to} className="kid-card group grid min-h-48 grid-cols-[72px_1fr] items-start gap-4 p-6 transition duration-300 hover:-translate-y-1">
              <div className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl ${card.color} text-white transition duration-300 group-hover:scale-105`}>
                <card.icon className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[hsl(197,41%,22%)]">{card.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/75">{card.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {secondaryCards.map((card) => (
            <Link key={card.to} to={card.to} className="rounded-3xl border border-foreground/10 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.color} text-white`}>
                  <card.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[hsl(197,41%,22%)]">{card.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{card.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border-2 border-[hsl(197,41%,22%)]/15 bg-white/90 p-5 shadow-xl shadow-primary/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-vowel-a/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-vowel-a">
                <Rocket className="h-4 w-4" /> Centro de avance real
              </p>
              <h2 className="mt-3 text-3xl font-black text-[hsl(197,41%,22%)]">
                Páginas, escaneos, corrección, calidad y proyección avanzando.
              </h2>
              <p className="mt-2 max-w-3xl text-base leading-relaxed text-foreground/70">
                El visor ya prioriza imágenes corregidas/V2 cuando existen, mantiene respaldo al escaneo original, sube la presencia visual con profundidad 3D y prepara el flujo para seguir corrigiendo páginas rápido.
              </p>
            </div>
            <Link to="/cartilla/teacher/flipchart" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20">
              Ver proyección
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {launchItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-foreground/10 bg-card p-4">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base font-black text-[hsl(197,41%,22%)]">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-foreground/10 bg-[hsl(197,41%,22%)] p-5 text-white shadow-xl shadow-primary/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">Cola de deadline</p>
              <h2 className="mt-2 text-3xl font-black">Siguiente lote de remasterización</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
                {deadlineSummary.usableNow} imágenes ya tienen corrección/V2 utilizable. Quedan {deadlineSummary.studentPending} del cuaderno y {deadlineSummary.teacherPending} del flipchart en cola.
              </p>
            </div>
            <Link to="/cartilla/teacher/remaster-review" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-[hsl(197,41%,22%)] shadow-lg">
              Revisar calidad
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {deadlineQueue.map((asset) => (
              <div key={asset.originalSourcePath} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white/80">
                    {asset.label}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-white/50">
                    {asset.type === "student-workbook" ? "Cuaderno" : "Maestro"}
                  </span>
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
