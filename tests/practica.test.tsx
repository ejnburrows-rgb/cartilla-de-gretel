import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Route } from "../src/routes/cartilla/practica";
import * as SpeakMod from "../src/lib/speak";
import { LanguageProvider } from "../src/context/LanguageContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory, Outlet } from '@tanstack/react-router';

vi.mock("../src/lib/speak", () => ({
  speak: vi.fn(),
}));

const PracticaComponent = Route.options.component;

describe("Practica route", () => {
  let router;
  let queryClient;
  
  beforeEach(async () => {
    window.history.replaceState({}, "", "/");
    vi.useFakeTimers();
    vi.clearAllMocks();
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const rootRoute = createRootRoute({
        component: () => <Outlet />
    });
    const practicaRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: PracticaComponent,
    });
    router = createRouter({
      routeTree: rootRoute.addChildren([practicaRoute]),
      history: createMemoryHistory(),
    });
    await router.load();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    // Clear and restore fake timers is moved to within test
  });

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </QueryClientProvider>
    );
  };

  it("keeps rapid practice visual and never synthesizes Spanish speech", async () => {
    renderComponent();
    
    await act(async () => {});
    
    const startButton = screen.getByRole("button", { name: /empezar/i });
    expect(startButton).toBeInTheDocument();
    
    act(() => { startButton.click(); });
    expect(screen.getAllByRole("button").filter((button) => /^[a-záéíóú]+$/i.test(button.textContent ?? "")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button").find((button) => /^[a-záéíóú]+$/i.test(button.textContent ?? ""))!);
    act(() => { vi.advanceTimersByTime(800); });
    expect(SpeakMod.speak).not.toHaveBeenCalled();
    
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("opens the piano lesson picker at modo=piano", () => {
    window.history.pushState({}, "", "/?modo=piano");
    renderComponent();
    expect(screen.getByRole("heading", { name: "Cancionero / Piano" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lección 7:/ })).toHaveAttribute("href", "/cartilla/practica?modo=piano&lesson=7");
    expect(SpeakMod.speak).not.toHaveBeenCalled();
  });

  it("calculates time remaining accurately even if timer is delayed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    renderComponent();
    
    await act(async () => {});
    
    const startButton = screen.getByRole("button", { name: /empezar/i });
    act(() => { startButton.click(); });
    
    expect(screen.getAllByText((content, element) => {
        return content === "60" || element?.textContent === "60s";
    })[0]).toBeInTheDocument();
    
    // Fast forward System time by 10s
    act(() => {
      vi.setSystemTime(new Date('2024-01-01T00:00:10Z'));
      vi.advanceTimersByTime(1000); 
    });
    
    expect(screen.getAllByText((content, element) => {
        // It might be 50 or 49 depending on how exactly React bats
        return content === "50" || element?.textContent === "50s" || element?.textContent === "49s" || content === "49";
    })[0]).toBeInTheDocument();
    
    // Fast forward System time by 50s
    act(() => {
      vi.setSystemTime(new Date('2024-01-01T00:01:00Z'));
      vi.advanceTimersByTime(1000); 
    });
    
    expect(screen.getByText(/¡Tiempo!/i)).toBeInTheDocument();
    
    vi.clearAllTimers();
    vi.useRealTimers();
  });
});
