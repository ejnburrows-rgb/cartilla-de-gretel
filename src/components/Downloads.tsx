const FILES = [
  {
    href: "/book/book.pdf",
    name: "La_cartilla_de_Gretel.pdf",
    label: "PDF",
    desc: "Libro del alumno completo, listo para leer o descargar",
  },
];

export function Downloads() {
  return (
    <section className="border-t border-border bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="w-full px-4 py-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-primary/15 bg-card/90 p-4 shadow-xl shadow-primary/5 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Descargar el libro
              </h2>
              <p className="mt-1 text-sm text-foreground/65">
                Acceso rápido al PDF oficial de la cartilla.
              </p>
            </div>
            <div className="grid gap-3 sm:min-w-72">
              {FILES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  download={f.name}
                  className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-primary/20 bg-background/85 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="min-w-0">
                    <div className="font-bold">{f.label}</div>
                    <div className="mt-0.5 text-xs text-foreground/60">{f.desc}</div>
                  </div>
                  <span className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition group-hover:scale-105">
                    ↓ Descargar
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
