/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { WelcomeSplash } from "../WelcomeSplash";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderSplashComponent() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: WelcomeSplash,
  });
  const routeTree = rootRoute.addChildren([indexRoute]);
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({ routeTree, history });
  render(<RouterProvider router={router} />);
  await router.load();
}

describe("WelcomeSplash integration with GretelSceneMedia", () => {
  it("renders GretelSceneMedia fallback image when no video clip is provided", async () => {
    await renderSplashComponent();

    const splash = screen.getByTestId("welcome-splash");
    expect(splash).toBeInTheDocument();

    const img = screen.getByAltText("Gretel");
    expect(img).toHaveAttribute("src", GRETEL_APPROVED_MASTER_SRC);
    expect(splash.querySelector("video")).toBeNull();
  });

  it("renders action buttons Comenzar and Soy maestro with correct routes", async () => {
    await renderSplashComponent();

    const comenzarBtn = screen.getByTestId("wc-entrar");
    expect(comenzarBtn).toHaveTextContent("Comenzar");
    expect(comenzarBtn).toHaveAttribute("href", "/cartilla/lecciones");

    const teacherBtn = screen.getByRole("link", { name: "Soy maestro" });
    expect(teacherBtn).toHaveAttribute("href", "/cartilla/teacher/crm");
  });
});
