import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award } from "lucide-react";
import portrait from "@/assets/autora-portrait.png";

export const Route = createFileRoute("/cartilla/autora")({
  component: Autora,
  head: () => ({ meta: [{ title: "Leonor Lopetegui — La autora" }] }),
});

function Autora() {
  return (
    <main className="min-h-screen bg-[hsl(40,40%,96%)] text-[hsl(25,25%,15%)]">
      <header className="border-b border-[hsl(25,15%,80%)]/60 bg-[hsl(40,40%,96%)]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-[hsl(25,25%,30%)] hover:text-[hsl(25,25%,10%)]"
          >
            <ArrowLeft className="w-4 h-4" /> Cartilla
          </Link>
          <p
            className="hidden md:block text-[11px] tracking-[0.45em] uppercase text-[hsl(25,25%,35%)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            La Cartilla de Gretel
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 order-2 md:order-1">
          <p className="text-[11px] tracking-[0.45em] uppercase text-[hsl(15,55%,38%)] mb-8">
            Educadora · Autora · Editora
          </p>
          <h1
            className="text-5xl md:text-7xl leading-[1.02] tracking-tight mb-8 text-[hsl(25,25%,12%)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Leonor
            <br />
            <span className="italic font-normal text-[hsl(15,55%,32%)]">Lopetegui</span>
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed text-[hsl(25,25%,28%)] max-w-prose"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Casi cincuenta años enseñando español en las aulas del Condado de Miami-Dade. Autora de
            La Cartilla de Gretel, un método propio —fonético, visual y entrañable— que ha
            acompañado a miles de familias.
          </p>
        </div>
        <div className="md:col-span-5 order-1 md:order-2 relative">
          <img
            src={portrait}
            alt="Retrato de Leonor Lopetegui"
            className="w-full h-auto object-cover shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]"
          />
        </div>
      </section>

      <section className="bg-[hsl(25,25%,12%)] text-[hsl(40,40%,92%)]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ["+50", "años en el aula"],
            ["★", "Premio Cervantes"],
            ["10+", "años liderando bilingüe"],
            ["6 jun 2014", "Día de la Sra. Lopetegui"],
          ].map(([n, l]) => (
            <div key={l} className="text-center md:text-left">
              <p
                className="text-3xl md:text-4xl mb-1 text-[hsl(40,40%,96%)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {n}
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[hsl(40,40%,75%)]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[hsl(35,30%,93%)] border-y border-[hsl(25,15%,80%)]/60">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p
            className="text-6xl leading-none mb-4 text-[hsl(15,55%,38%)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            “
          </p>
          <blockquote
            className="italic text-2xl md:text-[28px] leading-snug text-[hsl(25,25%,18%)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Enseñar a leer en la lengua materna es regalarle al niño la llave de su propio mundo.
          </blockquote>
          <p className="mt-8 text-[11px] tracking-[0.4em] uppercase text-[hsl(25,25%,40%)]">
            — Leonor Lopetegui
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            "Premio Cervantes — Nova Southeastern University",
            "Maestra del Año 2001–2002 — James H. Bright Elementary",
            "Educadora Bilingüe del Año — Florida Bilingual Association",
            "Día de la Sra. Leonor Lopetegui — Sweetwater · 2014",
          ].map((h) => (
            <li key={h} className="flex gap-3 items-start text-[hsl(25,25%,22%)]">
              <Award className="w-4 h-4 mt-1 text-[hsl(15,55%,38%)] shrink-0" />
              <span className="italic">{h}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[hsl(25,25%,12%)] text-[hsl(40,40%,94%)]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2
            className="text-4xl md:text-5xl mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Para escuelas y familias
          </h2>
          <p className="text-sm uppercase tracking-[0.25em] text-[hsl(40,40%,78%)]">
            Lectura inicial · practica · seguimiento
          </p>
        </div>
      </section>
    </main>
  );
}
