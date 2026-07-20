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

describe("Welcome splash (\"/\") — first screen before the existing landing", () => {
  it("shows the Bienvenidos headline, subtitle, and a single Entrar button to /entrar", async () => {
    await renderSplash();

    const splash = await screen.findByTestId("welcome-splash");
    expect(splash.textContent).toContain("¡Bienvenidos!");
    expect(splash.textContent).toContain("La Cartilla de Gretel");

    const entrar = await screen.findByTestId("wc-entrar");
    expect(entrar.textContent?.trim()).toBe("Entrar");
    expect(entrar.getAttribute("href")).toBe("/entrar");

    // Exactly one Entrar control on the splash — not the dual student/teacher
    // cards, which now live one tap later on /entrar.
    expect(screen.queryByTestId("home-cta-student")).toBeNull();
    expect(screen.queryByTestId("home-cta-teacher")).toBeNull();
  });

  it("renders Gretel and the full animal crowd", async () => {
    await renderSplash();

    await screen.findByTestId("wc-gretel");
    const critterWords = [
      "águila",
      "araña",
      "elefante",
      "iguana",
      "mono",
      "pez",
      "oso",
      "oveja",
      "conejo",
      "ardilla",
      "erizo",
      "zorro",
      "burro",
      "jirafa",
      "sapo",
      "catalina",
      "rana",
      "gusano",
    ];
    for (const word of critterWords) {
      expect(screen.getByTestId(`wc-critter-${word}`)).toBeTruthy();
    }
  });

  it("every critter and Gretel pose image resolves to a real PASS-verified faithful crop", async () => {
    const qaResults = (await import("../../../public/cartilla/art/faithful/qa-results.json"))
      .default as { results: { file: string; verdict: string }[] };
    const passSet = new Set(
      qaResults.results.filter((r) => r.verdict === "PASS").map((r) => r.file),
    );

    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    const imgs = Array.from(splash.querySelectorAll<HTMLImageElement>("img"));
    const faithfulImgs = imgs.filter((img) => img.getAttribute("src")?.includes("/cartilla/art/faithful/"));
    expect(faithfulImgs.length).toBeGreaterThan(0);
    for (const img of faithfulImgs) {
      const src = img.getAttribute("src")!;
      const relFile = `public${src}`;
      expect(passSet.has(relFile)).toBe(true);
    }

    const poseImgs = imgs.filter((img) => img.getAttribute("src")?.includes("/cartilla/images/gretel/poses/"));
    expect(poseImgs.length).toBeGreaterThan(0);
    for (const img of poseImgs) {
      const src = img.getAttribute("src")!;
      const relFile = `public${src}`;
      expect(passSet.has(relFile)).toBe(true);
    }
  });

  it("respects prefers-reduced-motion (no live breathing class on critters)", async () => {
    stubMatchMedia(true);

    await renderSplash();
    const gretel = await screen.findByTestId("wc-gretel");
    expect(gretel.className).not.toContain("wc-gretel--live");
  });
});
