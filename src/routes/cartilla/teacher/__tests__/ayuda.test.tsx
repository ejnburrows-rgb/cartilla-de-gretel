/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { Route as AyudaRoute } from "../ayuda";

function renderAyuda() {
  const history = createMemoryHistory({ initialEntries: ["/cartilla/teacher/ayuda"] });
  const rootRoute = createRootRouteWithContext()({ component: Outlet });
  const ayudaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cartilla/teacher/ayuda",
    component: AyudaRoute.options.component,
  });
  const routeTree = rootRoute.addChildren([ayudaRoute]);
  const router = createRouter({ routeTree, history });
  render(<RouterProvider router={router} />);
}

describe("/cartilla/teacher/ayuda — teacher how-to page", () => {
  it("renders the page title", async () => {
    renderAyuda();
    const heading = await screen.findByRole("heading", { level: 1, name: "Ayuda para el Docente" });
    expect(heading).toBeTruthy();
  });

  it("covers all 10 required sections as h2 headings", async () => {
    renderAyuda();
    await screen.findByRole("heading", { level: 1, name: "Ayuda para el Docente" });
    const expectedTitles = [
      "Cómo entrar",
      "Cómo crear o abrir una clase",
      "Cómo agregar estudiantes / código de unión",
      "Cómo asignar lecciones o actividades",
      "Cómo presentar el flipchart",
      "Cómo ver progreso por estudiante y por lección",
      "Cómo usar la Guía del profesor por lección",
      "Cómo el estudiante usa el cuaderno (para poder guiarlo)",
      "Qué NO hacer",
      "Orden típico de una clase con esta app",
    ];
    for (const title of expectedTitles) {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: new RegExp(escapeRegExp(title)),
      });
      expect(heading).toBeTruthy();
    }
  });

  it("never invents printed guide content — mentions the honest not-in-repo status instead", async () => {
    renderAyuda();
    await screen.findByRole("heading", { level: 1, name: "Ayuda para el Docente" });
    expect(screen.getAllByText(/SOURCE-NOT-IN-REPO/).length).toBeGreaterThan(0);
  });

  it("links to the real Clase (CRM) and Guía routes, not dead ends", async () => {
    renderAyuda();
    const claseLink = await screen.findByRole("link", { name: "Ir a Clase" });
    expect(claseLink.getAttribute("href")).toBe("/cartilla/teacher/crm");
    const guiaLink = screen.getByRole("link", { name: "Ir a la Guía" });
    expect(guiaLink.getAttribute("href")).toBe("/cartilla/teacher/guia");
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
