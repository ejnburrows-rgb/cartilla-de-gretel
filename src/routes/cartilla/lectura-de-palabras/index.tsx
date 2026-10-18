import { createFileRoute } from "@tanstack/react-router";
import { LecturaPalabrasEntrance } from "@/components/cartilla/lectura-palabras/LecturaPalabrasEntrance";

export const Route = createFileRoute("/cartilla/lectura-de-palabras/")({
  component: LecturaPalabrasEntrance,
  head: () => ({
    meta: [
      { title: "Lectura de palabras — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Elige una letra y lee palabras con las sílabas de La Cartilla de Gretel.",
      },
    ],
  }),
});
