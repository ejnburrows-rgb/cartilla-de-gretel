import { assetPath } from "@/lib/assets";

export function CoverInspiredPanel({ compact = false }: { compact?: boolean }) {
  return (
    <figure className="relative overflow-hidden rounded-[2rem] border-2 border-stone-300 bg-[#FAF7F0] p-4 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:rotate-1 hover:scale-[1.015]">
      {/* 3D realistic left spine binding shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-10" />
      <img
        src={assetPath("cartilla/images/original/cover.jpg")}
        alt="Portada original de La Cartilla de Gretel"
        className="mx-auto h-auto w-full rounded-[1.25rem] object-contain shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-stone-200/40 bg-white"
        loading="eager"
      />
      <figcaption className="sr-only">
        Portada original de La Cartilla de Gretel, autora Leonor Lopetegui.
      </figcaption>
      {!compact && (
        <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.2em] text-[hsl(230,16%,38%)]">
          Cuaderno oficial del estudiante
        </p>
      )}
    </figure>
  );
}
