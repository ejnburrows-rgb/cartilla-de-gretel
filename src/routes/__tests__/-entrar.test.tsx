/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: () => () => {},
}));

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => null,
}));

afterEach(() => cleanup());

const BANNED = [
  "Esperando recortes",
  "recortes transparentes",
  "PNG transparente",
  "subas las imágenes",
  "TODO",
  "WIP",
  "placeholder",
  "LANY",
  "Lany Books",
  "jardín de las letras",
  "Gretel te espera",
];

async function renderEntrar() {
  const { Route: EntrarRoute } = await import("../entrar");
  const rootRoute = createRootRoute();
  const entrarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/entrar",
    component: EntrarRoute.options.component!,
  });
  const routeTree = rootRoute.addChildren([entrarRoute]);
  const history = createMemoryHistory({ initialEntries: ["/entrar"] });
  const router = createRouter({ routeTree, history });
  const view = render(<RouterProvider router={router} />);
  await router.load();
  return view;
}

describe('Entrar ("/entrar") — same approved single welcome screen', () => {
  it("renders the approved welcome with the two entry choices", async () => {
    await renderEntrar();
    const splash = await screen.findByTestId("welcome-splash");
    expect(splash.textContent).toContain("La Cartilla de Gretel");
    expect(splash.textContent).toContain("¡Hola! Soy Gretel. Vamos a aprender a leer juntos.");

    const comenzar = await screen.findByTestId("wc-entrar");
    expect(comenzar.textContent?.trim()).toBe("Comenzar");
    expect(comenzar.getAttribute("href")).toBe("/cartilla/lecciones");
    expect(screen.getByRole("link", { name: "Soy maestro" }).getAttribute("href")).toBe("/cartilla/teacher/crm");

    const imgs = Array.from(splash.querySelectorAll("img"));
    expect(imgs).toHaveLength(1);
    expect(imgs[0]?.getAttribute("src")).toBe("/cartilla/images/gretel/gretel-approved-master.png");
  }, 20_000);

  it("shows no fabricated captions or legacy credits", async () => {
    const { container } = await renderEntrar();
    await screen.findByTestId("welcome-splash");
    const text = (container.textContent || "").toLowerCase();
    for (const banned of BANNED) {
      expect(text).not.toContain(banned.toLowerCase());
    }
    expect(screen.queryByTestId("home-footer-credits")).toBeNull();
  });
});
