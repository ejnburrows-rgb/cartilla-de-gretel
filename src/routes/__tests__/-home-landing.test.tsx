/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { createMemoryHistory, createRouter, RouterProvider, createRootRoute, createRoute } from "@tanstack/react-router";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
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
];

describe("Home landing face-lift", () => {
  it("renders high-contrast student and teacher Entrar landmarks", async () => {
    const { Route: IndexRoute } = await import("../index");
    const rootRoute = createRootRoute();
    // Re-bind index component under a test router
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

    const student = await screen.findByTestId("home-cta-student");
    const teacher = await screen.findByTestId("home-cta-teacher");
    expect(student.textContent).toMatch(/Entrar como estudiante/i);
    expect(teacher.textContent).toMatch(/Entrar como maestro/i);

    const hero = screen.getByTestId("book-hero-gretel");
    expect(hero.getAttribute("data-sticker")).toBe("false");
    const img = hero.querySelector("img");
    expect(img?.getAttribute("src")).toMatch(/gretel-authentic|garden/i);
    expect(img?.getAttribute("src")).not.toMatch(/poses\/gretel-/);

    expect(screen.getByTestId("home-footer-credits").textContent).toMatch(/Leonor/);
  });

  it("does not show developer placeholder poison strings", async () => {
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
    const { container } = render(<RouterProvider router={router} />);
    await router.load();
    const text = container.textContent || "";
    for (const banned of BANNED) {
      expect(text.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });
});
