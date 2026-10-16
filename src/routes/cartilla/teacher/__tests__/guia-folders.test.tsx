/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { Route as GuiaRoute } from "../guia.index.lazy";

function renderGuia(initialUrl: string) {
  const history = createMemoryHistory({ initialEntries: [initialUrl] });
  const rootRoute = createRootRouteWithContext()({ component: Outlet });
  const guiaRoute = createRoute({
    // Trailing slash mirrors the lazy file route's id ("/cartilla/teacher/guia/")
    // so Route.useSearch() inside the component resolves to this active match.
    getParentRoute: () => rootRoute,
    path: "/cartilla/teacher/guia/",
    component: GuiaRoute.options.component,
  });
  const routeTree = rootRoute.addChildren([guiaRoute]);
  const router = createRouter({ routeTree, history });
  render(<RouterProvider router={router} />);
  return router;
}

describe("/cartilla/teacher/guia — ?folder= param sync (#835)", () => {
  it("opens the folder named by the ?folder= URL param on mount", async () => {
    renderGuia("/cartilla/teacher/guia/?folder=guia");
    // Guia folder detail content: one link per lesson row.
    const links = await screen.findAllByText("Ver guion completo de la lección");
    expect(links.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });

  it("updates the visible folder when the ?folder= param changes without remount", async () => {
    const router = renderGuia("/cartilla/teacher/guia/?folder=guia");
    expect((await screen.findAllByText("Ver guion completo de la lección")).length).toBeGreaterThan(0);

    await act(async () => {
      router.history.push("/cartilla/teacher/guia/?folder=tablas");
    });

    // Old folder content gone, new folder content visible, still open.
    await waitFor(() => {
      expect(screen.queryByText("Ver guion completo de la lección")).toBeNull();
    });
    expect(screen.getAllByText("a · e · i · o · u").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
  });

  it("manual open and close keep working with no URL param", async () => {
    renderGuia("/cartilla/teacher/guia/");
    await screen.findByRole("heading", { level: 1, name: "Guía del profesor" });
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Tareas para el hogar/ }));
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull();
    });
  });
});
