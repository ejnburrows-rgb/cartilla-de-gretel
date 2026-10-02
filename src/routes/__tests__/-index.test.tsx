/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => stubMatchMedia(false));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function renderSplash() {
  const { Route: IndexRoute } = await import("../index");
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: IndexRoute.options.component!,
  });
  const routeTree = rootRoute.addChildren([indexRoute]);
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({ routeTree, history });
  render(<RouterProvider router={router} />);
  await router.load();
}

describe('Approved single welcome ("/")', () => {
  it("shows the approved title, greeting, and two entry choices", async () => {
    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    expect(splash.textContent).toContain("La Cartilla de Gretel");
    expect(splash.textContent).toContain("¡Hola! Soy Gretel. Vamos a aprender a leer juntos.");

    const comenzar = await screen.findByTestId("wc-entrar");
    expect(comenzar.textContent?.trim()).toBe("Comenzar");
    expect(comenzar.getAttribute("href")).toBe("/cartilla/lecciones");

    const teacher = screen.getByRole("link", { name: "Soy maestro" });
    expect(teacher.getAttribute("href")).toBe("/cartilla/teacher/crm");
  });

  it("keeps title and greeting as real HTML text", async () => {
    await renderSplash();
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("La Cartilla de Gretel");
  });

  it("uses only the owner-approved Gretel master", async () => {
    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    const imgs = Array.from(splash.querySelectorAll("img"));
    expect(imgs).toHaveLength(1);
    expect(imgs[0]?.getAttribute("src")).toBe("/cartilla/images/gretel/gretel-approved-master.png");
    expect(imgs[0]?.getAttribute("alt")).toBe("Gretel");
  });

  it("contains no generated or garden art reference", async () => {
    await renderSplash();
    const html = (await screen.findByTestId("welcome-splash")).innerHTML;
    expect(html).not.toContain("/art/generated/");
    expect(html).not.toContain("/art/hd/garden/");
  });

  it("is Spanish-only", async () => {
    await renderSplash();
    expect((await screen.findByTestId("welcome-splash")).textContent).not.toMatch(/\b(welcome|enter|start|login|sign in)\b/i);
  });
});
