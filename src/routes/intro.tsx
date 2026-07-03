import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IntroSplash } from "../components/intro/IntroSplash";

export const Route = createFileRoute("/intro")({
  component: IntroPage,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Bienvenidos" },
      {
        name: "description",
        content:
          "Pantalla de bienvenida con la paleta pastel de La Cartilla de Gretel.",
      },
    ],
  }),
});

function IntroPage() {
  const navigate = useNavigate();
  return (
    <IntroSplash
      ctaLabel="Comenzar"
      onContinue={() => navigate({ to: "/cartilla/lecciones" })}
    />
  );
}
