import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Layers3, Presentation, Sparkles, Users } from "lucide-react";
import { CoverInspiredPanel } from "@/components/CoverInspiredPanel";
import { routePath } from "@/lib/assets";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel - Paper to CRM Classroom System" },
      {
        name: "description",
        content:
          "La Cartilla de Gretel converted from paper workbook into a classroom CRM with student workbook, teacher dashboard, and flipchart presentation.",
      },
    ],
  }),
});

const primaryActions = [
  {
    href: "/cartilla/lecciones",
    icon: BookOpen,
    label: "Student workbook",
    desc: "The real 24-lesson book path, scans, page turning, verified text, and reading activities.",
    color: "bg-[hsl(197,41%,22%)]",
  },
  {
    href: "/cartilla/teacher",
    icon: GraduationCap,
    label: "Teacher CRM",
    desc: "Classes, student codes, assignments, progress, time, accuracy, and classroom records.",
    color: "bg-vowel-o",
  },
  {
    href: "/cartilla/teacher/flipchart",
    icon: Presentation,
    label: "Teacher flipchart",
    desc: "The teacher presentation side as a projected book with quality mode and full-screen controls.",
    color: "bg-vowel-a",
  },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 rounded-3xl border border-foreground/10 bg-white/92 p-3 shadow-xl shadow-primary/10 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="px-2">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-vowel-a">Paper-to-CRM classroom system</p>
          <p className="text-lg font-black text-[hsl(197,41%,22%)]">La Cartilla de Gretel</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {primaryActions.map((action) => (
            <a key={action.href} href={routePath(action.href)} className="group grid min-h-20 grid-cols-[44px_1fr] items-center gap-3 rounded-2xl border border-foreground/10 bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-primary">
              <span className={`${action.color} flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-black/10`}>
                <action.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-black leading-tight sm:text-base">{action.label}</span>
                <span className="hidden text-xs font-semibold text-foreground/60 sm:block">Open</span>
              </span>
            </a>
          ))}
        </div>
      </nav>

      <header className="mx-auto grid max-w-7xl items-center gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <CoverInspiredPanel />
        <div className="text-center lg:text-left">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-vowel-a">The main goal</p>
          <h1 className="mt-4 text-4xl font-black leading-[0.95] text-[hsl(197,41%,22%)] sm:text-6xl lg:text-7xl">
            Old-school book material turned into a working classroom CRM.
          </h1>
          <p className="mt-5 max-w-4xl text-xl font-semibold leading-relaxed text-foreground/75">
            The student side follows the official workbook page by page. The teacher side tracks the class like a CRM. The flipchart side presents the teacher book for the classroom. This is the heart of the product.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <a href={routePath("/cartilla/lecciones")} className="tap-target inline-flex items-center justify-center gap-3 rounded-2xl bg-[hsl(197,41%,22%)] px-5 py-4 text-base font-black text-white shadow-lg shadow-[hsl(197,41%,22%)]/25">
              <BookOpen className="h-5 w-5" /> See workbook
            </a>
            <a href={routePath("/cartilla/teacher")} className="tap-target inline-flex items-center justify-center gap-3 rounded-2xl bg-vowel-o px-5 py-4 text-base font-black text-white shadow-lg shadow-vowel-o/25">
              <Users className="h-5 w-5" /> See CRM
            </a>
            <a href={routePath("/cartilla/teacher/flipchart")} className="tap-target inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-vowel-a/30 bg-card px-5 py-4 text-base font-black text-vowel-a shadow-lg shadow-primary/10">
              <Presentation className="h-5 w-5" /> See flipchart
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-4 pb-12 md:grid-cols-3">
        {primaryActions.map((action) => (
          <a key={action.href} href={routePath(action.href)} className="kid-card group flex min-h-56 flex-col justify-between p-6 transition hover:-translate-y-1 hover:shadow-2xl">
            <div>
              <div className={`${action.color} flex h-14 w-14 items-center justify-center rounded-2xl text-white`}>
                <action.icon className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-[hsl(197,41%,22%)]">{action.label}</h2>
              <p className="mt-2 text-base font-semibold leading-relaxed text-foreground/70">{action.desc}</p>
            </div>
            <span className="mt-5 inline-flex text-sm font-black text-primary group-hover:underline">Open this part →</span>
          </a>
        ))}
      </section>

      <section className="mx-auto mb-10 max-w-7xl rounded-[2rem] border-2 border-[hsl(197,41%,22%)]/15 bg-white/92 p-6 shadow-xl shadow-primary/10">
        <p className="inline-flex items-center gap-2 rounded-full bg-vowel-a/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-vowel-a">
          <Sparkles className="h-4 w-4" /> What should be visible
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-foreground/10 bg-card p-5">
            <BookOpen className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-xl font-black text-[hsl(197,41%,22%)]">Exact book direction</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/70">Students should feel they are inside the real cartilla, not a generic reading app.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card p-5">
            <Layers3 className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-xl font-black text-[hsl(197,41%,22%)]">Paper to system</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/70">The paper workflow becomes digital records, student progress, teacher decisions, and assignments.</p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card p-5">
            <Presentation className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-xl font-black text-[hsl(197,41%,22%)]">Classroom presentation</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/70">The teacher can project the lesson like an actual classroom book with a stronger visual presence.</p>
          </div>
        </div>
      </section>

      <footer className="pb-8 text-center text-sm font-bold text-foreground/55">
        <p>La Cartilla de Gretel · Leonor Lopetegui · classroom CRM build</p>
      </footer>
    </main>
  );
}
