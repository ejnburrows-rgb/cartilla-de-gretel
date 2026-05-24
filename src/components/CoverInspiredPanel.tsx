export function CoverInspiredPanel({ compact = false }: { compact?: boolean }) {
  return (
    <figure className="relative overflow-hidden rounded-[2rem] border border-[hsl(42,52%,70%)] bg-white p-3 text-center shadow-2xl shadow-[hsl(230,35%,18%)]/15">
      <img
        src="/cartilla/images/original/cover.jpg"
        alt="Portada original de La Cartilla de Gretel"
        className="mx-auto h-auto w-full rounded-[1.5rem] object-contain"
        loading="eager"
      />
      <figcaption className="sr-only">
        Portada original de La Cartilla de Gretel, autora Leonor Lopetegui.
      </figcaption>
      {!compact && (
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-[hsl(230,16%,38%)]">
          Cuaderno oficial del estudiante
        </p>
      )}
    </figure>
  );
}
