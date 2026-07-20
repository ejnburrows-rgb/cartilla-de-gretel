import { createFileRoute } from "@tanstack/react-router";
import { WelcomeSplash } from "@/components/intro/WelcomeSplash";

export const Route = createFileRoute("/")({
  component: WelcomeSplash,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel" },
      {
        name: "description",
        content: "La Cartilla de Gretel — aprendamos a leer juntos.",
      },
    ],
  }),
});
