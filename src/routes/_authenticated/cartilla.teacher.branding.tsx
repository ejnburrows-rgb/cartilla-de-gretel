import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookMarked, Check } from "lucide-react";
import { BRANDING, copyrightLine, pageTitle } from "@/lib/branding";

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
  const fields: Array<[string, string, boolean?]> = [
    ["Nombre del producto", BRANDING.productName],
    ["Nombre corto", BRANDING.shortName],
    ["Eslogan / tagline", BRANDING.productTagline],
    ["Autora", BRANDING.author],
    ["Editorial", BRANDING.publisher],
    ["Año de fundación", String(BRANDING.publisherEstablished)],
    ["Correo de soporte", BRANDING.supportEmail, true],
    ["Color principal", BRANDING.themeColor, true],
    ["Descripción larga", BRANDING.description],
    ["Línea de copyright", copyrightLine()],
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-3xl mx-auto">
      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Panel de Maestro
      </Link>

      <header className="mt-6 flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Marca y textos</h1>
          <p className="text-foreground/70 mt-1">
            Fuente única de los textos de marca. Estos valores aparecen en el título de las
            pestañas, el manifest (PWA), redes sociales y pies de página.
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border-2 border-foreground/10 bg-card p-6">
        <div className="flex items-center gap-2 text-success text-sm font-bold mb-2">
          <Check className="w-4 h-4" /> Configuración activa
        </div>
        <div>
          {fields.map(([label, value, mono]) => (
            <Row key={label} label={label} value={value} mono={mono} />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-dashed border-foreground/15 bg-muted/40 p-5 text-sm text-foreground/70">
        <p className="font-bold text-foreground mb-1">¿Cómo cambiar estos valores?</p>
        <p>
          Edita el archivo{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">src/lib/branding.ts</code>
          . Todas las pantallas que usan{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">BRANDING</code> se
          actualizan automáticamente. El nombre que aparece al instalar la app como PWA vive en{" "}
          <code className="font-mono bg-background px-1.5 py-0.5 rounded">
            public/manifest.webmanifest
          </code>
          .
        </p>
      </section>
    </main>
  );
}
