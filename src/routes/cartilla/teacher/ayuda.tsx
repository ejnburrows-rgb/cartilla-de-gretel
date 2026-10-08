import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/ayuda")({
  head: () => ({
    meta: [
      { title: "Ayuda para el Docente — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Guía completa para usar la app en clase: entrar, crear clase, agregar alumnos, asignar, presentar y ver progreso.",
      },
    ],
  }),
});
