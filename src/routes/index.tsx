import { createFileRoute } from "@tanstack/react-router";
import { WelcomeSplash } from "@/components/intro/WelcomeSplash";
import { ThemeToggle } from "@/components/ThemeToggle";

// The homepage renders the welcome splash with a dark/light theme toggle in
// the top-right corner (previously the homepage had no theme control — the
// controls only appeared on some cartilla routes). The toggle is placed here
// at the route level so the splash component itself stays untouched.
function HomePage() {
  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <WelcomeSplash />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
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
