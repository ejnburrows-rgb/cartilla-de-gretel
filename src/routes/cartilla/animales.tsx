import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { ANIMAL_GALLERY } from "@/content/animal-gallery";
import { GretelLiveAvatar, type GretelLiveAvatarRef } from "@/components/gretel/GretelLiveAvatar";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import "@/styles/animal-gallery.css";

export const Route = createFileRoute("/cartilla/animales")({
  component: AnimalGalleryPage,
  head: () => ({
    meta: [
      { title: "Conoce a los animales — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Conoce a todos los animales de La Cartilla de Gretel. Toca cada uno para escuchar su nombre.",
      },
    ],
  }),
});

function AnimalGalleryPage() {
  // Fixed-corner living Gretel, driven imperatively (she never subscribes to
  // the bus here) — tapping a card makes her say the animal's name with her
  // real cheer/talk animation, reusing the existing avatar API. She lives in a
  // fixed corner and never overlaps the grid (per the "never block content"
  // rule).
  const gretelRef = useRef<GretelLiveAvatarRef>(null);

  const handleTap = (word: string) => {
    gretelRef.current?.celebrate(word);
  };

  return (
    <main className="animal-gallery" data-testid="animal-gallery">
      <div style={{ maxWidth: "66rem", margin: "0 auto" }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline"
        >
          <ArrowLeft size={16} aria-hidden />
          Volver al inicio
        </Link>
      </div>

      <header className="animal-gallery__head">
        <h1 className="animal-gallery__title">Conoce a los animales</h1>
        <p className="animal-gallery__subtitle">Toca cada animal para escuchar su nombre.</p>
      </header>

      <ul className="animal-gallery__grid" role="list">
        {ANIMAL_GALLERY.map((animal, i) => (
          <li
            key={animal.word}
            className="animal-card"
            style={
              {
                "--ag-accent": animal.accent,
                // stagger the ambient float so the grid never moves in lockstep
                "--ag-float-delay": `${(i % 7) * 0.55}s`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className="animal-card__tap"
              onClick={() => handleTap(animal.word)}
              aria-label={`Escuchar: ${animal.word}`}
            >
              <span className="animal-card__imgwrap">
                <LivingIllustration
                  className="animal-card__living"
                  src={animal.illustrationSrc}
                  alt={animal.word}
                  loading="lazy"
                />
              </span>
              <span className="animal-card__word">{animal.word}</span>
            </button>

            <Link
              to="/cartilla/leccion/$n"
              params={{ n: String(animal.lessonNumber) }}
              className="animal-card__link"
            >
              Ir a la lección {animal.lessonNumber}
            </Link>
          </li>
        ))}
      </ul>

      {/* Fixed-corner living host — never overlaps the grid content. */}
      <div className="fixed bottom-3 right-3 z-40 pointer-events-none no-print" aria-hidden="true">
        <GretelLiveAvatar ref={gretelRef} size="sm" bubblePosition="left" />
      </div>
    </main>
  );
}
