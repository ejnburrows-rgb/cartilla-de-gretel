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
import { HOME_GREETING } from "@/lib/gretel-voice";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: () => () => {},
}));

vi.mock("@/lib/student-session", () => ({
  getStudentSession: () => null,
}));

vi.mock("@/lib/gretel-voice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gretel-voice")>();
  return {
    ...actual,
    speakAsGretel: vi.fn(() => Promise.resolve()),
    cancelGretelSpeech: vi.fn(),
    isGretelVoiceMuted: () => true,
  };
});

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

describe("Entrar (post-splash landing) — GretelPresence + approved copy only", () => {
  it("renders high-contrast Entrar + real GretelPresence (not sticker/static-only)", async () => {
    const { Route: IndexRoute } = await import("../entrar");
    const rootRoute = createRootRoute();
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/entrar",
      component: IndexRoute.options.component!,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const history = createMemoryHistory({ initialEntries: ["/entrar"] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);
    await router.load();

    const student = await screen.findByTestId("home-cta-student");
    const teacher = await screen.findByTestId("home-cta-teacher");
    expect(student.textContent).toMatch(/Entrar como estudiante/i);
    expect(teacher.textContent).toMatch(/Entrar como maestro/i);

    // GretelPresence system (data-gretel-system=presence), not sticker
    const hero = screen.getByTestId("book-hero-gretel-frame");
    expect(hero.getAttribute("data-sticker")).toBe("false");
    expect(hero.getAttribute("data-gretel-system")).toBe("presence");
  });

  it("hero text is ONLY the approved greeting — no fabricated captions", async () => {
    const { Route: IndexRoute } = await import("../entrar");
    const rootRoute = createRootRoute();
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/entrar",
      component: IndexRoute.options.component!,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const history = createMemoryHistory({ initialEntries: ["/entrar"] });
    const router = createRouter({ routeTree, history });
    const { container } = render(<RouterProvider router={router} />);
    await router.load();

    const greeting = await screen.findByTestId("home-greeting");
    expect(greeting.textContent?.trim()).toBe(HOME_GREETING);

    const text = container.textContent || "";
    for (const banned of BANNED) {
      expect(text.toLowerCase()).not.toContain(banned.toLowerCase());
    }
    // No legacy footer credits on home
    expect(screen.queryByTestId("home-footer-credits")).toBeNull();
  });
});
