import { createFileRoute, Link } from "@tanstack/react-router";
import { ActivityBadge } from "../components/activities/ActivityBadge";
import {
  ALL_ACTIVITY_KINDS,
  ACTIVITY_REGISTRY,
} from "../components/activities/activityIcons";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPreview,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Actividades" },
      {
        name: "description",
        content:
          "Catálogo visual de los 8 tipos de actividad usados en la Cartilla.",
      },
    ],
  }),
});

function ActivitiesPreview() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.58),transparent_32%),linear-gradient(135deg,#fff8ed_0%,#f9efe0_48%,#e8f4ef_100%)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-full border border-[hsl(28,30%,18%)]/15 bg-white/70 px-4 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Inicio
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[hsl(31,56%,48%)]">
            Catálogo de actividades
          </p>
        </header>

        <h1 className="mb-2 text-4xl font-black text-[hsl(197,41%,22%)]">
          Actividades
        </h1>
        <p className="mb-8 max-w-2xl text-base font-bold text-[hsl(28,30%,18%)]/65">
          Los 8 tipos de actividad que aparecen en La Cartilla de Gretel. Cada
          tipo tiene su propio ícono y color para que el estudiante reconozca
          de un vistazo qué va a hacer.
        </p>

        <section aria-label="Tipos de actividad" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_ACTIVITY_KINDS.map((kind) => (
            <div key={kind} className="kid-card flex items-center gap-4 p-5">
              <ActivityBadge kind={kind} size="lg" showLabel />
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-[hsl(28,30%,18%)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-black text-[hsl(197,41%,22%)]">
            Tamaños
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <ActivityBadge kind="read" size="sm" />
            <ActivityBadge kind="read" size="md" />
            <ActivityBadge kind="read" size="lg" />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[hsl(28,30%,18%)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-lg font-black text-[hsl(197,41%,22%)]">
            Variante sólida
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {ALL_ACTIVITY_KINDS.map((kind) => (
              <ActivityBadge
                key={kind}
                kind={kind}
                size="md"
                variant="solid"
                showLabel={false}
              />
            ))}
          </div>
        </section>

        <footer className="mt-12 text-xs font-bold text-[hsl(28,30%,18%)]/45">
          {Object.keys(ACTIVITY_REGISTRY).length} tipos registrados · lucide-react
        </footer>
      </div>
    </main>
  );
}
