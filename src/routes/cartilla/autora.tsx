import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award, BookOpen, Mail, ExternalLink } from "lucide-react";
import portrait from "@/assets/autora-portrait.png";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";

export const Route = createFileRoute("/cartilla/autora")({
  component: Autora,
  head: () => ({ meta: [{ title: "Leonor Lopetegui — La autora" }] }),
});

const PURCHASE_URL = "https://doublermuybien-com.3dcartstores.com/";
const CONTACT_EMAIL = "info@doublerpublishing.com";

function Autora() {
  const { lang } = useLanguage();
  const t = sCopy;
  return (
    <main className="min-h-screen bg-[hsl(40,40%,96%)] text-[hsl(25,25%,15%)]">
      <header className="border-b border-[hsl(25,15%,80%)]/60 bg-[hsl(40,40%,96%)]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/cartilla"
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-[hsl(25,25%,30%)] hover:text-[hsl(25,25%,10%)]"
            >
              <ArrowLeft className="w-4 h-4" /> {t.cartilla[lang]}
            </Link>
            <div className="hidden sm:block"><LanguageToggle /></div>
          </div>
          <p
            className="hidden md:block text-[11px] tracking-[0.45em] uppercase text-[hsl(25,25%,35%)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Double R Publishing · est. 2004
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hidden sm:inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-[hsl(25,25%,30%)] hover:text-[hsl(25,25%,10%)]"
          >
            <Mail className="w-4 h-4" /> {t.contacto[lang]}
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 order-2 md:order-1">
          <p className="text-[11px] tracking-[0.45em] uppercase text-[hsl(15,55%,38%)] mb-8">
            {t.educadora[lang]}
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
            {t.bioLeonor[lang]}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={PURCHASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[hsl(15,55%,32%)] text-[hsl(40,40%,97%)] tracking-[0.2em] uppercase text-[11px] hover:bg-[hsl(15,55%,24%)] transition"
            >
              <BookOpen className="w-4 h-4" /> {t.comprarCartilla[lang]}
            </a>
          </div>
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
            ["+50", t.anosAula[lang]],
            ["★", t.premioCervantes[lang]],
            ["10+", t.anosLiderando[lang]],
            ["6 jun 2014", t.diaLopetegui[lang]],
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
            {t.citaLeonor[lang]}
          </blockquote>
          <p className="mt-8 text-[11px] tracking-[0.4em] uppercase text-[hsl(25,25%,40%)]">
            — Leonor Lopetegui
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            t.premio1[lang],
            t.premio2[lang],
            t.premio3[lang],
            t.premio4[lang],
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
            {t.paraEscuelas[lang]}
          </h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-3 px-9 py-4 bg-[hsl(40,40%,94%)] text-[hsl(25,25%,12%)] tracking-[0.25em] uppercase text-[11px] hover:bg-white transition"
          >
            <Mail className="w-4 h-4" /> {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
