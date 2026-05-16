const vowels = [
  ["a", "bg-vowel-a"],
  ["e", "bg-vowel-e"],
  ["i", "bg-vowel-i"],
  ["o", "bg-vowel-o"],
  ["u", "bg-vowel-u"],
] as const;

export function CoverInspiredPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[hsl(42,52%,70%)] bg-[linear-gradient(180deg,hsl(43,70%,91%),hsl(42,60%,76%))] p-6 text-center shadow-2xl shadow-[hsl(230,35%,18%)]/15">
      <div className="absolute inset-x-0 bottom-0 h-3 bg-vowel-a" aria-hidden="true" />
      <div className="mx-auto max-w-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(230,30%,28%)]">
          Edicion digital escolar
        </p>
        <h2
          className={`${compact ? "mt-4 text-4xl" : "mt-6 text-5xl sm:text-6xl"} font-black leading-[0.95] text-[hsl(197,41%,22%)]`}
        >
          La Cartilla
          <span className="block">de Gretel</span>
        </h2>
        <p className="mt-6 text-xl font-semibold text-[hsl(230,16%,32%)]">Leonor Lopetegui</p>
        <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3" aria-label="Vocales">
          {vowels.map(([letter, color]) => (
            <div
              key={letter}
              className={`${color} flex aspect-square items-center justify-center rounded-full text-4xl font-black text-white shadow-lg shadow-black/10 sm:text-5xl`}
            >
              {letter}
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[hsl(230,16%,38%)]">
          Lectura, practica y progreso
        </p>
      </div>
    </div>
  );
}
