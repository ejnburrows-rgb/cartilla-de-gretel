/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { WelcomeSplash } from "../WelcomeSplash";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { GRETEL_CINEMATICS, getCinematicById } from "@/content/gretel-cinematics";

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock("framer-motion", () => ({ useReducedMotion: () => preferences.reduced }));
vi.mock("@/content/gretel-cinematics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content/gretel-cinematics")>();
  return { ...actual, getCinematicById: vi.fn(actual.getCinematicById) };
});

const welcome = GRETEL_CINEMATICS.find((item) => item.id === "master-welcome")!;
// Test-only URLs: no media is produced, registered, or substituted for owner assets.
const testClip = {
  mp4: "/test-only-welcome.mp4",
  webm: "/test-only-welcome.webm",
  poster: GRETEL_APPROVED_MASTER_SRC,
};

beforeEach(() => {
  preferences.reduced = false;
  vi.mocked(getCinematicById).mockReturnValue(welcome);
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: { saveData: false },
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "connection");
});

async function renderSplash() {
  const root = createRootRoute();
  const index = createRoute({ getParentRoute: () => root, path: "/", component: WelcomeSplash });
  const learner = createRoute({
    getParentRoute: () => root,
    path: "/cartilla/lecciones",
    component: () => <h1>Lecciones</h1>,
  });
  const teacher = createRoute({
    getParentRoute: () => root,
    path: "/cartilla/teacher/crm",
    component: () => <h1>Maestro</h1>,
  });
  const router = createRouter({
    routeTree: root.addChildren([index, learner, teacher]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
    await router.load();
  });
  await screen.findByTestId("welcome-splash");
}

function expectStill() {
  const splash = screen.getByTestId("welcome-splash");
  expect(screen.getByAltText("Gretel, la niña de la cartilla")).toHaveAttribute(
    "src",
    GRETEL_APPROVED_MASTER_SRC,
  );
  expect(splash.querySelector("video")).toBeNull();
  expect(splash.querySelector("[data-gretel-media]")).toHaveAttribute("data-gretel-media", "still");
}

function registerTestClip() {
  vi.mocked(getCinematicById).mockReturnValue({ ...welcome, video: testClip });
}

async function followEntry(name: string, heading: string) {
  fireEvent.click(screen.getByRole("link", { name }));
  expect(await screen.findByRole("heading", { name: heading })).toBeVisible();
}

describe("WelcomeSplash", () => {
  it("uses the approved still while no welcome video is registered", async () => {
    await renderSplash();
    expectStill();
  });

  it("keeps both app navigation choices outside the media", async () => {
    await renderSplash();
    expect(screen.getByTestId("wc-entrar")).toHaveAttribute("href", "/cartilla/lecciones");
    expect(screen.getByRole("link", { name: "Soy maestro" })).toHaveAttribute(
      "href", "/cartilla/teacher/crm",
    );
  });

  it.each([
    ["Comenzar", "Lecciones"],
    ["Soy maestro", "Maestro"],
  ])("navigates through %s without a final video", async (name, heading) => {
    await renderSplash();
    expectStill();
    await followEntry(name, heading);
  });

  it("immediately uses the still under reduced motion even with a clip registered", async () => {
    preferences.reduced = true;
    registerTestClip();
    await renderSplash();
    expectStill();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    await followEntry("Comenzar", "Lecciones");
  });

  it("immediately uses the still when data saving is enabled", async () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true, value: { saveData: true },
    });
    registerTestClip();
    await renderSplash();
    expectStill();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    await followEntry("Soy maestro", "Maestro");
  });

  it("returns to the still after media failure without blocking Comenzar", async () => {
    registerTestClip();
    await renderSplash();
    fireEvent.error(screen.getByTestId("welcome-splash").querySelector("video")!);
    expectStill();
    await followEntry("Comenzar", "Lecciones");
  });

  it("returns to the still when autoplay is rejected", async () => {
    registerTestClip();
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error("blocked"));
    await renderSplash();
    await act(async () => {
      fireEvent.canPlay(screen.getByTestId("welcome-splash").querySelector("video")!);
    });
    expectStill();
    await followEntry("Soy maestro", "Maestro");
  });

  it("passes a silent inline loop and approved poster to the existing player", async () => {
    registerTestClip();
    await renderSplash();
    const video = screen.getByTestId("welcome-splash").querySelector("video")!;
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.poster).toContain(GRETEL_APPROVED_MASTER_SRC);
    expect(video.querySelector('source[type="video/webm"]')).toHaveAttribute("src", testClip.webm);
    expect(video.querySelector('source[type="video/mp4"]')).toHaveAttribute("src", testClip.mp4);
  });
});
