import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reader } from "@/components/Reader";

export const Route = createFileRoute("/book")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lector PDF" },
      { name: "description", content: "Lector PDF con progreso y temporizador por página." },
    ],
  }),
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="flex items-center justify-center h-screen text-foreground/60">Cargando…</div>
    );
  return <Reader />;
}
