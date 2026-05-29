import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({
    meta: [
      { title: "Créditos — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Créditos de La Cartilla de Gretel: autora, ilustradora, desarrollo, editorial e ISBN.",
      },
    ],
  }),
});

const credits = [
  ["Autora", "Leonor Lopetegui"],
  ["Ilustraciones", "Estela de Armas Plasencia"],
  ["Digital adaptation", "Emilio Jose Novo"],
  ["Imprint", "LANY Books LLC"],
  ["ISBN del libro", "978-1-7368420-7-2"],
  ["ISBN de la carpeta", "0-971-8696-8-5"],
] as const;

function CreditsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" /> Inicio
        </Link>

        <header className="mt-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-4xl font-black">Créditos</h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground/70">
            La Cartilla de Gretel conserva el trabajo original de su autora e ilustradora en esta
            edición digital para lectura y aula.
          </p>
        </header>

        <section className="kid-card mt-10 overflow-hidden p-0">
          {credits.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 border-b border-foreground/10 px-6 py-5 last:border-b-0 sm:grid-cols-[12rem_1fr]"
            >
              <dt className="text-xs font-black uppercase tracking-wide text-foreground/50">
                {label}
              </dt>
              <dd className="text-lg font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
