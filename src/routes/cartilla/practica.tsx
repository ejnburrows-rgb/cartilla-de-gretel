import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/practica")({
  head: () => ({
    meta: [
      { title: "Práctica rápida — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Práctica breve de lectura y sílabas de La Cartilla de Gretel.",
      },
    ],
  }),
});
