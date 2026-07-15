import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookMarked, Check } from "lucide-react";
import { BRANDING, copyrightLine, pageTitle } from "@/lib/branding";
import { useLanguage } from "@/context/LanguageContext";
import { tCopy } from "@/content/teacher-copy";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/branding")({
  component: BrandingPage,
  head: () => ({ meta: [{ title: pageTitle("Marca y textos") }] }),
});

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-foreground/10">
      <div className="text-xs uppercase tracking-wider text-foreground/50 font-bold">{label}</div>
      <div className={`sm:col-span-2 ${mono ? "font-mono text-sm" : ""}`}>{value}</div>
    </div>
  );
}

function BrandingPage() {
  const { lang } = useLanguage();
  const t = tCopy;
  const fields: Array<[string, string, boolean?]> = [
    [t.nombreProducto[lang], BRANDING.productName],
    [t.nombreCorto[lang], BRANDING.shortName],
    [t.eslogan[lang], BRANDING.productTagline],
    [t.autora[lang], BRANDING.author],
    [t.editorial[lang], BRANDING.publisher],
    [t.anoFundacion[lang], String(BRANDING.publisherEstablished)],
    [t.correoSoporte[lang], BRANDING.supportEmail, true],
    [t.colorPrincipal[lang], BRANDING.themeColor, true],
    [t.descLarga[lang], BRANDING.description],
    [t.lineaCopyright[lang], copyrightLine()],
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-3xl mx-auto">
      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {t.panelMaestro[lang]}
      </Link>

      <header className="mt-6 flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t.marcaTextos[lang]}</h1>
          <p className="text-foreground/70 mt-1">{t.fuenteUnica[lang]}</p>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border-2 border-foreground/10 bg-card p-6">
        <div className="flex items-center gap-2 text-success text-sm font-bold mb-2">
          <Check className="w-4 h-4" /> {t.configActiva[lang]}
        </div>
        <div>
          {fields.map(([label, value, mono]) => (
            <Row key={label} label={label} value={value} mono={mono} />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-dashed border-foreground/15 bg-muted/40 p-5 text-sm text-foreground/70">
        <p className="font-bold text-foreground mb-1">{t.comoCambiar[lang]}</p>
        <p>
          {t.comoCambiarDesc1[lang]}{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">src/lib/branding.ts</code>
          {t.comoCambiarDesc2[lang]}{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">BRANDING</code>{" "}
          {t.comoCambiarDesc3[lang]}{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">
            public/manifest.webmanifest
          </code>
          .
        </p>
      </section>
    </main>
  );
}
