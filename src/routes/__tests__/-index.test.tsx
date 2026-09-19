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

describe('Welcome splash ("/") — one generated garden scene (issue #345)', () => {
  it("shows the Bienvenidos headline, subtitle, and a single Entrar button to /entrar", async () => {
    await renderSplash();

    const splash = await screen.findByTestId("welcome-splash");
    expect(splash.textContent).toContain("¡Bienvenidos!");
    expect(splash.textContent).toContain("La Cartilla de Gretel");

    const entrar = await screen.findByTestId("wc-entrar");
    expect(entrar.textContent?.trim()).toBe("Entrar");
    expect(entrar.getAttribute("href")).toBe("/entrar");

    // Exactly one Entrar control on the splash — not the dual student/teacher
    // cards, which live one tap later on /entrar.
    expect(screen.queryByTestId("home-cta-student")).toBeNull();
    expect(screen.queryByTestId("home-cta-teacher")).toBeNull();
  });

  it("renders the headline as real HTML text, never baked into the image", async () => {
    await renderSplash();
    // A real <h1> is what keeps the title selectable, translatable and
    // readable by a screen reader.
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("¡Bienvenidos!");
  });

  it("renders exactly one full-scene image, and it is decorative", async () => {
    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    const imgs = Array.from(splash.querySelectorAll("img"));
    expect(imgs).toHaveLength(1);
    // The scene carries no information the text does not already give, so it
    // is hidden from screen readers rather than given a redundant description.
    expect(imgs[0].getAttribute("alt")).toBe("");
    expect(imgs[0].getAttribute("aria-hidden")).toBe("true");
  });

  it("uses the owner-approved generated scene from the manifest", async () => {
    const { getGeneratedScene } = await import("@/lib/generated-art");
    const scene = getGeneratedScene("welcome-splash");
    expect(scene, "no approved welcome-splash entry in the generated manifest").not.toBeNull();

    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    const img = splash.querySelector("img")!;
    expect(img.getAttribute("src")).toBe(scene!.src);
  });

  it("keeps generated art out of the faithful book-art folders", async () => {
    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    const img = splash.querySelector("img")!;
    const src = img.getAttribute("src")!;
    // Generated scene art lives in its own folder and must never be served
    // from, or mistaken for, the book's faithful crops.
    expect(src.startsWith("/cartilla/art/generated/")).toBe(true);
    expect(src).not.toContain("/art/faithful/");
  });

  it("is Spanish-only — no English anywhere on the first screen", async () => {
    await renderSplash();
    const splash = await screen.findByTestId("welcome-splash");
    expect(splash.textContent).not.toMatch(/\b(welcome|enter|start|login|sign in)\b/i);
  });
});
